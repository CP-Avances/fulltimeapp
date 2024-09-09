import { Component, OnInit } from '@angular/core';
import { RelojServiceService } from 'src/app/services/reloj-service.service';
import { Empresa } from 'src/app/interfaces/Empresa';
import { Usuario } from 'src/app/interfaces/Usuario';
import { DatePipe } from '@angular/common';
import { DataUserLoggedService } from '../../services/data-user-logged.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { ModalController, Platform, ToastController } from '@ionic/angular';
import { InformacionEmpleadoPage } from '../informacion-empleado/informacion-empleado.page';
import { NetworkService } from '../../libs/network.service';

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
    cedula: "",
    usuario: "",
    id_rol: 0,
    codigo: ''
  }

  public get app_info(): any {
    return localStorage.getItem("version")
  }

  public get app_vacuna(): any {
    return this.dataUser.dataVacuna
  }

  ver: boolean = true;

  constructor(
    private relojService: RelojServiceService,
    private dataUser: DataUserLoggedService,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    public modalController: ModalController,
    private toastController: ToastController,
    private networkService: NetworkService,

  ) { }

  ngOnInit() {
    this.networkSubscriber();
  }
  ionViewWillEnter() {
 
    this.networkSubscriber();
  }

  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
    console.log("Esta conectado: ", this.isConnected)
    if (!this.isConnected) {
      this.abrirToas('Por favor verifique su conexión a Internet', "danger", 3000, "bottom");

    } else {
      this.obtenerDatosEmpresa(localStorage.getItem('id_empresa'));
      this.searchEmpleado = this.empleados;
      // console.log('data vacuna .. ', this.dataUser.dataVacuna)
      this.BuscarFormatos();
      console.log('conectado');
    }
  }
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
    this.parametro.ObtenerFormatos().subscribe(
      resp => {
        this.formato_fecha = resp.fecha;
        this.formato_hora = resp.hora;
        this.fecha_ = this.validar.FormatearFecha(this.dataUser.dataVacuna.fecha, this.formato_fecha, this.validar.dia_completo);
        console.log("ver fecha",localStorage.getItem("caducidad_licencia"))
        this.caduca_ = this.validar.FormatearFecha(localStorage.getItem("caducidad_licencia"), this.formato_fecha, this.validar.dia_completo);
      },
      err => {
        console.log(err)
      }
    )
  }

  obtenerDatosEmpresa(idEmpresa: any) {
    this.relojService.obtenerDatosEmpresa(idEmpresa).subscribe(
      res => {

        console.log("ver datos empresa", res)
        console.log(res);
        this.empresa = res[0];
        this.obtenerEmpleados();
        // this.obtenerDatosAdministrador(localStorage.getItem('Uid'));
      },
      err => {
        console.log(err)
      }
    );
  }

  obtenerEmpleados() {
    this.relojService.obtenerUsuarioEmpresa().subscribe(
      res => {
        this.empleados = res;
        this.existenEmpleados = true;
        this.empleados_filtro = [...this.empleados];
        console.log('lista empleados: ', this.empleados)
        if (this.empleados.length < 11) {
          return this.ver = true;
        } else {
          return this.ver = false;
        }
      },
      err => {
        console.log(err)
      }
    );

  }

  changeSearch(e: any) {
    const query = e.detail.value;
    const filtro = this.empleados.filter((o: any) => {
      return o.fullname.toLowerCase().indexOf(query.toLowerCase()) > -1 ||
        o.codigo.toLowerCase().indexOf(query.toLowerCase()) > -1 ||
        o.cedula.toLowerCase().indexOf(query.toLowerCase()) > -1
    })
    this.empleados_filtro = filtro

  }


  //refrescar la pagina
  doRefresh(event: any) {
    this.ngOnInit();

    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 1500);
  }


  //obtener datos de usuario administrador
  obtenerDatosAdministrador(iduser: string) {
    this.relojService.obtenerUsuario(iduser).subscribe(
      res => {
        this.usuario = res;
      },
      err => {
        console.log(err)
      }
    );
  }

  async presentModal(usuario: any) {
    console.log("ver usuario", usuario)

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
