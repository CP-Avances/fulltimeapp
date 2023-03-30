import { Component, OnInit} from '@angular/core';
import { Permiso } from 'src/app/interfaces/Permisos';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { SkeletonListPermisoArray } from 'src/app/interfaces/Skeleton';
import { PermisosService } from 'src/app/services/permisos.service';
import { Subscription } from 'rxjs';
//import { UpdateAutorizacionComponent } from 'src/app/modals/update-autorizacion/update-autorizacion.component';
import { DataUserLoggedService } from '../../../../../services/data-user-logged.service';
import { Socket } from 'ngx-socket-io';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import moment from 'moment';


@Component({
  selector: 'app-all-permisos',
  templateUrl: './lista-permisos-admin.component.html',
  styleUrls: ['../../aprobar-permisos.page.scss'],
})
export class ListaPermisosAdminComponent implements OnInit {

  username: any;
  subscripted: Subscription;
  skeleton = SkeletonListPermisoArray;
  loading: boolean = true;
  pageActual: number = 1;
  Ver: boolean;

  permisos_pendientes: Permiso[] = [];
  permisos_pre_autorizados: Permiso[] = [];
  permisos_autorizado: Permiso[] = [];
  permisos_negado: Permiso[] = [];

  fechaInicio: string = "";
  fechaFinal: string = "";

  fechaIn: string = "";
  fechaFi: string = "";

  idEmpleado: number;

  constructor(
    private permisosService: PermisosService,
    private modalController: ModalController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private userService: DataUserLoggedService,
    private socket: Socket,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
  ) {

    this.socket.on('recibir_notificacion', (data_llega: any) => {
      this.obtenerAllPermisos();
    });
  }

  ngOnInit() {
    this.idEmpleado = parseInt(localStorage.getItem('empleadoID'));
    this.username = this.userService.UserFullname;
    this.BuscarFormatos();
  }

  // BUSQUEDA DE PARAMETROS DE FECHAS Y HORAS
  formato_fecha: string;
  formato_hora: string;
  BuscarFormatos() {
    this.parametro.ObtenerFormatos().subscribe(
      resp => {
        this.formato_fecha = resp.fecha;
        this.formato_hora = resp.hora;
        this.obtenerAllPermisos();
      }
    )
  }

  obtenerAllPermisos() {
    this.limpiarRango_fechas();
    this.subscripted = this.permisosService.getAllPermisos()
      .subscribe(
        permisos => {
          this.permisos_pendientes = permisos.filter(o => {
            if (this.idEmpleado !== o.id_empl_contrato) { // condicion para no mostrar las solicitudes del mismo admin
              return o.estado === 1;
            }
          });

          this.permisos_pre_autorizados = permisos.filter(o => {
            if (this.idEmpleado !== o.id_empl_contrato) { // condicion para no mostrar las solicitudes del mismo admin
              return o.estado === 2;
            }

          });

          this.permisos_autorizado = permisos.filter(o => {
            if (this.idEmpleado !== o.id_empl_contrato) { // condicion para no mostrar las solicitudes del mismo admin
              return o.estado === 3
            }
          });

          this.permisos_negado = permisos.filter(o => {
            if (this.idEmpleado !== o.id_empl_contrato) { // condicion para no mostrar las solicitudes del mismo admin
              return o.estado === 4
            }
          });

          permisos.forEach(p => {
            // TRATAMIENTO DE FECHAS Y HORAS
            p.fec_creacion_ = this.validar.FormatearFecha(p.fec_creacion, this.formato_fecha, this.validar.dia_completo);
            p.fec_inicio_ = this.validar.FormatearFecha(String(p.fec_inicio), this.formato_fecha, this.validar.dia_completo);
            p.fec_final_ = this.validar.FormatearFecha(String(p.fec_final), this.formato_fecha, this.validar.dia_completo);

            p.hora_ingreso_ = this.validar.FormatearHora(p.hora_ingreso, this.formato_hora);
            p.hora_salida_ = this.validar.FormatearHora(p.hora_salida, this.formato_hora);
          })

          if (this.permisos_pendientes.length == 0 && this.permisos_pre_autorizados.length == 0 && this.permisos_autorizado.length == 0 && this.permisos_negado.length == 0) {
            return this.Ver = true;
          } else {
            if((this.pestaniaEstados == 'pendientes') && (this.permisos_pendientes.length < 5)){
              return this.Ver = true;
            }else if((this.pestaniaEstados == 'pre_autorizados') && (this.permisos_pre_autorizados.length < 5)){
              return this.Ver = true;
            }else if((this.pestaniaEstados == 'autorizados') && (this.permisos_autorizado.length < 5)){
              return this.Ver = true;
            }else if((this.pestaniaEstados == 'negados') && (this.permisos_negado.length < 5)){
              return this.Ver = true;
            }else{
              this.Ver = false;
            }
          }
        },
        err => {
          console.log(err);
        },
        () => {
          this.loading = false
        })
  }

  async presentModalAutorizarPermiso(permiso: Permiso) {
    /*const modal = await this.modalController.create({
      component: UpdateAutorizacionComponent,
      componentProps: {
        permiso,
        labelAutorizacion: 'Permisos'
      },
      cssClass: 'my-custom-class'
    });
    await modal.present();

    const { data: { refreshInfo } } = await modal.onDidDismiss()

    if (refreshInfo) {
      this.ngOnInit();
    }
    return;*/
  }

  pestaniaEstados: string = 'pendientes';
  cambioPestaniaEstados(estado) {
    this.pestaniaEstados = estado;
    this.obtenerAllPermisos();
  }

  isChecked: boolean = false;
  isCheckedPre: boolean = false;
  ChangeAprobacionMultiple(isChecked: boolean) {
    switch (this.pestaniaEstados) {
      case 'pendientes':
        this.isChecked = isChecked;
        break;
      case 'pre_autorizados':
        this.isCheckedPre = isChecked;
        break;
      default:
        break;
    }
  }

  allCheckPendientes(data: Permiso[]) {
    this.permisos_pendientes = data
  }

  allCheckPreAutorizados(data: Permiso[]) {
    this.permisos_pre_autorizados = data
  }

  BuscarByFecha() {
      this.permisos_pendientes = [];
      this.permisos_pre_autorizados = [];
      this.permisos_autorizado = [];
      this.permisos_negado = [];

      this.permisosService.getAllPermisosByFechas(this.fechaInicio.split('T')[0], this.fechaFinal.split('T')[0]).subscribe(
        permisos => {

          permisos.forEach(p => {
            // TRATAMIENTO DE FECHAS Y HORAS
            p.fec_creacion_ = this.validar.FormatearFecha(p.fec_creacion, this.formato_fecha, this.validar.dia_completo);
            p.fec_inicio_ = this.validar.FormatearFecha(String(p.fec_inicio), this.formato_fecha, this.validar.dia_completo);
            p.fec_final_ = this.validar.FormatearFecha(String(p.fec_final), this.formato_fecha, this.validar.dia_completo);

            p.hora_ingreso_ = this.validar.FormatearHora(p.hora_ingreso, this.formato_hora);
            p.hora_salida_ = this.validar.FormatearHora(p.hora_salida, this.formato_hora);
          })

          this.permisos_pendientes = permisos.filter(o => {
            if (o.id_empl_contrato != this.idEmpleado) { // condicion para no mostrar las solicitudes del mismo admin
              return o.estado === 1
            }
          });

          this.permisos_pre_autorizados = permisos.filter(o => {
            if (o.id_empl_contrato != this.idEmpleado) { // condicion para no mostrar las solicitudes del mismo admin
              return o.estado === 2
            }
          });

          this.permisos_autorizado = permisos.filter(o => {
            if (o.id_empl_contrato != this.idEmpleado) { // condicion para no mostrar las solicitudes del mismo admin
              return o.estado === 3
            }
          });

          this.permisos_negado = permisos.filter(o => {
            if (o.id_empl_contrato != this.idEmpleado) { // condicion para no mostrar las solicitudes del mismo admin
              return o.estado === 4
            }
          });

          if((this.pestaniaEstados == 'pendientes') && (this.permisos_pendientes.length < 5)){
            return this.Ver = true;
          }else if((this.pestaniaEstados == 'pre_autorizados') && (this.permisos_pre_autorizados.length < 5)){
            return this.Ver = true;
          }else if((this.pestaniaEstados == 'autorizados') && (this.permisos_autorizado.length < 5)){
            return this.Ver = true;
          }else if((this.pestaniaEstados == 'negados') && (this.permisos_negado.length < 5)){
            return this.Ver = true;
          }else{
            this.Ver = false;
          }

        },
        err => {
          console.log(err);
        }
      )
    
  }

  changeFechaInicio(e) {
    this.fechaFinal = null;
    this.fechaFi = null;
    if(!e.target.value){
      this.fechaInicio = (moment(new Date()).format('YYYY-MM-DD'));
      return this.fechaIn = moment(e.target.value).format('YYYY-MM-DD');
    }else{
      this.fechaInicio = e.target.value;
      if(this.fechaInicio == null || this.fechaInicio == ''){
        this.fechaIn = null;
      }else{
        this.fechaIn = moment(this.fechaInicio).format('YYYY-MM-DD');
      }
    }
  }

  changeFechaFinal(e) {
    if(!e.target.value){
      if(moment(this.fechaInicio).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')){
        this.fechaFinal = this.fechaInicio;
        return this.fechaFi = moment(this.fechaFinal).format('YYYY-MM-DD');//Ajustamos el formato de la fecha para mostrar en el input
      }else{
        this.fechaFinal = null;
        this.validar.showToast('Seleccione una Fecha Final', 3000, "warning");
        return this.fechaFi = null
      }
    }else{
      this.fechaFinal = e.target.value;
      if(this.fechaFinal == null || this.fechaFinal == ''){
        this.fechaFi = null;
      }else{
        this.fechaFi = moment(e.target.value).format('YYYY-MM-DD');
      }
    }
  }


  limpiarRango_fechas() {
    this.fechaFinal = "";
    this.fechaInicio = "";
    this.fechaIn = "";
    this.fechaFi = "";
  }


  //Pestanas de mensajes
  async mostrarToas(mensaje: string, duracion: number, color: string) {

    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      mode: 'ios',
    });
    toast.present();
    this.dismissLoading();
  }
  async dismissLoading() {
    while (await this.loadingController.getTop() !== undefined) {
      await this.loadingController.dismiss();
    }
  }
}
