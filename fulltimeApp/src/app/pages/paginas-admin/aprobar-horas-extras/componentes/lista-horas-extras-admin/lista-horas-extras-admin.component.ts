import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import moment from 'moment';
import { SkeletonListPermisoArray } from 'src/app/interfaces/Skeleton';
import { HoraExtra } from 'src/app/interfaces/HoraExtra';
import { UpdateAutorizacionComponent } from 'src/app/modals/update-autorizacion/update-autorizacion.component';
import { DataUserLoggedService } from '../../../../../services/data-user-logged.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { HorasExtrasService } from 'src/app/services/horas-extras.service';
import { ParametrosService } from 'src/app/services/parametros.service';

@Component({
  selector: 'app-all-horas-extras',
  templateUrl: './lista-horas-extras-admin.component.html',
  styleUrls: ['../../aprobar-horas-extras.page.scss'],
})

export class ListaHorasExtrasAdminComponent implements OnInit, OnDestroy {

  username: any;
  subscripted: Subscription;
  skeleton = SkeletonListPermisoArray;
  loading: boolean = true;
  pageActual: number = 1;
  Ver: boolean;

  horasExtras_pendientes: HoraExtra[] = [];
  horasExtras_pre_autorizados: HoraExtra[] = [];
  horasExtras_autorizado: HoraExtra[] = [];
  horasExtras_negado: HoraExtra[] = [];

  get fechaInicio(): string { return this.dataUserLoggedService.fechaRangoInicio}
  get fechaFinal(): string { return this.dataUserLoggedService.fechaRangoFinal}

  fechaIn: string = "";
  fechaFi: string = "";

  constructor(
    private dataUserLoggedService: DataUserLoggedService,
    private horasExtrasService: HorasExtrasService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private userService: DataUserLoggedService,
    private socket: Socket,
    public modalController: ModalController,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
  ) {

    this.socket.on('recibir_aviso', (data_llega: any) => {
      this.obtenerAllHorasExtras();
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
        this.obtenerAllHorasExtras();
      }
    )
  }

  ngOnDestroy() {
    this.subscripted.unsubscribe();
  }


  obtenerAllHorasExtras() {
    this.limpiarRango_fechas();
    this.subscripted = this.horasExtrasService.getAllHorasExtras()
      .subscribe(
        horasExtras => {

          horasExtras.forEach(h => {
            h.fecha_inicio_ = this.validar.FormatearFecha(moment(h.fec_inicio).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);
            h.hora_inicio_ = this.validar.FormatearHora(moment(h.fec_inicio).format('HH:mm:ss'), this.formato_hora);
            h.fecha_fin_ = this.validar.FormatearFecha(moment(h.fec_final).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);;
            h.hora_fin_ = this.validar.FormatearHora(moment(h.fec_final).format('HH:mm:ss'), this.formato_hora);
            h.fec_solicita_ = this.validar.FormatearFecha(String(h.fec_solicita), this.formato_fecha, this.validar.dia_completo);
          })

          this.horasExtras_pendientes = horasExtras.filter(o => {
            if (o.nempleado !== this.username) { // condicion para no mostrar las solicitudes del mismo admin
              return o.estado === 1
            }
          });

          this.horasExtras_pre_autorizados = horasExtras.filter(o => {
            if (o.nempleado !== this.username) { // condicion para no mostrar las solicitudes del mismo admin
              return o.estado === 2
            }
          });

          this.horasExtras_autorizado = horasExtras.filter(o => {
            if (o.nempleado !== this.username) { // condicion para no mostrar las solicitudes del mismo admin
              return o.estado === 3
            }
          });

          this.horasExtras_negado = horasExtras.filter(o => {
            if (o.nempleado !== this.username) { // condicion para no mostrar las solicitudes del mismo admin
              return o.estado === 4
            }
          });

          if (this.horasExtras_pendientes.length == 0 && this.horasExtras_pre_autorizados.length == 0 && this.horasExtras_autorizado.length == 0 && this.horasExtras_negado.length == 0) {
            this.Ver = true;
          } else {
            if((this.pestaniaEstados == 'pendientes') && (this.horasExtras_pendientes.length < 5)){
              return this.Ver = true;
            }else if((this.pestaniaEstados == 'pre_autorizados') && (this.horasExtras_pre_autorizados.length < 5)){
              return this.Ver = true;
            }else if((this.pestaniaEstados == 'autorizados') && (this.horasExtras_autorizado.length < 5)){
              return this.Ver = true;
            }else if((this.pestaniaEstados == 'negados') && (this.horasExtras_negado.length < 5)){
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

  async presentModalAutorizarHorasExtras(hora_extra: HoraExtra) {
    const modal = await this.modalController.create({
      component: UpdateAutorizacionComponent,
      componentProps: {
        hora_extra,
        labelAutorizacion: 'Hora Extra'
      },
      cssClass: 'my-custom-class'
    });
    await modal.present();

    const { data: { refreshInfo } } = await modal.onDidDismiss()

    if (refreshInfo) {
      this.ngOnInit()
    }
    return;
  }

  pestaniaEstados: string = 'pendientes';
  cambioPestaniaEstados(estado) {
    this.pestaniaEstados = estado;
    this.obtenerAllHorasExtras();
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

  allCheckPendientes(data: HoraExtra[]) {
    this.horasExtras_pendientes = data
  }

  allCheckPreAutorizados(data: HoraExtra[]) {
    this.horasExtras_pre_autorizados = data
  }

  BuscarByFecha() {
    this.horasExtras_pendientes = [];
    this.horasExtras_pre_autorizados = [];
    this.horasExtras_autorizado = [];
    this.horasExtras_negado = [];

    if (this.fechaFinal < this.fechaInicio) {
      this.limpiarRango_fechas();
      return this.mostrarToas('La fecha de inicio no puede ser mayor a la fecha final de consulta', 3000, "danger");
    } else {
      this.horasExtrasService.getAllHorasExtrasByFechas(this.fechaInicio.split('T')[0], this.fechaFinal.split('T')[0]).subscribe(
        horasExtras => {

          horasExtras.forEach(h => {
            h.fecha_inicio_ = this.validar.FormatearFecha(moment(h.fec_inicio).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);
            h.hora_inicio_ = this.validar.FormatearHora(moment(h.fec_inicio).format('HH:mm:ss'), this.formato_hora);
            h.fecha_fin_ = this.validar.FormatearFecha(moment(h.fec_final).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);;
            h.hora_fin_ = this.validar.FormatearHora(moment(h.fec_final).format('HH:mm:ss'), this.formato_hora);
            h.fec_solicita_ = this.validar.FormatearFecha(String(h.fec_solicita), this.formato_fecha, this.validar.dia_completo);
          })

          this.horasExtras_pendientes = horasExtras.filter(o => {
            if (o.nempleado !== this.username) { // condicion para no mostrar las solicitudes del mismo admin
              return o.estado === 1
            }
          });

          this.horasExtras_pre_autorizados = horasExtras.filter(o => {
            if (o.nempleado !== this.username) { // condicion para no mostrar las solicitudes del mismo admin
              return o.estado === 2
            }
          });

          this.horasExtras_autorizado = horasExtras.filter(o => {
            if (o.nempleado !== this.username) { // condicion para no mostrar las solicitudes del mismo admin
              return o.estado === 3
            }
          });

          this.horasExtras_negado = horasExtras.filter(o => {
            if (o.nempleado !== this.username) { // condicion para no mostrar las solicitudes del mismo admin
              return o.estado === 4
            }
          });

          if((this.pestaniaEstados == 'pendientes') && (this.horasExtras_pendientes.length < 5)){
            return this.Ver = true;
          }else if((this.pestaniaEstados == 'pre_autorizados') && (this.horasExtras_pre_autorizados.length < 5)){
            return this.Ver = true;
          }else if((this.pestaniaEstados == 'autorizados') && (this.horasExtras_autorizado.length < 5)){
            return this.Ver = true;
          }else if((this.pestaniaEstados == 'negados') && (this.horasExtras_negado.length < 5)){
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
  }


  changeFechaInicio(e) {
    this.dataUserLoggedService.setFechaRangoFinal(null);
    this.fechaFi = null
    if(!e.target.value){
      this.dataUserLoggedService.setFechaRangoInicio((moment(new Date()).format('YYYY-MM-DD')));
      return this.fechaIn = moment(e.target.value).format('YYYY-MM-DD');
    }else{
      this.dataUserLoggedService.setFechaRangoInicio(e.target.value);
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
        this.dataUserLoggedService.setFechaRangoFinal(this.fechaInicio);
        return this.fechaFi = moment(e.target.value).format('YYYY-MM-DD');//Ajustamos el formato de la fecha para mostrar en el input
      }else{
        this.dataUserLoggedService.setFechaRangoFinal(null);
        this.validar.showToast('Seleccione una Fecha Final', 3000, "warning");
        return this.fechaFi = null
      }
    }else{
      this.dataUserLoggedService.setFechaRangoInicio(this.fechaInicio);
      this.dataUserLoggedService.setFechaRangoFinal(e.target.value);
      if(this.fechaFinal == null || this.fechaFinal == ''){
        this.fechaFi = null;
      }else{
        this.fechaFi = moment(e.target.value).format('YYYY-MM-DD');
      }
    }
  }


  limpiarRango_fechas() {
    this.dataUserLoggedService.setFechaRangoInicio("");
    this.dataUserLoggedService.setFechaRangoFinal("");
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
