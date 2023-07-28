import { Component, EventEmitter, Output, Input, ViewChild } from '@angular/core';
import { AlertController } from '@ionic/angular';
import moment from 'moment';
moment.locale('es');

import { DeleteService } from 'src/app/libs/delete.service';
import { CatalogosService } from 'src/app/services/catalogos.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { AutorizacionesService } from 'src/app/services/autorizaciones.service';

import { Notificacion, notificacionValueDefault } from 'src/app/interfaces/Notificaciones';
import { cg_permisoValueDefault } from 'src/app/interfaces/Permisos';
import { Cg_TipoPermiso } from 'src/app/interfaces/Catalogos';
import { NotificacionesService } from 'src/app/services/notificaciones.service';

import { HorasExtrasService } from 'src/app/services/horas-extras.service';
import { PermisosService } from 'src/app/services/permisos.service';
import { VacacionesService } from 'src/app/services/vacaciones.service';
import { AlimentacionService } from 'src/app/services/alimentacion.service';
import { ParametrosService } from 'src/app/services/parametros.service';

@Component({
  selector: 'btn-delete',
  templateUrl: './delete-register.component.html',
  styles: [`
    ion-icon {
      margin: 0px 5px
    }
  `],
})

export class DeleteRegisterComponent{

  // @Input() formRegistro: NgForm;
  @Input() loadingBtn: boolean;

  @Input() isButtom: boolean = true;

  label: string = 'Eliminar';

  @Input() nameTable: string = '';
  @Input() idreg: string = '';
  @Input() userCodigo: string = '';

  @Output() onDelete: EventEmitter<any> = new EventEmitter();

  cg_permiso: Cg_TipoPermiso = cg_permisoValueDefault;

  public get cg_tipo_permisos(): Cg_TipoPermiso[] {
    return this.catalogos.cg_tipo_permisos
  }

  idEmpresa: number;
  tiempo: any;

  constructor(
    private catalogos: CatalogosService,
    private autoriza: AutorizacionesService,
    private notifica: NotificacionesService,
    private deleteSevice: DeleteService,
    private permisoService: PermisosService,
    private vacacionService: VacacionesService,
    private horaExtraService: HorasExtrasService,
    private alimentacionService: AlimentacionService,
    public alertController: AlertController,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
  ) {
    this.idEmpresa = parseInt(String(localStorage.getItem('id_empresa')));
    this.catalogos.getCgPermisos();
    this.tiempo = moment();
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
      }
    )
  }

  async presentAlertConfirm() {
    if (this.nameTable === '' && this.idreg === '') return this.deleteSevice.showToast('Código de registro no encontrado para eliminar', 3000, 'danger')
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: '⚠ Alerta!',
      message: 'Seguro en eliminar este registro.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Confirmar',
          handler: () => {
            this.deleteSevice.EliminarRegistro(this.idreg, this.nameTable).subscribe(
              data => {
                console.log('Datos a eliminar -> ', this.nameTable, ' id: ', this.idreg, ' codigo: ', this.userCodigo)
                this.obtenerInformacionEmpleado(data, this.nameTable, parseInt(this.userCodigo));
                this.deleteSevice.showToast('Registro Eliminado', 3000, 'success')
              },
              err => { this.deleteSevice.showToast(err.error.message, 3000, 'danger') },
              () => { this.onDelete.emit() }
            )

          }
        }
      ]
    });

    await alert.present();
  }


  obtenerInformacionEmpleado(info: any, tabla: string, codigo: number) {
    var codigoUser = parseInt(String(localStorage.getItem('codigo')));
    var nota = 'su solicitud';
    var user = '';
    this.autoriza.getInfoEmpleadoByCodigo(codigo).subscribe(
      res => {
        var estado = false
        if (res.estado === 1) {
          estado = true;
        }
        var solInfo: any = [];
        solInfo = {
          hora_extra_mail: res.hora_extra_mail,
          hora_extra_noti: res.hora_extra_noti,
          permiso_mail: res.permiso_mail,
          permiso_noti: res.permiso_noti,
          comida_mail: res.comida_mail,
          comida_noti: res.comida_noti,
          vaca_mail: res.vaca_mail,
          vaca_noti: res.vaca_noti,
          empleado: res.id_empleado,
          id_dep: res.id_departamento,
          id_suc: res.id_sucursal,
          estado: estado,
          correo: res.correo,
          fullname: res.fullname,
          id_contrato: res.id_contrato,
        }

        if (codigo != codigoUser) {
          nota = 'la solicitud';
          user = 'para ' + solInfo.fullname;
        }
        console.log('ver info .. ', solInfo, 'ver res .. ', res)
        this.NotificarEventos(info, tabla, solInfo, nota, user);
      })
  }

  // METODO DE ENVIO DE NOTIFICACIONES 
  NotificarEventos(info: any, tabla: string, infoUsuario: any, nota: string, user: string) {
    var datos = {
      depa_user_loggin: infoUsuario.id_dep,
      objeto: info,
    }

    this.autoriza.BuscarJefes(datos).subscribe(data => {
      data.EmpleadosSendNotiEmail.push(infoUsuario);
      if (tabla === 'permisos') {
        this.EliminarDocumentoPermiso(data);
        //this.EnviarCorreoPermiso(data); 
        //this.EnviarNotificacionPermiso(data, nota, user);
      }
      else if (tabla === 'vacaciones') {
        this.EnviarCorreoVacacion(data, infoUsuario);
        this.EnviarNotificacionVacacion(data, nota, user);
      }
      else if (tabla === 'hora_extr_pedidos') {
        this.EliminarDocumentoHoraE(data);
        this.EnviarCorreoHE(data, infoUsuario);
        this.EnviarNotificacionHE(data, nota, user);
      }
      else if (tabla === 'solicita_comidas') {
        this.EnviarCorreoComida(data);
        this.NotificarEventoComida(data, nota, user);
      }
    });
  }

  /** ******************************************************************************************* **
   ** **                           MANEJO DE NOTIFICACIONES DE PERMISOS                          ** **
   ** ******************************************************************************************* **/

  EnviarCorreoPermiso(permiso: any) {
    var cont = 0;
    var correo_usuarios = '';

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO
    let solicitud = this.validar.FormatearFecha(permiso.fec_creacion, this.formato_fecha, this.validar.dia_completo);
    let desde = this.validar.FormatearFecha(permiso.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(permiso.fec_final, this.formato_fecha, this.validar.dia_completo);

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (permiso.estado === 1) {
      var estado_p = 'Pendiente de autorización';
    }
    else if (permiso.estado === 2) {
      var estado_p = 'Preautorizado';
    }
    else if (permiso.estado === 3) {
      var estado_p = 'Autorizado';
    }
    else if (permiso.estado === 4) {
      var estado_p = 'Negado';
    }

    // LEYENDO DATOS DE TIPO DE PERMISO
    var tipo_permiso = '';
    let correo_envia: boolean;
    this.cg_tipo_permisos.filter(o => {
      if (o.id === permiso.id_tipo_permiso) {
        tipo_permiso = o.descripcion
        correo_envia = o.correo_eliminar
      }
      return tipo_permiso;
    })

    if(correo_envia == true){
      // VERIFICACIÓN QUE TODOS LOS DATOS HAYAN SIDO LEIDOS PARA ENVIAR CORREO
    permiso.EmpleadosSendNotiEmail.forEach((e: any) => {

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

      if (cont === permiso.EmpleadosSendNotiEmail.length) {

        let datosPermisoCreado = {
          solicitud: solicitud,
          desde: desde,
          hasta: hasta,
          h_inicio: this.validar.FormatearHora(permiso.hora_salida, this.formato_hora),
          h_fin: this.validar.FormatearHora(permiso.hora_ingreso, this.formato_hora),
          id_empl_contrato: permiso.id_empl_contrato,
          tipo_solicitud: 'Permiso eliminado por',
          horas_permiso: permiso.hora_numero,
          observacion: permiso.descripcion,
          tipo_permiso: tipo_permiso,
          dias_permiso: permiso.dia,
          estado_p: estado_p,
          proceso: 'eliminado',
          id_dep: e.id_dep,
          id_suc: e.id_suc,
          correo: correo_usuarios,
          asunto: 'ELIMINACION DE SOLICITUD DE PERMISO',
          id: permiso.id,
          solicitado_por: (localStorage.getItem('nom')) + ' ' + (localStorage.getItem('ap')),
        }
        if (correo_usuarios != '') {

          this.autoriza.EnviarCorreoPermiso(this.idEmpresa, datosPermisoCreado).subscribe(
            resp => {
              if (resp.message === 'ok') {
                this.validar.showToast('Correo de solicitud enviado exitosamente.', 5000, 'success');
              }
              else {
                this.validar.showToast('Ups algo salio mal !!! No fue posible enviar correo de solicitud.', 5000, 'warning');
              }
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
  }

  EnviarNotificacionPermiso(permiso: any, nota: string, user: string) {

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

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (permiso.estado === 1) {
      var estado_p = 'Pendiente de autorización';
    }
    else if (permiso.estado === 2) {
      var estado_p = 'Preautorizado';
    }
    else if (permiso.estado === 3) {
      var estado_p = 'Autorizado';
    }
    else if (permiso.estado === 4) {
      var estado_p = 'Negado';
    }

    const noti: Notificacion = notificacionValueDefault;
    noti.id_vacaciones = noti.id_hora_extra = null;
    noti.id_send_empl = parseInt(String(localStorage.getItem('empleadoID')));
    noti.id_permiso = permiso.id;
    noti.create_at = this.tiempo.format('YYYY-MM-DD') + ' ' + this.tiempo.format('HH:mm:ss');
    noti.estado = estado_p!;
    noti.tipo = 3;
    noti.mensaje = 'Ha eliminado ' + nota + ' de permiso ' + user + ' desde ' +
      desde + ' ' + h_inicio + ' hasta ' +
      hasta + ' ' + h_fin;

    //Listado para eliminar el usuario duplicado
    var NotificacionesPermisoFiltrados: any = [];
    //Ciclo por cada elemento del listado
    permiso.EmpleadosSendNotiEmail.forEach(function(elemento: any, indice: any, array: any) {
      // Discriminación de elementos iguales
      if(NotificacionesPermisoFiltrados.find((p: any) =>p.empleado == elemento.empleado) == undefined)
      {
        // Nueva lista de empleados que reciben la notificacion
        NotificacionesPermisoFiltrados.push(elemento);
      }
    });

    console.log("Usuarios que reciben la notificacion Permiso: ",NotificacionesPermisoFiltrados);

    NotificacionesPermisoFiltrados.forEach((e: any) => {
      noti.id_receives_depa = e.id_dep;
      noti.id_receives_empl = e.empleado;
      
      if (e.permiso_noti) {
        this.autoriza.postNotificacion(noti).subscribe(
          resp => {
            this.permisoService.sendNotiRealTime(resp.respuesta);
          },
          err => { this.validar.showToast(err.error.message, 3000, 'danger') },
          () => { },
        )
      }
    })
  }


  // ELIMINAR ARCHIVO DE PERMISO
  EliminarDocumentoPermiso(data: any) {
    if(data.documento != null && data.documento != undefined && data.documento != ''){
      this.permisoService.EliminarArchivo(data.documento, parseInt(this.userCodigo)).subscribe(
        resp => { })
    }
  }

  /** ************************************************************************************************** ** 
   ** **                           METODOS DE ENVIO DE NOTIFICACIONES DE VACACIONES                                   ** ** 
   ** ************************************************************************************************** **/

  // METODO PARA ENVIO DE NOTIFICACIONES DE VACACIONES
  EnviarCorreoVacacion(vacacion: any, infoUsuario: any) {
    var cont = 0;
    var correo_usuarios = '';

    vacacion.EmpleadosSendNotiEmail.forEach((e: any) => {
      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE VACACIÓN
      let desde = this.validar.FormatearFecha(vacacion.fec_inicio, this.formato_fecha, this.validar.dia_completo);
      let hasta = this.validar.FormatearFecha(vacacion.fec_final, this.formato_fecha, this.validar.dia_completo);

      // CAPTURANDO ESTADO DE LA SOLICITUD DE VACACIÓN
      if (vacacion.estado === 1) {
        var estado_v = 'Pendiente de autorización';
      }
      else if (vacacion.estado === 2) {
        var estado_v = 'Preautorizado';
      }
      else if (vacacion.estado === 3) {
        var estado_v = 'Autorizado';
      }
      else if (vacacion.estado === 4) {
        var estado_v = 'Negado';
      }

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
          tipo_solicitud: 'Solicitud de vacaciones eliminada por',
          idContrato: infoUsuario.id_contrato,
          estado_v: estado_v!,
          proceso: 'eliminado',
          desde: desde,
          hasta: hasta,
          id_dep: e.id_dep, // VERIFICAR
          id_suc: e.id_suc, // VERIFICAR
          correo: correo_usuarios,
          asunto: 'ELIMINACION DE SOLICITUD DE VACACIONES',
          id: vacacion.id,
          solicitado_por: (localStorage.getItem('nom')) + ' ' + (localStorage.getItem('ap')),
        }

        if (correo_usuarios != '') {
          this.autoriza.EnviarCorreoVacacion(this.idEmpresa, datosVacacionCreada).subscribe(
            resp => {
              if (resp.message === 'ok') {
                this.validar.showToast('Correo de solicitud enviado exitosamente.', 5000, 'success');
              }
              else {
                this.validar.showToast('Ups algo salio mal !!! No fue posible enviar correo de solicitud.', 5000, 'warning');
              }
            },
            err => { this.validar.showToast(err.error.message, 5000, 'danger'); },
            () => { },
          )
        }
      }
    })
  }

  // METODO PARA ENVIAR NOTIFICACIONES
  EnviarNotificacionVacacion(vacaciones: any, nota: string, user: string) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE VACACIÓN
    let desde = this.validar.FormatearFecha(vacaciones.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(vacaciones.fec_final, this.formato_fecha, this.validar.dia_completo);

    // CAPTURANDO ESTADO DE LA SOLICITUD DE VACACIÓN
    if (vacaciones.estado === 1) {
      var estado_v = 'Pendiente de autorización';
    }
    else if (vacaciones.estado === 2) {
      var estado_v = 'Preautorizado';
    }
    else if (vacaciones.estado === 3) {
      var estado_v = 'Autorizado';
    }
    else if (vacaciones.estado === 4) {
      var estado_v = 'Negado';
    }

    const noti: Notificacion = notificacionValueDefault;
    noti.id_vacaciones = vacaciones.id;
    noti.id_send_empl = parseInt(String(localStorage.getItem('empleadoID')));
    noti.id_permiso = noti.id_hora_extra = null;
    noti.create_at = this.tiempo.format('YYYY-MM-DD') + ' ' + this.tiempo.format('HH:mm:ss');
    noti.estado = estado_v!
    noti.tipo = 3;
    noti.mensaje = 'Ha eliminado ' + nota + ' de vacaciones ' + user + ' desde ' +
      desde + ' hasta ' + hasta;

    //Listado para eliminar el usuario duplicado
    var NotificacionesVacacionesFiltrados: any = [];
    //Ciclo por cada elemento del listado
    vacaciones.EmpleadosSendNotiEmail.forEach(function(elemento: any, indice: any, array: any) {
      // Discriminación de elementos iguales
      if(NotificacionesVacacionesFiltrados.find((p: any)=>p.empleado == elemento.empleado) == undefined)
      {
        // Nueva lista de empleados que reciben la notificacion
        NotificacionesVacacionesFiltrados.push(elemento);
      }
    });

    console.log("Usuarios que reciben la notificacion Vacaci: ",NotificacionesVacacionesFiltrados);


    NotificacionesVacacionesFiltrados.forEach((e: any) => {
      noti.id_receives_depa = e.id_dep;
      noti.id_receives_empl = e.empleado;
      if (e.vaca_noti) {
        this.autoriza.postNotificacion(noti).subscribe(
          resp => {
            this.vacacionService.sendNotiRealTime(resp.respuesta);
            //this.validar.showToast(resp.message, 3000, 'success') 
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

  // METODO PARA ENVIAR NOTIFICACIONES DE CORREO
  EnviarCorreoHE(horaExtra: any, infoUsuario: any) {
    var cont = 0;
    var correo_usuarios = '';

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE HORA EXTRA
    let solicitud = this.validar.FormatearFecha(horaExtra.fec_solicita, this.formato_fecha, this.validar.dia_completo);
    let desde = this.validar.FormatearFecha(moment(horaExtra.fec_inicio).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(moment(horaExtra.fec_final).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);

    // CAPTURANDO ESTADO DE LA SOLICITUD DE HORA EXTRA
    if (horaExtra.estado === 1) {
      var estado_h = 'Pendiente de autorización';
    }
    else if (horaExtra.estado === 2) {
      var estado_h = 'Preautorizado';
    }
    else if (horaExtra.estado === 3) {
      var estado_h = 'Autorizado';
    }
    else if (horaExtra.estado === 4) {
      var estado_h = 'Negado';
    }

    horaExtra.EmpleadosSendNotiEmail.forEach((e: any)=> {

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
          id_empl_contrato: infoUsuario.id_contrato,
          tipo_solicitud: 'Realización de Horas Extras eliminada por',
          observacion: horaExtra.descripcion,
          num_horas: moment(horaExtra.num_hora, 'HH:mm').format('HH:mm'),
          estado_h: estado_h,
          solicitud: solicitud,
          desde: desde,
          hasta: hasta,
          h_inicio: this.validar.FormatearHora(moment(horaExtra.fec_inicio).format('HH:mm:ss'), this.formato_hora),
          h_final: this.validar.FormatearHora(moment(horaExtra.fec_final).format('HH:mm:ss'), this.formato_hora),
          proceso: 'eliminado',
          asunto: 'ELIMINACION DE SOLICITUD DE REALIZACION DE HORAS EXTRAS',
          correo: correo_usuarios,
          id_dep: e.id_dep,
          id_suc: e.id_suc,
          id: horaExtra.id,
          solicitado_por: (localStorage.getItem('nom')) + ' ' + (localStorage.getItem('ap')),
        }

        if (correo_usuarios != '') {
          this.autoriza.EnviarCorreoHoraExtra(this.idEmpresa, datosHoraExtraCreada).subscribe(
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
  EnviarNotificacionHE(horaExtra: any, nota: string, user: string) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE HORA EXTRA
    let desde = this.validar.FormatearFecha(moment(horaExtra.fec_inicio).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(moment(horaExtra.fec_final).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);

    let h_inicio = this.validar.FormatearHora(moment(horaExtra.fec_inicio).format('HH:mm:ss'), this.formato_hora)
    let h_final = this.validar.FormatearHora(moment(horaExtra.fec_final).format('HH:mm:ss'), this.formato_hora);

    // CAPTURANDO ESTADO DE LA SOLICITUD DE HORA EXTRA
    if (horaExtra.estado === 1) {
      var estado_h = 'Pendiente de autorización';
    }
    else if (horaExtra.estado === 2) {
      var estado_h = 'Preautorizado';
    }
    else if (horaExtra.estado === 3) {
      var estado_h = 'Autorizado';
    }
    else if (horaExtra.estado === 4) {
      var estado_h = 'Negado';
    }

    const noti: Notificacion = notificacionValueDefault;
    noti.id_hora_extra = horaExtra.id;
    noti.id_send_empl = parseInt(String(localStorage.getItem('empleadoID')));
    noti.id_permiso = noti.id_vacaciones = null;
    noti.create_at = this.tiempo.format('YYYY-MM-DD') + ' ' + this.tiempo.format('HH:mm:ss');
    noti.estado = estado_h!;
    noti.tipo = 3;
    noti.mensaje = 'Ha eliminado ' + nota + ' de horas extras ' + user + ' desde ' +
      desde + ' hasta ' + hasta +
      ' horario de ' + h_inicio + ' a ' + h_final;

    //Listado para eliminar el usuario duplicado
    var NotificacionesHorasExtrasFiltrados: any = [];
    //Ciclo por cada elemento del listado
    horaExtra.EmpleadosSendNotiEmail.forEach(function(elemento: any, indice: any, array: any) {
      // Discriminación de elementos iguales
      if(NotificacionesHorasExtrasFiltrados.find((p: any) =>p.empleado == elemento.empleado) == undefined)
      {
        // Nueva lista de empleados que reciben la notificacion
        NotificacionesHorasExtrasFiltrados.push(elemento);
      }
    });

    console.log("Usuarios que reciben la notificacion Horas: ",NotificacionesHorasExtrasFiltrados);

    NotificacionesHorasExtrasFiltrados.forEach((e: any) => {
      noti.id_receives_empl = e.empleado;
      if (e.hora_extra_noti) {
        this.autoriza.postNotificacion(noti).subscribe(
          resp => {
            this.horaExtraService.sendNotiRealTimeAprobar(resp.respuesta);
            //this.validar.showToast(resp.message, 3000, 'success') 
          },
          err => { this.validar.showToast(err.error.message, 3000, 'danger') },
          () => { },
        )
      }
    })
  }

  // ELIMINAR ARCHIVO DE PERMISO
  EliminarDocumentoHoraE(data: any) {
    this.horaExtraService.EliminarArchivoRespaldo(data.documento).subscribe(
      resp => { })
  }

  /** ******************************************************************************************* **
   ** **                METODO DE ENVIO DE NOTIFICACIONES DE ALIMENTACION                      ** **
   ** ******************************************************************************************* **/

  // METODO PARA ENVIO DE CORREO
  EnviarCorreoComida(alimentacion: any) {
    var cont = 0;
    var correo_usuarios = '';

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE ALIMENTACIÓN
    let solicitud = this.validar.FormatearFecha(alimentacion.fec_comida, this.formato_fecha, this.validar.dia_completo);

    // CAPTURANDO ESTADO DE LA SOLICITUD 
    if (alimentacion.aprobada === null) {
      var estado_a = 'Pendiente de autorización';
    }
    else if (alimentacion.aprobada === true) {
      var estado_a = 'Autorizado';
    }
    else if (alimentacion.aprobada === false) {
      var estado_a = 'Negado';
    }

    alimentacion.EmpleadosSendNotiEmail.forEach((e: any) => {

      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      // SI EL USUARIO SE ENCUENTRA ACTIVO Y TIENEN CONFIGURACIÓN RECIBIRA CORREO DE SOLICITUD DE ALIMENTACIÓN
      if (e.comida_mail) {
        if (e.estado === true) {
          if (correo_usuarios === '') {
            correo_usuarios = e.correo;
          }
          else {
            correo_usuarios = correo_usuarios + ', ' + e.correo
          }
        }
      }

      if (cont === alimentacion.EmpleadosSendNotiEmail.length) {
        let comida = {
          id_usua_solicita: alimentacion.id_empleado,
          tipo_solicitud: 'Servicio de alimentación eliminado por',
          fec_solicitud: solicitud,
          observacion: alimentacion.observacion,
          id_comida: alimentacion.id_comida,
          proceso: 'eliminado',
          estadoc: estado_a,
          correo: correo_usuarios,
          asunto: 'ELIMINACION DE SOLICITUD DE SERVICIO DE ALIMENTACION',
          inicio: this.validar.FormatearHora(alimentacion.hora_inicio, this.formato_hora),
          final: this.validar.FormatearHora(alimentacion.hora_fin, this.formato_hora),
          extra: alimentacion.extra,
          id: alimentacion.id,
          solicitado_por: (localStorage.getItem('nom')) + ' ' + (localStorage.getItem('ap')),
        }

        if (correo_usuarios != '') {
          this.autoriza.EnviarCorreoSolAlimentacion(this.idEmpresa, comida).subscribe(
            resp => {
              if (resp.message === 'ok') {
                this.validar.showToast('Correo de solicitud enviado exitosamente.', 5000, 'success');
              }
              else {
                this.validar.showToast('Ups algo salio mal !!! No fue posible enviar correo de solicitud.', 5000, 'warning');
              }
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

  // METODO PARA ENVIO DE NOTIFICACION
  NotificarEventoComida(alimentacion: any, nota: string, user: string) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE ALIMENTACIÓN
    let desde = this.validar.FormatearFecha(alimentacion.fec_comida, this.formato_fecha, this.validar.dia_completo);

    let inicio = this.validar.FormatearHora(alimentacion.hora_inicio, this.formato_hora);
    let final = this.validar.FormatearHora(alimentacion.hora_fin, this.formato_hora);

    let mensaje = {
      create_at: this.tiempo.format('YYYY-MM-DD') + ' ' + this.tiempo.format('HH:mm:ss'),
      id_empl_envia: parseInt(String(localStorage.getItem('empleadoID'))),
      id_empl_recive: '',
      tipo: 1, // SOLICITUD SERVICIO DE ALIMENTACIÓN 
      mensaje: 'Ha eliminado ' + nota + ' de alimentación ' + user + ' desde ' +
        desde +
        ' horario de ' + inicio + ' a ' + final + ' servicio ',
      id_comida: alimentacion.id_comida
    }

        //Listado para eliminar el usuario duplicado
        var NotificacionesAlimentacionFiltrados: any = [];
        //Ciclo por cada elemento del listado
        alimentacion.EmpleadosSendNotiEmail.forEach(function(elemento: any, indice: any, array: any) {
          // Discriminación de elementos iguales
          if(NotificacionesAlimentacionFiltrados.find((p: any) =>p.empleado == elemento.empleado) == undefined)
          {
            // Nueva lista de empleados que reciben la notificacion
            NotificacionesAlimentacionFiltrados.push(elemento);
          }
        });
    
        console.log("Usuarios que reciben la notificacion Alimen: ",NotificacionesAlimentacionFiltrados);

      NotificacionesAlimentacionFiltrados.forEach((e: any) => {
      mensaje.id_empl_recive = e.empleado;
      if (e.comida_noti) {
        this.notifica.EnviarMensajePlanComida(mensaje).subscribe(res => {
          console.log(res.message);
          this.alimentacionService.sendNotiRealTime(res.respuesta);
        })
      }
    })

  }

}
