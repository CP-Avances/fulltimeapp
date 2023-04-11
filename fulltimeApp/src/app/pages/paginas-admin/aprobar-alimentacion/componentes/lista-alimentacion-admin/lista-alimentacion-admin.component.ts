import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { SkeletonListPermisoArray } from 'src/app/interfaces/Skeleton';
import { Subscription } from 'rxjs';
import { UpdateAutorizacionComponent } from 'src/app//modals/update-autorizacion/update-autorizacion.component';
import { Alimentacion } from 'src/app/interfaces/Alimentacion';
import { AlimentacionService } from 'src/app/services/alimentacion.service';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { UpdateAutorizacionMultipleComponent } from '../update-autorizacion-multiple/update-autorizacion-multiple.component';
import { Socket } from 'ngx-socket-io';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import moment from 'moment';

@Component({
  selector: 'app-all-alimentacion',
  templateUrl: './lista-alimentacion-admin.component.html',
  styleUrls: ['../../aprobar-alimentacion.page.scss'],
})
export class ListaAlimentacionAdminComponent implements OnInit, OnDestroy {

  username: any;
  subscripted: Subscription;
  skeleton = SkeletonListPermisoArray;
  loading: boolean = true;
  pageActual: number = 1;
  Ver: boolean;

  alimentacion_pendientes: Alimentacion[] = [];
  alimentacion_autorizado: Alimentacion[] = [];
  alimentacion_negado: Alimentacion[] = [];

  fechaInicio: string = "";
  fechaFinal: string = "";

  fechaIn: string = "";
  fechaFi: string = "";

  constructor(
    private alimentacionService: AlimentacionService,
    private dataUserLoggedService: DataUserLoggedService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private userService: DataUserLoggedService,
    private socket: Socket,
    public modalController: ModalController,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
  ) {
    this.socket.on('recibir_aviso', (data_llega: any) => {
      this.obtenerAllAlimentacion();
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
        this.obtenerAllAlimentacion();
      }
    )
  }

  ngOnDestroy() {
    this.subscripted.unsubscribe();
  }

  obtenerAllAlimentacion() {
    this.limpiarRango_fechas();
    this.subscripted = this.alimentacionService.getAllAlimentacion()
      .subscribe(
        alimentacion => {

          this.alimentacion_pendientes = alimentacion.filter(o => {
            if (o.nempleado !== this.username) { // condicion para no mostrar las solicitudes del mismo admin
              return o.aprobada === null
            }
          });

          this.alimentacion_autorizado = alimentacion.filter(o => {
            if (o.nempleado !== this.username) { // condicion para no mostrar las solicitudes del mismo admin
              return o.aprobada === true
            }
          });

          this.alimentacion_negado = alimentacion.filter(o => {
            if (o.nempleado !== this.username) { // condicion para no mostrar las solicitudes del mismo admin
              return o.aprobada === false
            }
          });

          alimentacion.forEach(c => {
            // TRATAMIENTO DE FECHAS Y HORAS
            c.fecha_ = this.validar.FormatearFecha(String(c.fecha), this.formato_fecha, this.validar.dia_completo);
            c.fec_comida_ = this.validar.FormatearFecha(String(c.fec_comida), this.formato_fecha, this.validar.dia_completo);
            c.hora_inicio_ = this.validar.FormatearHora(c.hora_inicio, this.formato_hora);
            c.hora_fin_ = this.validar.FormatearHora(c.hora_fin, this.formato_hora);
          })

          
          if (this.alimentacion_pendientes.length == 0 && this.alimentacion_autorizado.length == 0 && this.alimentacion_negado.length == 0) {
            this.Ver = true;
          } else {
            if((this.pestaniaEstados == 'pendientes') && (this.alimentacion_pendientes.length < 6)){
              return this.Ver = true;
            }else if((this.pestaniaEstados == 'autorizados') && (this.alimentacion_autorizado.length < 6)){
              return this.Ver = true;
            }else if((this.pestaniaEstados == 'negados') && (this.alimentacion_negado.length < 6)){
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

  async presentModalAutorizarAlimentacion(alimento: Alimentacion) {
    let alimentacion = [alimento];
    let generarArchivoPdf = false;
    const modal = await this.modalController.create({
      component: UpdateAutorizacionMultipleComponent, // se puede reutilizar de esta forma
      componentProps: {
        alimentacion,
        generarArchivoPdf,
        labelAutorizacion: 'Alimentación'
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
    this.obtenerAllAlimentacion();
  }

  allCheckPendientes(data: Alimentacion[]) {
    this.alimentacion_pendientes = data
  }

  BuscarByFecha() {
      this.alimentacion_pendientes = [];
      this.alimentacion_autorizado = [];
      this.alimentacion_negado = [];
      
      this.subscripted = this.alimentacionService.getAllAlimentacionByFechas(this.fechaInicio.split('T')[0], this.fechaFinal.split('T')[0]).subscribe(
        alimentacion => {

          alimentacion.forEach(c => {
            // TRATAMIENTO DE FECHAS Y HORAS
            c.fecha_ = this.validar.FormatearFecha(String(c.fecha), this.formato_fecha, this.validar.dia_completo);
            c.fec_comida_ = this.validar.FormatearFecha(String(c.fec_comida), this.formato_fecha, this.validar.dia_completo);
            c.hora_inicio_ = this.validar.FormatearHora(c.hora_inicio, this.formato_hora);
            c.hora_fin_ = this.validar.FormatearHora(c.hora_fin, this.formato_hora);
          })

          this.alimentacion_pendientes = alimentacion.filter(o => {
            if (o.nempleado !== this.username) {
              return o.aprobada === null
            }
          });

          this.alimentacion_autorizado = alimentacion.filter(o => {
            if (o.nempleado !== this.username) {
              return o.aprobada === true
            }
          });

          this.alimentacion_negado = alimentacion.filter(o => {
            if (o.nempleado !== this.username) {
              return o.aprobada === false
            }
          });

          if((this.pestaniaEstados == 'pendientes') && (this.alimentacion_pendientes.length < 6)){
            return this.Ver = true;
          }else if((this.pestaniaEstados == 'autorizados') && (this.alimentacion_autorizado.length < 6)){
            return this.Ver = true;
          }else if((this.pestaniaEstados == 'negados') && (this.alimentacion_negado.length < 6)){
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

  isChecked: boolean = false;
  ChangeAprobacionMultiple(isChecked: boolean) {
    this.isChecked = isChecked;
  }

  changeFechaInicio(e) {
    this.fechaFinal = null;
    this.fechaFi = null
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
        return this.fechaFi = moment(e.target.value).format('YYYY-MM-DD');//Ajustamos el formato de la fecha para mostrar en el input
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

  //Pestalas de mensajes
  async mostrarToas(mensaje: string, duracion: number, color: string) {

    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      mode: "ios",
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
