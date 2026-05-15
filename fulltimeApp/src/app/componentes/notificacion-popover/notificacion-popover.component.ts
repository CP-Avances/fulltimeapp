import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { SkeletonListNotificacionesArray } from '../../interfaces/Skeleton';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { ListaNotificacionComponent } from '../lista-notificaciones/lista-notificacion.component';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { SocketService } from 'src/app/services/socket.service';
import { ParametrosSistema } from 'src/app/libs/parametros.emun';
import { ParametrosService } from 'src/app/services/parametros.service';

@Component({
  selector: 'app-notificacion-popover',
  templateUrl: './notificacion-popover.component.html',
  styleUrls: ['./notificacion-popover.component.scss'],
})
export class NotificacionPopoverComponent implements OnInit {

  ips_locales: any = '';

  skeleton = SkeletonListNotificacionesArray;
  loading: boolean = true;

  notificacionesAll: any[] = [];

  countNoti: number = 0;

  pageActual: number = 1;
  valorcolor: string = '';
  noticheck: string = '';

  valor: boolean = false;

  formato_fecha: string = 'dd/MM/yyyy';
  formato_hora: string = 'HH:mm:ss';

  id_empleado_logueado: number = 0;

  constructor(
    public pooverCtrl: PopoverController,
    private vistonotificacion: NotificacionesService,
    public modalController: ModalController,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
    private readonly socketService: SocketService,
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.id_empleado_logueado = parseInt(localStorage.getItem('empleadoID') ?? '0', 10);

    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    this.BuscarParametro();

    this.EscucharNotificacionesTiempoReal();
    this.EscucharAvisosTiempoReal();
  }

  /** ********************************************************************************** **
  ** **               ESCUCHAR NOTIFICACIONES DE SOLICITUDES EN TIEMPO REAL          ** **
  ** ********************************************************************************** **/
  EscucharNotificacionesTiempoReal() {
    this.socketService.onNotificacion((noti: any) => {
      this.ngZone.run(() => {
        if (!this.id_empleado_logueado) return;

        const idRecibe = Number(noti.id_empleado_recibe);

        if (idRecibe !== Number(this.id_empleado_logueado)) return;

        const notiFormateada = this.formatearNotificacionGeneral(noti);

        this.loading = false;
        this.agregarNotificacionTiempoReal(notiFormateada);
      });
    });
  }

  /** ********************************************************************************** **
  ** **               ESCUCHAR AVISOS DE ASISTENCIA EN TIEMPO REAL                   ** **
  ** ********************************************************************************** **/
  EscucharAvisosTiempoReal() {
    this.socketService.onAviso((aviso: any) => {
      this.ngZone.run(() => {
        if (!this.id_empleado_logueado) return;

        const idRecibe = Number(aviso.id_empleado_recibe);

        if (idRecibe !== Number(this.id_empleado_logueado)) return;

        const avisoFormateado = this.formatearNotificacionGeneral(aviso);

        this.loading = false;
        this.agregarNotificacionTiempoReal(avisoFormateado);
      });
    });
  }

  // METODO PARA AGREGAR NOTIFICACION EN TIEMPO REAL SIN DUPLICAR
  // METODO PARA AGREGAR NOTIFICACION EN TIEMPO REAL SIN DUPLICAR
  agregarNotificacionTiempoReal(noti: any) {

    // SOLO MOSTRAR NOTIFICACIONES NO VISTAS
    if (noti.visto === true) return;

    const existe = this.notificacionesAll.some((n: any) =>
      Number(n.id) === Number(noti.id) &&
      Number(n.tipo) === Number(noti.tipo)
    );

    if (existe) return;

    this.notificacionesAll.unshift(noti);

    this.notificacionesAll = this.notificacionesAll.slice(0, 10);

    this.countNoti = this.notificacionesAll.length;

    this.cdr.detectChanges();
  }

  // METODO PARA ABRIR LA NOTIFICACION MARCADA EN LA LISTA DE NOTIFICACIONES
  async AbrirNoti(noti: {
    id: number;
    id_permiso?: string;
    id_vacaciones?: string;
    id_hora_extra?: string;
    estado?: string;
    tipo: number;
    nempleadoreceives?: string;
    id_receives_empl?: number;
    nempleadosend?: string;
  }) {
    const tipo = Number(noti.tipo);

    if ([6, 100, 101, 102].includes(tipo)) {
      this.cambiovistanotitimbre(noti);
    } else {
      this.cambiovistanoti(noti);
    }

    this.pooverCtrl.dismiss({});
    this.valor = false;

    const modal = await this.modalController.create({
      component: ListaNotificacionComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        id: noti.id
      }
    });

    return await modal.present();
  }

  // METODO PARA CAMBIAR EL ESTADO DE VISTO DE NOTIFICACIONES DE SOLICITUDES
  cambiovistanoti(noti: { id: number }) {
    if (!noti?.id) return;

    const datos = {
      id: noti.id,
      visto: true
    };

    this.vistonotificacion.PutNotificaVisto(datos).subscribe({
      next: () => {
        this.loading = false;
        this.actualizarVistaLocal(noti.id);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // METODO PARA CAMBIAR EL ESTADO DE VISTO DE LA NOTIFICACION TIMBRE / AVISO
  cambiovistanotitimbre(noti: { id: number }) {
    if (!noti?.id) return;

    const datos = {
      id: noti.id,
      visto: true
    };

    this.vistonotificacion.PutNotifiTimbreVisto(datos).subscribe({
      next: () => {
        this.loading = false;
        this.actualizarVistaLocal(noti.id);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // ACTUALIZA LOCALMENTE LA NOTIFICACION COMO VISTA
  // ACTUALIZA LOCALMENTE LA NOTIFICACION COMO VISTA Y LA QUITA DEL POPOVER
  actualizarVistaLocal(id: number) {

    this.notificacionesAll = this.notificacionesAll.filter((n: any) =>
      Number(n.id) !== Number(id)
    );

    this.countNoti = this.notificacionesAll.length;

    this.cdr.detectChanges();
  }

  // METODO PARA ABRIR EL MODAL DE LISTA DE NOTIFICACIONES
  async abrirNotificaciones() {
    this.pooverCtrl.dismiss({});
    this.valor = false;

    const modal = await this.modalController.create({
      component: ListaNotificacionComponent,
      cssClass: 'my-custom-class'
    });

    return await modal.present();
  }

  // METODO PARA BUSCAR DATOS DE PARAMETROS
  BuscarParametro() {
    const detalles = [
      ParametrosSistema.FORMATO_FECHA,
      ParametrosSistema.FORMATO_HORA
    ];

    this.parametro.ObtenerFormatos(detalles).subscribe({
      next: (res) => {
        res.forEach((p: any) => {
          if (p.id_parametro === ParametrosSistema.FORMATO_FECHA) {
            this.formato_fecha = p.descripcion;
          } else if (p.id_parametro === ParametrosSistema.FORMATO_HORA) {
            this.formato_hora = p.descripcion;
          }
        });

        this.CargarNotificacionesIniciales();
      },
      error: () => {
        this.CargarNotificacionesIniciales();
      }
    });
  }

  // CARGAR TODAS LAS NOTIFICACIONES INICIALES
  CargarNotificacionesIniciales() {
    this.loading = true;
    this.notificacionesAll = [];
    this.countNoti = 0;

    this.LeerAvisosGenerales();
    this.LeerNotificacionesSolicitudes();
  }

  // LEER AVISOS GENERALES / ASISTENCIA / COMUNICADOS
  LeerAvisosGenerales() {
    this.vistonotificacion.BuscarAvisosGenerales(this.id_empleado_logueado).subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          const avisosFormateados = res.map((aviso: any) => {
            return this.formatearNotificacionGeneral(aviso);
          });

          this.agregarNotificacionesALista(avisosFormateados);
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // LEER NOTIFICACIONES DE PERMISOS / VACACIONES / HORAS EXTRA
  LeerNotificacionesSolicitudes() {
    this.vistonotificacion.ObtenerNotasUsuario(this.id_empleado_logueado).subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          const notificacionesFormateadas = res.map((noti: any) => {
            return this.formatearNotificacionGeneral(noti);
          });

          this.agregarNotificacionesALista(notificacionesFormateadas);
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // AGREGA NOTIFICACIONES INICIALES A LA LISTA GENERAL
  // AGREGA NOTIFICACIONES INICIALES A LA LISTA GENERAL
  agregarNotificacionesALista(notificaciones: any[]) {

    notificaciones.forEach((noti: any) => {

      // SOLO MOSTRAR NOTIFICACIONES NO VISTAS
      if (noti.visto === true) return;

      const existe = this.notificacionesAll.some((n: any) =>
        Number(n.id) === Number(noti.id) &&
        Number(n.tipo) === Number(noti.tipo)
      );

      if (!existe) {
        this.notificacionesAll.push(noti);
      }
    });

    this.notificacionesAll.sort((a: any, b: any) => {
      const fechaA = new Date(a.create_at).getTime();
      const fechaB = new Date(b.create_at).getTime();

      return fechaB - fechaA;
    });

    this.notificacionesAll = this.notificacionesAll.slice(0, 10);

    // EL CONTADOR SERÁ IGUAL A LAS NOTIFICACIONES NO VISTAS MOSTRADAS
    this.countNoti = this.notificacionesAll.length;
  }

  // METODO PARA FORMATEAR LOS DATOS SEGUN EL TIPO DE NOTIFICACION
  private formatearNotificacionGeneral(noti: any): any {
    const [fechaRaw = '', horaRaw = ''] = String(noti.create_at ?? '').split(' ');

    const fechaRegistro = this.validar.DarFormatoFecha(fechaRaw, 'yyyy-MM-dd') ?? '';

    noti.fecha_ = this.validar.FormatearFecha(
      fechaRegistro,
      this.formato_fecha,
      this.validar.dia_abreviado
    );

    noti.hora_ = this.validar.FormatearHora(horaRaw, this.formato_hora);

    const tipo = Number(noti.tipo);

    if ([6, 100, 101, 102].includes(tipo)) {
      this.formatearAvisoAsistencia(noti);
    } else {
      this.formatearNotificacionSolicitud(noti);
    }

    return noti;
  }

  // FORMATEAR NOTIFICACIONES DE SOLICITUDES / PERMISOS / VACACIONES / HORAS EXTRA
  private formatearNotificacionSolicitud(noti: any): void {
    try {
      const mensajeObj = typeof noti.mensaje === 'string'
        ? JSON.parse(noti.mensaje)
        : noti.mensaje;

      const data = mensajeObj?.data ?? {};

      noti.notificacion = mensajeObj?.notificacion ?? noti.descripcion ?? '';
      noti.empleado = data.empleado ?? noti.empleado ?? '';

      const desde = data.fecha_desde ?? data.fecha_hora ?? null;
      const hasta = data.fecha_hasta ?? data.fecha_hora ?? null;

      noti.fecha_desde = desde
        ? this.validar.FormatearFecha(
          desde,
          this.formato_fecha,
          this.validar.dia_abreviado
        )
        : '';

      noti.fecha_hasta = hasta
        ? this.validar.FormatearFecha(
          hasta,
          this.formato_fecha,
          this.validar.dia_abreviado
        )
        : '';

      noti.dias = data.dias ?? '';
      noti.motivo = data.motivo ?? '';

      noti.hora_inicio = data.hora_inicio
        ? this.validar.FormatearHora(data.hora_inicio, this.formato_hora)
        : '';

      noti.hora_fin = data.hora_fin
        ? this.validar.FormatearHora(data.hora_fin, this.formato_hora)
        : '';

    } catch {
      noti.notificacion = noti.descripcion ?? '';
      noti.empleado = noti.empleado ?? '';
      noti.fecha_desde = '';
      noti.fecha_hasta = '';
      noti.motivo = '';
      noti.hora_inicio = '';
      noti.hora_fin = '';
    }
  }

  // FORMATEAR AVISOS DE ASISTENCIA / COMUNICADOS
  private formatearAvisoAsistencia(aviso: any): void {
    const tipo = Number(aviso.tipo);
    const partes = String(aviso.mensaje ?? '').split('//');

    if (tipo === 100) {
      aviso.notificacion = partes[4] ?? aviso.descripcion ?? '';

      const fechaHorario = String(partes[0] ?? '').split(' ')[0];
      const horaHorario = String(partes[0] ?? '').split(' ')[1];

      aviso.horario_fecha = this.validar.FormatearFecha(
        fechaHorario,
        this.formato_fecha,
        this.validar.dia_completo
      );

      aviso.horario_hora = this.validar.FormatearHora(
        horaHorario,
        this.formato_hora
      );

      aviso.timbre_fecha = this.validar.FormatearFecha(
        String(partes[1] ?? '').split(' ')[0],
        this.formato_fecha,
        this.validar.dia_completo
      );

      aviso.timbre_hora = this.validar.FormatearHora(
        String(partes[1] ?? '').split(' ')[1],
        this.formato_hora
      );

      aviso.tolerancia = partes[2] ?? '';
      aviso.atraso = partes[3] ?? '';
    }

    else if (tipo === 101) {
      aviso.notificacion = partes[2] ?? aviso.descripcion ?? '';
      aviso.nombre_horario = partes[1] ?? '';

      aviso.horario_fecha = this.validar.FormatearFecha(
        partes[0] ?? '',
        this.formato_fecha,
        this.validar.dia_completo
      );

      aviso.horario_hora = '';
    }

    else if (tipo === 102) {
      aviso.notificacion = partes[3] ?? aviso.descripcion ?? '';

      const fechaHorario = String(partes[0] ?? '').split(' ')[0];
      const horaHorario = String(partes[0] ?? '').split(' ')[1];

      aviso.horario_fecha = this.validar.FormatearFecha(
        fechaHorario,
        this.formato_fecha,
        this.validar.dia_completo
      );

      aviso.horario_hora = this.validar.FormatearHora(
        horaHorario,
        this.formato_hora
      );

      aviso.timbre_fecha = this.validar.FormatearFecha(
        String(partes[1] ?? '').split(' ')[0],
        this.formato_fecha,
        this.validar.dia_completo
      );

      aviso.timbre_hora = this.validar.FormatearHora(
        String(partes[1] ?? '').split(' ')[1],
        this.formato_hora
      );

      aviso.salida = partes[2] ?? '';
    }

    else if (tipo === 6) {
      aviso.notificacion = aviso.mensaje ?? aviso.descripcion ?? '';
    }
  }

  // METODO PARA CAMBIAR ESTILOS
  CambiarEstiloNotificacion: any = {
    // COMUNICADO
    6: {
      color: '#f5cafc',
      icon: 'mail-outline',
      iconColor: '#260DE6',
      grupo: 'comunicado'
    },

    // PERMISOS
    1: {
      color: '#FAF28A',
      icon: 'document-text-outline',
      iconColor: '#2563EB',
      grupo: 'solicitud'
    },
    2: {
      color: '#FAF28A',
      icon: 'create-outline',
      iconColor: '#2563EB',
      grupo: 'solicitud'
    },
    3: {
      color: '#FAF28A',
      icon: 'trash-outline',
      iconColor: '#2563EB',
      grupo: 'solicitud'
    },
    4: {
      color: '#FAF28A',
      icon: 'document-text-outline',
      iconColor: '#2563EB',
      grupo: 'solicitud'
    },
    5: {
      color: '#FAF28A',
      icon: 'checkmark-circle-outline',
      iconColor: '#2563EB',
      grupo: 'solicitud'
    },
    7: {
      color: '#FAF28A',
      icon: 'close-circle-outline',
      iconColor: '#2563EB',
      grupo: 'solicitud'
    },
    8: {
      color: '#FAF28A',
      icon: 'create-outline',
      iconColor: '#2563EB',
      grupo: 'solicitud'
    },

    // VACACIONES
    9: {
      color: '#D8F9C6',
      icon: 'calendar-outline',
      iconColor: '#2563EB',
      grupo: 'solicitud'
    },
    10: {
      color: '#D8F9C6',
      icon: 'calendar-outline',
      iconColor: '#2563EB',
      grupo: 'solicitud'
    },
    11: {
      color: '#D8F9C6',
      icon: 'calendar-clear-outline',
      iconColor: '#2563EB',
      grupo: 'solicitud'
    },
    12: {
      color: '#D8F9C6',
      icon: 'calendar-outline',
      iconColor: '#2563EB',
      grupo: 'solicitud'
    },
    13: {
      color: '#D8F9C6',
      icon: 'calendar-number-outline',
      iconColor: '#2563EB',
      grupo: 'solicitud'
    },
    14: {
      color: '#D8F9C6',
      icon: 'close-circle-outline',
      iconColor: '#2563EB',
      grupo: 'solicitud'
    },

    // ATRASOS / FALTAS / SALIDAS
    100: {
      color: '#fff9c4',
      icon: 'time-outline',
      iconColor: '#260DE6',
      grupo: 'asistencia'
    },
    101: {
      color: '#f8d7da',
      icon: 'person-remove-outline',
      iconColor: '#260DE6',
      grupo: 'asistencia'
    },
    102: {
      color: '#bbdefb',
      icon: 'log-out-outline',
      iconColor: '#260DE6',
      grupo: 'asistencia'
    },
  };
}