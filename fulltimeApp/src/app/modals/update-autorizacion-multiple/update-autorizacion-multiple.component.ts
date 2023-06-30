import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AutorizacionesService } from '../../services/autorizaciones.service';
import { ValidacionesService } from '../../libs/validaciones.service';

import { Cg_TipoPermiso } from 'src/app/interfaces/Catalogos';
import { estadoSelectItems, EstadoSolicitudes } from '../../interfaces/Estados';
import { Permiso, cg_permisoValueDefault } from '../../interfaces/Permisos';
import { Vacacion } from 'src/app/interfaces/Vacacion';
import { HoraExtra } from 'src/app/interfaces/HoraExtra';

import { Autorizacion } from '../../interfaces/Autorizaciones';
import {
  Notificacion, notificacionValueDefault, SettingsInfoEmpleado, NotificacionTimbre,
  notificacionTimbreValueDefault
} from 'src/app/interfaces/Notificaciones';
import { DataUserLoggedService } from '../../services/data-user-logged.service';
import { ModalController, LoadingController } from '@ionic/angular';
import { PlantillaReportesService } from '../../libs/plantilla-reportes.service';
import { CatalogosService } from 'src/app/services/catalogos.service';
import moment from 'moment';

import { HorasExtrasService } from 'src/app/services/horas-extras.service';
import { PermisosService } from 'src/app/services/permisos.service';
import { VacacionesService } from 'src/app/services/vacaciones.service';
import { ParametrosService } from 'src/app/services/parametros.service';

@Component({
  selector: 'app-update-autorizacion-multiple',
  templateUrl: './update-autorizacion-multiple.component.html',
  styleUrls: ['./update-autorizacion-multiple.component.scss'],
})
export class UpdateAutorizacionMultipleComponent implements OnInit {

  @ViewChild('formRegistro', { static: true }) ngForm: NgForm;
  showForm: boolean = true;
  @Input() permisos: Permiso[];
  @Input() vacaciones: Vacacion[];
  @Input() horas_extras: HoraExtra[];
  @Input() labelAutorizacion: string = '';

  autorizaciones: Autorizacion[] = [];

  loadingBtn: boolean = false;
  estadoSelectItems = estadoSelectItems;
  estadoChange: EstadoSolicitudes;

  departamentoChange: any = [];

  estados: any = [];

  infoEmpleadoRecibe: SettingsInfoEmpleado[] = [];

  get fechaInicio(): string { return this.dataUserServices.fechaRangoInicio }
  get fechaFinal(): string { return this.dataUserServices.fechaRangoFinal }

  cg_permiso: Cg_TipoPermiso = cg_permisoValueDefault;
  public get cg_tipo_permisos(): Cg_TipoPermiso[] {
    return this.catalogos.cg_tipo_permisos
  }

  idEmpleado: number;
  idEmpresa: number;
  solInfo: any;
  username: any;

  ocultar: boolean = true;
  oculDepa: boolean = true;

  //VARIABLES PARA VALIDAR Y ENVIAR LOS CORREOS DE APROBACION
  public listaEnvioCorreo: any = [];
  listadoDepaAutorizaCorreo: any = [];
  id_depart: any;

  constructor(
    public catalogos: CatalogosService,
    private dataUserServices: DataUserLoggedService,
    private horaExtraService: HorasExtrasService,
    private vacacionService: VacacionesService,
    private permisoService: PermisosService,
    private plantillaPDF: PlantillaReportesService,
    private autoService: AutorizacionesService,
    private validar: ValidacionesService,
    public loadingController: LoadingController,
    public modalController: ModalController,
    public parametro: ParametrosService,
    public restAutoriza: AutorizacionesService,
  ) {
    this.idEmpresa = parseInt(localStorage.getItem('id_empresa'));
    this.idEmpleado = parseInt(localStorage.getItem('empleadoID'));
  }

  tiempo: any;
  ngOnInit() {
    this.username = this.dataUserServices.UserFullname;
    this.tiempo = moment();
    const id_empresa = localStorage.getItem('id_empresa');
    (id_empresa !== null) ? this.plantillaPDF.ShowColoresLogo(id_empresa) : this.plantillaPDF.abrirToas('No existe codigo de empresa', 'danger', 3000)
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
        this. BuscarTipoAutorizacion();
      }
    )
  }


  public ArrayAutorizacionTipos: any = []
  autorizaDirecto: boolean = false;
  InfoListaAutoriza: any = [];
  gerencia: boolean = false;
  nuevoAutorizacionTipos: any = [];
  BuscarTipoAutorizacion(){
    this.ArrayAutorizacionTipos = [];
    this.nuevoAutorizacionTipos = [];
    var i = 0;
    this.restAutoriza.BuscarAutoridadUsuarioDepa(this.idEmpleado).subscribe(
      (res) => {
        this.ArrayAutorizacionTipos = res;
        this.nuevoAutorizacionTipos = this.ArrayAutorizacionTipos.filter(item => {
          i += 1;
          return item.estado == true
        });

        if(i == this.ArrayAutorizacionTipos.length){
          if(this.nuevoAutorizacionTipos.length < 2){
            this.oculDepa = true;
            this.id_depart = this.nuevoAutorizacionTipos[0].id_departamento;
            this.obtenerAutorizacion();
          }else{
            this.oculDepa = false;
          }

          this.nuevoAutorizacionTipos.filter(x => {
            if(x.nombre == 'GERENCIA' && x.estado == true){
              this.gerencia = true;
              this.autorizaDirecto = false;
              this.InfoListaAutoriza = x;
              if(x.autorizar == true){
                this.estados = [
                  { id: 3, nombre: 'Autorizado' },
                  { id: 4, nombre: 'Negado' }
                ];
              }else if(x.preautorizar == true){
                this.estados = [
                  { id: 2, nombre: 'Pre-autorizado' },
                  { id: 4, nombre: 'Negado'}
                ];
              }
            }
            else if((this.gerencia == false) && (x.estado == true) && (x.id_departamento == this.id_depart)){
              this.autorizaDirecto = true;
              this.InfoListaAutoriza = x;
              if(x.autorizar == true){
                this.estados = [
                  { id: 3, nombre: 'Autorizado' },
                  { id: 4, nombre: 'Negado' }
                ];
              }else if(x.preautorizar == true){
                this.estados = [
                  { id: 2, nombre: 'Pre-autorizado' },
                  { id: 4, nombre: 'Negado'}
                ];
              }
            }
          });          
        }
      }
    );
  }

  lectura: number = 0;
  estado_auto: any;
  listadoDepaAutoriza: any = [];
  ListaPermisos: Permiso[];
  ListaVacaciones: Vacacion[];
  ListaHoras_extras: HoraExtra[];
  obtenerAutorizacion() {

    if (this.permisos) {
      var cont = 0;
      this.ListaPermisos = [];
      this.ListaPermisos = this.permisos.filter(item => {
        cont += 1;
        return item.id_departamento == this.id_depart;    
      })
      if(this.ListaPermisos.length == cont){
        this.listadoDepaAutoriza = [];
        this.lectura = 1;
        if(this.ListaPermisos.length != 0){
          this.ListaPermisos.forEach(o => {
            if (o.nempleado != this.username) {
              this.autoService.getInfoEmpleadoByCodigo(o.codigo).subscribe(
                res => {
                  if (o.nempleado != this.username) {
                    if (res.estado === 1) {
                      var estado = true;
                    }
                    this.solInfo = [];
                    this.solInfo = {
                      permiso_mail: res.permiso_mail,
                      permiso_noti: res.permiso_noti,
                      empleado: res.id_empleado,
                      id_dep: res.id_departamento,
                      id_suc: res.id_sucursal,
                      estado: estado,
                      correo: res.correo,
                    }
                    this.processInfoEmpleado(res)
                  }
  
                },
                err => { this.errorResponse(err.error.message) },
              )
            }
  
            if (o.nempleado != this.username) {
              this.autoService.getAutorizacionPermiso(o.id).subscribe(
                autorizacion => { 
                this.autorizaciones.push(autorizacion);
                this.ConfiguracionAutorizacion(autorizacion, o); 
              },
              err => { this.errorResponse(err.error.message) },
              () => {}
              )
            }
          });
          return
        }else{
          this.mensaje = 'No hay solicitudes seleccionadas del departamento de '+this.departamentoChange.depa_autoriza;
          this.ocultar = true;
          return
        }
        
      }else{
        this.mensaje = 'No hay solicitudes seleccionadas del departamento de '+this.departamentoChange.depa_autoriza;
        this.ocultar = true;
        return
      }
    }

    if (this.vacaciones) {
      var cont = 0;
      this.ListaVacaciones = [];
      this.ListaVacaciones = this.vacaciones.filter(item => {
        cont += 1;
        return item.id_departamento == this.id_depart; 
      })

      if(this.vacaciones.length == cont){
        this.listadoDepaAutoriza = [];
        this.lectura = 1;
        if(this.ListaVacaciones.length != 0){
          this.ListaVacaciones.forEach(o => {
            if (o.nempleado != this.username) {
              this.autoService.getInfoEmpleadoByCodigo(o.codigo).subscribe(
                res => {
                  if (res.estado === 1) {
                    var estado = true;
                  }
                  this.solInfo = [];
                  this.solInfo = {
                    vaca_mail: res.vaca_mail,
                    vaca_noti: res.vaca_noti,
                    empleado: res.id_empleado,
                    id_suc: res.id_sucursal,
                    id_dep: res.id_departamento,
                    estado: estado,
                    correo: res.correo,
                  }
                  this.processInfoEmpleado(res)
                },
                err => { this.errorResponse(err.error.message) },
              )
            }
  
            if (o.nempleado != this.username) {
              this.autoService.getAutorizacionVacacion(o.id).subscribe(
                autorizacion => { 
                  this.autorizaciones.push(autorizacion);
                  this.ConfiguracionAutorizacion(autorizacion, o);  
                },
                err => { this.errorResponse(err.error.message) },
                () => {}
              )
            }
          });
          return
        }else{
          this.mensaje = 'No hay solicitudes seleccionadas del departamento de '+this.departamentoChange.depa_autoriza;
          this.ocultar = true;
          return
        } 
      }else{
        this.mensaje = 'No hay solicitudes seleccionadas del departamento de '+this.departamentoChange.depa_autoriza;
        this.ocultar = true;
        return
      }
    }

    if (this.horas_extras) {
      var cont = 0;
      this.ListaHoras_extras = [];
      this.ListaHoras_extras = this.horas_extras.filter(item => {
        cont += 1;
        return item.id_departamento == this.id_depart;    
      })

      if(this.horas_extras.length == cont){
        this.listadoDepaAutoriza = [];
        this.lectura = 1;
        if(this.ListaHoras_extras.length != 0){
          this.ListaHoras_extras.forEach(o => {
            this.autoService.getInfoEmpleadoByCodigo(o.codigo).subscribe(
              res => {
                if (res.estado === 1) {
                  var estado = true;
                }
                this.solInfo = [];
                this.solInfo = {
                  hora_extra_mail: res.hora_extra_mail,
                  hora_extra_noti: res.hora_extra_noti,
                  empleado: res.id_empleado,
                  id_suc: res.id_sucursal,
                  id_dep: res.id_departamento,
                  estado: estado,
                  correo: res.correo,
                }
                this.processInfoEmpleado(res)
              },
              err => { this.errorResponse(err.error.message) },
            )
            if (o.nempleado != this.username) {
              this.autoService.getAutorizacionHoraExtra(o.id).subscribe(
                autorizacion => { 
                  this.autorizaciones.push(autorizacion);
                  this.ConfiguracionAutorizacion(autorizacion, o);  
                },
                err => { this.errorResponse(err.error.message) },
                () => {}
              )
            }
          });
          return
        }else{
          this.mensaje = 'No hay solicitudes en el departamento de '+this.departamentoChange.depa_autoriza;
          this.ocultar = true;
          return
        } 
      }else{
        this.mensaje = 'No hay solicitudes en el departamento de '+this.departamentoChange.depa_autoriza;
        this.ocultar = true;
        return
      }
    }

  }

  processInfoEmpleado(info: SettingsInfoEmpleado) {

    console.log(info.fullname, " = ", this.username);

    if (info === null) {
      this.showForm = false;
      this.permisos = [];
      this.vacaciones = [];
      this.horas_extras = [];
    }
    this.infoEmpleadoRecibe.push(info);
  }

  ChangeDepa(e: any) {
    if (e.target.value != null && e.target.value != undefined) {
      const [departamento] = this.ArrayAutorizacionTipos.filter(o => {
        return o.id_depa_confi === e.target.value
      })
      this.departamentoChange = departamento;
      this.id_depart = this.departamentoChange.id_departamento;
      this.BuscarTipoAutorizacion()
      this.obtenerAutorizacion();
    }
  }


  ChangeEstado(e: any) {
    if (e.target.value != 1 && e.target.value != null && e.target.value != undefined) {
      const [autorizacion] = this.estadoSelectItems.filter(o => {
        return o.id === e.target.value
      })
      this.estadoChange = autorizacion
    }
  }

  nivel_padre: number = 0;
  cont: number = 0;
  mensaje: any;
  listafiltrada: any = [];
  // PARA VALIDAR SI LE CORRESPONDE REALIZAR LA APROBACION DE LA SOLICITUD
  ConfiguracionAutorizacion(autorizacion: any, solicitud: any){
    var autorizaciones = autorizacion.id_documento.split(',');
    autorizaciones.map((obj: string) => {
      this.lectura = this.lectura + 1;
      if (obj != '') {
        let empleado_id = obj.split('_')[0];
        this.estado_auto = obj.split('_')[1];

        // CAMBIAR DATO ESTADO INT A VARCHAR
        if (this.estado_auto === '1') {
          this.estado_auto = 'Pendiente';
        }
        if (this.estado_auto === '2') {
          this.estado_auto = 'Preautorizado';
        }

        // CREAR ARRAY DE DATOS DE COLABORADORES
        var data = {
          id_empleado: empleado_id,
          estado: this.estado_auto
        }

        if((this.estado_auto === 'Pendiente') || (this.estado_auto === 'Preautorizado')){
          //Valida que el usuario que va a realizar la aprobacion le corresponda su nivel y autorice caso contrario se oculta el boton de aprobar.
          this.restAutoriza.BuscarListaAutorizaDepa(autorizacion.id_departamento).subscribe(res => {
            this.listadoDepaAutoriza = res;
            this.cont = 0;
            this.listadoDepaAutoriza.filter(item => {
              this.cont = this.cont + 1;
              this.nivel_padre = item.nivel_padre;
              if((this.idEmpleado == item.id_contrato) && (autorizaciones.length ==  item.nivel)){
                this.listafiltrada.push(solicitud);
                return this.ocultar = false;
              }
            })
          });
        }else{
          this.ocultar = true;
        }
      }else{
        if(autorizaciones.length < 2){
          //Valida que el usuario que va a realizar la aprobacion le corresponda su nivel y autorice caso contrario se oculta el boton de aprobar.
          this.restAutoriza.BuscarListaAutorizaDepa(autorizacion.id_departamento).subscribe(res => {
            this.listadoDepaAutoriza = res;
            this.cont = 0;
            this.listadoDepaAutoriza.filter(item => {
              this.cont = this.cont + 1;
              if((this.idEmpleado == item.id_contrato) && (autorizaciones.length ==  item.nivel)){
                this.listafiltrada.push(solicitud);
                return this.ocultar = false;
              }
            })
          });
        }
      }
    });
  }

  async UpdateRegister() {
    if (this.estadoChange.id == null) {
      return this.validar.showToast("Seleccione la Autorización", 2000, 'warning');
    }
    else {
      this.loadingBtn = true;
      await this.autorizaciones.forEach(a => {
        a.estado = this.estadoChange.id
        const data = {
          estado: a.estado,
          id_documento: a.id_documento + `${localStorage.getItem("empleadoID")}_${this.estadoChange.id},`
        }

        if (this.ListaPermisos) {
          var [per] = this.listafiltrada.filter(o => { return o.id === a.id_permiso });
          var [info] = this.infoEmpleadoRecibe.filter(o => { return o.codigo === per.codigo })

          this.autoService.putAutorizacionPermiso(a.id_permiso, data).subscribe(
            autorizacion => { this.successResponse(per, autorizacion, 'permiso', info) },
            err => { this.errorResponse(err.error.message) },
          )
        }

        if (this.vacaciones) {
          var [vac] = this.listafiltrada.filter(o => { return o.id === a.id_vacacion });
          var [info] = this.infoEmpleadoRecibe.filter(o => { return o.codigo === vac.codigo })

          this.autoService.putAutorizacionVacacion(a.id_vacacion, data).subscribe(
            autorizacion => { this.successResponse(vac, autorizacion, 'vacacion', info) },
            err => { this.errorResponse(err.error.message) },
          )
        }

        if (this.ListaHoras_extras) {
          var [hor] = this.listafiltrada.filter(o => { return o.id === a.id_hora_extra });
          var [info] = this.infoEmpleadoRecibe.filter(o => { return o.codigo === hor.codigo })

          this.autoService.putAutorizacionHoraExtra(a.id_hora_extra, data).subscribe(
            autorizacion => { this.successResponse(hor, autorizacion, 'hora_extra', info) },
            err => { this.errorResponse(err.error.message) },
          )
        }
      })

      this.presentLoading()
    }
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Procesando aprobaciones...',
      duration: 2500
    });
    await loading.present();
    this.generarPDF();
    this.loadingBtn = false;
    this.closeModal(true);
  }

  closeModal(refreshInfo: Boolean) {
    this.estadoChange = { id: 1, nombre: 'Pendiente' };
    this.permisos = [];
    this.vacaciones = [];
    this.horas_extras = [];
    this.modalController.dismiss({
      'refreshInfo': refreshInfo
    });
  }

  dataAprobacion: any = [];
  successResponse(dataSolicitud: any, autorizacion: Autorizacion, solicitud: string, infoEmpleadoRecibe: SettingsInfoEmpleado) {

    this.dataAprobacion.push({ dataSolicitud, autorizacion, solicitud });

    const { permiso_mail, permiso_noti, vaca_mail, vaca_noti, hora_extra_mail, hora_extra_noti } = infoEmpleadoRecibe;

    switch (solicitud) {
      case 'permiso':
        this.autoService.updateEstadoSolicitudes(
          { estado: this.estadoChange.id, id_solicitud: dataSolicitud.id }, 'permisos').subscribe(
            resp => { this.validar.showToast(resp.message, 3000, 'success') },
            err => { this.validar.showToast(err.error.message, 3000, 'danger') },
          )
        /* if (permiso_mail) {
           this.SendEmailPermiso(dataSolicitud, infoEmpleadoRecibe)
         }
         if (permiso_noti) {
           this.SendNotificacionBackEnd(this.notificacion);
         }*/
        console.log('ver datos de permisos multiples...', dataSolicitud,
          ' datos empleado ... ', infoEmpleadoRecibe, ' tamaño... ', this.ListaPermisos.length)

        this.NotificarAprobacionPermisos(dataSolicitud, infoEmpleadoRecibe, this.estadoChange.id);
        break;
      case 'vacacion':
        this.autoService.updateEstadoSolicitudes({ estado: this.estadoChange.id, id_solicitud: dataSolicitud.id }, 'vacaciones').subscribe(
          resp => { this.validar.showToast(resp.message, 3000, 'success') },
          err => { this.validar.showToast(err.error.message, 3000, 'danger') },
        )
        /* if (vaca_mail) {
           this.SendEmailVacaciones(dataSolicitud, infoEmpleadoRecibe)
         }
         if (vaca_noti) {
           this.SendNotificacionBackEnd(this.notificacion);
         }*/
        console.log('ver datos de permisos multiples...', dataSolicitud,
          ' datos empleado ... ', infoEmpleadoRecibe, ' tamaño... ', this.vacaciones.length)
        this.NotificarAprobacionVacacion(dataSolicitud, infoEmpleadoRecibe, this.estadoChange.id);
        break;
      case 'hora_extra':
        this.autoService.updateEstadoSolicitudes({ estado: this.estadoChange.id, id_solicitud: dataSolicitud.id }, 'hora_extr_pedidos').subscribe(
          resp => { this.validar.showToast(resp.message, 3000, 'success') },
          err => { this.validar.showToast(err.error.message, 3000, 'danger') },
        )
        /*if (hora_extra_mail) {
          this.SendEmailHorasExtras(dataSolicitud, infoEmpleadoRecibe);
        }
        if (hora_extra_noti) {
          this.SendNotificacionBackEnd(this.notificacion);
        }*/
        console.log('ver datos de permisos multiples...', dataSolicitud,
          ' datos empleado ... ', infoEmpleadoRecibe, ' tamaño... ', this.ListaHoras_extras.length)
        this.NotificarAprobacionHE(dataSolicitud, infoEmpleadoRecibe, this.estadoChange.id);
        break;

      default:
        break;
    }

    return this.showMessageSuccess()
  }

  /** ******************************************************************************************* **
   ** **                           MANEJO DE APROBACIONES DE PERMISOS                          ** **
   ** ******************************************************************************************* **/

  // METODO DE ENVIO DE NOTIFICACIONES RESPECTO A LA APROBACION
  NotificarAprobacionPermisos(permiso: any, infoUsuario: any, estado: number) {
    var datos = {
      depa_user_loggin: infoUsuario.id_departamento,
      objeto: permiso,
    }

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (estado === 2) {
      var estado_p = 'Preautorizado';
      var estado_c = 'Preautorizada';
    }
    else if (estado === 3) {
      var estado_p = 'Autorizado';
      var estado_c = 'Autorizada';
    }
    else if (estado === 4) {
      var estado_p = 'Negado';
      var estado_c = 'Negada';
    }

    let correo_envia;
    this.cg_tipo_permisos.filter(o => {
      if(o.id === permiso.id_tipo_permiso){
        if(estado === 2){
          if(o.id === permiso.id_tipo_permiso){
            console.log('correo_envia: ',o, " : ",o.correo_preautorizar)
            return correo_envia = o.correo_preautorizar;
          }
        }else if(estado === 3){
          if(o.id === permiso.id_tipo_permiso){
            console.log('correo_envia: ',o, " : ",o.correo_autorizar)
            return correo_envia = o.correo_autorizar;
          }
        }else if(estado === 4){
          if(o.id === permiso.id_tipo_permiso){
            console.log('correo_envia: ',o, " : ",o.correo_negar)
            return correo_envia = o.correo_negar;
        }
      } 
      }
    })

    console.log('correo_envia: ',correo_envia)
    this.autoService.BuscarJefes(datos).subscribe(permiso => {
      permiso.EmpleadosSendNotiEmail.push(this.solInfo);
      if(correo_envia === true){
        this.configuracionCorreoPermiso(permiso, estado_p, estado_c);
      }
      this.EnviarNotificacionPermiso(permiso, estado_p, infoUsuario);
      this.validar.showToast('Proceso realizado exitosamente.', 5000, 'success');
    });
  }

  autorizacionPE: any = [];
  configuracionCorreoPermiso(permiso: any, estado_p: string, estado_c: string){
    console.log('ver Permiso ....   ', permiso);
    this.listadoDepaAutoriza = [];
    this.listaEnvioCorreo = [];
    this.lectura = 1;

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO
    let solicitud = this.validar.FormatearFecha(permiso.fec_creacion, this.formato_fecha, this.validar.dia_completo);
    let desde = this.validar.FormatearFecha(permiso.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(permiso.fec_final, this.formato_fecha, this.validar.dia_completo);

    this.autoService.getAutorizacionPermiso(permiso.id).subscribe(res1 => {
      this.autorizacionPE = res1;
      // METODO PARA OBTENER EMPLEADOS Y ESTADOS
      var autorizaciones = this.autorizacionPE.id_documento.split(',');
      autorizaciones.map((obj: string) => {
        this.lectura = this.lectura + 1;
        if (obj != '') {
          let empleado_id = obj.split('_')[0];
          this.estado_auto = obj.split('_')[1];

          // CREAR ARRAY DE DATOS DE COLABORADORES
          var data = {
            id_empleado: empleado_id,
            estado: this.estado_auto
          }

          // CAMBIAR DATO ESTADO INT A VARCHAR
          if (this.estado_auto === '1') {
            this.estado_auto = 'Pendiente';
          }
          if (this.estado_auto === '2') {
            this.estado_auto = 'Preautorizado';
          }

          // CUANDO TODOS LOS DATOS SE HAYAN REVISADO EJECUTAR METODO DE INFORMACIÓN DE AUTORIZACIÓN
          if (this.lectura === autorizaciones.length) {
            if((this.estado_auto === 'Pendiente') || (this.estado_auto === 'Preautorizado')){
              this.restAutoriza.BuscarListaAutorizaDepa(this.autorizacionPE.id_departamento).subscribe(res => {
                this.listadoDepaAutoriza = res;
                this.listadoDepaAutoriza.filter(item => {
                  if((item.nivel === autorizaciones.length) && (item.nivel_padre === item.nivel)){
                    return this.listaEnvioCorreo.push(item);
                  }else if((item.nivel === autorizaciones.length || item.nivel === (autorizaciones.length - 1))){
                    return this.listaEnvioCorreo.push(item);
                  }
                })
                this.EnviarCorreoPermiso(permiso, this.listaEnvioCorreo, estado_p, estado_c, solicitud, desde, hasta);
              });
            }else if(this.estado_auto > 2){
              this.restAutoriza.BuscarListaAutorizaDepa(this.autorizacionPE.id_departamento).subscribe(res => {
                this.listadoDepaAutoriza = res;
                this.listadoDepaAutoriza.filter(item => {
                  if((item.nivel_padre === this.InfoListaAutoriza.nivel) && (item.nivel_padre === item.nivel)){
                    this.autorizaDirecto = false;
                    return this.listaEnvioCorreo.push(item);
                  }else{
                    this.autorizaDirecto = true;
                  }
                })

                //Esta condicion es para enviar el correo a todos los usuraios que autorizan siempre y cuando la solicitud fue negada antes
                if(this.autorizaDirecto === true){
                  this.listaEnvioCorreo = this.listadoDepaAutoriza;
                }

                this.EnviarCorreoPermiso(permiso, this.listaEnvioCorreo, estado_p, estado_c, solicitud, desde, hasta);
              });
            }
          }
        }else if(autorizaciones.length == 1){
          this.restAutoriza.BuscarListaAutorizaDepa(this.autorizacionPE.id_departamento).subscribe(res => {
            this.listadoDepaAutoriza = res;
            this.listadoDepaAutoriza.filter(item => {
              if(item.nivel < 3 ){
                return this.listaEnvioCorreo.push(item);  
              }
            })
            this.EnviarCorreoPermiso(permiso, this.listaEnvioCorreo, estado_p, estado_c, solicitud, desde, hasta);
          });
        }
      })
    });  

  }


  EnviarCorreoPermiso(permiso: any, listaEnvioCorreo: any, estado_p: string, estado_c: string, solicitud: any, desde: any, hasta: any) {
    var cont = 0;
    var correo_usuarios = '';
    permiso.EmpleadosSendNotiEmail = listaEnvioCorreo;
    permiso.EmpleadosSendNotiEmail.push(this.solInfo);
    console.log('nueva lista PE: ',permiso.EmpleadosSendNotiEmail);

    // VERIFICACIÓN QUE TODOS LOS DATOS HAYAN SIDO LEIDOS PARA ENVIAR CORREO
    permiso.EmpleadosSendNotiEmail.forEach(e => {

      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      // SI EL USUARIO SE ENCUENTRA ACTIVO Y TIENEN CONFIGURACIÓN RECIBIRA CORREO DE SOLICITUD DE VACACIÓN
      if (e.permiso_mail) {
        if (e.estado === true) {
          if (correo_usuarios === '') {
            correo_usuarios = e.correo;
          }
          else {
            correo_usuarios = correo_usuarios + ', ' + e.correo
          }
        }
      }

      console.log('contadores', permiso.EmpleadosSendNotiEmail.length + ' cont ' + cont)

      if (cont === permiso.EmpleadosSendNotiEmail.length) {

        console.log('data entra correo usuarios', correo_usuarios)

        let datosPermisoCreado = {
          solicitud: solicitud,
          desde: desde,
          hasta: hasta,
          h_inicio: this.validar.FormatearHora(permiso.hora_salida, this.formato_hora),
          h_fin: this.validar.FormatearHora(permiso.hora_ingreso, this.formato_hora),
          id_empl_contrato: permiso.id_empl_contrato,
          tipo_solicitud: 'Permiso ' + estado_p.toLowerCase() + ' por',
          horas_permiso: permiso.hora_numero,
          observacion: permiso.descripcion,
          tipo_permiso: permiso.ntipopermiso,
          dias_permiso: permiso.dia,
          estado_p: estado_p,
          proceso: estado_p.toLowerCase(),
          id_dep: e.id_dep,
          id_suc: e.id_suc,
          correo: correo_usuarios,
          asunto: 'SOLICITUD DE PERMISO ' + estado_c.toUpperCase(),
          id: permiso.id,
          solicitado_por: localStorage.getItem('nom') + ' ' + localStorage.getItem('ap'),
        }
        if (correo_usuarios != '') {
          console.log('data entra enviar correo')

          this.autoService.EnviarCorreoPermiso(this.idEmpresa, datosPermisoCreado).subscribe(
            resp => {
              /* if (resp.message === 'ok') {
                 this.validar.showToast('Correo de solicitud enviado exitosamente.', 5000, 'success');
               }
               else {
                 this.validar.showToast('Ups algo salio mal !!! No fue posible enviar correo de solicitud.', 5000, 'warning');
               }*/
            },
            err => {
              this.validar.showToast(err.error.message, 5000, 'danger');
            },
            () => { },
          )
        }
      }
    })
  }

  EnviarNotificacionPermiso(permiso: any, estado_p: string, infoUsuario: any) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO
    let desde = this.validar.FormatearFecha(permiso.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(permiso.fec_final, this.formato_fecha, this.validar.dia_completo);

    let h_inicio = this.validar.FormatearHora(permiso.hora_salida, this.formato_hora);
    let h_fin = this.validar.FormatearHora(permiso.hora_ingreso, this.formato_hora);

    if (h_inicio === '00:00') {
      h_inicio = '';
    }

    if (h_fin === '00:00') {
      h_fin = '';
    }

    const noti: Notificacion = notificacionValueDefault;
    noti.id_vacaciones = noti.id_hora_extra = null;
    noti.id_send_empl = parseInt(localStorage.getItem('empleadoID'));
    noti.id_permiso = permiso.id;
    noti.create_at = this.tiempo.format('YYYY-MM-DD') + ' ' + this.tiempo.format('HH:mm:ss');
    noti.estado = estado_p;
    noti.tipo = 2;
    noti.mensaje = 'Ha ' + estado_p.toLowerCase() + ' la solicitud de permiso para ' +
      infoUsuario.fullname + ' desde ' +
      desde + h_inicio + ' hasta ' +
      hasta + ' ' + h_fin;

    //Listado para eliminar el usuario duplicado
    var allNotificacionesPermisos = [];
    //Ciclo por cada elemento del listado
    permiso.EmpleadosSendNotiEmail.forEach(function(elemento, indice, array) {
      // Discriminación de elementos iguales
      if(allNotificacionesPermisos.find(p=>p.empleado == elemento.empleado) == undefined)
      {
        // Nueva lista de empleados que reciben la notificacion
        allNotificacionesPermisos.push(elemento);
      }
    });

    console.log("Usuarios que reciben la notificacion: ",allNotificacionesPermisos);

    allNotificacionesPermisos.forEach(e => {

      noti.id_receives_depa = e.id_dep;
      noti.id_receives_empl = e.empleado;

      if (e.permiso_noti) {
        this.autoService.postNotificacion(noti).subscribe(
          resp => {
            this.permisoService.sendNotiRealTime(resp.respuesta);
          },
          err => { this.validar.showToast(err.error.message, 3000, 'danger') },
          () => { },
        )
      }
    })
  }

  /** ************************************************************************************************** ** 
   ** **                           METODOS APROBACION DE VACACIONES                                   ** ** 
   ** ************************************************************************************************** **/

  // METODO DE ENVIO DE NOTIFICACIONES RESPECTO A LA APROBACION
  NotificarAprobacionVacacion(vacacion: any, infoUsuario: any, estado: number) {
    var datos = {
      depa_user_loggin: infoUsuario.id_departamento,
      objeto: vacacion,
    }

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (estado === 2) {
      var estado_v = 'Preautorizado';
      var estado_c = 'Preautorizada';
    }
    else if (estado === 3) {
      var estado_v = 'Autorizado';
      var estado_c = 'Autorizada';
    }
    else if (estado === 4) {
      var estado_v = 'Negado';
      var estado_c = 'Negada';
    }
    this.autoService.BuscarJefes(datos).subscribe(vacacion => {
      vacacion.EmpleadosSendNotiEmail.push(this.solInfo);
      console.log(vacacion);
      this.configuracionCorreoVA(vacacion, estado_v, estado_c);
      this.EnviarNotificacionVacacion(vacacion, estado_v, infoUsuario);
      this.validar.showToast('Proceso realizado exitosamente.', 5000, 'success');
    });
  }

  autorizacionVA: any = [];
  configuracionCorreoVA(vacacion, estado_v, estado_c){
    console.log('ver vacaciones..   ', vacacion);
    this.listadoDepaAutoriza = [];
    this.listaEnvioCorreo = [];
    this.lectura = 1;

    this.autoService.getAutorizacionVacacion(vacacion.id).subscribe(res2 => { 
      this.autorizacionVA = res2;
      // METODO PARA OBTENER EMPLEADOS Y ESTADOS
      var autorizaciones = this.autorizacionVA.id_documento.split(',');
      autorizaciones.map((obj: string) => {
        this.lectura = this.lectura + 1;
        if (obj != '') {
          let empleado_id = obj.split('_')[0];
          this.estado_auto = obj.split('_')[1];

          // CREAR ARRAY DE DATOS DE COLABORADORES
          var data = {
            id_empleado: empleado_id,
            estado: this.estado_auto
          }

          // CAMBIAR DATO ESTADO INT A VARCHAR
          if (this.estado_auto === '1') {
            this.estado_auto = 'Pendiente';
          }
          if (this.estado_auto === '2') {
            this.estado_auto = 'Preautorizado';
          }

          // CUANDO TODOS LOS DATOS SE HAYAN REVISADO EJECUTAR METODO DE INFORMACIÓN DE AUTORIZACIÓN
          if (this.lectura === autorizaciones.length) {
            if((this.estado_auto === 'Pendiente') || (this.estado_auto === 'Preautorizado')){
              this.restAutoriza.BuscarListaAutorizaDepa(this.autorizacionVA.id_departamento).subscribe(res => {
                this.listadoDepaAutoriza = res;
                this.listadoDepaAutoriza.filter(item => {
                  if((item.nivel === autorizaciones.length) && (item.nivel_padre === item.nivel)){
                    return this.listaEnvioCorreo.push(item);
                  }else if((item.nivel === autorizaciones.length || item.nivel === (autorizaciones.length - 1))){
                    return this.listaEnvioCorreo.push(item);
                  }
                })
                this.EnviarCorreoVacacion(vacacion, this.listaEnvioCorreo, estado_v, estado_c);
              });
            }else if(this.estado_auto > 2){
              this.restAutoriza.BuscarListaAutorizaDepa(this.autorizacionVA.id_departamento).subscribe(res => {
                this.listadoDepaAutoriza = res;
                this.listadoDepaAutoriza.filter(item => {
                  if((item.nivel_padre === this.InfoListaAutoriza.nivel) && (item.nivel_padre === item.nivel)){
                    this.autorizaDirecto = false;
                    return this.listaEnvioCorreo.push(item);
                  }else{
                    this.autorizaDirecto = true;
                  }
                })

                //Esta condicion es para enviar el correo a todos los usuraios que autorizan siempre y cuando la solicitud fue negada antes
                if(this.autorizaDirecto === true){
                  this.listaEnvioCorreo = this.listadoDepaAutoriza;
                }

                this.EnviarCorreoVacacion(vacacion, this.listaEnvioCorreo, estado_v, estado_c);
              });
            }
          }
        }else if(autorizaciones.length == 1){
          this.restAutoriza.BuscarListaAutorizaDepa(this.autorizacionVA.id_departamento).subscribe(res => {
            this.listadoDepaAutoriza = res;
            this.listadoDepaAutoriza.filter(item => {
              if(item.nivel < 3 ){
                return this.listaEnvioCorreo.push(item);  
              }
            })
            this.EnviarCorreoVacacion(vacacion, this.listaEnvioCorreo, estado_v, estado_c);
          });
        }
      })
    })
  }


  // METODO PARA ENVIO DE NOTIFICACIONES DE VACACIONES
  EnviarCorreoVacacion(vacacion: any, listaEnvioCorreo: any, estado_v: string, estado_c: string) {
    var cont = 0;
    var correo_usuarios = '';
    vacacion.EmpleadosSendNotiEmail = listaEnvioCorreo;
    vacacion.EmpleadosSendNotiEmail.push(this.solInfo);
    console.log('nueva lista VA: ',vacacion.EmpleadosSendNotiEmail);

    vacacion.EmpleadosSendNotiEmail.forEach(e => {
      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE VACACIÓN
      let desde = this.validar.FormatearFecha(vacacion.fec_inicio, this.formato_fecha, this.validar.dia_completo);
      let hasta = this.validar.FormatearFecha(vacacion.fec_final, this.formato_fecha, this.validar.dia_completo);

      // SI EL USUARIO SE ENCUENTRA ACTIVO Y TIENEN CONFIGURACIÓN RECIBIRA CORREO DE SOLICITUD DE VACACIÓN
      if (e.vaca_mail) {
        if (e.estado === true) {
          if (correo_usuarios === '') {
            correo_usuarios = e.correo;
          }
          else {
            correo_usuarios = correo_usuarios + ', ' + e.correo
          }
        }
      }

      // VERIFICACIÓN QUE TODOS LOS DATOS HAYAN SIDO LEIDOS PARA ENVIAR CORREO
      if (cont === vacacion.EmpleadosSendNotiEmail.length) {
        let datosVacacionCreada = {
          tipo_solicitud: 'Vacaciones ' + estado_v.toLowerCase() + ' por',
          idContrato: vacacion.id_contrato,
          estado_v: estado_v,
          proceso: estado_v.toLowerCase(),
          desde: desde,
          hasta: hasta,
          id_dep: e.id_dep, // VERIFICAR
          id_suc: e.id_suc, // VERIFICAR
          correo: correo_usuarios,
          asunto: 'SOLICITUD DE VACACIONES ' + estado_c.toUpperCase(),
          id: vacacion.id,
          solicitado_por: (localStorage.getItem('nom')) + ' ' + (localStorage.getItem('ap')),
        }

        if (correo_usuarios != '') {
          this.autoService.EnviarCorreoVacacion(this.idEmpresa, datosVacacionCreada).subscribe(
            resp => {
              /* if (resp.message === 'ok') {
                 this.validar.showToast('Correo de solicitud enviado exitosamente.', 5000, 'success');
               }
               else {
                 this.validar.showToast('Ups algo salio mal !!! No fue posible enviar correo de solicitud.', 5000, 'warning');
               }*/
            },
            err => { this.validar.showToast(err.error.message, 5000, 'danger'); },
            () => { },
          )
        }
      }
    })
  }

  // METODO PARA ENVIAR NOTIFICACIONES
  EnviarNotificacionVacacion(vacaciones: any, estado_v: string, infoUsuario: any) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE VACACIÓN
    let desde = this.validar.FormatearFecha(vacaciones.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(vacaciones.fec_final, this.formato_fecha, this.validar.dia_completo);

    const noti: Notificacion = notificacionValueDefault;
    noti.id_vacaciones = vacaciones.id;
    noti.id_send_empl = parseInt(localStorage.getItem('empleadoID'));
    noti.id_permiso = noti.id_hora_extra = null;
    noti.create_at = this.tiempo.format('YYYY-MM-DD') + ' ' + this.tiempo.format('HH:mm:ss');
    noti.estado = estado_v;
    noti.tipo = 2;
    noti.mensaje = 'Ha ' + estado_v.toLowerCase() + ' la solicitud de vacaciones para ' +
      infoUsuario.fullname + ' desde ' +
      desde + ' hasta ' + hasta;

    //Listado para eliminar el usuario duplicado
    var allNotificacionesVacaciones = [];
    //Ciclo por cada elemento del listado
    vacaciones.EmpleadosSendNotiEmail.forEach(function(elemento, indice, array) {
      // Discriminación de elementos iguales
      if(allNotificacionesVacaciones.find(p=>p.empleado == elemento.empleado) == undefined)
      {
        // Nueva lista de empleados que reciben la notificacion
        allNotificacionesVacaciones.push(elemento);
      }
    });

    console.log("Usuarios que reciben la notificacion: ",allNotificacionesVacaciones);

    allNotificacionesVacaciones.forEach(e => {

      noti.id_receives_depa = e.id_dep;
      noti.id_receives_empl = e.empleado;

      if (e.vaca_noti) {
        this.autoService.postNotificacion(noti).subscribe(
          resp => {
            this.vacacionService.sendNotiRealTime(resp.respuesta);
          },
          err => { this.validar.showToast(err.error.message, 3000, 'danger') },
          () => { },
        )
      }
    })
  }


  /** ******************************************************************************************* **
   ** **                METODO DE ENVIO DE NOTIFICACIONES DE HORAS EXTRAS                      ** **
   ** ******************************************************************************************* **/

  // METODO DE ENVIO DE NOTIFICACIONES RESPECTO A LA APROBACION
  NotificarAprobacionHE(horaExtra: any, infoUsuario: any, estado: number) {
    var datos = {
      depa_user_loggin: infoUsuario.id_departamento,
      objeto: horaExtra,
    }

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (estado === 2) {
      var estado_h = 'Preautorizado';
      var estado_c = 'Preautorizada';
      var estado_n = 'preautorizadas';
    }
    else if (estado === 3) {
      var estado_h = 'Autorizado';
      var estado_c = 'Autorizada';
      var estado_n = 'autorizadas';
    }
    else if (estado === 4) {
      var estado_h = 'Negado';
      var estado_c = 'Negada';
      var estado_n = 'negadas';
    }
    this.autoService.BuscarJefes(datos).subscribe(horaExtra => {
      horaExtra.EmpleadosSendNotiEmail.push(this.solInfo);
      this.EnviarNotificacionHE(horaExtra, estado_h, horaExtra.num_hora, estado_n, infoUsuario);
      this.configuracionCorreoHE (horaExtra, estado_h, estado_c, horaExtra.num_hora, estado_n);
      this.validar.showToast('Proceso realizado exitosamente.', 5000, 'success');
    });
  }

  autorizacionHE: any = [];
  configuracionCorreoHE(horaExtra: any, estado_h: string, estado_c: string, valor: any, estado_n: string){
    console.log('ver horas extras ....   ', horaExtra);
    this.listadoDepaAutoriza = [];
    this.listaEnvioCorreo = [];
    this.lectura = 1;
    this.autoService.getAutorizacionHoraExtra(horaExtra.id).subscribe(res3 => { 
      this.autorizacionHE = res3;
      // METODO PARA OBTENER EMPLEADOS Y ESTADOS
      var autorizaciones = this.autorizacionHE.id_documento.split(',');
      autorizaciones.map((obj: string) => {
        this.lectura = this.lectura + 1;
        if (obj != '') {
          let empleado_id = obj.split('_')[0];
          this.estado_auto = obj.split('_')[1];

          // CREAR ARRAY DE DATOS DE COLABORADORES
          var data = {
            id_empleado: empleado_id,
            estado: this.estado_auto
          }

          // CAMBIAR DATO ESTADO INT A VARCHAR
          if (this.estado_auto === '1') {
            this.estado_auto = 'Pendiente';
          }
          if (this.estado_auto === '2') {
            this.estado_auto = 'Preautorizado';
          }

          // CUANDO TODOS LOS DATOS SE HAYAN REVISADO EJECUTAR METODO DE INFORMACIÓN DE AUTORIZACIÓN
          if (this.lectura === autorizaciones.length) {
            if((this.estado_auto === 'Pendiente') || (this.estado_auto === 'Preautorizado')){
              this.restAutoriza.BuscarListaAutorizaDepa(this.autorizacionHE.id_departamento).subscribe(res => {
                this.listadoDepaAutoriza = res;
                this.listadoDepaAutoriza.filter(item => {
                  if((item.nivel === autorizaciones.length) && (item.nivel_padre === item.nivel)){
                    return this.listaEnvioCorreo.push(item);
                  }else if((item.nivel === autorizaciones.length || item.nivel === (autorizaciones.length - 1))){
                    return this.listaEnvioCorreo.push(item);
                  }
                })
                this.EnviarCorreoHE(horaExtra, this.listaEnvioCorreo, estado_h, estado_c, valor, estado_n);
              });
            }else if(this.estado_auto > 2){
              this.restAutoriza.BuscarListaAutorizaDepa(this.autorizacionHE.id_departamento).subscribe(res => {
                this.listadoDepaAutoriza = res;
                this.listadoDepaAutoriza.filter(item => {
                  if((item.nivel_padre === this.InfoListaAutoriza.nivel) && (item.nivel_padre === item.nivel)){
                    this.autorizaDirecto = false;
                    return this.listaEnvioCorreo.push(item);
                  }else{
                    this.autorizaDirecto = true;
                  }
                })

                //Esta condicion es para enviar el correo a todos los usuraios que autorizan siempre y cuando la solicitud fue negada antes
                if(this.autorizaDirecto === true){
                  this.listaEnvioCorreo = this.listadoDepaAutoriza;
                }

                this.EnviarCorreoHE(horaExtra, this.listaEnvioCorreo, estado_h, estado_c, valor, estado_n);
              });
            }
          }
        }else if(autorizaciones.length == 1){
          this.restAutoriza.BuscarListaAutorizaDepa(this.autorizacionHE.id_departamento).subscribe(res => {
            this.listadoDepaAutoriza = res;
            this.listadoDepaAutoriza.filter(item => {
              if(item.nivel < 3 ){
                return this.listaEnvioCorreo.push(item);  
              }
            })
            this.EnviarCorreoHE(horaExtra, this.listaEnvioCorreo, estado_h, estado_c, valor, estado_n);
          });
        }
      })

    },err => { 
      this.errorResponse(err.error.message) 
    });
  }

  // METODO PARA ENVIAR NOTIFICACIONES DE CORREO
  EnviarCorreoHE(horaExtra: any, listaEnvioCorreo: any, estado_h: string, estado_c: string, valor: any, estado_n: string) {
    var cont = 0;
    var correo_usuarios = '';
    horaExtra.EmpleadosSendNotiEmail = listaEnvioCorreo;
    horaExtra.EmpleadosSendNotiEmail.push(this.solInfo);
    console.log('nueva lista HE: ',horaExtra.EmpleadosSendNotiEmail);

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE HORA EXTRA
    let solicitud = this.validar.FormatearFecha(horaExtra.fec_solicita, this.formato_fecha, this.validar.dia_completo);
    let desde = this.validar.FormatearFecha(moment(horaExtra.fec_inicio).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(moment(horaExtra.fec_final).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);

    horaExtra.EmpleadosSendNotiEmail.forEach(e => {

      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      if (e.hora_extra_mail) {
        if (e.estado === true) {
          if (correo_usuarios === '') {
            correo_usuarios = e.correo;
          }
          else {
            correo_usuarios = correo_usuarios + ', ' + e.correo
          }
        }
      }

      if (cont === horaExtra.EmpleadosSendNotiEmail.length) {

        let datosHoraExtraCreada = {
          tipo_solicitud: 'Solicitud de Hora Extra ' + estado_c.toLowerCase() + ' por',
          solicitud: solicitud,
          desde: desde,
          hasta: hasta,
          h_inicio: this.validar.FormatearHora(moment(horaExtra.fec_inicio).format('HH:mm:ss'), this.formato_hora),
          h_final: this.validar.FormatearHora(moment(horaExtra.fec_final).format('HH:mm:ss'), this.formato_hora),
          num_horas: moment(horaExtra.num_hora, 'HH:mm').format('HH:mm') +
            '<br> <b>Num. horas ' + estado_n + ':</b> ' + moment(valor, 'HH:mm').format('HH:mm') + ' <br>',
          observacion: horaExtra.descripcion,
          estado_h: estado_h,
          proceso: estado_h.toLowerCase(),
          asunto: 'SOLICITUD DE HORAS EXTRAS ' + estado_c.toUpperCase(),
          id_dep: e.id_dep,
          id_suc: e.id_suc,
          correo: correo_usuarios,
          id: horaExtra.id,
          id_empl_contrato: horaExtra.id_contrato,
          solicitado_por: localStorage.getItem('nom') + ' ' + localStorage.getItem('ap'),
        }
        console.log('ver horas extras ....   ', datosHoraExtraCreada)
        if (correo_usuarios != '') {
          this.autoService.EnviarCorreoHoraExtra(this.idEmpresa, datosHoraExtraCreada).subscribe(
            resp => {
              if (resp.message === 'ok') {
                 this.validar.showToast('Correo de solicitud enviado exitosamente.', 5000, 'success');
               }
               else {
                 this.validar.showToast('Ups algo salio mal !!! No fue posible enviar correo de solicitud.', 5000, 'warning');
               }
            },
            err => { this.validar.showToast(err.error.message, 3000, 'danger'); },
            () => { },
          )
        }

      }
    })
  }

  // METODO PARA ENVIAR NOTIIFICACIONES AL SISTEMA
  EnviarNotificacionHE(horaExtra: any, estado_h: string, valor: any, estado_n: string, infoUsuario: any) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE HORA EXTRA
    let desde = this.validar.FormatearFecha(moment(horaExtra.fec_inicio).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(moment(horaExtra.fec_final).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);

    let h_inicio = this.validar.FormatearHora(moment(horaExtra.fec_inicio).format('HH:mm:ss'), this.formato_hora)
    let h_final = this.validar.FormatearHora(moment(horaExtra.fec_final).format('HH:mm:ss'), this.formato_hora);

    const noti: NotificacionTimbre = notificacionTimbreValueDefault;
    noti.tipo = 12; // APROBACIONES DE SOLICITUD DE HORAS EXTRAS
    noti.id_send_empl = parseInt(localStorage.getItem('empleadoID'));
    noti.create_at = this.tiempo.format('YYYY-MM-DD') + ' ' + this.tiempo.format('HH:mm:ss');

    noti.descripcion = 'Ha ' + estado_h.toLowerCase() + ' la solicitud de horas extras para ' +
      infoUsuario.fullname + ' desde ' +
      desde + ' hasta ' + hasta +
      ' horario de ' + h_inicio + ' a ' + h_final +
      ' estado ' + estado_n + ' horas ' + moment(valor, 'HH:mm').format('HH:mm');

    //Listado para eliminar el usuario duplicado
    var allNotificacionesHorasExtras = [];
    //Ciclo por cada elemento del listado
    horaExtra.EmpleadosSendNotiEmail.forEach(function(elemento, indice, array) {
      // Discriminación de elementos iguales
      if(allNotificacionesHorasExtras.find(p=>p.empleado == elemento.empleado) == undefined)
      {
        // Nueva lista de empleados que reciben la notificacion
        allNotificacionesHorasExtras.push(elemento);
      }
    });

    console.log("Usuarios que reciben la notificacion: ",allNotificacionesHorasExtras);

    allNotificacionesHorasExtras.forEach(e => {

      noti.id_receives_empl = e.empleado;

      if (e.hora_extra_noti) {
        this.autoService.postAvisosGenerales(noti).subscribe(
          resp => { //this.validar.showToast(resp.message, 3000, 'success') 
            this.horaExtraService.sendNotiRealTimeAprobar(resp.respuesta);
          },
          err => { this.validar.showToast(err.error.message, 3000, 'danger') },
          () => { },
        )
      }
    })
  }


  errorResponse(message) {
    this.showForm = false;
    this.showMessageError(message)
  }

  showMessageError(message = 'Error') {
    this.validar.showToast(message, 3000, 'danger')
  }

  showMessageSuccess(message = 'Registro actualizado') {
    this.validar.showToast(message, 3000, 'success')
  }


  generarPDF() {
    const f = moment();
    let fecha = f.format('YYYY-MM-DD');
    const filename = 'aprobación-multiple-' + this.labelAutorizacion + '-' + fecha + '.pdf';

    //this.plantillaPDF.generarPdf(this.getDocumentDefinicion(fecha), filename)
  }

  /* ****************************************************************************************************
  *                               PARA LA EXPORTACIÓN DE ARCHIVOS PDF
  * ****************************************************************************************************/

  getDocumentDefinicion(fecha) {

    return {

      pageOrientation: this.plantillaPDF.Orientacion(false),
      watermark: this.plantillaPDF.MargaDeAgua(),
      header: this.plantillaPDF.HeaderText(),

      footer: function (currentPage, pageCount) {
        const h = new Date();
        h.setUTCHours(h.getHours());
        const time = h.toJSON().split("T")[1].split(".")[0];
        return {
          margin: 10,
          columns: [
            {
              text: [{
                text: 'Fecha: ' + fecha + ' Hora: ' + time,
                alignment: 'left', opacity: 0.3
              }]
            },
            {
              text: [{
                text: '© Pag ' + currentPage.toString() + ' of ' + pageCount, alignment: 'right', opacity: 0.3
              }],
            }
          ], fontSize: 10
        }
      },
      content: [
        this.plantillaPDF.EncabezadoHorizontalAprobacion('Reporte Aprobación Múltiple'),
        this.impresionDatosPDF(this.dataAprobacion, fecha)
        // this.plantillaPDF.presentarDatosGenerales(this.data),
      ],
      styles: this.plantillaPDF.estilosPdf()
    };
  }

  impresionDatosPDF(data: any[], fecha: any): Array<any> {
    let c = 0;
    console.log(data);

    return [{
      style: 'tableMargin',
      table: {
        widths: ['auto', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*'],
        body: [
          [
            { text: 'N°', style: 'tableHeader' },
            { text: 'Solicitud', style: 'tableHeader' }, // solicitud
            { text: 'Empleado', style: 'tableHeader' },
            { text: 'Descripción', style: 'tableHeader' },  // validar cual es
            { text: 'Fecha Inicio', style: 'tableHeader' },
            { text: 'Fecha Fin', style: 'tableHeader' },
            { text: 'Días', style: 'tableHeader' },
            { text: 'Horas', style: 'tableHeader' },
            { text: 'Estado', style: 'tableHeader' },
            { text: 'Revisado por', style: 'tableHeader' },
            { text: 'Fecha', style: 'tableHeader' },
          ],
          ...data.map(obj => {
            c = c + 1
            const { dataSolicitud: dat, autorizacion: aut, solicitud } = obj;
            console.log('ver ************', dat)
            return [
              { style: 'itemsTable', text: c },
              { style: 'itemsTable', text: solicitud },
              { style: 'itemsTable', text: dat.nempleado },
              { style: 'itemsTable', text: this.CampoDescripcion(dat, solicitud) },
              { style: 'itemsTable', text: this.validar.FormatearFecha(moment(dat.fec_inicio).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_abreviado) },
              { style: 'itemsTable', text: this.validar.FormatearFecha(moment(dat.fec_final).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_abreviado) },
              { style: 'itemsTable', text: dat.dia },
              { style: 'itemsTable', text: dat.hora_numero },
              { style: 'itemsTable', text: this.estadoChange.nombre },
              { style: 'itemsTable', text: localStorage.getItem('ap') + ' ' + localStorage.getItem('nom') },
              { style: 'itemsTable', text: this.validar.FormatearFecha(moment(fecha).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_abreviado) },
            ]
          })
        ]
      },
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
        }
      }
    }]
  }

  CampoDescripcion(data: any, solicitud: string) {
    if (solicitud === 'permiso') {
      return data.descripcion
    }
    if (solicitud === 'vacacion') {
      return data.nperivacacion
    }
    if (solicitud === 'hora_extra') {
      return data.descripcion
    }
  }

}