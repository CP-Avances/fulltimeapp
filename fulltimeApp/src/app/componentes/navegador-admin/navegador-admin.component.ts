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
    this.username = this.userService.username;

    const empleadoID = Number(localStorage.getItem('empleadoID') ?? 0);
    this.idEmpleadoIngresa = Number.isNaN(empleadoID) ? 0 : empleadoID;

    this.networkSubscriber();
    this.VerificarFunciones();

    this.CargarContadorNotificaciones();
    this.EscucharNotificacionesTiempoReal();

    this.ValidarPermisosRol();
  }

  ionViewWillEnter() {
    this.username = this.userService.username;

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
        this.procesarNotificacionSocket(noti, 'Fulltime Notificación');
      });
    });

    this.unsubscribeAviso = this.socketService.onAviso((aviso: any) => {
      this.ngZone.run(() => {
        this.procesarNotificacionSocket(aviso, 'Fulltime Aviso');
      });
    });
  }

  private procesarNotificacionSocket(data: any, titulo: string) {
    if (!this.idEmpleadoIngresa) return;

    const idRecibe = this.obtenerIdEmpleadoRecibe(data);

    if (idRecibe !== Number(this.idEmpleadoIngresa)) return;

    if (data.visto === false || data.visto === undefined || data.visto === null) {
      this.countNoti += 1;
    }

    this.mensaje = this.obtenerMensajeNotificacion(data);

    this.enviarNotificacionLocal(data, titulo);
  }

  private obtenerIdEmpleadoRecibe(data: any): number {
    return Number(
      data?.id_empleado_recibe ??
      data?.id_receives_empl ??
      data?.id_recibe ??
      0
    );
  }

  private obtenerMensajeNotificacion(data: any): string {
    if (data?.descripcion) return String(data.descripcion);

    if (data?.notificacion) return String(data.notificacion);

    if (data?.usuario) return String(data.usuario);

    if (data?.mensaje) {
      if (typeof data.mensaje === 'string') {
        try {
          const mensajeObj = JSON.parse(data.mensaje);
          return mensajeObj?.notificacion ?? data.mensaje;
        } catch {
          return data.mensaje;
        }
      }

      return data.mensaje?.notificacion ?? 'Tiene una nueva notificación';
    }

    return 'Tiene una nueva notificación';
  }

  private async enviarNotificacionLocal(data: any, titulo: string) {
    try {
      const idLocal = Number(data?.id ?? Date.now());

      const options: ScheduleOptions = {
        notifications: [
          {
            id: idLocal,
            title: titulo,
            body: this.mensaje,
            largeBody: this.mensaje,
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
    await popover.onDidDismiss();

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

  cerrarSesion() {
    this.unsubscribeNotificacion?.();
    this.unsubscribeAviso?.();
    this.socketEscuchando = false;

    this.relojService.cerrarSesion();
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


  // CONTROL DE MENU DEACUERDO CON EL ROL
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
      error: (error) => {
        console.log('Error al validar permisos del rol', error);

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