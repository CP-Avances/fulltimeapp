import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { LoadingController, ModalController, ToastController, IonDatetime } from '@ionic/angular';
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
import { AutorizacionesService } from 'src/app/services/autorizaciones.service';
import { RelojServiceService } from 'src/app/services/reloj-service.service';

@Component({
  selector: 'app-all-horas-extras',
  templateUrl: './lista-horas-extras-admin.component.html',
  styleUrls: ['../../aprobar-horas-extras.page.scss'],
})

export class ListaHorasExtrasAdminComponent implements OnInit, OnDestroy {

  @ViewChild (IonDatetime) datetimeInicio: IonDatetime;
  @ViewChild (IonDatetime) datetimeFinal: IonDatetime;

  public horasExtras : any = [];

  username: any;
  subscripted: Subscription;
  skeleton = SkeletonListPermisoArray;
  loading: boolean = true;
  pageActual: number = 1;
  Ver: boolean;

  idEmpleado: any;

  horasExtras_pendientes: HoraExtra[] = [];
  horasExtras_pre_autorizados: HoraExtra[] = [];
  horasExtras_autorizado: HoraExtra[] = [];
  horasExtras_negado: HoraExtra[] = [];

  get fechaInicio(): string { return this.dataUserLoggedService.fechaRangoInicio}
  get fechaFinal(): string { return this.dataUserLoggedService.fechaRangoFinal}

  fechaIn: string = "";
  fechaFi: string = "";

  ArrayAutorizacionTipos: any = [];

  msPendiente: boolean = false;
  msPreautorizado: boolean = false;
  msAutorizado: boolean = false;
  msNegado: boolean = false;

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
    public restAutoriza: AutorizacionesService,
    public usuarioDepa: RelojServiceService,
  ) {

    this.socket.on('recibir_aviso', (data_llega: any) => {
      this.obtenerAllHorasExtras();
    });

  }

  ngOnInit() {
    this.username = this.userService.UserFullname;
    this.idEmpleado = parseInt(localStorage.getItem('empleadoID'));
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

    this.restAutoriza.BuscarAutoridadUsuarioDepa(this.idEmpleado).subscribe(
      (res) => {
        this.ArrayAutorizacionTipos = res;
      }
    );

  }

  ngOnDestroy() {
    this.subscripted.unsubscribe();
  }

  EncerarListas(){
    this.horasExtras_pendientes = [];
    this.horasExtras_pre_autorizados = [];
    this.horasExtras_autorizado = [];
    this.horasExtras_negado = [];
    this.msPendiente = false;
    this.msAutorizado = false;
    this.msPreautorizado = false;
    this.msNegado = false;
  }

  listaHorasFiltradas: any = [];
  listaHorasDeparta: any = [];
  horalista: any = [];
  gerencia: boolean;
  obtenerAllHorasExtras() {
    this.limpiarRango_fechas();
    this.EncerarListas();
    this.pageActual = 1;
    this.listaHorasFiltradas = [];
    this.listaHorasDeparta = [];
    this.horalista = [];
    this.subscripted = this.horasExtrasService.getAllHorasExtras()
      .subscribe(
        horasExtras => {
          this.horasExtras = horasExtras;
          //Filtra la lista de Horas Extras para descartar las solicitudes del mismo usuario y almacena en una nueva lista
          this.listaHorasFiltradas = this.horasExtras.filter(o => {
            if (o.nempleado !== this.username) { // condicion para no mostrar las solicitudes del mismo admin
              return this.listaHorasFiltradas.push(o)
            }
          });

          this.listaHorasFiltradas.forEach(h => {
            h.fecha_inicio_ = this.validar.FormatearFecha(moment(h.fec_inicio).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);
            h.hora_inicio_ = this.validar.FormatearHora(moment(h.fec_inicio).format('HH:mm:ss'), this.formato_hora);
            h.fecha_fin_ = this.validar.FormatearFecha(moment(h.fec_final).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);;
            h.hora_fin_ = this.validar.FormatearHora(moment(h.fec_final).format('HH:mm:ss'), this.formato_hora);
            h.fec_solicita_ = this.validar.FormatearFecha(String(h.fec_solicita), this.formato_fecha, this.validar.dia_completo);
          })


          let i = 0;
          this.listaHorasFiltradas.filter(item => {   
            this.usuarioDepa.ObtenerDepartamentoUsuarios(item.id_contrato).subscribe(
              (usuaDep) => {
                i = i+1;
                this.ArrayAutorizacionTipos.filter(x => {
                  if((usuaDep[0].id_departamento == x.id_departamento && x.nombre == 'GERENCIA') && (x.estado == true)){
                    this.gerencia = true;
                    if(item.estado == 'Pendiente' && (x.autorizar == true || x.preautorizar == true)){
                      this.horalista.push(item);
                    }else if(item.estado == 'Pre-autorizado' && (x.autorizar == true || x.preautorizar == true)){
                      this.horalista.push(item);
                    }else{
                      this.horalista.push(item);
                    }
                  }else if((this.gerencia != true) && (usuaDep[0].id_departamento == x.id_departamento && x.estado == true)){
                    if((item.estado == 'Pendiente' || item.estado == 'Pre-autorizado') && x.preautorizar == true){
                      this.horalista.push(item);
                    }else if((item.estado == 'Pendiente' || item.estado == 'Pre-autorizado') && x.autorizar == true){
                      this.horalista.push(item);
                    }else{
                      this.horalista.push(item);
                    }
                  }
                });

                //Filtra la lista de autorizacion para almacenar en un array
                if(this.listaHorasFiltradas.length === i){
                  this.listaHorasDeparta = this.horalista;

                  this.horasExtras_pendientes = this.listaHorasDeparta.filter(o => {
                    return o.estado === 1
                  });

                  this.horasExtras_pre_autorizados = this.listaHorasDeparta.filter(o => {
                      return o.estado === 2
                  });
        
                  this.horasExtras_autorizado = this.listaHorasDeparta.filter(o => {
                      return o.estado === 3
                  });
        
                  this.horasExtras_negado = this.listaHorasDeparta.filter(o => {
                      return o.estado === 4
                  });

                  //Listado para eliminar el usuario duplicado
                  var ListaSinDuplicadosPendie = [];
                  var cont = 0;
                  this.horasExtras_pendientes.forEach(function(elemento, indice, array) {
                    cont = cont + 1;
                    if(ListaSinDuplicadosPendie.find(p=>p.id == elemento.id) == undefined)
                    {
                      ListaSinDuplicadosPendie.push(elemento);
                    }
                  });

                  if(this.horasExtras_pendientes.length == cont){
                    this.horasExtras_pendientes = ListaSinDuplicadosPendie;

                    this.horasExtras_pendientes.sort(
                      (firstObject: HoraExtra, secondObject: HoraExtra) =>  
                        (firstObject.id >  secondObject.id)? -1 : 1
                    );
                  }

                  this.horasExtras_pre_autorizados.sort(
                    (firstObject: HoraExtra, secondObject: HoraExtra) =>  
                      (firstObject.id >  secondObject.id)? -1 : 1
                  );

                  this.horasExtras_autorizado.sort(
                    (firstObject: HoraExtra, secondObject: HoraExtra) =>  
                      (firstObject.id >  secondObject.id)? -1 : 1
                  );

                  this.horasExtras_negado.sort(
                    (firstObject: HoraExtra, secondObject: HoraExtra) =>  
                      (firstObject.id >  secondObject.id)? -1 : 1
                  );

                  if(this.horasExtras_pendientes.length == 0){
                    this.msPendiente = true;
                  }else if(this.horasExtras_pre_autorizados.length == 0){
                    this.msPreautorizado = true;
                  }else if(this.horasExtras_autorizado.length == 0){
                    this.msAutorizado = true;
                  }else if(this.horasExtras_negado.length == 0){
                    this.msNegado = true;
                  }

                  if (this.horasExtras_pendientes.length == 0 && this.horasExtras_pre_autorizados.length == 0 && this.horasExtras_autorizado.length == 0 && this.horasExtras_negado.length == 0) {
                    this.msPendiente = true;
                    this.msAutorizado = true;
                    this.msPreautorizado = true;
                    this.msNegado = true;
                    this.Ver = true;
                  } else {
                    if((this.pestaniaEstados == 'pendientes') && (this.horasExtras_pendientes.length < 6)){
                      return this.Ver = true;
                    }else if((this.pestaniaEstados == 'pre_autorizados') && (this.horasExtras_pre_autorizados.length < 6)){
                      return this.Ver = true;
                    }else if((this.pestaniaEstados == 'autorizados') && (this.horasExtras_autorizado.length < 6)){
                      return this.Ver = true;
                    }else if((this.pestaniaEstados == 'negados') && (this.horasExtras_negado.length < 6)){
                      return this.Ver = true;
                    }else{
                      this.Ver = false;
                    }
                  }        
                }
              }
            );
          });

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
    this.EncerarListas();
    this.pageActual = 1;
    this.listaHorasFiltradas = [];
    this.listaHorasDeparta = [];
    this.horalista = [];
    if (this.fechaFinal < this.fechaInicio) {
      this.limpiarRango_fechas();
      return this.mostrarToas('La fecha de inicio no puede ser mayor a la fecha final de consulta', 3000, "danger");
    } else {
      this.horasExtrasService.getAllHorasExtrasByFechas(this.fechaInicio.split('T')[0], this.fechaFinal.split('T')[0]).subscribe(
        horasExtras => {
          this.horasExtras = horasExtras;

          //Filtra la lista de Horas Extras para descartar las solicitudes del mismo usuario y almacena en una nueva lista
          this.listaHorasFiltradas = this.horasExtras.filter(o => {
            if (o.nempleado !== this.username) { // condicion para no mostrar las solicitudes del mismo admin
              return this.listaHorasFiltradas.push(o)
            }
          });

          this.listaHorasFiltradas.forEach(h => {
            h.fecha_inicio_ = this.validar.FormatearFecha(moment(h.fec_inicio).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);
            h.hora_inicio_ = this.validar.FormatearHora(moment(h.fec_inicio).format('HH:mm:ss'), this.formato_hora);
            h.fecha_fin_ = this.validar.FormatearFecha(moment(h.fec_final).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);;
            h.hora_fin_ = this.validar.FormatearHora(moment(h.fec_final).format('HH:mm:ss'), this.formato_hora);
            h.fec_solicita_ = this.validar.FormatearFecha(String(h.fec_solicita), this.formato_fecha, this.validar.dia_completo);
          })

          let i = 0;
          this.listaHorasFiltradas.filter(item => {   
            this.usuarioDepa.ObtenerDepartamentoUsuarios(item.id_contrato).subscribe(
              (usuaDep) => {
                i = i+1;
                this.ArrayAutorizacionTipos.filter(x => {
                  if((usuaDep[0].id_departamento == x.id_departamento && x.nombre == 'GERENCIA') && (x.estado == true)){
                    this.gerencia = true;
                    if(item.estado == 'Pendiente' && (x.autorizar == true || x.preautorizar == true)){
                      this.horalista.push(item);
                    }else if(item.estado == 'Pre-autorizado' && (x.autorizar == true || x.preautorizar == true)){
                      this.horalista.push(item);
                    }else{
                      this.horalista.push(item);
                    }
                  }else if((this.gerencia != true) && (usuaDep[0].id_departamento == x.id_departamento && x.estado == true)){
                    if((item.estado == 'Pendiente' || item.estado == 'Pre-autorizado') && x.preautorizar == true){
                      this.horalista.push(item);
                    }else if((item.estado == 'Pendiente' || item.estado == 'Pre-autorizado') && x.autorizar == true){
                      this.horalista.push(item);
                    }else{
                      this.horalista.push(item);
                    }
                  }
                });

                //Filtra la lista de autorizacion para almacenar en un array
                if(this.listaHorasFiltradas.length === i){
                  this.listaHorasDeparta = this.horalista;

                  this.horasExtras_pendientes = this.listaHorasDeparta.filter(o => {
                    return o.estado === 1
                  });

                  this.horasExtras_pre_autorizados = this.listaHorasDeparta.filter(o => {
                      return o.estado === 2
                  });
        
                  this.horasExtras_autorizado = this.listaHorasDeparta.filter(o => {
                      return o.estado === 3
                  });
        
                  this.horasExtras_negado = this.listaHorasDeparta.filter(o => {
                      return o.estado === 4
                  });
                  
                  this.horasExtras_pendientes.sort(
                    (firstObject: HoraExtra, secondObject: HoraExtra) =>  
                      (firstObject.id >  secondObject.id)? -1 : 1
                  );

                  this.horasExtras_pre_autorizados.sort(
                    (firstObject: HoraExtra, secondObject: HoraExtra) =>  
                      (firstObject.id >  secondObject.id)? -1 : 1
                  );

                  this.horasExtras_autorizado.sort(
                    (firstObject: HoraExtra, secondObject: HoraExtra) =>  
                      (firstObject.id >  secondObject.id)? -1 : 1
                  );

                  this.horasExtras_negado.sort(
                    (firstObject: HoraExtra, secondObject: HoraExtra) =>  
                      (firstObject.id >  secondObject.id)? -1 : 1
                  );
                  

                  if (this.horasExtras_pendientes.length == 0 && this.horasExtras_pre_autorizados.length == 0 && this.horasExtras_autorizado.length == 0 && this.horasExtras_negado.length == 0) {
                    this.Ver = true;
                  } else {
                    if((this.pestaniaEstados == 'pendientes') && (this.horasExtras_pendientes.length < 6)){
                      return this.Ver = true;
                    }else if((this.pestaniaEstados == 'pre_autorizados') && (this.horasExtras_pre_autorizados.length < 6)){
                      return this.Ver = true;
                    }else if((this.pestaniaEstados == 'autorizados') && (this.horasExtras_autorizado.length < 6)){
                      return this.Ver = true;
                    }else if((this.pestaniaEstados == 'negados') && (this.horasExtras_negado.length < 6)){
                      return this.Ver = true;
                    }else{
                      this.Ver = false;
                    }
                  }        
                }
              }
            );
          });
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
      this.datetimeFinal.confirm(true);
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
