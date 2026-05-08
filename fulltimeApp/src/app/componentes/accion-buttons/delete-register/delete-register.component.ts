import { Component, EventEmitter, Output, Input } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { DateTime } from 'luxon';
import { DeleteService } from 'src/app/libs/delete.service';
import { CatalogosService } from 'src/app/services/catalogos.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { AutorizacionesService } from 'src/app/services/autorizaciones.service';
import { Notificacion, notificacionValueDefault } from 'src/app/interfaces/Notificaciones';
import { cg_permisoValueDefault } from 'src/app/interfaces/Permisos';
import { Cg_TipoPermiso } from 'src/app/interfaces/Catalogos';
import { PermisosService } from 'src/app/services/permisos.service';
import { VacacionesService } from 'src/app/services/vacaciones.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
@Component({
  selector: 'btn-delete',
  templateUrl: './delete-register.component.html',
  styles: [`
    ion-icon {
      margin: 0px 5px
    }
  `],
})



export class DeleteRegisterComponent {
  ips_locales: any = '';

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
    private deleteSevice: DeleteService,
    private permisoService: PermisosService,
    private vacacionService: VacacionesService,
    public alertController: AlertController,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    private dataUserServices: DataUserLoggedService,

  ) {
    this.idEmpresa = parseInt(String(localStorage.getItem('id_empresa')));
    this.catalogos.getCgPermisos();
    this.tiempo = DateTime.now();
    this.BuscarFormatos();
  }
  ngOnInit() {
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
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
            this.deleteSevice.EliminarRegistro(this.idreg, this.nameTable, this.dataUserServices.username, localStorage.getItem('ip'), this.ips_locales).subscribe(
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
          hora_extra_noti: res.hora_extra_notificacion,
          permiso_mail: res.permiso_mail,
          permiso_noti: res.permiso_notificacion,
          comida_mail: res.comida_mail,
          comida_noti: res.comida_notificacion,
          vaca_mail: res.vacacion_mail,
          vaca_noti: res.vacacion_notificacion,
          empleado: res.id_empleado,
          id_dep: res.id_depa,
          id_suc: res.id_suc,
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
    console.log("ver", datos);

    this.autoriza.BuscarJefes(datos).subscribe(data => {
      data.EmpleadosSendNotiEmail.push(infoUsuario);
      if (tabla === 'mp_solicitud_permiso') {
        this.EliminarDocumentoPermiso(data);
        // this.EnviarCorreoPermiso(data); 
        this.EnviarNotificacionPermiso(data, nota, user);
      }
      else if (tabla === 'mv_solicitud_vacacion') {
        // this.EnviarCorreoVacacion(data, infoUsuario);
        this.EnviarNotificacionVacacion(data, nota, user);
      }
    });
  }

  /** ******************************************************************************************* **
   ** **                           MANEJO DE NOTIFICACIONES DE PERMISOS                          ** **
   ** ******************************************************************************************* **/



  EnviarNotificacionPermiso(permiso: any, nota: string, user: string) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO
    let desde = this.validar.FormatearFecha(permiso.fecha_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(permiso.fecha_final, this.formato_fecha, this.validar.dia_completo);

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
    noti.fecha_hora = this.tiempo.format('YYYY-MM-DD') + ' ' + this.tiempo.format('HH:mm:ss');
    noti.estado = estado_p!;
    noti.tipo = 3;
    noti.mensaje = 'Ha eliminado ' + nota + ' de permiso ' + user + ' desde ' +
      desde + ' ' + h_inicio + ' hasta ' +
      hasta + ' ' + h_fin;

    //Listado para eliminar el usuario duplicado
    var NotificacionesPermisoFiltrados: any = [];
    //Ciclo por cada elemento del listado
    permiso.EmpleadosSendNotiEmail.forEach(function (elemento: any, indice: any, array: any) {
      // Discriminación de elementos iguales
      if (NotificacionesPermisoFiltrados.find((p: any) => p.empleado == elemento.empleado) == undefined) {
        // Nueva lista de empleados que reciben la notificacion
        NotificacionesPermisoFiltrados.push(elemento);
      }
    });

    console.log("Usuarios que reciben la notificacion Permiso: ", NotificacionesPermisoFiltrados);

    NotificacionesPermisoFiltrados.forEach((e: any) => {
      noti.id_receives_depa = e.id_dep;
      noti.id_receives_empl = e.empleado;
      noti.user_name = this.dataUserServices.username;
      noti.ip = localStorage.getItem('ip');
      noti.ip_local = this.ips_locales;



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
    if (data.documento != null && data.documento != undefined && data.documento != '') {
      this.permisoService.EliminarArchivo(data.documento, parseInt(this.userCodigo)).subscribe(
        resp => { })
    }
  }

  /** ************************************************************************************************** ** 
   ** **                           METODOS DE ENVIO DE NOTIFICACIONES DE VACACIONES                                   ** ** 
   ** ************************************************************************************************** **/

  // METODO PARA ENVIO DE NOTIFICACIONES DE VACACIONES


  // METODO PARA ENVIAR NOTIFICACIONES
  EnviarNotificacionVacacion(vacaciones: any, nota: string, user: string) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE VACACIÓN
    let desde = this.validar.FormatearFecha(vacaciones.fecha_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(vacaciones.fecha_final, this.formato_fecha, this.validar.dia_completo);

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
    noti.fecha_hora = this.tiempo.format('YYYY-MM-DD') + ' ' + this.tiempo.format('HH:mm:ss');
    noti.estado = estado_v!
    noti.tipo = 3;
    noti.mensaje = 'Ha eliminado ' + nota + ' de vacaciones ' + user + ' desde ' +
      desde + ' hasta ' + hasta;

    //Listado para eliminar el usuario duplicado
    var NotificacionesVacacionesFiltrados: any = [];
    //Ciclo por cada elemento del listado
    vacaciones.EmpleadosSendNotiEmail.forEach(function (elemento: any, indice: any, array: any) {
      // Discriminación de elementos iguales
      if (NotificacionesVacacionesFiltrados.find((p: any) => p.empleado == elemento.empleado) == undefined) {
        // Nueva lista de empleados que reciben la notificacion
        NotificacionesVacacionesFiltrados.push(elemento);
      }
    });

    console.log("Usuarios que reciben la notificacion Vacaci: ", NotificacionesVacacionesFiltrados);


    NotificacionesVacacionesFiltrados.forEach((e: any) => {
      noti.id_receives_depa = e.id_dep;
      noti.id_receives_empl = e.empleado;
      noti.user_name = this.dataUserServices.username;
      noti.ip = localStorage.getItem('ip');
      noti.ip_local = this.ips_locales;
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

}
