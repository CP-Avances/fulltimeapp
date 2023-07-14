import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm} from '@angular/forms';
import { AutorizacionesService } from '../../services/autorizaciones.service';
import { ValidacionesService } from '../../libs/validaciones.service';
import { Cg_TipoPermiso } from 'src/app/interfaces/Catalogos';

import { estadoSelectItems, EstadoSolicitudes } from '../../interfaces/Estados';
import { Permiso, cg_permisoValueDefault } from '../../interfaces/Permisos';
import { Vacacion } from 'src/app/interfaces/Vacacion';
import { HoraExtra } from 'src/app/interfaces/HoraExtra';

import { Autorizacion, autorizacionValueDefault } from '../../interfaces/Autorizaciones';
import { Notificacion, NotificacionTimbre, notificacionTimbreValueDefault, notificacionValueDefault } from 'src/app/interfaces/Notificaciones';
import { CatalogosService } from 'src/app/services/catalogos.service';

import { AlertController, ModalController } from '@ionic/angular';
import moment from 'moment';

import { HorasExtrasService } from 'src/app/services/horas-extras.service';
import { PermisosService } from 'src/app/services/permisos.service';
import { VacacionesService } from 'src/app/services/vacaciones.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { EmpleadosService } from 'src/app/services/empleados.service';



@Component({
  selector: 'app-update-autorizacion',
  templateUrl: './update-autorizacion.component.html',
  styleUrls: ['./update-autorizacion.component.scss'],
})
export class UpdateAutorizacionComponent implements OnInit {

  @ViewChild('formRegistro', { static: true }) ngForm: NgForm;
  showForm: boolean = true;
  @Input() permiso: Permiso;
  @Input() vacacion: Vacacion;
  @Input() hora_extra: HoraExtra;
  @Input() labelAutorizacion: string = '';

  autorizacion: Autorizacion = autorizacionValueDefault;
  notificacion: Notificacion = notificacionValueDefault;

  itemautorizacion: Autorizacion = autorizacionValueDefault;

  loadingBtn: boolean = false;
  estadoSelectItems = estadoSelectItems;
  estadoChange: EstadoSolicitudes;

  infoEmpleadoRecibe: any;
  idEmpresa: number;
  idEmpleado: number;
  solInfo: any;
  ocultar: boolean = true;

  estados: any = [];

  cg_permiso: Cg_TipoPermiso = cg_permisoValueDefault;
  public get cg_tipo_permisos(): Cg_TipoPermiso[] {
    return this.catalogos.cg_tipo_permisos
  }

  constructor(
    private catalogos: CatalogosService,
    private autoService: AutorizacionesService,
    private validaciones: ValidacionesService,
    public modalController: ModalController,
    private vacacionService: VacacionesService,
    private permisoService: PermisosService,
    private horaExtraService: HorasExtrasService,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    public restAutoriza: AutorizacionesService,
    public restGeneral: EmpleadosService,
    public horario: EmpleadosService,
    public alertCrtl: AlertController,

  ) {
    this.idEmpresa = parseInt(localStorage.getItem('id_empresa'));
    this.idEmpleado = parseInt(localStorage.getItem('empleadoID'));
  }

  tiempo: any;
  ngOnInit() {
    console.log('pantalla update-autorizacion .. ', this.permiso, ' ', this.vacacion, ' ', this.hora_extra)
    this.tiempo = moment();
    this.BuscarFormatos();
  }

  public ArrayAutorizacionTipos: any = []
  
  InfoListaAutoriza: any = [];
  gerencia: boolean = false;
  BuscarTipoAutorizacion(datos: any){
    this.ArrayAutorizacionTipos = [];
    this.restAutoriza.BuscarAutoridadUsuarioDepa(this.idEmpleado).subscribe(
      (res) => {
        this.ArrayAutorizacionTipos = res;
        this.ArrayAutorizacionTipos.filter(x => {
          if(x.nombre == 'GERENCIA' && x.estado == true && (datos.id_dep == x.id_departamento)){
            this.gerencia = true;
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
          else if((this.gerencia == false) && (x.estado == true) && (datos.id_dep == x.id_departamento)){
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
    );
  }

  // BUSQUEDA DE PARAMETROS DE FECHAS Y HORAS
  formato_fecha: string;
  formato_hora: string;
  BuscarFormatos() {
    this.parametro.ObtenerFormatos().subscribe(
      resp => {
        this.formato_fecha = resp.fecha;
        this.formato_hora = resp.hora;
        this.obtenerAutorizacion();
      }
    )
  }

  ChangeEstado(e: any) {
    if (e.target.value != 1 && e.target.value != null && e.target.value != undefined) {
      const [autorizacion] = this.estadoSelectItems.filter(o => {
        return o.id === e.target.value
      })
      this.estadoChange = autorizacion
      this.autorizacion.estado = this.estadoChange.id;
    }
  }

  lectura: number = 0;
  estado_auto: any;
  empleado_estado: any = [];
  listadoDepaAutoriza: any = [];
  obtenerAutorizacion() {
    if (this.permiso) {
      this.autoService.getInfoEmpleadoByCodigo(this.permiso.codigo).subscribe(
        res => {
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
          this.processInfoEmpleado(res);
          this.BuscarTipoAutorizacion(this.solInfo);
        },
        err => { this.errorResponse(err.error.message) },
      )

      this.empleado_estado = [];
      this.listadoDepaAutoriza = [];
      this.lectura = 1;
      return this.autoService.getAutorizacionPermiso(this.permiso.id).subscribe(
        autorizacion => { 
          this.autorizacion = autorizacion;
          this.ConfiguracionAutorizacion(this.autorizacion, this.permiso);
        },
        err => { this.errorResponse(err.error.message) },
        () => { }
      )
    }

    if (this.vacacion) {
      this.autoService.getInfoEmpleadoByCodigo(this.vacacion.codigo).subscribe(
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
          this.processInfoEmpleado(res);
          this.BuscarTipoAutorizacion(this.solInfo);
        },
        err => { this.errorResponse(err.error.message) },
      )

      this.empleado_estado = [];
      this.listadoDepaAutoriza = [];
      this.lectura = 1;
      return this.autoService.getAutorizacionVacacion(this.vacacion.id).subscribe(
        autorizacion => { 
          this.autorizacion = autorizacion;
          this.ConfiguracionAutorizacion(this.autorizacion, this.vacacion); 
        },
        err => { this.errorResponse(err.error.message) },
        () => { }
      )
    }

    if (this.hora_extra) {
      this.autoService.getInfoEmpleadoByCodigo(this.hora_extra.codigo).subscribe(
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
          this.BuscarTipoAutorizacion(this.solInfo);
        },
        err => { this.errorResponse(err.error.message) },
      )

      this.empleado_estado = [];
      this.listadoDepaAutoriza = [];
      this.lectura = 1;
      return this.autoService.getAutorizacionHoraExtra(this.hora_extra.id).subscribe(
        autorizacion => { 
          this.autorizacion = autorizacion;
          this.ConfiguracionAutorizacion(this.autorizacion, this.hora_extra); 
        },
        err => { this.errorResponse(err.error.message) },
        () => { }
      )
    }
  }

  nivel_padre: number = 0;
  cont: number = 0;
  mensaje: any;
  FilDepartamentosAprueban: any = [];
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
            var filtroArray: any = [];
            this.listadoDepaAutoriza.forEach(function(elemento, indice, array) {
              if(filtroArray.find(p=>p.id_dep_nivel == elemento.id_dep_nivel) == undefined){
                filtroArray.push(elemento);
              }
            });
            this.FilDepartamentosAprueban = filtroArray;

            this.listadoDepaAutoriza.filter(item => {
              this.cont = this.cont + 1;
              this.nivel_padre = item.nivel_padre;
              if((this.idEmpleado == item.id_contrato) && (autorizaciones.length ==  item.nivel)){
                this.obtenerPlanificacionHoraria(solicitud.fec_inicio, solicitud.fec_final, solicitud.codigo, solicitud);
              }
            })

            if (this.cont === this.listadoDepaAutoriza.length) {
              if(this.ocultar === true){
                this.mensaje = 'No puede Aprobar la solicitud debido a que falta la Aprobacion del nivel '+ this.listadoDepaAutoriza[autorizaciones.length - 1].nivel +
                '. Departamento ' + this.listadoDepaAutoriza[autorizaciones.length - 1].dep_nivel_nombre;
              }else{
                this.mensaje = 'Falta la Aprobacion del nivel '+this.listadoDepaAutoriza[autorizaciones.length - 1].nivel +'. Departamento ' + this.listadoDepaAutoriza[autorizaciones.length - 1].dep_nivel_nombre;
              }
            }
          });
        
        }else{
          this.ocultar = true;
          this.mensaje = 'Falta la Aprobacion del nivel '+this.listadoDepaAutoriza[autorizaciones.length - 1].nivel +'. Departamento ' + this.listadoDepaAutoriza[autorizaciones.length - 1].dep_nivel_nombre;
        }

        this.empleado_estado = this.empleado_estado.concat(data);
        // CUANDO TODOS LOS DATOS SE HAYAN REVISADO EJECUTAR METODO DE INFORMACIÓN DE AUTORIZACIÓN
        if (this.lectura === autorizaciones.length) {
          this.VerInformacionAutoriza(this.empleado_estado);
        }
      }else{
        //Valida que el usuario que va a realizar la aprobacion le corresponda su nivel y autorice caso contrario se oculta el boton de aprobar.
        this.restAutoriza.BuscarListaAutorizaDepa(autorizacion.id_departamento).subscribe(res => {
          this.listadoDepaAutoriza = res;
          var filtroArray: any = [];
          this.listadoDepaAutoriza.forEach(function(elemento, indice, array) {
            if(filtroArray.find(p=>p.id_dep_nivel == elemento.id_dep_nivel) == undefined){
              filtroArray.push(elemento);
            }
          });
          this.FilDepartamentosAprueban = filtroArray;

          this.listadoDepaAutoriza.filter(item => {
            if((this.idEmpleado == item.id_contrato) && (autorizaciones.length ==  item.nivel)){
              this.obtenerPlanificacionHoraria(solicitud.fec_inicio, solicitud.fec_final, solicitud.codigo, solicitud);
            }
          })
            
          this.empleado_estado = this.empleado_estado.concat(',');
          this.mensaje = 'Falta la Aprobacion del nivel '+this.listadoDepaAutoriza[autorizaciones.length - 1].nivel +'. Departamento ' + this.listadoDepaAutoriza[autorizaciones.length - 1].dep_nivel_nombre;

        });
      }
    });
  }

  listahorario: any = [];
  color: string = '';
  dia: any;
  obtenerPlanificacionHoraria(fecha_i: any, fehca_f: any, codigo: any, solicitud: any){
    this.mensaje = '';
    var datos = {
      fecha_inicio: fecha_i, 
      fecha_final: fehca_f, 
      codigo: '\''+codigo+'\''
    }

    this.horario.BuscarPlanificacionHorarioEmple(datos).subscribe(res => {
      this.listahorario = res;
      if(this.listahorario.length == 0){
        solicitud.aprobacion = 'NO';
        this.color = 'danger'
        this.mensaje = 'No tiene registrado la planificacion horaria en esas fechas';
        return this.ocultar = true;
      }else{
        this.color = ''
        solicitud.aprobacion = 'SI';
        return this.ocultar = false;
      }
    },error => {
      solicitud.aprobacion = 'NO';
      this.color = 'danger'
      this.mensaje = 'Problemas con validar su planificacion horaria en esas fechas';
      return this.ocultar = true;
    });

  }

  // METODO PARA INGRESAR NOMBRE Y CARGO DEL USUARIO QUE REVISÓ LA SOLICITUD 
  cadena_texto: string = ''; // VARIABLE PARA ALMACENAR TODOS LOS USUARIOS
  VerInformacionAutoriza(array: any) {
    array.map(empl => {
      this.restGeneral.InformarEmpleadoAutoriza(parseInt(empl.id_empleado)).subscribe(data => {
        empl.nombre = data[0].fullname;
        empl.cargo = data[0].cargo;
        empl.departamento = data[0].departamento;
        if (this.cadena_texto === '') {
          this.cadena_texto = data[0].fullname + ': ' + empl.estado;
        } else {
          this.cadena_texto = this.cadena_texto + ' | ' + data[0].fullname + ': ' + empl.estado;
        }
      })
    })
  }


  processInfoEmpleado(info: any) {
    if (info === null) {
      this.showForm = false;
      this.permiso = undefined;
      this.vacacion = undefined;
      this.hora_extra = undefined;
    }
    this.infoEmpleadoRecibe = info;
  }

  UpdateRegister() {

    if (this.autorizacion.estado == 1) {
      return this.validaciones.showToast("Seleccione el tipo de Autorización", 2000, 'warning');
    } else {

      this.loadingBtn = true;
      const data = {
        estado: this.autorizacion.estado,
        id_documento: this.autorizacion.id_documento + `${localStorage.getItem("empleadoID")}_${this.estadoChange.id},`
      }

      if (this.permiso){

        this.autoService.putAutorizacionPermiso(this.permiso.id, data).subscribe(
          autorizacion => { this.successResponse(autorizacion, 'permiso') },
          err => { this.errorResponse(err.error.message) },
          () => { this.loadingBtn = false }
        )
      }

      else if (this.vacacion){
        this.autoService.putAutorizacionVacacion(this.vacacion.id, data).subscribe(
          autorizacion => { this.successResponse(autorizacion, 'vacacion') },
          err => { this.errorResponse(err.error.message) },
          () => { this.loadingBtn = false }
        )
      }
      
      else if(this.hora_extra){
        this.autoService.putAutorizacionHoraExtra(this.hora_extra.id, data).subscribe(
          autorizacion => { this.successResponse(autorizacion, 'hora_extra') },
          err => { this.errorResponse(err.error.message) },
          () => { this.loadingBtn = false }
        )
      }
        
      this.closeModal(true)
    }
  }

  closeModal(refreshInfo: Boolean) {
    this.modalController.dismiss({
      'refreshInfo': refreshInfo
    });
  }

  successResponse(autorizacion: Autorizacion, solicitud: string) {
    this.autorizacion = autorizacionValueDefault;

    this.autorizacion = autorizacion;

    switch (solicitud) {
      case 'permiso':
        this.autoService.updateEstadoSolicitudes({ estado: this.estadoChange.id, id_solicitud: this.permiso.id }, 'permisos').subscribe(
          resp => { this.validaciones.showToast(resp.message, 3000, 'success') },
          err => { this.validaciones.showToast(err.error.message, 3000, 'danger') },
        )
        console.log('ver autoriza permiso.... ', this.permiso, 'INFO.. ', this.infoEmpleadoRecibe)
        this.permiso.estado = this.estadoChange.id;
        this.NotificarAprobacionPermisos(this.permiso, this.infoEmpleadoRecibe);
        break;

      case 'vacacion':
        this.autoService.updateEstadoSolicitudes({ estado: this.estadoChange.id, id_solicitud: this.vacacion.id }, 'vacaciones').subscribe(
          resp => { this.validaciones.showToast(resp.message, 3000, 'success') },
          err => { this.validaciones.showToast(err.error.message, 3000, 'danger') },
        )
        this.vacacion.estado = this.estadoChange.id;

        console.log('ver autoriza vacacion .. ', this.vacacion, ' infoempleado ... ', this.infoEmpleadoRecibe)
        this.NotificarAprobacionVacacion(this.vacacion, this.infoEmpleadoRecibe);
        break;
      
      case 'hora_extra':
        this.autoService.updateEstadoSolicitudes({ estado: this.estadoChange.id, id_solicitud: this.hora_extra.id }, 'hora_extr_pedidos').subscribe(
          resp => { this.validaciones.showToast(resp.message, 3000, 'success') },
          err => { this.validaciones.showToast(err.error.message, 3000, 'danger') },
        )
        this.hora_extra.estado = this.estadoChange.id;
        console.log('ver autoriza hora extra...', this.hora_extra, ' ... ', this.infoEmpleadoRecibe)
        this.NotificarAprobacionHE(this.hora_extra, this.infoEmpleadoRecibe);
        break;

      default:
        break;
    }

    return this.showMessageSuccess()
  }

  errorResponse(message) {
    this.showForm = false;
    this.showMessageError(message)
  }

  showMessageError(message = 'Error') {
    this.validaciones.showToast(message, 3000, 'danger')
  }

  showMessageSuccess(message = 'Registro actualizado') {
    this.validaciones.showToast(message, 3000, 'success')
  }


  /** ******************************************************************************************* **
   ** **                           MANEJO DE APROBACIONES DE PERMISOS                          ** **
   ** ******************************************************************************************* **/

  // METODO DE ENVIO DE NOTIFICACIONES RESPECTO A LA APROBACION
  NotificarAprobacionPermisos(permiso: any, infoUsuario: any) {
    var datos = {
      depa_user_loggin: infoUsuario.id_departamento,
      objeto: permiso,
    }

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (permiso.estado === 2) {
      var estado_p = 'Preautorizado';
      var estado_c = 'Preautorizada';
    }
    else if (permiso.estado === 3) {
      var estado_p = 'Autorizado';
      var estado_c = 'Autorizada';
    }
    else if (permiso.estado === 4) {
      var estado_p = 'Negado';
      var estado_c = 'Negada';
    }

    let correo_envia;
    this.cg_tipo_permisos.filter(o => {
      if(o.id === permiso.id_tipo_permiso){
        if(permiso.estado === 2){
          if(o.id === permiso.id_tipo_permiso){
            console.log('correo_envia: ',o, " : ",o.correo_preautorizar)
            return correo_envia = o.correo_preautorizar;
          }
        }else if(permiso.estado === 3){
          if(o.id === permiso.id_tipo_permiso){
            console.log('correo_envia: ',o, " : ",o.correo_autorizar)
            return correo_envia = o.correo_autorizar;
          }
        }else if(permiso.estado === 4){
          if(o.id === permiso.id_tipo_permiso){
            console.log('correo_envia: ',o, " : ",o.correo_negar)
            return correo_envia = o.correo_negar;
          }
        } 
      }
    })

    this.autoService.BuscarJefes(datos).subscribe(permiso => {
      permiso.EmpleadosSendNotiEmail.push(this.solInfo);
      if(correo_envia === true){
        this.configuracionCorreo(permiso, estado_p, estado_c);
      }
      this.EnviarNotificacionPermiso(permiso, estado_p, infoUsuario);
      this.validaciones.showToast('Proceso realizado exitosamente.', 4000, 'success');
    });
  }

  public listaEnvioCorreo: any = [];
  listadoDepaAutorizaCorreo: any = [];
  id_departamento: any;
  configuracionCorreo(permiso: any, estado_p: string, estado_c: string){
    console.log('entro ha configuracion correo..');
    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO
    let solicitud = this.validar.FormatearFecha(permiso.fec_creacion, this.formato_fecha, this.validar.dia_completo);
    let desde = this.validar.FormatearFecha(permiso.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(permiso.fec_final, this.formato_fecha, this.validar.dia_completo);

    this.listaEnvioCorreo = [];
    this.id_departamento = this.solInfo.id_dep;
    this.lectura = 1;
    this.autoService.getAutorizacionPermiso(this.permiso.id).subscribe(res1 => {
      this.autorizacion = res1;
      // METODO PARA OBTENER EMPLEADOS Y ESTADOS
      var autorizaciones = this.autorizacion.id_documento.split(',');
      autorizaciones.map((obj: string) => {
        this.lectura = this.lectura + 1;
        if (obj != '') {
          // CUANDO TODOS LOS DATOS SE HAYAN REVISADO EJECUTAR METODO DE INFORMACIÓN DE AUTORIZACIÓN
          if (this.lectura === autorizaciones.length) {
            if((estado_p === 'Preautorizado')){
                this.listadoDepaAutoriza.filter(item => {
                  if((item.nivel === autorizaciones.length) && (item.nivel === this.FilDepartamentosAprueban.length)){
                    return this.listaEnvioCorreo.push(item);
                  }else if((item.nivel === autorizaciones.length) || (item.nivel === (autorizaciones.length + 1))){
                    return this.listaEnvioCorreo.push(item);
                  }
                })

                console.log('this.listaEnvioCorreo PRE: ',this.listaEnvioCorreo)
                this.EnviarCorreoPermiso(permiso, this.listaEnvioCorreo, estado_p, estado_c, solicitud, desde, hasta);

            }else if(estado_p == 'Autorizado' || estado_p === 'Negado'){
              if(estado_p === 'Autorizado'){
                this.listadoDepaAutoriza.forEach(item => {
                  if((item.nivel === this.InfoListaAutoriza.nivel) && (item.nivel === this.FilDepartamentosAprueban.length)){
                    return this.listaEnvioCorreo.push(item);
                  }else if((item.nivel === this.InfoListaAutoriza.nivel) || (item.nivel === autorizaciones.length + 1)){
                    return this.listaEnvioCorreo.push(item);
                  }
                });
              }else{
                //Esta condicion es para enviar el correo a todos los usuraios que autorizan siempre y cuando la solicitud fue negada antes
                this.listaEnvioCorreo = this.listadoDepaAutoriza;
              }

              console.log('this.listaEnvioCorreo AUTO - Nega: ',this.listaEnvioCorreo);
              this.EnviarCorreoPermiso(permiso, this.listaEnvioCorreo, estado_p, estado_c, solicitud, desde, hasta);
            }
          }

        }else if(autorizaciones.length < 2){
          if(estado_p === 'Negado'){
            //Esta condicion es para enviar el correo a todos los usuraios que autorizan siempre y cuando la solicitud fue negada antes
            this.listaEnvioCorreo = this.listadoDepaAutoriza;
          }else{
            this.listadoDepaAutoriza.filter(item => {
              if(item.nivel < 3 ){
                return this.listaEnvioCorreo.push(item);  
              }
            });
          }

          console.log('this.listaEnvioCorreo PEND: ',this.listaEnvioCorreo);
          this.EnviarCorreoPermiso(permiso, this.listaEnvioCorreo, estado_p, estado_c, solicitud, desde, hasta);
        }
      })
    });  

  }

  EnviarCorreoPermiso(permiso: any, listaEnvioCorreo: any, estado_p: string, estado_c: string, solicitud: any, desde: any, hasta: any) {
    var cont = 0;
    var correo_usuarios = '';
    permiso.EmpleadosSendNotiEmail = listaEnvioCorreo;
    permiso.EmpleadosSendNotiEmail.push(this.solInfo);
    console.log('nueva lista Correo_PE: ',permiso.EmpleadosSendNotiEmail);
    
    
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
          this.autoService.EnviarCorreoPermiso(this.idEmpresa, datosPermisoCreado).subscribe(
            resp => {
              if (resp.message === 'ok') {
                this.validaciones.showToast('Correo de solicitud enviado exitosamente.', 5000, 'success');
              }
              else {
                this.validaciones.showToast('Ups algo salio mal !!! No fue posible enviar correo de solicitud.', 5000, 'warning');
              }
            },
            err => {
              this.validaciones.showToast(err.error.message, 5000, 'danger');
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

    console.log('ver horas... ', h_inicio, ' ... ', h_fin)

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
      desde + ' ' + h_inicio + ' hasta ' +
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
          err => { this.validaciones.showToast(err.error.message, 3000, 'danger') },
          () => { },
        )
      }
    })
  }

  /** ************************************************************************************************** ** 
   ** **                           METODOS APROBACION DE VACACIONES                                   ** ** 
   ** ************************************************************************************************** **/

  // METODO DE ENVIO DE NOTIFICACIONES RESPECTO A LA APROBACION
  NotificarAprobacionVacacion(vacacion: any, infoUsuario: any) {
    var datos = {
      depa_user_loggin: infoUsuario.id_departamento,
      objeto: vacacion,
    }

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (vacacion.estado === 2) {
      var estado_v = 'Preautorizado';
      var estado_c = 'Preautorizada';
    }
    else if (vacacion.estado === 3) {
      var estado_v = 'Autorizado';
      var estado_c = 'Autorizada';
    }
    else if (vacacion.estado === 4) {
      var estado_v = 'Negado';
      var estado_c = 'Negada';
    }
    this.autoService.BuscarJefes(datos).subscribe(vacacion => {
      vacacion.EmpleadosSendNotiEmail.push(this.solInfo);
      //this.configuracionCorreoVacacion(vacacion, estado_v, estado_c);
      this.EnviarNotificacionVacacion(vacacion, estado_v, infoUsuario);
      this.validaciones.showToast('Proceso realizado exitosamente.', 5000, 'success');
    });
  }

  configuracionCorreoVacacion(vacacion: any, estado_v: string, estado_c: string){
    console.log('ver vacaciones..   ', vacacion);
    this.empleado_estado = [];
    this.listadoDepaAutoriza = [];
    this.listaEnvioCorreo = [];
    this.id_departamento = this.solInfo.id_dep;
    this.lectura = 1;
    this.autoService.getAutorizacionVacacion(this.vacacion.id).subscribe(res2 => { 
      this.autorizacion = res2;
      // METODO PARA OBTENER EMPLEADOS Y ESTADOS
      var autorizaciones = this.autorizacion.id_documento.split(',');
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

          this.empleado_estado = this.empleado_estado.concat(data);
          // CUANDO TODOS LOS DATOS SE HAYAN REVISADO EJECUTAR METODO DE INFORMACIÓN DE AUTORIZACIÓN
          if (this.lectura === autorizaciones.length) {
            if((this.estado_auto === 'Pendiente') || (this.estado_auto === 'Preautorizado')){
              this.restAutoriza.BuscarListaAutorizaDepa(this.autorizacion.id_departamento).subscribe(res => {
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
              this.restAutoriza.BuscarListaAutorizaDepa(this.autorizacion.id_departamento).subscribe(res => {
                this.listadoDepaAutoriza = res;
                this.listadoDepaAutoriza.filter(item => {
                  if((item.nivel_padre === this.InfoListaAutoriza.nivel) && (item.nivel_padre === item.nivel)){
                    return this.listaEnvioCorreo.push(item);
                  }else{
                    //Esta condicion es para enviar el correo a todos los usuraios que autorizan siempre y cuando la solicitud fue negada antes
                    this.listaEnvioCorreo = this.listadoDepaAutoriza;
                  }
                })

                this.EnviarCorreoVacacion(vacacion, this.listaEnvioCorreo, estado_v, estado_c);
              });
            }
          }
        }else if(autorizaciones.length == 1){
          this.restAutoriza.BuscarListaAutorizaDepa(this.autorizacion.id_departamento).subscribe(res => {
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

  // METODO PARA ENVIO DE CORREO DE VACACIONES
  EnviarCorreoVacacion(vacacion: any, listaEnvioCorreo: any, estado_v: string, estado_c: string) {
    var cont = 0;
    var correo_usuarios = '';
    vacacion.EmpleadosSendNotiEmail = listaEnvioCorreo;
    vacacion.EmpleadosSendNotiEmail.push(this.solInfo);
    console.log('nueva lista VA:  ',vacacion.EmpleadosSendNotiEmail);

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
              if (resp.message === 'ok') {
                this.validaciones.showToast('Correo de solicitud enviado exitosamente.', 5000, 'success');
              }
              else {
                this.validaciones.showToast('Ups algo salio mal !!! No fue posible enviar correo de solicitud.', 5000, 'warning');
              }
            },
            err => { this.validaciones.showToast(err.error.message, 5000, 'danger'); },
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
          err => {
            this.validaciones.showToast(err.error.message, 3000, 'danger')
          },
          () => { },
        )
      }
    })
  }


  /** ******************************************************************************************* **
   ** **                METODO DE ENVIO DE NOTIFICACIONES DE HORAS EXTRAS                      ** **
   ** ******************************************************************************************* **/

  // METODO DE ENVIO DE NOTIFICACIONES RESPECTO A LA APROBACION
  NotificarAprobacionHE(horaExtra: any, infoUsuario: any) {
    var datos = {
      depa_user_loggin: infoUsuario.id_departamento,
      objeto: horaExtra,
    }

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (horaExtra.estado === 2) {
      var estado_h = 'Preautorizado';
      var estado_c = 'Preautorizada';
      var estado_n = 'preautorizadas';
    }
    else if (horaExtra.estado === 3) {
      var estado_h = 'Autorizado';
      var estado_c = 'Autorizada';
      var estado_n = 'autorizadas';
    }
    else if (horaExtra.estado === 4) {
      var estado_h = 'Negado';
      var estado_c = 'Negada';
      var estado_n = 'negadas';
    }
    this.autoService.BuscarJefes(datos).subscribe(horaExtra => {
      horaExtra.EmpleadosSendNotiEmail.push(this.solInfo);
      console.log(horaExtra);
      //this.configuracionCorreoHE(horaExtra, estado_h, estado_c, horaExtra.num_hora, estado_n);
      this.EnviarNotificacionHE(horaExtra, estado_h, horaExtra.num_hora, estado_n, infoUsuario);
      this.validaciones.showToast('Proceso realizado exitosamente.', 5000, 'success');
    });
  }

  configuracionCorreoHE(horaExtra: any, estado_h: string, estado_c: string, valor: any, estado_n: string){
    console.log('ver horas extras ....   ', horaExtra);
    this.empleado_estado = [];
    this.listadoDepaAutoriza = [];
    this.listaEnvioCorreo = [];
    this.id_departamento = this.solInfo.id_dep;
    this.lectura = 1;
    this.autoService.getAutorizacionHoraExtra(this.hora_extra.id).subscribe(res3 => { 
      this.autorizacion = res3;
      // METODO PARA OBTENER EMPLEADOS Y ESTADOS
      var autorizaciones = this.autorizacion.id_documento.split(',');
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

          this.empleado_estado = this.empleado_estado.concat(data);
          // CUANDO TODOS LOS DATOS SE HAYAN REVISADO EJECUTAR METODO DE INFORMACIÓN DE AUTORIZACIÓN
          if (this.lectura === autorizaciones.length) {
            if((this.estado_auto === 'Pendiente') || (this.estado_auto === 'Preautorizado')){
              this.restAutoriza.BuscarListaAutorizaDepa(this.autorizacion.id_departamento).subscribe(res => {
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
              this.restAutoriza.BuscarListaAutorizaDepa(this.autorizacion.id_departamento).subscribe(res => {
                this.listadoDepaAutoriza = res;
                this.listadoDepaAutoriza.filter(item => {
                  if((item.nivel_padre === this.InfoListaAutoriza.nivel) && (item.nivel_padre === item.nivel)){
                    return this.listaEnvioCorreo.push(item);
                  }else{
                    //Esta condicion es para enviar el correo a todos los usuraios que autorizan siempre y cuando la solicitud fue negada antes
                    this.listaEnvioCorreo = this.listadoDepaAutoriza;

                  }
                })

                

                this.EnviarCorreoHE(horaExtra, this.listaEnvioCorreo, estado_h, estado_c, valor, estado_n);
              });
            }
          }
        }else if(autorizaciones.length == 1){
          this.restAutoriza.BuscarListaAutorizaDepa(this.autorizacion.id_departamento).subscribe(res => {
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
                this.validaciones.showToast('Correo de solicitud enviado exitosamente.', 5000, 'success');
              }
              else {
                this.validaciones.showToast('Ups algo salio mal !!! No fue posible enviar correo de solicitud.', 5000, 'warning');
              }
            },
            err => { this.validaciones.showToast(err.error.message, 3000, 'danger'); },
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
    noti.tipo = 12;
    noti.id_send_empl = parseInt(localStorage.getItem('empleadoID'));
    noti.create_at = this.tiempo.format('YYYY-MM-DD') + ' ' + this.tiempo.format('HH:mm:ss');

    noti.descripcion = 'Ha ' + estado_h.toLowerCase() + ' la solicitud de horas extras para ' +
      infoUsuario.fullname + ' desde ' +
      desde + ' hasta ' +
      hasta + ' horario de ' + h_inicio + ' a ' + h_final +
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
          resp => {
            this.horaExtraService.sendNotiRealTimeAprobar(resp.respuesta);
          },
          err => {
            this.validaciones.showToast(err.error.message, 3000, 'danger')
          },
          () => { },
        )
      }
    })
  }
}
