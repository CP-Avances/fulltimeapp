import { Component, OnInit } from '@angular/core';
import { ModalController, PopoverController, NavParams } from '@ionic/angular';
import { Notificacion } from '../../interfaces/Notificaciones';
import { NotificacionTimbre } from '../../interfaces/Notificaciones';
import { SkeletonListNotificacionesArray } from '../../interfaces/Skeleton';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { ConnectivityService } from 'src/app/services/conexion-servidor.service'
import { NetworkService } from '../../libs/network.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { ParametrosSistema } from 'src/app/libs/parametros.emun';
import { ParametrosService } from 'src/app/services/parametros.service';

@Component({
  selector: 'app-lista-notificacion',
  templateUrl: './lista-notificacion.component.html',
  styleUrls: ['./lista-notificacion.component.scss'],
})

export class ListaNotificacionComponent implements OnInit {
  ips_locales: any = '';

  //INICIO DE VARIABLES
  serverConnected: boolean = true;
  skeleton = SkeletonListNotificacionesArray;
  loading: boolean = true;
  notificaciones: Notificacion[] = [];
  notificaiontimbre: NotificacionTimbre[] = [];
  notificacionestimbres: any = [];
  notificacionesAll: any = [];
  countNoti: any;
  pageActual: any = 1;
  valorcolor: string = '';
  noticheck: string = '';
  valor: boolean = false;
  paginaccionvista: boolean = false;
  ver: boolean = false;
  id_noti: any;

  formato_fecha = 'dd/MM/yyyy';
  formato_hora = 'HH:mm:ss';

  id_empleado_logueado: number = 0;

  constructor(
    private navParams: NavParams,
    public pooverCtrl: PopoverController,
    private vistonotificacion: NotificacionesService,
    public modalController: ModalController,
    private networkService: NetworkService,
    private connectivityService: ConnectivityService,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
  ) {
    this.id_noti = this.navParams.get('id')
  }

  // METODO QUE AL INICIARCE MARCA COMO VISTO A TODAS LAS NOTIFICACIONES
  async ngOnInit() {
    this.networkSubscriber();
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    this.serverConnected = await this.connectivityService.checkServerConnection();
    this.id_empleado_logueado = parseInt(localStorage.getItem('empleadoID') ?? '0', 10);

    this.BuscarParametro();
  }

  async ionViewWillEnter() {
    this.ngOnInit();
  }

  //METODO DE VERIFICACION DE CONEXION A INTERNET
  isConnected: boolean;
  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
  }


  // METODO PARA ABRIR LA NOTIFICACION EN LA VISTA DEL MODULO AL QUE PERTENECE
  AbrirNoti(noti: { id: number, id_permiso: string; id_vacaciones: string; id_hora_extra: string; estado: string, tipo: number; nempleadoreceives: string; id_receives_empl: number; nempleadosend: string; }) {
    this.cambiovistanoti(noti);
    this.cambiovistanotitimbre(noti);
    this.modalController.dismiss({});

  }


  cambiovistanoti(noti: { id: number }) {
    if (!noti?.id) {
      console.warn('No se recibió el id de la notificación');
      return;
    }

    const datos = {
      id: noti.id,
      visto: true
    };

    this.vistonotificacion.PutNotificaVisto(datos).subscribe(
      {
        next: () => {
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      }
    );
  }

  //cambia el estado de la columna visto de la tabla realtime_notitimbre de true a false.
  cambiovistanotitimbre(noti: { id: number }) {
    const vista = true;
    const datos = { id: noti.id, visto: vista }

    this.vistonotificacion.PutNotifiTimbreVisto(datos).subscribe(
      {
        next: () => {
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      }
    )
  }

  //Poner todas las notificaciones como vistas
  notificacionesvistanoti(noti: any) {
    const vista = true;
    var datos = { id: 0, visto: vista }
    var allNotificaciones = [];
    allNotificaciones = noti;

    noti.forEach((item: any) => {
      if (item.visto != true) {
        datos.id = item.id;

        this.vistonotificacion.PutNotificaVisto(datos).subscribe(
          {
            next: () => {
              this.loading = false;
            },
            error: () => {
              this.loading = false;
            }
          }
        )

        this.vistonotificacion.PutNotifiTimbreVisto(datos).subscribe(
          {
            next: () => {
              this.loading = false;
            },
            error: () => {
              this.loading = false;
            }
          }
        )
      }
    });

    this.modalController.dismiss({});
  }

  //variables de configuracion del componente de paginacion (pagination-controls)
  public maxSize: number = 5;
  public directionLinks: boolean = true;
  public autoHide: boolean = false;
  public responsive: boolean = true;
  public labels: any = {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };

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
  agregarNotificacionesALista(notificaciones: any[]) {
    notificaciones.forEach((noti: any) => {
      const existe = this.notificacionesAll.some((n: any) =>
        Number(n.id) === Number(noti.id) &&
        Number(n.tipo) === Number(noti.tipo)
      );

      if (!existe) {
        if (noti.visto === false) {
          this.countNoti += 1;
        }

        this.notificacionesAll.push(noti);
      }
    });

    this.notificacionesAll.sort((a: any, b: any) => {
      const fechaA = new Date(a.create_at).getTime();
      const fechaB = new Date(b.create_at).getTime();

      return fechaB - fechaA;
    });

    this.notificacionesAll = this.notificacionesAll.slice(0, 10);
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

    } catch (error) {
      console.error('Error al formatear notificación de solicitud:', error, noti);

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
}
