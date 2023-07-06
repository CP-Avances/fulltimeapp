import { Component, OnInit, ViewChild} from '@angular/core';
import { Permiso } from 'src/app/interfaces/Permisos';
import { ModalController, ToastController, LoadingController, IonDatetime } from '@ionic/angular';
import { SkeletonListPermisoArray } from 'src/app/interfaces/Skeleton';
import { PermisosService } from 'src/app/services/permisos.service';
import { Subscription } from 'rxjs';
import { UpdateAutorizacionComponent } from 'src/app/modals/update-autorizacion/update-autorizacion.component';
import { DataUserLoggedService } from '../../../../../services/data-user-logged.service';
import { Socket } from 'ngx-socket-io';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import moment from 'moment';
import { RelojServiceService } from 'src/app/services/reloj-service.service';
import { AutorizacionesService } from 'src/app/services/autorizaciones.service';


@Component({
  selector: 'app-all-permisos',
  templateUrl: './lista-permisos-admin.component.html',
  styleUrls: ['../../aprobar-permisos.page.scss'],
})
export class ListaPermisosAdminComponent implements OnInit {
  public permisos: any = [];

  @ViewChild (IonDatetime) datetimeInicio: IonDatetime;
  @ViewChild (IonDatetime) datetimeFinal: IonDatetime;

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
  msPendiente: boolean = false;
  msPreautorizado: boolean = false;
  msAutorizado: boolean = false;
  msNegado: boolean = false;

  constructor(
    private permisosService: PermisosService,
    private modalController: ModalController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private userService: DataUserLoggedService,
    private socket: Socket,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    public restAutoriza: AutorizacionesService,
    public usuarioDepa: RelojServiceService,
  ) {
    this.socket.on('recibir_notificacion', (data_llega: any) => {
      this.BuscarFormatos();
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
  ArrayAutorizacionTipos: any = [];
  BuscarFormatos() {
    this.parametro.ObtenerFormatos().subscribe(
      resp => {
        this.formato_fecha = resp.fecha;
        this.formato_hora = resp.hora;
        this.obtenerAllPermisos();
      }
    )

    this.restAutoriza.BuscarAutoridadUsuarioDepa(this.idEmpleado).subscribe(
      (res) => {
        this.ArrayAutorizacionTipos = res;
      }
    );

  }

  InicializarListas(){
    this.permisos_pendientes = [];
    this.permisos_pre_autorizados = [];
    this.permisos_autorizado = [];
    this.permisos_negado = [];
    this.msPendiente = false;
    this.msAutorizado = false;
    this.msPreautorizado = false;
    this.msNegado = false;
  }

  listaPermisosFiltradas: any = [];
  listaPermisosDeparta: any = [];
  permilista: any = [];
  gerencia: boolean;
  obtenerAllPermisos() {
    this.limpiarRango_fechas();
    this.InicializarListas();
    this.pageActual = 1;
    this.listaPermisosFiltradas = [];
    this.listaPermisosDeparta = [];
    this.permilista = [];
    this.subscripted = this.permisosService.getAllPermisos()
      .subscribe(
        permisos => {
          this.permisos = permisos;
          //Filtra la lista de Permisos para descartar las solicitudes del mismo usuario y almacena en una nueva lista
          this.listaPermisosFiltradas = this.permisos.filter((o) => {
            if (this.idEmpleado !== o.id_empl_contrato) {
              return this.listaPermisosFiltradas.push(o);
            }
          });

          this.listaPermisosFiltradas.forEach(p => {
            // TRATAMIENTO DE FECHAS Y HORAS
            p.fec_creacion_ = this.validar.FormatearFecha(p.fec_creacion, this.formato_fecha, this.validar.dia_completo);
            p.fec_inicio_ = this.validar.FormatearFecha(String(p.fec_inicio), this.formato_fecha, this.validar.dia_completo);
            p.fec_final_ = this.validar.FormatearFecha(String(p.fec_final), this.formato_fecha, this.validar.dia_completo);

            p.hora_ingreso_ = this.validar.FormatearHora(p.hora_ingreso, this.formato_hora);
            p.hora_salida_ = this.validar.FormatearHora(p.hora_salida, this.formato_hora);
          })

          let i = 0;
          this.listaPermisosFiltradas.filter(item => {   
            this.usuarioDepa.ObtenerDepartamentoUsuarios(item.id_empl_contrato).subscribe(
              (usuaDep) => {
                i = i+1;

                this.ArrayAutorizacionTipos.filter(x => {
                  if((usuaDep[0].id_departamento == x.id_departamento && x.nombre == 'GERENCIA') && (x.estado == true)){
                    this.gerencia = true;
                    if(item.estado == 'Pendiente' && (x.autorizar == true || x.preautorizar == true)){
                      return this.permilista.push(item);
                    }else if(item.estado == 'Pre-autorizado' && (x.autorizar == true || x.preautorizar == true)){
                      return this.permilista.push(item);
                    }else{
                      return this.permilista.push(item);
                    }
                  }else if((this.gerencia != true) && (usuaDep[0].id_departamento == x.id_departamento && x.estado == true)){
                    if((item.estado == 'Pendiente' || item.estado == 'Pre-autorizado') && x.preautorizar == true){
                      return this.permilista.push(item);
                    }else if((item.estado == 'Pendiente' || item.estado == 'Pre-autorizado') && x.autorizar == true){
                      return this.permilista.push(item);
                    }else{
                      return this.permilista.push(item);
                    }
                  }
                });

                //Filtra la lista de autorizacion para almacenar en un array
                if(this.listaPermisosFiltradas.length === i){
                  this.listaPermisosDeparta = this.permilista

                  this.permisos_pendientes = this.listaPermisosDeparta.filter(o => {
                    return o.estado === 1;
                  });
        
                  this.permisos_pre_autorizados = this.listaPermisosDeparta.filter(o => {
                      return o.estado === 2;
                  });
        
                  this.permisos_autorizado = this.listaPermisosDeparta.filter(o => {
                    return o.estado === 3
                  });
        
                  this.permisos_negado = this.listaPermisosDeparta.filter(o => {
                    return o.estado === 4
                  });

                  //Listado para eliminar el usuario duplicado
                  var ListaSinDuplicadosPendie = [];
                  var cont = 0;
                  this.permisos_pendientes.forEach(function(elemento, indice, array) {
                    cont = cont + 1;
                    if(ListaSinDuplicadosPendie.find(p=>p.id == elemento.id) == undefined)
                    {
                      ListaSinDuplicadosPendie.push(elemento);
                    }
                  });

                  if(this.permisos_pendientes.length == cont){
                    this.permisos_pendientes = ListaSinDuplicadosPendie;

                    this.permisos_pendientes.sort(
                      (firstObject: Permiso, secondObject: Permiso) =>  
                        (firstObject.num_permiso >  secondObject.num_permiso)? -1 : 1
                    );
                  }
                  
                  this.permisos_pre_autorizados.sort(
                    (firstObject: Permiso, secondObject: Permiso) =>  
                      (firstObject.num_permiso >  secondObject.num_permiso)? -1 : 1
                  );

                  this.permisos_autorizado.sort(
                    (firstObject: Permiso, secondObject: Permiso) =>  
                      (firstObject.num_permiso >  secondObject.num_permiso)? -1 : 1
                  );

                  this.permisos_negado.sort(
                    (firstObject: Permiso, secondObject: Permiso) =>  
                      (firstObject.num_permiso >  secondObject.num_permiso)? -1 : 1
                  );

                  if(this.permisos_pendientes.length == 0){
                    this.msPendiente = true;
                  }else if(this.permisos_pre_autorizados.length == 0){
                    this.msPreautorizado = true;
                  }else if(this.permisos_autorizado.length == 0){
                    this.msAutorizado = true;
                  }else if(this.permisos_negado.length == 0){
                    this.msNegado = true;
                  }

                  if (this.permisos_pendientes.length == 0 && this.permisos_pre_autorizados.length == 0 && this.permisos_autorizado.length == 0 && this.permisos_negado.length == 0) {
                    this.msPendiente = true;
                    this.msAutorizado = true;
                    this.msPreautorizado = true;
                    this.msNegado = true;
                    return this.Ver = true;
                  } else {
                    if((this.pestaniaEstados == 'pendientes') && (this.permisos_pendientes.length < 6)){
                      return this.Ver = true;
                    }else if((this.pestaniaEstados == 'pre_autorizados') && (this.permisos_pre_autorizados.length < 6)){
                      return this.Ver = true;
                    }else if((this.pestaniaEstados == 'autorizados') && (this.permisos_autorizado.length < 6)){
                      return this.Ver = true;
                    }else if((this.pestaniaEstados == 'negados') && (this.permisos_negado.length < 6)){
                      return this.Ver = true;
                    }else{
                      this.Ver = false;
                    }
                  }

                }
            });
            
          });
          
        },
        err => {
          this.msPendiente = true;
          this.msAutorizado = true;
          this.msPreautorizado = true;
          this.msNegado = true;
          console.log(err);
        },
        () => {
          this.loading = false
        })
  }

  async presentModalAutorizarPermiso(permiso: Permiso) {
    const modal = await this.modalController.create({
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
    return;
  }

  pestaniaEstados: string = 'pendientes';
  cambioPestaniaEstados(estado) {
    this.pestaniaEstados = estado;
    this.obtenerAllPermisos();
  }

  isChecked: boolean = false;
  isCheckedPre: boolean = false;
  async ChangeAprobacionMultiple(isChecked: boolean) {

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
    if(data.length > 0){
      this.permisos_pendientes = data
    } else{
      this.permisos_pendientes = null;
    }
  }

  allCheckPreAutorizados(data: Permiso[]) {
    if(data.length > 0){
    this.permisos_pre_autorizados = data
    }else{
      this.permisos_pre_autorizados = null
    }
  }

  BuscarByFecha() {
    this.InicializarListas();
    this.pageActual = 1;
    this.listaPermisosFiltradas = [];
    this.listaPermisosDeparta = [];
    this.permilista = [];
    if (this.fechaFinal < this.fechaInicio) {
      this.limpiarRango_fechas();
      return this.mostrarToas('La fecha de inicio no puede ser mayor a la fecha final de consulta', 3000, "danger");
    } else {
      this.permisosService.getAllPermisosByFechas(this.fechaInicio.split('T')[0], this.fechaFinal.split('T')[0]).subscribe(
        permisos => {
          this.permisos = permisos;
          //Filtra la lista de Permisos para descartar las solicitudes del mismo usuario y almacena en una nueva lista
          this.listaPermisosFiltradas = this.permisos.filter((o) => {
            if (this.idEmpleado !== o.id_empl_contrato) {
              return this.listaPermisosFiltradas.push(o);
            }
          });

          this.listaPermisosFiltradas.forEach(p => {
            // TRATAMIENTO DE FECHAS Y HORAS
            p.fec_creacion_ = this.validar.FormatearFecha(p.fec_creacion, this.formato_fecha, this.validar.dia_completo);
            p.fec_inicio_ = this.validar.FormatearFecha(String(p.fec_inicio), this.formato_fecha, this.validar.dia_completo);
            p.fec_final_ = this.validar.FormatearFecha(String(p.fec_final), this.formato_fecha, this.validar.dia_completo);

            p.hora_ingreso_ = this.validar.FormatearHora(p.hora_ingreso, this.formato_hora);
            p.hora_salida_ = this.validar.FormatearHora(p.hora_salida, this.formato_hora);
          })

          let i = 0;
          this.listaPermisosFiltradas.filter(item => {   
            this.usuarioDepa.ObtenerDepartamentoUsuarios(item.id_empl_contrato).subscribe(
              (usuaDep) => {
                i = i+1;

                console.log('ArrayAutorizacionTipos: ',this.ArrayAutorizacionTipos);

                this.ArrayAutorizacionTipos.filter(x => {
                  if((usuaDep[0].id_departamento == x.id_departamento && x.nombre == 'GERENCIA') && (x.estado == true)){
                    this.gerencia = true;
                    if(item.estado == 'Pendiente' && (x.autorizar == true || x.preautorizar == true)){
                      this.permilista.push(item);
                    }else if(item.estado == 'Pre-autorizado' && (x.autorizar == true || x.preautorizar == true)){
                      this.permilista.push(item);
                    }else{
                      this.permilista.push(item);
                    }
                  }else if((this.gerencia != true) && (usuaDep[0].id_departamento == x.id_departamento && x.estado == true)){
                    if((item.estado == 'Pendiente' || item.estado == 'Pre-autorizado') && x.preautorizar == true){
                      this.permilista.push(item);
                    }else if((item.estado == 'Pendiente' || item.estado == 'Pre-autorizado') && x.autorizar == true){
                      this.permilista.push(item);
                    }else{
                      this.permilista.push(item);
                    }
                  }
                });

                //Filtra la lista de autorizacion para almacenar en un array
                if(this.listaPermisosFiltradas.length === i){
                  this.listaPermisosDeparta = this.permilista

                  this.permisos_pendientes = this.listaPermisosDeparta.filter(o => {
                    return o.estado === 1;
                  });
        
                  this.permisos_pre_autorizados = this.listaPermisosDeparta.filter(o => {
                      return o.estado === 2;
                  });
        
                  this.permisos_autorizado = this.listaPermisosDeparta.filter(o => {
                    return o.estado === 3
                  });
        
                  this.permisos_negado = this.listaPermisosDeparta.filter(o => {
                    return o.estado === 4
                  });

                  //Listado para eliminar el usuario duplicado
                  var ListaSinDuplicadosPendie = [];
                  var cont = 0;
                  this.permisos_pendientes.forEach(function(elemento, indice, array) {
                    cont = cont + 1;
                    if(ListaSinDuplicadosPendie.find(p=>p.id == elemento.id) == undefined)
                    {
                      ListaSinDuplicadosPendie.push(elemento);
                    }
                  });

                  if(this.permisos_pendientes.length == cont){
                    this.permisos_pendientes = ListaSinDuplicadosPendie;

                    this.permisos_pendientes.sort(
                      (firstObject: Permiso, secondObject: Permiso) =>  
                        (firstObject.num_permiso >  secondObject.num_permiso)? -1 : 1
                    );
                  }

                  this.permisos_pre_autorizados.sort(
                    (firstObject: Permiso, secondObject: Permiso) =>  
                      (firstObject.num_permiso >  secondObject.num_permiso)? -1 : 1
                  );

                  this.permisos_autorizado.sort(
                    (firstObject: Permiso, secondObject: Permiso) =>  
                      (firstObject.num_permiso >  secondObject.num_permiso)? -1 : 1
                  );

                  this.permisos_negado.sort(
                    (firstObject: Permiso, secondObject: Permiso) =>  
                      (firstObject.num_permiso >  secondObject.num_permiso)? -1 : 1
                  );

                  if(this.permisos_pendientes.length == 0){
                    this.msPendiente = true;
                  }else if(this.permisos_pre_autorizados.length == 0){
                    this.msPreautorizado = true;
                  }else if(this.permisos_autorizado.length == 0){
                    this.msAutorizado = true;
                  }else if(this.permisos_negado.length == 0){
                    this.msNegado = true;
                  }

                  if (this.permisos_pendientes.length == 0 && this.permisos_pre_autorizados.length == 0 && this.permisos_autorizado.length == 0 && this.permisos_negado.length == 0) {
                    this.msPendiente = true;
                    this.msAutorizado = true;
                    this.msPreautorizado = true;
                    this.msNegado = true;
                    return this.Ver = true;
                  } else {
                    if((this.pestaniaEstados == 'pendientes') && (this.permisos_pendientes.length < 6)){
                      return this.Ver = true;
                    }else if((this.pestaniaEstados == 'pre_autorizados') && (this.permisos_pre_autorizados.length < 6)){
                      return this.Ver = true;
                    }else if((this.pestaniaEstados == 'autorizados') && (this.permisos_autorizado.length < 6)){
                      return this.Ver = true;
                    }else if((this.pestaniaEstados == 'negados') && (this.permisos_negado.length < 6)){
                      return this.Ver = true;
                    }else{
                      this.Ver = false;
                    }
                  }

                }
            }); 
          });
        },
        err => {
          this.msPendiente = true;
          this.msAutorizado = true;
          this.msPreautorizado = true;
          this.msNegado = true;
          console.log(err);
        }
      )
    }
  }

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
