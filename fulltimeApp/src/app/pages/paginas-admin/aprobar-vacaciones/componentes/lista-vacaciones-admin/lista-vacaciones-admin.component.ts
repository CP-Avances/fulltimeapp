import { Component, OnInit, ViewChild } from '@angular/core';
import { LoadingController, ModalController, ToastController, IonDatetime } from '@ionic/angular';
import { SkeletonListPermisoArray } from 'src/app/interfaces/Skeleton';
import { Subscription } from 'rxjs';
import { UpdateAutorizacionComponent } from 'src/app/modals/update-autorizacion/update-autorizacion.component';
import { Vacacion } from 'src/app/interfaces/Vacacion';
import { VacacionesService } from 'src/app/services/vacaciones.service';
import { DataUserLoggedService } from '../../../../../services/data-user-logged.service';
import { Socket } from 'ngx-socket-io';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import moment from 'moment';

@Component({
  selector: 'app-all-vacaciones',
  templateUrl: './lista-vacaciones-admin.component.html',
  styleUrls: ['../../aprobar-vacaciones.page.scss'],
})
export class ListaVacacionesAdminComponent implements OnInit {

  @ViewChild (IonDatetime) datetimeInicio: IonDatetime;
  @ViewChild (IonDatetime) datetimeFinal: IonDatetime;

  username: any;
  subscripted: Subscription;
  skeleton = SkeletonListPermisoArray;
  loading: boolean = true;
  pageActual: number = 1;
  Ver: boolean;

  vacaciones_pendientes: Vacacion[] = [];
  vacaciones_pre_autorizados: Vacacion[] = [];
  vacaciones_autorizado: Vacacion[] = [];
  vacaciones_negado: Vacacion[] = [];

  fechaInicio: string = "";
  fechaFinal: string = "";

  fechaIn: string = "";
  fechaFi: string = "";

  constructor(
    private dataUserLoggedService: DataUserLoggedService,
    private loadingController: LoadingController,
    private vacacionService: VacacionesService,
    private toastController: ToastController,
    private userService: DataUserLoggedService,
    private socket: Socket,
    public modalController: ModalController,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
  ) {
    this.socket.on('recibir_notificacion', (data_llega: any) => {
      this.obtenerAllVacaciones();
    });
  }

  ngOnInit() {
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
        this.obtenerAllVacaciones();
      }
    )
  }

  ngOnDestroy() {
    this.subscripted.unsubscribe();
    this.dataUserLoggedService.setFechaRangoInicio('');
    this.dataUserLoggedService.setFechaRangoFinal('');
  }

  obtenerAllVacaciones() {
    this.limpiarRango_fechas();
    this.subscripted = this.vacacionService.getAllVacaciones()
      .subscribe(
        vacaciones => {

          this.vacaciones_pendientes = vacaciones.filter(o => {
            if (o.nempleado !== this.username) { // condicion para no mostrar las solicitudes del mismo admin
              return o.estado === 1
            }
          });

          this.vacaciones_pre_autorizados = vacaciones.filter(o => {
            if (o.nempleado !== this.username) { // condicion para no mostrar las solicitudes del mismo admin
              return o.estado === 2
            }
          });

          this.vacaciones_autorizado = vacaciones.filter(o => {
            if (o.nempleado !== this.username) { // condicion para no mostrar las solicitudes del mismo admin
              return o.estado === 3
            }
          });

          this.vacaciones_negado = vacaciones.filter(o => {
            if (o.nempleado !== this.username) { // condicion para no mostrar las solicitudes del mismo admin
              return o.estado === 4
            }
          });

          vacaciones.forEach(v => {
            // TRATAMIENTO DE FECHAS Y HORAS 
            v.fec_ingreso_ = this.validar.FormatearFecha(String(v.fec_ingreso), this.formato_fecha, this.validar.dia_completo);
            v.fec_inicio_ = this.validar.FormatearFecha(String(v.fec_inicio), this.formato_fecha, this.validar.dia_completo);
            v.fec_final_ = this.validar.FormatearFecha(String(v.fec_final), this.formato_fecha, this.validar.dia_completo);
          })

          if (this.vacaciones_pendientes.length == 0 && this.vacaciones_pre_autorizados.length == 0 && this.vacaciones_autorizado.length == 0 && this.vacaciones_negado.length == 0) {
            this.Ver = true;
          } else {
            if((this.pestaniaEstados == 'pendientes') && (this.vacaciones_pendientes.length < 6)){
              this.Ver = true;
            }else if((this.pestaniaEstados == 'pre_autorizados') && (this.vacaciones_pre_autorizados.length < 6)){
              this.Ver = true;
            }else if((this.pestaniaEstados == 'autorizados') && (this.vacaciones_autorizado.length < 6)){
              this.Ver = true;
            }else if((this.pestaniaEstados == 'negados') && (this.vacaciones_negado.length < 6)){
              this.Ver = true;
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

  async presentModalAutorizarVacacion(vacacion: Vacacion) {
    const modal = await this.modalController.create({
      component: UpdateAutorizacionComponent,
      componentProps: {
        vacacion,
        labelAutorizacion: 'Vacación'
      },
      cssClass: 'my-custom-class'
    });

    await modal.present();
    const { data: { refreshInfo } } = await modal.onDidDismiss()
    if (refreshInfo) {
      this.ngOnInit();
    }
    return;
  }

  pestaniaEstados: string = 'pendientes';
  cambioPestaniaEstados(estado) {
    this.pestaniaEstados = estado;
    this.obtenerAllVacaciones();
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

  allCheckPendientes(data: Vacacion[]) {
    console.log("data vacaciones: ",data)
    if(data.length > 0){
      this.vacaciones_pendientes = data
    }else{
      this.vacaciones_pendientes = null;
    }
  }

  allCheckPreAutorizados(data: Vacacion[]) {
    if(data.length > 0){
      this.vacaciones_pre_autorizados = data
    }else{
      this.vacaciones_pre_autorizados = null;
    }
  }

  BuscarByFecha() {
    this.vacaciones_pendientes = [];
    this.vacaciones_pre_autorizados = [];
    this.vacaciones_autorizado = [];
    this.vacaciones_negado = [];
   
    this.vacacionService.getAllVacacionesByFechas(this.fechaInicio.split('T')[0], this.fechaFinal.split('T')[0]).subscribe(
      vacaciones => {

        vacaciones.forEach(v => {
          // TRATAMIENTO DE FECHAS Y HORAS 
          v.fec_ingreso_ = this.validar.FormatearFecha(String(v.fec_ingreso), this.formato_fecha, this.validar.dia_completo);
          v.fec_inicio_ = this.validar.FormatearFecha(String(v.fec_inicio), this.formato_fecha, this.validar.dia_completo);
          v.fec_final_ = this.validar.FormatearFecha(String(v.fec_final), this.formato_fecha, this.validar.dia_completo);
        })

        this.vacaciones_pendientes = vacaciones.filter(o => {
          if (o.nempleado !== this.username) { // condicion para no mostrar las solicitudes del mismo admin
            return o.estado === 1
          }
        });

        this.vacaciones_pre_autorizados = vacaciones.filter(o => {
          if (o.nempleado !== this.username) { // condicion para no mostrar las solicitudes del mismo admin
            return o.estado === 2
          }
        });

        this.vacaciones_autorizado = vacaciones.filter(o => {
          if (o.nempleado !== this.username) { // condicion para no mostrar las solicitudes del mismo admin
            return o.estado === 3
          }
        });

        this.vacaciones_negado = vacaciones.filter(o => {
          if (o.nempleado !== this.username) { // condicion para no mostrar las solicitudes del mismo admin
            return o.estado === 4
          }
        });

        if((this.pestaniaEstados == 'pendientes') && (this.vacaciones_pendientes.length < 6)){
          this.Ver = true;
        }else if((this.pestaniaEstados == 'pre_autorizados') && (this.vacaciones_pre_autorizados.length < 6)){
          this.Ver = true;
        }else if((this.pestaniaEstados == 'autorizados') && (this.vacaciones_autorizado.length < 6)){
          this.Ver = true;
        }else if((this.pestaniaEstados == 'negados') && (this.vacaciones_negado.length < 6)){
          this.Ver = true;
        }else{
          this.Ver = false;
        }

      },
      err => {
        console.log(err);
      }
    )
  }


  //Metodos para cambiar de manera automatica el rango de fechas a filtrar
   changeFechaInicio(e) {
    this.fechaFinal = null;
    this.fechaFi = null;
    if(!e.target.value){
      this.fechaInicio = (moment(new Date()).format('YYYY-MM-DD'));
      return this.fechaIn = moment(e.target.value).format('YYYY-MM-DD');
    }else{
      this.fechaInicio = e.target.value;
      this.datetimeInicio.confirm(true);
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
      this.datetimeFinal.confirm(true);
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

  //Pestalas de mensajes
  async mostrarToas(mensaje: string, duracion: number, color: string) {

    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      mode: 'ios'
    });
    toast.present();
    this.dismissLoading();
  }
  async dismissLoading() {
    while (await this.loadingController.getTop() !== undefined) {
      await this.loadingController.dismiss();
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
