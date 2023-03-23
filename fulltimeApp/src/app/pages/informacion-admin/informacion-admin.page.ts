import { Component, OnInit } from '@angular/core';
import { RelojServiceService } from 'src/app/services/reloj-service.service';
import { Empresa } from 'src/app/interfaces/Empresa';
import { Usuario } from 'src/app/interfaces/Usuario';
import { DatePipe } from '@angular/common';
import { DataUserLoggedService } from '../../services/data-user-logged.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';

@Component({
  selector: 'app-informacion-admin',
  templateUrl: './informacion-admin.page.html',
  styleUrls: ['./informacion-admin.page.scss']
})
export class InformacionAdminPage implements OnInit {

  existenEmpleados = false;
  pipe = new DatePipe('en-US');
  pageActual: number = 1;

  empresa: Empresa = {
    nombre: '',
    ruc: '',
    direccion: '',
    telefono: '',
    correo: '',
    representante: '',
  };

  empleados: any = [];
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
    return this.dataUser.dataApp
  }

  public get app_vacuna(): any {
    return this.dataUser.dataVacuna
  }

  constructor(
    private relojService: RelojServiceService,
    private dataUser: DataUserLoggedService,
    public parametro: ParametrosService,
    public validar: ValidacionesService
    ) {}

  ngOnInit(){
    this.obtenerDatosEmpresa(localStorage.getItem('id_empresa'));
    this.searchEmpleado = this.empleados;

    console.log('data vacuna .. ', this.dataUser.dataVacuna)
    this.BuscarFormatos();
  }

  fecha_: string = '';
  caduca_: string = '';

  // BUSQUEDA DE PARAMETROS DE FECHAS Y HORAS
  formato_fecha: string = '';
  formato_hora: string = '';
  BuscarFormatos() {
    this.parametro.ObtenerFormatos().subscribe(
      resp => {
        this.formato_fecha = resp.fecha;
        this.formato_hora = resp.hora;
        this.fecha_ = this.validar.FormatearFecha(this.dataUser.dataVacuna.fecha, this.formato_fecha, this.validar.dia_completo);
        this.caduca_ = this.validar.FormatearFecha(this.dataUser.dataApp.caducidad_licencia, this.formato_fecha, this.validar.dia_completo);      
      }
    )
  }

  obtenerDatosEmpresa(idEmpresa: any) {
    this.relojService.obtenerDatosEmpresa(idEmpresa).subscribe(
      res => {
        console.log(res);
        this.empresa = res;
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

      },
      err => {
        console.log(err)
      }
    );

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
