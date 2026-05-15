import { Component, OnInit } from '@angular/core';
import { RelojServiceService } from 'src/app/services/reloj-service.service';
import { Usuario } from 'src/app/interfaces/Usuario';
import { DatePipe } from '@angular/common';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { ModalController, ToastController } from '@ionic/angular';
import { InformacionEmpleadoPage } from '../informacion-empleado/informacion-empleado.page';
import { NetworkService } from '../../libs/network.service';
import { ConnectivityService } from '../../services/conexion-servidor.service'
import { ParametrosSistema } from 'src/app/libs/parametros.emun';
import { AsignacionesMovilService } from 'src/app/services/asignaciones-movil.services';

@Component({
  selector: 'app-informacion-admin',
  templateUrl: './informacion-admin.page.html',
  styleUrls: ['./informacion-admin.page.scss']
})
export class InformacionAdminPage implements OnInit {
  modal: HTMLIonModalElement;

  existenEmpleados = false;
  pipe = new DatePipe('en-US');
  pageActual: number = 1;
  isConnected: boolean;
  serverConnected: boolean = true;

  rolEmpleado: number = 0;
  idEmpleado: number = 0;

  idUsuariosAcceso: Set<any> = new Set();

  empresa: any = {
    nombre: '',
    ruc: '',
    direccion: '',
    telefono: '',
    correo: '',
    representante: '',
  };

  empleados: any = [];
  empleados_filtro: any[] = [];
  searchEmpleado: any = [];

  usuario: Usuario = {
    nombre: "",
    apellido: "",
    identificacion: "",
    usuario: "",
    id_rol: 0,
    codigo: '',
    ciudad: "",
    domicilio: "",
    name_suc: "",
    name_dep: "",
    name_rol: "",
    name_regimen: "",
    genero: "",
    nombre_nacionalidad: "",
    id_suc: 0,
    id_depa: 0,
    id_regimen: 0,
    id_cargo_: 0,
  }

  public get app_info(): any {
    return localStorage.getItem("version")
  }

  ver: boolean = true;

  constructor(
    private relojService: RelojServiceService,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    public modalController: ModalController,
    private toastController: ToastController,
    private networkService: NetworkService,
    private connectivityService: ConnectivityService,
    private readonly asignacionesMovil: AsignacionesMovilService
  ) { }

  async ngOnInit() {
    this.idEmpleado = parseInt(localStorage.getItem('empleadoID') ?? '0', 10);
    this.rolEmpleado = parseInt(localStorage.getItem('rol') ?? '0', 10);

    await this.cargarAsignacionesUsuario();

    this.networkSubscriber();

    this.serverConnected = await this.connectivityService.checkServerConnection();
    console.log("serverConnected ", this.serverConnected);
  }

  async ionViewWillEnter() {
    this.idEmpleado = parseInt(localStorage.getItem('empleadoID') ?? '0', 10);
    this.rolEmpleado = parseInt(localStorage.getItem('rol') ?? '0', 10);

    await this.cargarAsignacionesUsuario();

    this.networkSubscriber();

    this.serverConnected = await this.connectivityService.checkServerConnection();
  }

  private async cargarAsignacionesUsuario(): Promise<void> {
    if (!this.idEmpleado) return;

    try {
      await this.asignacionesMovil.ObtenerAsignacionesUsuario(this.idEmpleado);

      this.idUsuariosAcceso = this.asignacionesMovil.idUsuariosAcceso;

    } catch (error) {
      console.log('Error al cargar asignaciones del usuario', error);
      this.idUsuariosAcceso = new Set();
    }
  }

  private aplicarFiltroPorAsignacion(empleados: any[]): any[] {
    if (!empleados || empleados.length === 0) return [];

    // SUPERADMINISTRADOR: ve todos
    if (this.rolEmpleado === 1) {
      return empleados;
    }

    // Si no tiene asignaciones, no mostrar empleados
    if (!this.idUsuariosAcceso || this.idUsuariosAcceso.size === 0) {
      return [];
    }

    return empleados.filter((empleado: any) => {
      const idEmpleado = Number(empleado.id ?? empleado.id_empleado);
      return this.idUsuariosAcceso.has(idEmpleado);
    });
  }

  // METODO PARA VERIFICAR SI EXISTE CONEXION A INTERNET
  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
    console.log("Esta conectado: ", this.isConnected)
    if (!this.isConnected) {
    } else {
      this.obtenerDatosEmpresa();
      this.searchEmpleado = this.empleados;
      this.BuscarFormatos();
      console.log('conectado');
    }
  }

  // METODO PARA MODIFICAR EL TOAST
  async abrirToas(mensaje: string, color: string, duracion: number, position: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      position: position
    });
    toast.present();
  }

  fecha_: string = '';
  caduca_: string = localStorage.getItem("caducidad_licencia");

  // BUSQUEDA DE PARAMETROS DE FECHAS Y HORAS
  formato_fecha: string = '';
  formato_hora: string = '';
  BuscarFormatos() {
    const detalles = [
      ParametrosSistema.FORMATO_FECHA,
      ParametrosSistema.FORMATO_HORA
    ];
    this.parametro.ObtenerFormatos(detalles).subscribe(
      resp => {
        resp.forEach(p => {
          if (p.id_parametro === ParametrosSistema.FORMATO_FECHA) {
            this.formato_fecha = p.descripcion;
          } else if (p.id_parametro === ParametrosSistema.FORMATO_HORA) {
            this.formato_hora = p.descripcion;
          }
        });
        this.caduca_ = this.validar.FormatearFecha(localStorage.getItem("caducidad_licencia"), this.formato_fecha, this.validar.dia_completo);
      }
    );
  }

  // METODO PARA OBTENER LOS DATOS DE LA EMPRESA
  obtenerDatosEmpresa() {
    this.relojService.obtenerDatosEmpresa().subscribe(
      {
        next: res => {
          this.empresa = res.data;
          this.obtenerEmpleados();
        }
      }
    );
  }

  // METODO PARA OBTENER LOS EMPLEADOS 
  // METODO PARA OBTENER LOS EMPLEADOS 
  obtenerEmpleados() {
    this.relojService.obtenerUsuarioEmpresa().subscribe(
      res => {
        const empleados = res ?? [];

        this.empleados = this.aplicarFiltroPorAsignacion(empleados);

        this.existenEmpleados = true;
        this.empleados_filtro = [...this.empleados];

        this.ver = this.empleados.length < 11;
      }
    );
  }

  // METODO QUE DEFINE EL COMPORTAMIENTO DEL BUSCADOR
  // METODO QUE DEFINE EL COMPORTAMIENTO DEL BUSCADOR
  changeSearch(e: any) {
    const query = String(e?.detail?.value ?? '').toLowerCase();

    this.empleados_filtro = this.empleados.filter((o: any) => {
      const fullname = String(o.fullname ?? '').toLowerCase();
      const codigo = String(o.codigo ?? '').toLowerCase();
      const cedula = String(o.cedula ?? o.identificacion ?? '').toLowerCase();

      return fullname.includes(query) ||
        codigo.includes(query) ||
        cedula.includes(query);
    });
  }

  // METODO PARA REFRESCAR LA PAGINA
  doRefresh(event: any) {
    this.ngOnInit();
    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }

  //obtener datos de usuario administrador
  obtenerDatosAdministrador(iduser: string) {
    this.relojService.obtenerUsuario(iduser).subscribe(
      res => {
        this.usuario = res;
      }
    );
  }

  // METODO PARA DEFINIR EL CAMBIO DE VISTA AL MODAL IMFORMACIÓN EMPLEADO
  async presentModal(usuario: any) {
    const modal = await this.modalController.create({
      component: InformacionEmpleadoPage,
      componentProps: {
        'data': usuario,
      },
      cssClass: 'my-custom-class'
    });
    this.modal = modal;
    await modal.present();
    const { data: { refreshInfo } } = await modal.onDidDismiss()
    if (refreshInfo) {
      this.ngOnInit()
    }
  }


  //variables de configuracion del componente de paginacion (pagination-controls)
  public maxSize: number = 5;
  public directionLinks: boolean = true;
  public autoHide: boolean = false;
  public responsive: boolean = true;
  public labels: any = {
    previousLabel: 'ante..',
    nextLabel: 'sigui..',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };
}
