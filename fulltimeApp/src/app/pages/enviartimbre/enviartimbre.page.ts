import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, AlertController, Platform } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FingerprintAIO } from '@awesome-cordova-plugins/fingerprint-aio/ngx';
import { Geolocation } from '@capacitor/geolocation';
import { Device } from '@capacitor/device';
import {
  Camera,
  CameraDirection,
  CameraResultType,
  CameraSource
} from '@capacitor/camera';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { Timbre } from '../../interfaces/Timbre';
import { DataLocalService } from '../../libs/data-local.service';
import { NetworkService } from '../../libs/network.service';
import { RelojServiceService } from '../../services/reloj-service.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { FechaHoraService } from 'src/app/services/fecha-hora.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { ParametrosSistema } from 'src/app/libs/parametros.emun';

type MotivoConexion = 'SIN_INTERNET' | 'ERROR_SERVIDOR' | 'TIMEOUT' | 'OK';

@Component({
  selector: 'app-enviartimbre',
  templateUrl: './enviartimbre.page.html',
  styleUrls: ['./enviartimbre.page.scss'],
})
export class EnviartimbrePage implements OnInit {

  ips_locales: any = '';

  rango: number = 0;
  capturar_segundos: boolean = false;

  foto: boolean = false;
  foto_obligatorio: boolean = false;
  desconocida: boolean = false;
  especial: boolean = false;
  requiereInternet: boolean = false;

  timbrarSinInternet: string = 'No';
  timbrarConFoto: string = 'No';
  timbreFotoObligatoria: string = 'No';
  timbrarDesconocido: string = 'No';

  imagen: string = '';
  storageUbica: string = '';

  public isConnected: any;
  showFallback = true;
  hasBiometricAuth = false;

  fechaHora: string = '';
  fecha: string = '';
  hora: string = '';
  observaciones: string = '';
  zonaHoraria: string = '';
  gmtDispositivo: string = '';

  private readonly IDENTIFICACION_BIOMETRICA = 'BIOMETRICA';
  private readonly NINGUNA_IDENTIFICACION = 'NINGUNA';
  private readonly IDENTIFICACION_DESACTIVADA = 'DESCONOCIDA';

  private readonly APP_MOVIL = 'APP_MOVIL';

  /*
    Estos timbres validan ubicación, pero NO se bloquean
    si están fuera de zona o si salen como desconocidos.

    2 = Inicio alimentación
    3 = Fin alimentación
    4 = Inicio permiso
    5 = Fin permiso
    7 = Timbre especial / abierto
  */
  private readonly TIMBRES_UBICACION_FLEXIBLE = new Set<string>(['2', '3', '4', '5', '7']);

  cargandoPosicion = false;
  enviandoTimbre = false;

  public nuevoTimbre: any = {
    codigo: '',
    observacion: '',
    latitud: null,
    longitud: null,
    id_reloj: 97,
    ubicacion: '',
    imagen: null,
    dispositivo_timbre: 'APP_MOVIL',
    conexion: true,
    novedades_conexion: null,
    fecha_subida_servidor: null,
    tipo_autenticacion: null,
  };

  pipe = new DatePipe('en-US');
  horaTransformada = this.pipe.transform(Date.now(), 'h:mm:ss a');
  fechaTransformada = this.pipe.transform(Date.now(), 'yyyy-MM-dd');

  id_usuario = '';
  codigo = '';
  nombre_usuario = '';
  apellido_usuario = '';
  nombre_timbre = '';
  nombreInfo_timbre = '';

  geoLatitude: number = 0;
  geoLongitude: number = 0;

  numeroCaracteres = 0;
  intentos: number = 0;
  modelo_dispositivo: string = '';
  id_dispositivo_movil: string = '';

  conexion = true;
  novedades_conexion: string | null = null;

  activarOpcion: boolean = false;

  modulo_permisos: boolean = false;
  modulo_vacaciones: boolean = false;
  modulo_geolocalizacion: boolean = false;

  ubicacion: string = '';
  contar: number = 0;
  sin_ubicacion: number = 0;

  constructor(
    private activateRoute: ActivatedRoute,
    private navCtroller: NavController,
    private relojService: RelojServiceService,
    private toastController: ToastController,
    private platform: Platform,
    private alertController: AlertController,
    private dataLocalService: DataLocalService,
    private networkService: NetworkService,
    private restP: ParametrosService,
    private restE: EmpleadosService,
    public parametros: ParametrosService,
    private router: Router,
    private fechaHoraService: FechaHoraService,
    public validar: ValidacionesService,
    private fingerprintAIO: FingerprintAIO
  ) { }

  async ngOnInit() {
    await this.platform.ready();

    this.VerificarFunciones();
    this.networkSubscriber();

    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    this.id_usuario = localStorage.getItem('empleadoID') ?? '';
    this.codigo = localStorage.getItem('codigo') ?? '';
    this.nombre_usuario = localStorage.getItem('nom') ?? '';
    this.apellido_usuario = localStorage.getItem('ap') ?? '';

    this.ubicacion = localStorage.getItem('storageUbicacion') ?? '';

    this.nombreInfo_timbre = this.activateRoute.snapshot.paramMap.get('idTimbre') ?? '';
    this.nombre_timbre = this.nombreInfo_timbre.toUpperCase();

    this.obtenerIdCelular();

    this.fechaHoraService.fechaHora$.subscribe(async (fechaHora) => {
      const data = await fechaHora;

      this.fechaHora = data.fechaHora;
      this.fecha = data.fecha;
      this.hora = data.hora;
      this.zonaHoraria = data.zonaHoraria;
      this.gmtDispositivo = data.gmtDispositivo;
    });

    await this.BuscarParametros();
    await this.BuscarOpcionMarcacion();
    await this.solicitarPermisosIniciales();

    /*
      Precarga visual de ubicación.
      Si falla, no bloquea la pantalla.
      La validación fuerte se realiza al presionar Enviar Timbre.
    */
    await this.actualizarUbicacionAntesDeContinuar();
  }

  // ============================================================
  // PERMISOS APK
  // ============================================================

  async solicitarPermisosIniciales() {
    if (!this.platform.is('hybrid')) {
      return;
    }

    await this.solicitarPermisoUbicacionInicial();

    if (this.foto === true) {
      await this.solicitarPermisoCamara();
    }
  }

  async solicitarPermisoUbicacionInicial(): Promise<boolean> {
    if (!this.platform.is('hybrid')) {
      return true;
    }

    try {
      const permisos: any = await Geolocation.checkPermissions();

      const locationGranted =
        permisos.location === 'granted' ||
        permisos.coarseLocation === 'granted';

      if (locationGranted) {
        return true;
      }

      const request: any = await Geolocation.requestPermissions({
        permissions: ['location']
      } as any);

      return request.location === 'granted' ||
        request.coarseLocation === 'granted';

    } catch {
      return false;
    }
  }

  async solicitarPermisoCamara(): Promise<boolean> {
    if (!this.platform.is('hybrid')) {
      return true;
    }

    try {
      const permisos = await Camera.checkPermissions();

      if (permisos.camera === 'granted') {
        return true;
      }

      const request = await Camera.requestPermissions({
        permissions: ['camera']
      });

      if (request.camera === 'granted') {
        return true;
      }

      await this.abrirToas(
        'No se otorgó permiso de cámara. Para timbrar con foto debe permitir el acceso a la cámara.',
        'warning',
        5000,
        'middle'
      );

      return false;

    } catch {
      await this.abrirToas(
        'No fue posible solicitar el permiso de cámara. Revise los permisos de la app.',
        'danger',
        5000,
        'middle'
      );

      return false;
    }
  }

  // ============================================================
  // FUNCIONES / MÓDULOS
  // ============================================================

  VerificarFunciones() {
    const raw = localStorage.getItem('modulos');

    if (!raw) {
      this.modulo_permisos = false;
      this.modulo_vacaciones = false;
      this.modulo_geolocalizacion = false;
      return;
    }

    try {
      const modulos = JSON.parse(raw);
      const { permisos, vacaciones, geolocalizacion } = modulos;

      this.modulo_permisos = !!permisos;
      this.modulo_vacaciones = !!vacaciones;
      this.modulo_geolocalizacion = !!geolocalizacion;

    } catch {
      this.modulo_permisos = false;
      this.modulo_vacaciones = false;
      this.modulo_geolocalizacion = false;
    }
  }

  // ============================================================
  // RED / GPS
  // ============================================================

  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();

    if (!this.isConnected) {
      this.abrirToas(
        'Sin conexión a Internet. Si el parámetro lo permite, el timbre quedará pendiente de sincronización.',
        'warning',
        4000,
        'middle'
      );
    }

    this.comprobarGPS();
  }

  async comprobarGPS() {
    if (this.platform.is('hybrid')) {
      const permiso = await this.solicitarPermisoUbicacionInicial();

      if (permiso) {
        await this.obtenerPosicion(false);
      }

      return;
    }

    await this.obtenerPosicionWeb(false);
  }

  async requestLocationPermission() {
    const permiso = await this.solicitarPermisoUbicacionInicial();

    if (!permiso) {
      await this.abrirToas(
        'No se otorgó permiso de ubicación.',
        'warning',
        4000,
        'middle'
      );
      return;
    }

    await this.obtenerPosicion(true);
    await this.actualizarUbicacionAntesDeContinuar();
  }

  async obtenerPosicion(mostrarMensaje = true): Promise<boolean> {
    this.cargandoPosicion = true;

    try {
      const permisos: any = await Geolocation.checkPermissions();

      const permisoOk =
        permisos.location === 'granted' ||
        permisos.coarseLocation === 'granted';

      if (!permisoOk) {
        const request: any = await Geolocation.requestPermissions({
          permissions: ['location']
        } as any);

        const requestOk =
          request.location === 'granted' ||
          request.coarseLocation === 'granted';

        if (!requestOk) {
          this.geoLatitude = 0;
          this.geoLongitude = 0;

          if (mostrarMensaje) {
            await this.abrirToas(
              'No se otorgó permiso de ubicación.',
              'warning',
              4000,
              'middle'
            );
          }

          return false;
        }
      }

      const resp = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000
      });

      this.geoLatitude = resp.coords.latitude;
      this.geoLongitude = resp.coords.longitude;

      return true;

    } catch {
      this.geoLatitude = 0;
      this.geoLongitude = 0;

      if (mostrarMensaje) {
        await this.abrirToas(
          'No se pudo obtener la ubicación actual.',
          'warning',
          4000,
          'middle'
        );
      }

      return false;

    } finally {
      this.cargandoPosicion = false;
    }
  }

  obtenerPosicionWeb(mostrarMensaje = true): Promise<boolean> {
    this.cargandoPosicion = true;

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        this.geoLatitude = 0;
        this.geoLongitude = 0;
        this.cargandoPosicion = false;

        if (mostrarMensaje) {
          this.abrirToas(
            'El navegador no soporta geolocalización.',
            'warning',
            4000,
            'middle'
          );
        }

        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.geoLatitude = position.coords.latitude;
          this.geoLongitude = position.coords.longitude;
          this.cargandoPosicion = false;
          resolve(true);
        },
        () => {
          this.geoLatitude = 0;
          this.geoLongitude = 0;
          this.cargandoPosicion = false;

          if (mostrarMensaje) {
            this.abrirToas(
              'No se pudo obtener la ubicación actual desde el navegador.',
              'warning',
              4000,
              'middle'
            );
          }

          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 30000
        }
      );
    });
  }

  async refrescoEspecial() {
    this.cargandoPosicion = false;
    this.geoLatitude = 0;
    this.geoLongitude = 0;
    this.ubicacion = '';
    this.storageUbica = '';
    localStorage.removeItem('storageUbicacion');

    await this.comprobarGPS();
    await this.actualizarUbicacionAntesDeContinuar();
  }

  // ============================================================
  // DISPOSITIVO
  // ============================================================

  obtenerIdCelular() {
    Device.getInfo().then((info) => {
      this.modelo_dispositivo = info.model || 'Desconocido';
    }).catch(() => {
      this.modelo_dispositivo = 'Desconocido';
    });

    Device.getId().then((id) => {
      this.id_dispositivo_movil = id.identifier || 'Desconocido';

      this.nuevoTimbre.dispositivo_timbre = this.APP_MOVIL;
      this.nuevoTimbre.id_dispositivo_movil = this.id_dispositivo_movil;

    }).catch(() => {
      this.id_dispositivo_movil = 'Desconocido';

      this.nuevoTimbre.dispositivo_timbre = this.APP_MOVIL;
      this.nuevoTimbre.id_dispositivo_movil = 'Desconocido';
    });
  }

  // ============================================================
  // FOTO
  // ============================================================

  async iniciarProcesoFoto() {
    if (this.foto === true) {

      const debeTomarFoto = this.foto_obligatorio === true || this.activarOpcion === true;

      if (debeTomarFoto) {
        const permisoCamara = await this.solicitarPermisoCamara();

        if (!permisoCamara) {
          return this.abrirToas(
            'No se pudo obtener permiso de cámara. Timbre cancelado.',
            'warning',
            3000,
            'middle'
          );
        }

        try {
          await this.tomarFoto();
          this.identificarUsuario();
        } catch {
          this.abrirToas(
            'No se pudo obtener la foto, timbre cancelado.',
            'warning',
            3000,
            'middle'
          );
        }

        return;
      }

      this.identificarUsuario();
      return;
    }

    this.identificarUsuario();
  }

  async tomarFoto() {
    const cameraPhoto = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      correctOrientation: true,
      source: CameraSource.Camera,
      direction: CameraDirection.Front,
      width: 600,
      height: 600,
    });

    if (cameraPhoto.dataUrl) {
      this.imagen = await this.convertirBase64AWebP(cameraPhoto.dataUrl);
    } else {
      this.imagen = '';
    }
  }

  async convertirBase64AWebP(base64: string): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const webpBase64 = canvas.toDataURL('image/webp', 0.9);
        resolve(webpBase64);
      };

      img.onerror = reject;
      img.src = base64;
    });
  }

  // ============================================================
  // BIOMETRÍA
  // ============================================================

  async identificarUsuario() {
    if (!this.platform.is('hybrid')) {
      this.nuevoTimbre.tipo_autenticacion = this.NINGUNA_IDENTIFICACION;
      this.guardarEnBDD();
      return;
    }

    await this.fingerprintAIO.isAvailable({
      requireStrongBiometrics: false
    }).then(() => {
      this.openAutenticacion();
    }).catch(() => {
      this.enviarTimbreSinAuth();
    });
  }

  async openAutenticacion() {
    await this.fingerprintAIO.show({
      disableBackup: false,
      title: 'Comprobando',
      fallbackButtonTitle: 'PIN',
      subtitle: 'Es necesario autenticarse para enviar el timbre',
      description: 'Casa Pazmiño S.A'
    }).then((resul: any) => {
      if (resul) {
        this.nuevoTimbre.tipo_autenticacion = this.IDENTIFICACION_BIOMETRICA;
        this.guardarEnBDD();
      }
    }).catch(() => {
      this.abrirToas(
        'Ocurrió un error al autenticar al usuario. El timbre no se envió.',
        'danger',
        2000,
        'middle'
      );

      this.intentos = this.intentos + 1;

      if (this.intentos === 2) {
        this.enviarTimbreAuthProble();
        this.intentos = 0;
      }
    });
  }

  async enviarTimbreSinAuth() {
    this.nuevoTimbre.tipo_autenticacion = this.IDENTIFICACION_DESACTIVADA;
    await this.guardarEnBDD();
  }

  async enviarTimbreAuthProble() {
    const alert = await this.alertController.create({
      header: 'Problema con la autenticación',
      message: 'Al parecer tiene problemas con la autenticación.\n ¿Desea enviar el timbre de todos modos?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Listo',
          handler: () => {
            this.nuevoTimbre.tipo_autenticacion = this.NINGUNA_IDENTIFICACION;
            this.guardarEnBDD();
          }
        }
      ]
    });

    await alert.present();
  }

  // ============================================================
  // ENVÍO DEL TIMBRE
  // ============================================================

  async verificarPermisoLocation(): Promise<boolean> {
    if (!this.platform.is('hybrid')) {
      return true;
    }

    try {
      const result: any = await Geolocation.checkPermissions();

      return result.location === 'granted' || result.coarseLocation === 'granted';
    } catch {
      return false;
    }
  }

  async enviarTimbre(ev?: any) {
    if (this.enviandoTimbre) {
      return;
    }

    this.enviandoTimbre = true;

    try {
      const teclaFuncion = this.obtenerIdTipo();
      const esTimbreFlexible = this.EsTimbreFlexibleUbicacion(teclaFuncion);

      let ubicacionObtenida = false;

      if (this.platform.is('hybrid')) {
        const tienePermisoUbicacion = await this.solicitarPermisoUbicacionInicial();

        if (!tienePermisoUbicacion) {
          this.geoLatitude = 0;
          this.geoLongitude = 0;

          if (esTimbreFlexible) {
            this.actualizarUbicacionPantalla('SIN UBICACION');

            await this.abrirToas(
              'No se obtuvo permiso de ubicación. Este tipo de timbre se registrará como SIN UBICACION.',
              'warning',
              4000,
              'middle'
            );
          } else {
            this.enviandoTimbre = false;

            return this.abrirToas(
              'Debe permitir el acceso a la ubicación para registrar este tipo de timbre.',
              'danger',
              6000,
              'middle'
            );
          }
        } else {
          ubicacionObtenida = await this.obtenerPosicion(!esTimbreFlexible);
        }

      } else {
        await this.abrirToas(
          'Prueba desde navegador: no se usará autenticación biométrica.',
          'warning',
          2000,
          'middle'
        );

        this.nuevoTimbre.tipo_autenticacion = this.NINGUNA_IDENTIFICACION;

        ubicacionObtenida = await this.obtenerPosicionWeb(!esTimbreFlexible);
      }

      if (!ubicacionObtenida && esTimbreFlexible) {
        this.geoLatitude = 0;
        this.geoLongitude = 0;
        this.actualizarUbicacionPantalla('SIN UBICACION');
      }

      await this.actualizarUbicacionAntesDeContinuar();

      const ubicacionValida = this.NormalizarUbicacionParaTimbre(teclaFuncion);

      if (!ubicacionValida) {
        this.enviandoTimbre = false;

        return this.abrirToas(
          'No se pudo validar la ubicación. Este tipo de timbre solo puede registrarse en zonas permitidas.',
          'danger',
          5000,
          'middle'
        );
      }

      await this.iniciarProcesoFoto();

    } catch {
      this.enviandoTimbre = false;

      await this.abrirToas(
        'Ocurrió un error al procesar el timbre. Intente nuevamente.',
        'danger',
        4000,
        'middle'
      );
    }
  }

  obtenerIdTipo(): string {
    switch (this.nombreInfo_timbre) {
      case 'Inicio jornada laboral':
        this.nuevoTimbre.accion = 'E';
        return '0';

      case 'Fin jornada laboral':
        this.nuevoTimbre.accion = 'S';
        return '1';

      case 'Inicio alimentación':
        this.nuevoTimbre.accion = 'S/A';
        return '2';

      case 'Fin alimentación':
        this.nuevoTimbre.accion = 'E/A';
        return '3';

      case 'Inicio permiso':
        this.nuevoTimbre.accion = 'S/P';
        return '4';

      case 'Fin permiso':
        this.nuevoTimbre.accion = 'E/P';
        return '5';

      case 'Timbre abierto':
        this.nuevoTimbre.accion = 'HA';
        return '7';

      default:
        this.nuevoTimbre.accion = 'D';
        return '-1';
    }
  }

  ionChange() {
    this.numeroCaracteres = this.nuevoTimbre.observacion?.length ?? 0;
  }

  async guardarEnBDD() {
    const fechaHoraTimbre = this.formatearFechaTimbreParaBackend(this.fechaHora);

    if (!fechaHoraTimbre) {
      return this.abrirToas(
        'No se pudo obtener la fecha y hora del timbre. Intente nuevamente.',
        'warning',
        3000,
        'middle'
      );
    }

    const teclaFuncion = this.obtenerIdTipo();

    const ubicacionValida = this.NormalizarUbicacionParaTimbre(teclaFuncion);

    if (!ubicacionValida) {
      return this.abrirToas(
        'No se pudo validar la ubicación. Este tipo de timbre solo puede registrarse en zonas permitidas.',
        'danger',
        5000,
        'middle'
      );
    }

    const esTimbreFlexible = this.EsTimbreFlexibleUbicacion(teclaFuncion);

    this.nuevoTimbre.codigo = this.codigo;
    this.nuevoTimbre.fec_hora_timbre = fechaHoraTimbre;

    this.nuevoTimbre.zona_dispositivo = this.zonaHoraria;
    this.nuevoTimbre.zona_horaria_dispositivo = this.zonaHoraria;

    this.nuevoTimbre.tecl_funcion = teclaFuncion;
    this.nuevoTimbre.tecla_funcion = teclaFuncion;

    this.nuevoTimbre.imagen = this.imagen || null;
    this.nuevoTimbre.capturar_segundos = this.capturar_segundos;
    this.nuevoTimbre.gmt_dispositivo = this.gmtDispositivo;

    this.nuevoTimbre.latitud = this.geoLatitude ? String(this.geoLatitude) : '0';
    this.nuevoTimbre.longitud = this.geoLongitude ? String(this.geoLongitude) : '0';

    this.nuevoTimbre.ubicacion = this.ubicacion || (esTimbreFlexible ? 'SIN UBICACION' : 'Sin Ubicación');

    this.nuevoTimbre.dispositivo_timbre = this.APP_MOVIL;
    this.nuevoTimbre.id_dispositivo_movil = this.id_dispositivo_movil || 'Desconocido';
    this.nuevoTimbre.modelo_dispositivo = this.modelo_dispositivo || 'Desconocido';

    /*
      Desde la app móvil enviamos null.
      Si el timbre queda offline, esta fecha se llena cuando se sincronice.
    */
    this.nuevoTimbre.fecha_subida_servidor = null;

    if (this.nuevoTimbre.accion === 'HA' && !this.nuevoTimbre.observacion) {
      return this.abrirToas(
        'Debes ingresar una observación antes de enviar un timbre abierto.',
        'danger',
        5000,
        'middle'
      );
    }

    this.isConnected = this.networkService.getNetworkStatusDispositivo();

    if (this.isConnected === true) {
      this.PrepararDatosConexion(true, null);
      this.EnviarDatos(this.nuevoTimbre);
      return;
    }

    if (this.requiereInternet === true) {
      return this.abrirToas(
        'Este timbre requiere conexión a Internet. No se guardó el registro.',
        'danger',
        5000,
        'middle'
      );
    }

    this.PrepararDatosConexion(
      false,
      this.ObtenerNovedadConexion('SIN_INTERNET')
    );

    this.guardarTimbrePendiente(this.nuevoTimbre, 'SIN_INTERNET');
  }

  formatearFechaTimbreParaBackend(fecha: any): string {
    if (!fecha) return '';

    let fechaDate: Date;

    if (typeof fecha === 'string' && fecha.includes(' ') && fecha.includes('-')) {
      fechaDate = new Date(fecha.replace(' ', 'T'));
    } else {
      fechaDate = new Date(fecha);
    }

    if (isNaN(fechaDate.getTime())) {
      return '';
    }

    const dd = String(fechaDate.getDate()).padStart(2, '0');
    const mm = String(fechaDate.getMonth() + 1).padStart(2, '0');
    const yyyy = fechaDate.getFullYear();

    let horas = fechaDate.getHours();
    const minutos = String(fechaDate.getMinutes()).padStart(2, '0');

    /*
      Siempre se envía h:m:s.
      Si capturar_segundos = false, segundos va en 00.
    */
    const segundos = this.capturar_segundos
      ? String(fechaDate.getSeconds()).padStart(2, '0')
      : '00';

    const ampm = horas >= 12 ? 'PM' : 'AM';

    horas = horas % 12;
    horas = horas ? horas : 12;

    return `${dd}/${mm}/${yyyy} ${horas}:${minutos}:${segundos} ${ampm}`;
  }

  guardarTimbreStorage(timbre: Timbre) {
    this.guardarTimbrePendiente(timbre, 'SIN_INTERNET');
  }

  // ============================================================
  // PARÁMETROS
  // ============================================================

  async BuscarParametros() {
    this.rango = 0;
    this.capturar_segundos = false;

    const detalles = [
      ParametrosSistema.TOLERANCIA_UBICACION,
      ParametrosSistema.CONSIDERAR_SEGUNDOS_MARCACIONES
    ];

    try {
      const res: any[] = await firstValueFrom(this.restP.ObtenerFormatos(detalles));

      res.forEach((p: any) => {
        if (p.id_parametro === ParametrosSistema.TOLERANCIA_UBICACION) {
          this.rango = Number(p.descripcion);
        }

        if (p.id_parametro === ParametrosSistema.CONSIDERAR_SEGUNDOS_MARCACIONES) {
          this.capturar_segundos = p.descripcion === 'Si';
        }
      });

    } catch {
      this.rango = 0;
      this.capturar_segundos = false;
    }
  }

  async BuscarOpcionMarcacion() {
    const empleadoID = parseInt(localStorage.getItem('empleadoID') ?? '0', 10);

    const buscar = {
      ids_empleados: [empleadoID],
    };

    this.foto = false;
    this.foto_obligatorio = false;
    this.desconocida = false;
    this.especial = false;
    this.requiereInternet = false;

    try {
      const res: any = await firstValueFrom(this.parametros.ObtenerDetalleParametroUsuario(buscar));

      const parametro = res.data?.[0] ?? res.respuesta?.[0];

      if (!parametro) {
        this.guardarParametrosMarcacionEnLocalStorage();
        return;
      }

      this.foto = !!parametro.timbre_foto;
      this.foto_obligatorio = !!parametro.opcional_obligatorio;
      this.desconocida = !!parametro.timbre_ubicacion_desconocida;
      this.especial = !!parametro.timbre_especial;
      this.requiereInternet = !!parametro.timbre_internet;

      this.guardarParametrosMarcacionEnLocalStorage();

      if (this.platform.is('hybrid') && this.foto === true) {
        await this.solicitarPermisoCamara();
      }

    } catch {
      this.foto = false;
      this.foto_obligatorio = false;
      this.desconocida = false;
      this.especial = false;
      this.requiereInternet = false;

      this.guardarParametrosMarcacionEnLocalStorage();
    }
  }

  guardarParametrosMarcacionEnLocalStorage() {
    this.timbrarConFoto = this.foto ? 'Si' : 'No';
    this.timbreFotoObligatoria = this.foto_obligatorio ? 'Si' : 'No';
    this.timbrarDesconocido = this.desconocida ? 'Si' : 'No';
    this.timbrarSinInternet = this.requiereInternet ? 'Si' : 'No';

    localStorage.setItem('timbrarConFoto', this.timbrarConFoto);
    localStorage.setItem('opcional_obligatorio', this.timbreFotoObligatoria);
    localStorage.setItem('timbrarUbicacionDesconocida', this.timbrarDesconocido);
    localStorage.setItem('timbrarSinInternet', this.timbrarSinInternet);
  }

  // ============================================================
  // UBICACIÓN / PERÍMETROS
  // ============================================================

  actualizarUbicacionPantalla(valor: string) {
    this.ubicacion = valor;
    this.storageUbica = valor;
    localStorage.setItem('storageUbicacion', valor);
  }

  async actualizarUbicacionAntesDeContinuar() {
    this.cargandoPosicion = true;

    try {
      this.actualizarUbicacionPantalla('Validando ubicación...');

      if (!this.geoLatitude || !this.geoLongitude) {
        if (this.platform.is('hybrid')) {
          await this.obtenerPosicion(false);
        } else {
          await this.obtenerPosicionWeb(false);
        }
      }

      if (!this.geoLatitude || !this.geoLongitude) {
        const teclaFuncion = this.obtenerIdTipo();

        if (this.EsTimbreFlexibleUbicacion(teclaFuncion)) {
          this.actualizarUbicacionPantalla('SIN UBICACION');
        } else {
          this.actualizarUbicacionPantalla('Sin Ubicación');
        }

        return;
      }

      const ubicacionCalculada = await this.calcularUbicacionActual(
        this.geoLatitude,
        this.geoLongitude,
        this.rango
      );

      this.actualizarUbicacionPantalla(ubicacionCalculada);

    } catch {
      const teclaFuncion = this.obtenerIdTipo();

      if (this.EsTimbreFlexibleUbicacion(teclaFuncion)) {
        this.actualizarUbicacionPantalla('SIN UBICACION');
      } else {
        this.actualizarUbicacionPantalla('Sin Ubicación');
      }
    } finally {
      this.cargandoPosicion = false;
    }
  }

  async calcularUbicacionActual(latitud: any, longitud: any, rango: any): Promise<string> {
    const teclaFuncion = this.obtenerIdTipo();
    const esTimbreFlexible = this.EsTimbreFlexibleUbicacion(teclaFuncion);

    if (this.modulo_geolocalizacion !== true) {
      return esTimbreFlexible ? 'DESCONOCIDO' : 'Sin Ubicación';
    }

    if (!latitud || !longitud || Number(latitud) === 0 || Number(longitud) === 0) {
      return esTimbreFlexible ? 'SIN UBICACION' : 'Sin Ubicación';
    }

    const informacion: any = {
      lat1: String(latitud),
      lng1: String(longitud),
      lat2: '',
      lng2: '',
      valor: rango
    };

    const ubicacionPermitida = await this.buscarUbicacionPermitida(informacion);

    if (ubicacionPermitida) {
      return ubicacionPermitida;
    }

    const domicilio = await this.buscarUbicacionDomicilio(informacion);

    if (domicilio) {
      return domicilio;
    }

    if (this.desconocida === true || esTimbreFlexible) {
      return 'DESCONOCIDO';
    }

    return 'Sin Ubicación';
  }

  async buscarUbicacionPermitida(informacion: any): Promise<string> {
    try {
      const res: any = await firstValueFrom(this.restP.ObtenerUbicacionUsuario(this.id_usuario));
      const datosUbicacion: any[] = res.data ?? res ?? [];

      if (!datosUbicacion || datosUbicacion.length === 0) {
        return '';
      }

      for (const obj of datosUbicacion) {
        informacion.lat2 = obj.latitud;
        informacion.lng2 = obj.longitud;

        const estaDentro = await this.validarCoordenadas(informacion);

        if (estaDentro) {
          return obj.descripcion ?? 'Ubicación Permitida';
        }
      }

      return '';

    } catch {
      return '';
    }
  }

  async buscarUbicacionDomicilio(informacion: any): Promise<string> {
    try {
      const res: any = await firstValueFrom(this.restE.ObtenerUbicacion(this.id_usuario));
      const domicilio = res.data?.[0] ?? res?.[0];

      if (!domicilio?.latitud || !domicilio?.longitud) {
        return '';
      }

      informacion.lat2 = domicilio.latitud;
      informacion.lng2 = domicilio.longitud;

      const estaDentro = await this.validarCoordenadas(informacion);

      return estaDentro ? 'DOMICILIO' : '';

    } catch {
      return '';
    }
  }

  async validarCoordenadas(informacion: any): Promise<boolean> {
    try {
      const res: any = await firstValueFrom(this.restP.ObtenerCoordenadas(informacion));
      const resultado = res.data?.[0] ?? res?.[0];

      return resultado?.verificar === 'ok';

    } catch {
      return false;
    }
  }

  PermitirUbicacionDesconocida(timbre: any, guardarSinServidor: boolean = false) {
    const teclaFuncion = String(timbre.tecl_funcion ?? timbre.tecla_funcion ?? this.obtenerIdTipo());
    const esFlexible = this.EsTimbreFlexibleUbicacion(teclaFuncion);

    if (this.desconocida === true || esFlexible) {
      timbre.ubicacion = 'DESCONOCIDO';
      this.actualizarUbicacionPantalla(timbre.ubicacion);

      if (guardarSinServidor) {
        this.GuardartimbresinServidor(timbre);
      } else {
        this.abrirToas(
          esFlexible
            ? 'Marcación registrada como DESCONOCIDO. Este tipo de timbre no restringe perímetro.'
            : 'Marcación realizada dentro de un perímetro DESCONOCIDO.',
          'primary',
          3000,
          'top'
        );

        this.EnviarDatos(timbre);
      }

      return;
    }

    this.abrirToas(
      'Timbre con ubicación desconocida. No permitido',
      'danger',
      5000,
      'middle'
    );

    return;
  }

  private EsTimbreFlexibleUbicacion(teclaFuncion: string | number): boolean {
    return this.TIMBRES_UBICACION_FLEXIBLE.has(String(teclaFuncion));
  }

  private EsUbicacionNoValida(ubicacion: string): boolean {
    const valor = (ubicacion || '').trim().toUpperCase();

    return (
      valor === '' ||
      valor === 'SIN UBICACION' ||
      valor === 'SIN UBICACIÓN' ||
      valor === 'SIN UBICACION ACTUAL' ||
      valor === 'SIN UBICACIÓN ACTUAL' ||
      valor === 'VALIDANDO UBICACION...' ||
      valor === 'VALIDANDO UBICACIÓN...'
    );
  }

  private NormalizarUbicacionParaTimbre(teclaFuncion: string): boolean {
    const esFlexible = this.EsTimbreFlexibleUbicacion(teclaFuncion);
    const ubicacionActual = (this.ubicacion || '').trim();

    if (!ubicacionActual || this.EsUbicacionNoValida(ubicacionActual)) {
      if (esFlexible) {
        this.actualizarUbicacionPantalla('SIN UBICACION');
        return true;
      }

      return false;
    }

    if (ubicacionActual.toUpperCase() === 'DESCONOCIDO') {
      if (this.desconocida === true || esFlexible) {
        return true;
      }

      return false;
    }

    return true;
  }

  // ============================================================
  // CONEXIÓN / NOVEDADES
  // ============================================================

  private ObtenerNovedadConexion(tipo: MotivoConexion): string | null {
    switch (tipo) {
      case 'OK':
        return null;

      case 'SIN_INTERNET':
        return 'Timbre generado sin conexión a Internet. Pendiente de sincronización.';

      case 'TIMEOUT':
        return 'No hubo respuesta del servidor dentro del tiempo esperado. Timbre guardado localmente.';

      case 'ERROR_SERVIDOR':
        return 'No se pudo conectar con el servidor. Timbre guardado localmente.';

      default:
        return 'Novedad de conexión no identificada.';
    }
  }

  private PrepararDatosConexion(conectado: boolean, novedad: string | null = null): void {
    this.nuevoTimbre.dispositivo_timbre = this.APP_MOVIL;
    this.nuevoTimbre.conexion = conectado;

    /*
      IMPORTANTE:
      Desde esta pantalla, aunque el timbre se envíe correctamente,
      fecha_subida_servidor siempre debe ir NULL.

      Este campo solo se llena cuando el timbre ya estaba guardado
      en memoria del teléfono y luego se sincroniza desde la pantalla
      de timbres pendientes.
    */
    this.nuevoTimbre.fecha_subida_servidor = null;

    this.nuevoTimbre.novedades_conexion = conectado ? null : novedad;
  }

  // ============================================================
  // GUARDADO / ENVÍO
  // ============================================================

  EnviarDatos(data: any) {
    this.actualizarUbicacionPantalla(data.ubicacion || 'DESCONOCIDO');

    /*
      Envío directo desde la pantalla de timbrar.
      No es una sincronización de timbre pendiente,
      por eso fecha_subida_servidor debe ir NULL.
    */
    data.dispositivo_timbre = this.APP_MOVIL;
    data.fecha_subida_servidor = null;

    this.relojService.enviarTimbre(data).pipe(timeout(5000)).subscribe({
      next: () => {
        this.enviandoTimbre = false;


        localStorage.setItem('ultimoTimbreEmpleado', JSON.stringify({
          fecha_hora_timbre: data.fec_hora_timbre,
          fecha_hora_timbre_servidor: data.fec_hora_timbre,
          fecha_hora_timbre_validado: data.fec_hora_timbre,
          accion: data.accion,
          tecla_funcion: data.tecla_funcion ?? data.tecl_funcion,
          tecl_funcion: data.tecl_funcion ?? data.tecla_funcion
        }));

        localStorage.setItem('refrescarUltimoTimbre', 'true');

        this.navCtroller.navigateForward(['confirmaciontimbre'], {
          queryParams: {
            data: JSON.stringify(data)
          }
        });
      },
      error: (error: any) => {
        const novedad = error?.name === 'TimeoutError'
          ? this.ObtenerNovedadConexion('TIMEOUT')
          : this.ObtenerNovedadConexion('ERROR_SERVIDOR');

        data.conexion = false;
        data.dispositivo_timbre = this.APP_MOVIL;

        /*
          Sigue siendo NULL porque todavía NO se ha subido al servidor.
          Solo quedó guardado localmente.
        */
        data.fecha_subida_servidor = null;
        data.novedades_conexion = novedad;

        this.guardarTimbrePendiente(
          data,
          error?.name === 'TimeoutError' ? 'TIMEOUT' : 'ERROR_SERVIDOR'
        );
      }
    });
  }

  GuardartimbresinServidor(data: any) {
    data.conexion = false;
    data.dispositivo_timbre = this.APP_MOVIL;
    data.fecha_subida_servidor = null;
    data.novedades_conexion = data.novedades_conexion || this.ObtenerNovedadConexion('ERROR_SERVIDOR');

    if (!data.ubicacion) {
      data.ubicacion = this.ubicacion || 'Sin Ubicación';
    }

    this.actualizarUbicacionPantalla(data.ubicacion);

    this.guardarTimbrePendiente(data, 'ERROR_SERVIDOR');
  }

  async guardarTimbrePendiente(data: any, motivo: 'SIN_INTERNET' | 'ERROR_SERVIDOR' | 'TIMEOUT') {
    data.conexion = false;
    data.dispositivo_timbre = this.APP_MOVIL;

    /*
      El timbre queda en memoria.
      Aún no se ha subido al servidor.
    */
    data.fecha_subida_servidor = null;

    if (!data.novedades_conexion) {
      data.novedades_conexion = motivo === 'SIN_INTERNET'
        ? this.ObtenerNovedadConexion('SIN_INTERNET')
        : motivo === 'TIMEOUT'
          ? this.ObtenerNovedadConexion('TIMEOUT')
          : this.ObtenerNovedadConexion('ERROR_SERVIDOR');
    }

    if (!data.ubicacion) {
      data.ubicacion = this.ubicacion || 'Sin Ubicación';
    }

    this.actualizarUbicacionPantalla(data.ubicacion);

    this.nuevoTimbre.conexion = false;
    this.nuevoTimbre.fecha_subida_servidor = null;
    this.nuevoTimbre.novedades_conexion = data.novedades_conexion;

    this.dataLocalService.guardarTimbresPerdidos(data);

    await this.abrirToas(
      'Timbre guardado en el teléfono. Aún no ha sido enviado al servidor.',
      'warning',
      3500,
      'middle'
    );

    this.enviandoTimbre = false;

    /*
      Cerramos la pantalla para evitar que el usuario vuelva a enviar
      el mismo timbre desde el formulario.
    */
    this.navCtroller.navigateRoot(['/reloj/bienvenido']);

    return;
  }

  // ============================================================
  // UI
  // ============================================================

  async abrirToas(mensaje: string, color: string, duracion: number, position: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      position: position
    });

    toast.present();
  }

  toggleChanged(event: any) {
    this.activarOpcion = event.detail.checked;
  }
}