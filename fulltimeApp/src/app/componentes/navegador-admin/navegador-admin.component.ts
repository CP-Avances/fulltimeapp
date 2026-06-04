import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import {
  AlertController,
  LoadingController,
  MenuController,
  ModalController,
  Platform,
  PopoverController,
  ToastController
} from '@ionic/angular';

import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';

import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { RelojServiceService } from 'src/app/services/reloj-service.service';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { SocketService } from 'src/app/services/socket.service';

import { NetworkService } from '../../libs/network.service';
import { NotificacionPopoverComponent } from '../notificacion-popover/notificacion-popover.component';
import { TimbresPerdidosComponent } from '../../pages/bienvenido/showTimbresGuardados.component';

import { Notificacion, NotificacionTimbre } from '../../interfaces/Notificaciones';
import { ParametrosService } from 'src/app/services/parametros.service';

@Component({
  selector: 'app-navegador-admin',
  templateUrl: './navegador-admin.component.html',
  styleUrls: ['./navegador-admin.component.scss'],
})
export class NavegadorAdminComponent implements OnInit, OnDestroy {

  username: string = '';
  imagen: string = localStorage.getItem('imagen64') ?? '';

  idEmpleadoIngresa: number = 0;

  valor: boolean = true;
  loading: boolean = true;

  notificaciones: Notificacion[] = [];
  notificaiontimbre: NotificacionTimbre[] = [];
  notificacionestimbres: any[] = [];
  notificacionesAll: any[] = [];

  public countNoti: number = 0;
  public countbadge: number = 0;

  mensaje: string = '';
  empleEnvia: string = '';

  ids: number[] = [];
  resume: boolean = false;

  colorNOtifi: string = '';

  isConnected: boolean = true;

  funciones: any = [];
  apro_permisos: any;
  apro_vacaciones: any;
  apro_horasExtras: any;
  apro_alimentaciones: any;

  colorp: any;
  colorh: any;
  colorv: any;
  colora: any;

  formato_fecha: string = 'dd/MM/yyyy';
  formato_hora: string = 'HH:mm:ss';

  private unsubscribeNotificacion?: () => void;
  private unsubscribeAviso?: () => void;
  private socketEscuchando: boolean = false;

  constructor(
    private userService: DataUserLoggedService,
    private relojService: RelojServiceService,
    private menu: MenuController,
    public modalController: ModalController,
    public pooverCtrl: PopoverController,
    public platform: Platform,
    public alertCrtl: AlertController,
    public loadingController: LoadingController,
    private toastController: ToastController,
    private networkService: NetworkService,
    private socketService: SocketService,
    private notificacionesService: NotificacionesService,
    private parametros: ParametrosService,
    private readonly ngZone: NgZone,
  ) { }

  ngOnInit() {
    this.username = this.userService.UserFullname;

    const empleadoID = Number(localStorage.getItem('empleadoID') ?? 0);
    this.idEmpleadoIngresa = Number.isNaN(empleadoID) ? 0 : empleadoID;

    this.networkSubscriber();
    this.VerificarFunciones();

    this.CargarFormatosNotificaciones();
    this.CargarContadorNotificaciones();
    this.EscucharNotificacionesTiempoReal();

    this.ValidarPermisosRol();
  }

  ionViewWillEnter() {
    this.username = this.userService.UserFullname;

    const empleadoID = Number(localStorage.getItem('empleadoID') ?? 0);
    this.idEmpleadoIngresa = Number.isNaN(empleadoID) ? 0 : empleadoID;

    this.networkSubscriber();
    this.VerificarFunciones();
    this.CargarContadorNotificaciones();

    this.ValidarPermisosRol();
  }

  ngOnDestroy() {
    this.unsubscribeNotificacion?.();
    this.unsubscribeAviso?.();
    this.socketEscuchando = false;
  }

  onImageError(event: any) {
    event.target.src = '../../../assets/images/perfildefecto.png';
  }

  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();

    if (!this.isConnected) {
      this.abrirToas(
        'Por favor verifique su conexión a Internet',
        'danger',
        3000,
        'middle'
      );

      this.imagen = localStorage.getItem('imagen64') ?? '';
      return;
    }

    this.imagen = localStorage.getItem('imagen64') ?? '';
  }

  async abrirToas(mensaje: string, color: string, duracion: number, position: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      position: position
    });

    await toast.present();
  }

  CargarFormatosNotificaciones() {
    const detalles = [
      28, // ParametrosSistema.FORMATO_FECHA
      29  // ParametrosSistema.FORMATO_HORA
    ];

    this.parametros.ObtenerFormatos(detalles).subscribe({
      next: (res: any[]) => {
        res.forEach((p: any) => {
          if (p.id_parametro === 28) {
            this.formato_fecha = p.descripcion;
          }

          if (p.id_parametro === 29) {
            this.formato_hora = p.descripcion;
          }
        });
      },
      error: () => {
        this.formato_fecha = 'dd/MM/yyyy';
        this.formato_hora = 'HH:mm:ss';
      }
    });
  }

  CargarContadorNotificaciones() {
    if (!this.idEmpleadoIngresa) return;

    this.countNoti = 0;

    this.notificacionesService.BuscarAvisosGenerales(this.idEmpleadoIngresa).subscribe({
      next: (res: any[]) => {
        if (res && res.length > 0) {
          const noVistas = res.filter((n: any) => n.visto === false).length;
          this.countNoti += noVistas;
        }
      }
    });

    this.notificacionesService.ObtenerNotasUsuario(this.idEmpleadoIngresa).subscribe({
      next: (res: any[]) => {
        if (res && res.length > 0) {
          const noVistas = res.filter((n: any) => n.visto === false).length;
          this.countNoti += noVistas;
        }
      }
    });
  }

  EscucharNotificacionesTiempoReal() {
    if (this.socketEscuchando) return;

    this.socketEscuchando = true;

    this.unsubscribeNotificacion = this.socketService.onNotificacion((noti: any) => {
      this.ngZone.run(() => {
        this.procesarNotificacionSocket(noti, 'FullTime Notificación');
      });
    });

    this.unsubscribeAviso = this.socketService.onAviso((aviso: any) => {
      this.ngZone.run(() => {
        this.procesarNotificacionSocket(aviso, 'FullTime Aviso');
      });
    });
  }

  private procesarNotificacionSocket(data: any, tituloDefault: string) {
    if (!this.idEmpleadoIngresa) return;

    const idRecibe = this.obtenerIdEmpleadoRecibe(data);

    if (idRecibe !== Number(this.idEmpleadoIngresa)) return;

    if (data.visto === false || data.visto === undefined || data.visto === null) {
      this.countNoti += 1;
    }

    const notificacion = this.formatearNotificacionLocal(data, tituloDefault);

    this.enviarNotificacionLocal(
      data,
      notificacion.titulo,
      notificacion.cuerpo,
      notificacion.cuerpoLargo
    );
  }

  private obtenerIdEmpleadoRecibe(data: any): number {
    return Number(
      data?.id_empleado_recibe ??
      data?.id_receives_empl ??
      data?.id_recibe ??
      0
    );
  }

  private formatearNotificacionLocal(data: any, tituloDefault: string): {
    titulo: string;
    cuerpo: string;
    cuerpoLargo: string;
  } {
    const tipo = Number(data?.tipo ?? 0);

    if (tipo === 6) {
      return this.formatearComunicadoLocal(data);
    }

    if ([100, 101, 102].includes(tipo)) {
      return this.formatearAvisoAsistenciaLocal(data);
    }

    return this.formatearSolicitudLocal(data, tituloDefault);
  }

  private formatearComunicadoLocal(data: any): {
    titulo: string;
    cuerpo: string;
    cuerpoLargo: string;
  } {
    const empleado = data?.empleado ?? 'Sistema FullTime';
    const mensaje = data?.mensaje ?? data?.descripcion ?? 'Tiene un nuevo comunicado.';
    const fecha = this.formatearFechaHoraLocal(data?.create_at);

    const titulo = 'FullTime Aviso';
    const cuerpo = 'Tiene un nuevo comunicado';

    const cuerpoLargo =
      `COMUNICADO\n` +
      `Enviado por: ${empleado}\n` +
      `Notificación: ${mensaje}\n` +
      `Fecha: ${fecha}`;

    return {
      titulo,
      cuerpo,
      cuerpoLargo
    };
  }

  private formatearSolicitudLocal(data: any, tituloDefault: string): {
    titulo: string;
    cuerpo: string;
    cuerpoLargo: string;
  } {
    const mensajeObj = this.obtenerMensajeJson(data?.mensaje);
    const detalle = mensajeObj?.data ?? {};

    const mensajePrincipal =
      mensajeObj?.mensaje_principal ??
      data?.descripcion ??
      'Tiene una nueva notificación.';

    const notificacion =
      mensajeObj?.notificacion ??
      data?.descripcion ??
      'Tiene una nueva notificación.';

    const empleado =
      detalle?.empleado ??
      data?.empleado ??
      'No registrado';

    const motivo =
      detalle?.motivo ??
      '';

    const fechaDesde = detalle?.fecha_desde
      ? this.formatearFechaCortaLocal(detalle.fecha_desde)
      : '';

    const fechaHasta = detalle?.fecha_hasta
      ? this.formatearFechaCortaLocal(detalle.fecha_hasta)
      : '';

    const horaInicio = detalle?.hora_inicio
      ? this.formatearHoraLocal(detalle.hora_inicio)
      : '';

    const horaFin = detalle?.hora_fin
      ? this.formatearHoraLocal(detalle.hora_fin)
      : '';

    const fechaRegistro = this.formatearFechaHoraLocal(data?.create_at);

    const titulo = tituloDefault || 'FullTime Notificación';
    const cuerpo = String(mensajePrincipal).replace(/:$/, '');

    let cuerpoLargo =
      `${notificacion.replace(/:$/, '')}\n` +
      `Colaborador: ${empleado}`;

    if (motivo) {
      cuerpoLargo += `\nMotivo: ${motivo}`;
    }

    if (fechaDesde || fechaHasta) {
      cuerpoLargo += `\nDesde: ${fechaDesde || 'N/A'}    Hasta: ${fechaHasta || 'N/A'}`;
    }

    if (horaInicio || horaFin) {
      cuerpoLargo += `\nHorario: ${horaInicio || 'N/A'} - ${horaFin || 'N/A'}`;
    }

    cuerpoLargo += `\nFecha: ${fechaRegistro}`;

    return {
      titulo,
      cuerpo,
      cuerpoLargo
    };
  }

  private formatearAvisoAsistenciaLocal(data: any): {
    titulo: string;
    cuerpo: string;
    cuerpoLargo: string;
  } {
    const tipo = Number(data?.tipo ?? 0);
    const partes = String(data?.mensaje ?? '').split('//');
    const fechaRegistro = this.formatearFechaHoraLocal(data?.create_at);

    if (tipo === 100) {
      const notificacion = partes[5] ?? data?.descripcion ?? 'Se ha registrado un atraso.';

      const horario = this.formatearFechaHoraDesdeTexto(partes[0]);
      const timbre = this.formatearFechaHoraDesdeTexto(partes[1]);

      const titulo = 'FullTime Aviso';
      const cuerpo = 'Aviso de atraso';

      const cuerpoLargo =
        `ATRASO\n` +
        `Notificación: ${notificacion}\n` +
        `Horario: ${horario}\n` +
        `Timbre: ${timbre}\n` +
        `Tolerancia: ${partes[2] ?? 'N/A'} minutos\n` +
        `Total atraso: ${partes[3] ?? 'N/A'} minutos\n` +
        `Fecha: ${fechaRegistro}`;

      return {
        titulo,
        cuerpo,
        cuerpoLargo
      };
    }

    if (tipo === 101) {
      const notificacion = partes[2] ?? data?.descripcion ?? 'Se ha registrado una falta.';
      const horario = this.formatearFechaCortaLocal(partes[0]);
      const nombreHorario = partes[1] ?? 'No registrado';

      const titulo = 'FullTime Aviso';
      const cuerpo = 'Aviso de falta';

      const cuerpoLargo =
        `FALTA\n` +
        `Notificación: ${notificacion}\n` +
        `Horario: ${horario}\n` +
        `Nombre horario: ${nombreHorario}\n` +
        `Fecha: ${fechaRegistro}`;

      return {
        titulo,
        cuerpo,
        cuerpoLargo
      };
    }

    if (tipo === 102) {
      const notificacion = partes[3] ?? data?.descripcion ?? 'Se ha registrado una salida anticipada.';

      const horario = this.formatearFechaHoraDesdeTexto(partes[0]);
      const timbre = this.formatearFechaHoraDesdeTexto(partes[1]);

      const titulo = 'FullTime Aviso';
      const cuerpo = 'Aviso de salida anticipada';

      const cuerpoLargo =
        `SALIDA ANTICIPADA\n` +
        `Notificación: ${notificacion}\n` +
        `Horario: ${horario}\n` +
        `Timbre: ${timbre}\n` +
        `Total anticipación: ${partes[2] ?? 'N/A'} minutos\n` +
        `Fecha: ${fechaRegistro}`;

      return {
        titulo,
        cuerpo,
        cuerpoLargo
      };
    }

    return {
      titulo: 'FullTime Aviso',
      cuerpo: 'Tiene un nuevo aviso',
      cuerpoLargo: data?.descripcion ?? 'Tiene un nuevo aviso.'
    };
  }

  private obtenerMensajeJson(mensaje: any): any {
    if (!mensaje) return null;

    if (typeof mensaje === 'object') return mensaje;

    try {
      return JSON.parse(mensaje);
    } catch {
      return null;
    }
  }

  private formatearFechaHoraLocal(fechaHora: any): string {
    if (!fechaHora) return 'No registrada';

    const valor = String(fechaHora).trim();
    const partes = valor.split(' ');

    const fechaRaw = partes[0] ?? '';
    const horaRaw = partes[1] ?? '';

    const fecha = this.formatearFechaCortaLocal(fechaRaw);
    const hora = horaRaw ? this.formatearHoraLocal(horaRaw) : '';

    return hora ? `${fecha} - ${hora}` : fecha;
  }

  private formatearFechaHoraDesdeTexto(valor: any): string {
    if (!valor) return 'N/A';

    const texto = String(valor).trim();
    const partes = texto.split(' ');

    const fechaRaw = partes[0] ?? '';
    const horaRaw = partes[1] ?? '';

    const fecha = this.formatearFechaCortaLocal(fechaRaw);
    const hora = horaRaw ? this.formatearHoraLocal(horaRaw) : '';

    return hora ? `${fecha} ${hora}` : fecha;
  }

  private formatearFechaCortaLocal(fecha: any): string {
    if (!fecha) return '';

    const valor = String(fecha).trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(valor)) {
      const [anio, mes, dia] = valor.substring(0, 10).split('-');
      return `${dia}/${mes}/${anio}`;
    }

    if (/^\d{2}\/\d{2}\/\d{4}/.test(valor)) {
      return valor.substring(0, 10);
    }

    return valor;
  }

  private formatearHoraLocal(hora: any): string {
    if (!hora) return '';

    const valor = String(hora).trim();

    if (/^\d{2}:\d{2}/.test(valor)) {
      return valor.substring(0, 5);
    }

    return valor;
  }

  private async enviarNotificacionLocal(
    data: any,
    titulo: string,
    cuerpo: string,
    cuerpoLargo: string
  ) {
    try {
      const idLocal = Number(data?.id ?? Date.now());

      const options: ScheduleOptions = {
        notifications: [
          {
            id: idLocal,
            title: titulo,
            body: cuerpo,
            largeBody: cuerpoLargo,
            summaryText: 'FullTime',
            schedule: {
              allowWhileIdle: true
            }
          }
        ]
      };

      await LocalNotifications.schedule(options);

    } catch (error) {
      console.log('No se pudo mostrar la notificación local:', error);
    }
  }


  VerificarFunciones() {
    const raw = localStorage.getItem('modulos');

    if (!raw) return;

    try {
      const modulos = JSON.parse(raw);

      const { permisos, vacaciones } = modulos;

      this.apro_permisos = permisos;
      this.apro_vacaciones = vacaciones;

      this.colorp = this.apro_permisos === true ? 'dark' : 'medium';
      this.colorv = this.apro_vacaciones === true ? 'dark' : 'medium';

    } catch (error) {
      console.log('Error al leer módulos:', error);
    }
  }

  async mostrarToas(mensaje: string) {
    const toast = await this.toastController.create({
      message:
        `<ion-icon name="information-circle-outline"></ion-icon>` +
        mensaje +
        '\n\n Te gustaria activarlo? \n Comunicate con nosotros: www.casapazmino.com.ec',
      duration: 4500,
      position: 'top',
      color: 'notificacicon',
      mode: 'ios',
      cssClass: 'toast-custom-class',
    });

    await toast.present();
  }

  async mostrarToasNoti(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
      color: 'notificacicon',
      mode: 'ios',
      cssClass: 'toast-custom-class',
    });

    await toast.present();
  }

  async Mostrarpopnotificaciones(event: any) {
    this.countNoti = 0;
    this.valor = false;

    const popover = await this.pooverCtrl.create({
      component: NotificacionPopoverComponent,
      event: event,
      mode: 'md',
      translucent: true,
      cssClass: 'noti-popover',
    });

    await popover.present();
    const { data } = await popover.onDidDismiss();

    if (data?.actualizado === true || data?.modalActualizado === true) {
      this.countNoti = 0;
    }

    this.CargarContadorNotificaciones();
  }

  openAdmin() {
    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur();
    this.menu.enable(true, 'admin');
    this.menu.open('admin');
    this.VerificarFunciones();
  }

  closeAdmin() {
    this.menu.close('admin');
  }

  async cerrarSesion() {
    this.unsubscribeNotificacion?.();
    this.unsubscribeAviso?.();
    this.socketEscuchando = false;

    await this.relojService.cerrarSesion();
    this.closeAdmin();
  }

  async presentModalTimbresPerdidos() {
    this.closeAdmin();

    const modal = await this.modalController.create({
      component: TimbresPerdidosComponent,
      cssClass: 'my-custom-class'
    });

    return await modal.present();
  }

  permisosRol = {
    comunicados: false,
    horarios: false,
    justificarTimbres: false,
    timbresEmpleados: false,
    reporteTimbres: false,
    aprobaciones: false
  };

  ValidarPermisosRol() {
    const idRol = Number(localStorage.getItem('rol') ?? 0);

    const datos = {
      id_rol: idRol,
      funciones: [
        'Comunicados',
        'Ver Horarios',
        'Registrar Timbres',
        'Ver Timbres',
        'Reporte Timbres',
        'Aprobaciones'
      ]
    };

    this.parametros.ObtenerPermisosRoles(datos).subscribe({
      next: (res: any[]) => {
        this.permisosRol.comunicados = this.tienePermiso(res, 'Comunicados');
        this.permisosRol.horarios = this.tienePermiso(res, 'Ver Horarios');
        this.permisosRol.justificarTimbres = this.tienePermiso(res, 'Registrar Timbres');
        this.permisosRol.timbresEmpleados = this.tienePermiso(res, 'Ver Timbres');
        this.permisosRol.reporteTimbres = this.tienePermiso(res, 'Reporte Timbres');
        this.permisosRol.aprobaciones = this.tienePermiso(res, 'Aprobaciones');
      },
      error: () => {
        this.permisosRol = {
          comunicados: false,
          horarios: false,
          justificarTimbres: false,
          timbresEmpleados: false,
          reporteTimbres: false,
          aprobaciones: false
        };
      }
    });
  }

  private tienePermiso(permisos: any[], funcion: string): boolean {
    return permisos.some((item: any) =>
      String(item.funcion ?? '').trim().toLowerCase() === funcion.trim().toLowerCase()
      && item.permiso === true
    );
  }
}