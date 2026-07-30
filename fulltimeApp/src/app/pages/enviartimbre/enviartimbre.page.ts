import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, AlertController, Platform } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
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

import { ConfiguracionMarcacionLocal, Timbre } from '../../interfaces/Timbre';
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
  requiereInternet: boolean = true;

  /*
   * Indica si existe una configuración válida guardada
   * para el empleado actual.
   */
  configuracionMarcacionDisponible: boolean = false;

  /*
   * Indica si la configuración utilizada fue obtenida
   * del servidor o recuperada del teléfono.
   */
  configuracionMarcacionDesdeStorage: boolean = false;

  private readonly STORAGE_CONFIG_MARCACION =
    'configuracionMarcacionEmpleado';

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

  precisionUbicacion: number | null = null;
  intentoUbicacionActual: number = 0;

  private readonly MAX_INTENTOS_UBICACION = 3;
  private readonly TIEMPO_ESPERA_INTENTOS = 1200;

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

    if (this.nombreInfo_timbre === 'Timbre abierto') {
      this.nombre_timbre = 'TIMBRE ESPECIAL';
    }
    else {
      this.nombre_timbre = this.nombreInfo_timbre.toUpperCase();
    }


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

      /*
        location representa el permiso de ubicación precisa.
        coarseLocation representa ubicación aproximada.
      */
      if (permisos.location === 'granted') {
        return true;
      }

      const request: any = await Geolocation.requestPermissions({
        permissions: ['location']
      } as any);

      if (request.location === 'granted') {
        return true;
      }

      if (request.coarseLocation === 'granted') {
        await this.abrirToas(
          'Para validar una zona permitida debe activar la ubicación precisa en los permisos de AQHora.',
          'warning',
          6000,
          'middle'
        );
      }

      return false;

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
    this.intentoUbicacionActual = 0;

    let mejorPosicion: any = null;

    try {
      const permiso = await this.solicitarPermisoUbicacionInicial();

      if (!permiso) {
        this.limpiarCoordenadas();

        if (mostrarMensaje) {
          await this.abrirToas(
            'No se obtuvo permiso de ubicación precisa.',
            'warning',
            5000,
            'middle'
          );
        }

        return false;
      }

      for (
        let intento = 1;
        intento <= this.MAX_INTENTOS_UBICACION;
        intento++
      ) {
        this.intentoUbicacionActual = intento;

        try {
          const posicion = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          });

          const precision = Number(posicion.coords.accuracy);

          if (
            !mejorPosicion ||
            precision < Number(mejorPosicion.coords.accuracy)
          ) {
            mejorPosicion = posicion;
          }

          /*
            Una precisión de 30 metros o menos ya es suficientemente
            buena para dejar de realizar más intentos.
  
            Esto NO modifica el rango parametrizado.
          */
          if (
            Number.isFinite(precision) &&
            precision > 0 &&
            precision <= 30
          ) {
            break;
          }

        } catch {
          /*
            Se continúa con el siguiente intento.
          */
        }

        if (intento < this.MAX_INTENTOS_UBICACION) {
          await this.esperar(this.TIEMPO_ESPERA_INTENTOS);
        }
      }

      if (!mejorPosicion) {
        this.limpiarCoordenadas();

        if (mostrarMensaje) {
          await this.abrirToas(
            'No fue posible obtener la ubicación después de varios intentos. Verifique que el GPS esté activo e intente nuevamente.',
            'warning',
            6000,
            'middle'
          );
        }

        return false;
      }

      this.geoLatitude =
        Number(mejorPosicion.coords.latitude);

      this.geoLongitude =
        Number(mejorPosicion.coords.longitude);

      this.precisionUbicacion =
        Number(mejorPosicion.coords.accuracy);

      return true;

    } finally {
      this.cargandoPosicion = false;
      this.intentoUbicacionActual = 0;
    }
  }

  private limpiarCoordenadas(): void {
    this.geoLatitude = 0;
    this.geoLongitude = 0;
    this.precisionUbicacion = null;
  }

  private esperar(milisegundos: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, milisegundos);
    });
  }

  async obtenerPosicionWeb(mostrarMensaje = true): Promise<boolean> {
    this.cargandoPosicion = true;
    this.intentoUbicacionActual = 0;

    try {
      if (!navigator.geolocation) {
        this.limpiarCoordenadas();

        if (mostrarMensaje) {
          await this.abrirToas(
            'El navegador no soporta geolocalización.',
            'warning',
            4000,
            'middle'
          );
        }

        return false;
      }

      let mejorPosicion: GeolocationPosition | null = null;

      for (
        let intento = 1;
        intento <= this.MAX_INTENTOS_UBICACION;
        intento++
      ) {
        this.intentoUbicacionActual = intento;

        try {
          const posicion =
            await this.obtenerPosicionWebIndividual();

          if (
            !mejorPosicion ||
            posicion.coords.accuracy <
            mejorPosicion.coords.accuracy
          ) {
            mejorPosicion = posicion;
          }

          if (
            posicion.coords.accuracy > 0 &&
            posicion.coords.accuracy <= 30
          ) {
            break;
          }

        } catch {
          /*
            Continúa con el siguiente intento.
          */
        }

        if (intento < this.MAX_INTENTOS_UBICACION) {
          await this.esperar(this.TIEMPO_ESPERA_INTENTOS);
        }
      }

      if (!mejorPosicion) {
        this.limpiarCoordenadas();

        if (mostrarMensaje) {
          await this.abrirToas(
            'No fue posible obtener una ubicación desde el navegador. Revise los permisos de ubicación e intente nuevamente.',
            'warning',
            6000,
            'middle'
          );
        }

        return false;
      }

      this.geoLatitude =
        mejorPosicion.coords.latitude;

      this.geoLongitude =
        mejorPosicion.coords.longitude;

      this.precisionUbicacion =
        mejorPosicion.coords.accuracy;

      return true;

    } finally {
      this.cargandoPosicion = false;
      this.intentoUbicacionActual = 0;
    }
  }

  private obtenerPosicionWebIndividual(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => resolve(position),
        error => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
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
          this.enviandoTimbre = false;

          return this.abrirToas(
            'No se pudo obtener permiso de cámara. Timbre cancelado.',
            'warning',
            3000,
            'middle'
          );
        }

        try {
          const fotoTomada = await this.tomarFoto();

          if (!fotoTomada) {
            this.enviandoTimbre = false;

            return this.abrirToas(
              'No se tomó la foto. Timbre cancelado.',
              'warning',
              3000,
              'middle'
            );
          }

          await this.identificarUsuario();

        } catch {
          this.enviandoTimbre = false;

          return this.abrirToas(
            'No se pudo obtener la foto, timbre cancelado.',
            'warning',
            3000,
            'middle'
          );
        }

        return;
      }

      await this.identificarUsuario();
      return;
    }

    await this.identificarUsuario();
  }

  async tomarFoto(): Promise<boolean> {
    try {
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
        return true;
      }

      this.imagen = '';
      return false;

    } catch {
      /*
        Aquí entra cuando el usuario cancela la cámara
        o cuando ocurre un error al abrir/tomar la foto.
      */
      this.imagen = '';
      return false;
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
      await this.guardarEnBDD();
      return;
    }

    await this.fingerprintAIO.isAvailable({
      requireStrongBiometrics: false
    }).then(async () => {
      await this.openAutenticacion();
    }).catch(async () => {
      await this.enviarTimbreSinAuth();
    });
  }

  async openAutenticacion() {
    await this.fingerprintAIO.show({
      disableBackup: false,
      title: 'Comprobando',
      fallbackButtonTitle: 'PIN',
      subtitle: 'Es necesario autenticarse para enviar el timbre',
      description: 'Casa Pazmiño S.A'
    }).then(async (resul: any) => {
      if (resul) {
        this.nuevoTimbre.tipo_autenticacion = this.IDENTIFICACION_BIOMETRICA;
        await this.guardarEnBDD();
        return;
      }

      this.enviandoTimbre = false;

    }).catch(async () => {
      this.intentos = this.intentos + 1;

      if (this.intentos === 2) {
        this.intentos = 0;
        await this.enviarTimbreAuthProble();
        return;
      }

      this.enviandoTimbre = false;

      await this.abrirToas(
        'Ocurrió un error al autenticar al usuario. El timbre no se envió.',
        'danger',
        2000,
        'middle'
      );
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
          handler: () => {
            this.enviandoTimbre = false;
          }
        },
        {
          text: 'Listo',
          handler: async () => {
            this.nuevoTimbre.tipo_autenticacion = this.NINGUNA_IDENTIFICACION;
            await this.guardarEnBDD();
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
      const result: any =
        await Geolocation.checkPermissions();

      return result.location === 'granted';

    } catch {
      return false;
    }
  }

  private validarObservacionAntesDeEnviar(): boolean {
    const esTimbreAbierto = this.nombreInfo_timbre === 'Timbre abierto';
    const observacion = String(this.nuevoTimbre.observacion ?? '').trim();

    if (esTimbreAbierto) {
      if (observacion.length === 0) {
        this.abrirToas(
          'Debes ingresar una observación antes de enviar un timbre abierto.',
          'danger',
          5000,
          'middle'
        );

        return false;
      }

      this.nuevoTimbre.observacion = observacion;
    }

    return true;
  }

  async enviarTimbre(ev?: any) {
    if (this.enviandoTimbre) {
      return;
    }

    /*
      Validación temprana.
      Aquí todavía NO se bloquea el botón ni se inicia ubicación/foto/biometría.
    */
    const observacionValida = this.validarObservacionAntesDeEnviar();

    if (!observacionValida) {
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

      const ubicacionValida =
        await this.validarUbicacionParaContinuar(teclaFuncion);

      if (!ubicacionValida) {
        return;
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

      case 'Inicio de permiso':
        this.nuevoTimbre.accion = 'S/P';
        return '4';

      case 'Fin de permiso':
        this.nuevoTimbre.accion = 'E/P';
        return '5';

      case 'Timbre abierto':
        this.nuevoTimbre.accion = 'HA';
        return '7';

      default:
        this.nuevoTimbre.accion = 'D';
        return '99';
    }
  }

  ionChange() {
    this.numeroCaracteres = this.nuevoTimbre.observacion?.length ?? 0;
  }

  async guardarEnBDD() {
    const fechaHoraTimbre = this.formatearFechaTimbreParaBackend(this.fechaHora);

    if (!fechaHoraTimbre) {
      this.enviandoTimbre = false;

      return this.abrirToas(
        'No se pudo obtener la fecha y hora del timbre. Intente nuevamente.',
        'warning',
        3000,
        'middle'
      );
    }

    const teclaFuncion = this.obtenerIdTipo();

    /*
      La ubicación ya fue obtenida y validada en enviarTimbre().
      Se conserva esta segunda validación defensiva, pero sin volver
      a solicitar GPS, cámara o biometría.
    */
    const ubicacionValida =
      await this.validarUbicacionParaContinuar(teclaFuncion);

    if (!ubicacionValida) {
      return;
    }

    const esTimbreFlexible =
      this.EsTimbreFlexibleUbicacion(teclaFuncion);

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

    if (this.nuevoTimbre.accion === 'HA') {
      const observacion = String(this.nuevoTimbre.observacion ?? '').trim();

      if (observacion.length === 0) {
        this.enviandoTimbre = false;

        return this.abrirToas(
          'Debes ingresar una observación antes de enviar un timbre especial.',
          'danger',
          5000,
          'middle'
        );
      }

      this.nuevoTimbre.observacion = observacion;
    }

    this.isConnected =
      this.networkService
        .getNetworkStatusDispositivo();

    /*
     * Existe conexión: intentar enviar normalmente.
     */
    if (this.isConnected === true) {
      this.PrepararDatosConexion(
        true,
        null
      );

      this.EnviarDatos(
        this.nuevoTimbre
      );

      return;
    }

    /*
     * No existe conexión y nunca se pudo descargar
     * una configuración válida para este empleado.
     */
    if (
      this.configuracionMarcacionDisponible !== true
    ) {
      this.enviandoTimbre = false;

      return this.abrirToas(
        'No se pudo verificar si tiene permitido timbrar sin Internet. Conéctese al menos una vez para descargar su configuración.',
        'danger',
        7000,
        'middle'
      );
    }

    /*
     * La última configuración válida indica que el
     * empleado está obligado a timbrar con Internet.
     */
    if (this.requiereInternet === true) {
      this.enviandoTimbre = false;

      return this.abrirToas(
        'Este empleado requiere conexión a Internet para registrar el timbre. No se guardó el registro.',
        'danger',
        6000,
        'middle'
      );
    }

    /*
     * La última configuración válida permite timbrar
     * sin conexión.
     */
    this.PrepararDatosConexion(
      false,
      this.ObtenerNovedadConexion(
        'SIN_INTERNET'
      )
    );

    await this.guardarTimbrePendiente(
      this.nuevoTimbre,
      'SIN_INTERNET'
    );

    return;
  }

  botonEnviarDeshabilitado(): boolean {
    return this.esTimbreEspecialSinObservacion();
  }

  mostrarMensajeObservacionObligatoria(): boolean {
    return this.esTimbreEspecialSinObservacion();
  }

  private esTimbreEspecialSinObservacion(): boolean {
    const esTimbreAbierto = this.nombreInfo_timbre === 'Timbre abierto';
    const observacion = String(this.nuevoTimbre.observacion ?? '').trim();

    return esTimbreAbierto && observacion.length === 0;
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
      const res: any[] = await firstValueFrom(
        this.restP.ObtenerFormatos(detalles)
      );

      res.forEach((p: any) => {
        if (
          p.id_parametro ===
          ParametrosSistema.TOLERANCIA_UBICACION
        ) {
          this.rango = Number(p.descripcion);
        }

        if (
          p.id_parametro ===
          ParametrosSistema.CONSIDERAR_SEGUNDOS_MARCACIONES
        ) {
          this.capturar_segundos =
            p.descripcion === 'Si';
        }
      });

    } catch {
      this.rango = 0;
      this.capturar_segundos = false;
    }
  }

  /*
   * Busca la configuración de marcación del empleado.
   *
   * Orden de prioridad:
   *
   * 1. Carga primero la última configuración guardada.
   * 2. Intenta consultar al servidor.
   * 3. Si el servidor responde, actualiza el almacenamiento.
   * 4. Si falla, conserva la configuración local.
   * 5. Si no existe configuración local, exige Internet.
   */
  async BuscarOpcionMarcacion(): Promise<void> {
    const empleadoID = Number(
      localStorage.getItem('empleadoID') ?? '0'
    );

    /*
     * Estado seguro inicial.
     */
    this.establecerConfiguracionSegura();

    /*
     * Intentar recuperar la última configuración válida
     * guardada para este empleado.
     */
    const configuracionLocal =
      this.cargarParametrosMarcacionDesdeLocalStorage(
        empleadoID
      );

    if (configuracionLocal) {
      this.aplicarConfiguracionMarcacion(
        configuracionLocal
      );

      this.configuracionMarcacionDisponible = true;
      this.configuracionMarcacionDesdeStorage = true;

      console.log(
        'Configuración de marcación cargada desde el teléfono:',
        configuracionLocal
      );
    }

    /*
     * Si no hay un empleado válido, no realizar consulta.
     */
    if (
      !Number.isInteger(empleadoID) ||
      empleadoID <= 0
    ) {
      this.configuracionMarcacionDisponible = false;
      this.configuracionMarcacionDesdeStorage = false;
      this.requiereInternet = true;

      await this.abrirToas(
        'No se pudo identificar al empleado. Inicie sesión nuevamente.',
        'danger',
        5000,
        'middle'
      );

      return;
    }

    const buscar = {
      ids_empleados: [empleadoID],
    };

    try {
      const res: any = await firstValueFrom(
        this.parametros
          .ObtenerDetalleParametroUsuario(buscar)
          .pipe(timeout(5000))
      );

      const parametro =
        res?.data?.[0] ??
        res?.respuesta?.[0] ??
        null;

      /*
       * El servidor respondió, pero no devolvió configuración.
       * Se conserva la configuración local, si existe.
       */
      if (!parametro) {
        if (!configuracionLocal) {
          this.establecerConfiguracionSegura();

          this.configuracionMarcacionDisponible = false;
          this.configuracionMarcacionDesdeStorage = false;

          await this.abrirToas(
            'No se encontró una configuración de marcación para el empleado. Se requiere conexión a Internet para registrar el timbre.',
            'warning',
            6000,
            'middle'
          );
        }

        return;
      }

      /*
       * Crear una configuración normalizada con la
       * respuesta obtenida desde el servidor.
       */
      const nuevaConfiguracion:
        ConfiguracionMarcacionLocal = {
        empleadoId: empleadoID,

        foto:
          this.convertirABooleano(
            parametro.timbre_foto
          ),

        fotoObligatoria:
          this.convertirABooleano(
            parametro.opcional_obligatorio
          ),

        ubicacionDesconocida:
          this.convertirABooleano(
            parametro.timbre_ubicacion_desconocida
          ),

        timbreEspecial:
          this.convertirABooleano(
            parametro.timbre_especial
          ),

        requiereInternet:
          this.convertirABooleano(
            parametro.timbre_internet
          ),

        fechaActualizacion:
          new Date().toISOString(),
      };

      /*
       * Aplicar y almacenar la configuración obtenida.
       */
      this.aplicarConfiguracionMarcacion(
        nuevaConfiguracion
      );

      this.guardarParametrosMarcacionEnLocalStorage(
        nuevaConfiguracion
      );

      this.configuracionMarcacionDisponible = true;
      this.configuracionMarcacionDesdeStorage = false;

      console.log(
        'Configuración de marcación actualizada desde el servidor:',
        nuevaConfiguracion
      );

      if (
        this.platform.is('hybrid') &&
        this.foto === true
      ) {
        await this.solicitarPermisoCamara();
      }

    } catch (error) {
      console.warn(
        'No se pudo consultar la configuración de marcación:',
        error
      );

      /*
       * Si ya había configuración local, se conserva.
       */
      if (configuracionLocal) {
        this.aplicarConfiguracionMarcacion(
          configuracionLocal
        );

        this.configuracionMarcacionDisponible = true;
        this.configuracionMarcacionDesdeStorage = true;

        await this.abrirToas(
          configuracionLocal.requiereInternet
            ? 'Sin conexión con el servidor. Se aplicará la última configuración guardada: este empleado requiere Internet para timbrar.'
            : 'Sin conexión con el servidor. Se aplicará la última configuración guardada y podrá registrar timbres pendientes.',
          'warning',
          6000,
          'middle'
        );

        return;
      }

      /*
       * Si nunca se descargó una configuración,
       * no se puede asumir que el empleado tiene
       * permiso para timbrar sin Internet.
       */
      this.establecerConfiguracionSegura();

      this.configuracionMarcacionDisponible = false;
      this.configuracionMarcacionDesdeStorage = false;

      await this.abrirToas(
        'No fue posible verificar si tiene permitido timbrar sin Internet. Conéctese al menos una vez para descargar su configuración.',
        'danger',
        7000,
        'middle'
      );
    }
  }

  /*
   * Convierte correctamente valores booleanos que pueden
   * venir como true, false, "true", "false", "Si", "No",
   * 1 o 0.
   *
   * Usar !!valor no es seguro si el backend devuelve
   * la cadena "false", porque !!"false" resulta true.
   */
  private convertirABooleano(
    valor: unknown
  ): boolean {
    if (typeof valor === 'boolean') {
      return valor;
    }

    if (typeof valor === 'number') {
      return valor === 1;
    }

    const texto = String(
      valor ?? ''
    )
      .trim()
      .toLowerCase();

    return [
      'true',
      '1',
      'si',
      'sí',
      's',
      'yes'
    ].includes(texto);
  }

  /*
   * Configuración utilizada cuando no existe ninguna
   * configuración guardada ni se puede consultar
   * al servidor.
   *
   * Requiere Internet para evitar conceder permisos
   * offline sin conocer la configuración real.
   */
  private establecerConfiguracionSegura(): void {
    this.foto = false;
    this.foto_obligatorio = false;
    this.desconocida = false;
    this.especial = false;
    this.requiereInternet = true;

    this.actualizarVariablesVisualesMarcacion();
  }

  /*
   * Aplica una configuración recuperada del servidor
   * o del almacenamiento local.
   */
  private aplicarConfiguracionMarcacion(
    configuracion: ConfiguracionMarcacionLocal
  ): void {
    this.foto =
      configuracion.foto;

    this.foto_obligatorio =
      configuracion.fotoObligatoria;

    this.desconocida =
      configuracion.ubicacionDesconocida;

    this.especial =
      configuracion.timbreEspecial;

    this.requiereInternet =
      configuracion.requiereInternet;

    this.actualizarVariablesVisualesMarcacion();
  }

  /*
   * Actualiza las variables de texto que ya utiliza
   * el resto de la aplicación.
   */
  private actualizarVariablesVisualesMarcacion(): void {
    this.timbrarConFoto =
      this.foto ? 'Si' : 'No';

    this.timbreFotoObligatoria =
      this.foto_obligatorio ? 'Si' : 'No';

    this.timbrarDesconocido =
      this.desconocida ? 'Si' : 'No';

    /*
     * Esta variable conserva el nombre que ya existe
     * en tu aplicación.
     *
     * "Si" significa que se exige Internet.
     */
    this.timbrarSinInternet =
      this.requiereInternet ? 'Si' : 'No';
  }

  /*
   * Guarda la última configuración válida obtenida
   * desde el servidor.
   */
  private guardarParametrosMarcacionEnLocalStorage(
    configuracion?: ConfiguracionMarcacionLocal
  ): void {
    const empleadoID = Number(
      localStorage.getItem('empleadoID') ?? '0'
    );

    const datos: ConfiguracionMarcacionLocal =
      configuracion ?? {
        empleadoId: empleadoID,

        foto:
          this.foto,

        fotoObligatoria:
          this.foto_obligatorio,

        ubicacionDesconocida:
          this.desconocida,

        timbreEspecial:
          this.especial,

        requiereInternet:
          this.requiereInternet,

        fechaActualizacion:
          new Date().toISOString(),
      };

    try {
      localStorage.setItem(
        this.obtenerClaveConfiguracionMarcacion(
          datos.empleadoId
        ),
        JSON.stringify(datos)
      );

      /*
       * Se conservan las claves anteriores por compatibilidad
       * con otras pantallas de la aplicación.
       */
      localStorage.setItem(
        'timbrarConFoto',
        datos.foto ? 'Si' : 'No'
      );

      localStorage.setItem(
        'opcional_obligatorio',
        datos.fotoObligatoria
          ? 'Si'
          : 'No'
      );

      localStorage.setItem(
        'timbrarUbicacionDesconocida',
        datos.ubicacionDesconocida
          ? 'Si'
          : 'No'
      );

      localStorage.setItem(
        'timbrarSinInternet',
        datos.requiereInternet
          ? 'Si'
          : 'No'
      );

    } catch (error) {
      console.warn(
        'No se pudo guardar la configuración de marcación:',
        error
      );
    }
  }

  /*
   * Recupera la configuración guardada para el empleado.
   *
   * La clave incluye el ID del empleado para evitar utilizar
   * la configuración de otro usuario cuando se cambia de sesión.
   */
  private cargarParametrosMarcacionDesdeLocalStorage(
    empleadoID: number
  ): ConfiguracionMarcacionLocal | null {
    if (
      !Number.isInteger(empleadoID) ||
      empleadoID <= 0
    ) {
      return null;
    }

    try {
      const raw = localStorage.getItem(
        this.obtenerClaveConfiguracionMarcacion(
          empleadoID
        )
      );

      if (!raw) {
        return null;
      }

      const configuracion = JSON.parse(
        raw
      ) as Partial<ConfiguracionMarcacionLocal>;

      /*
       * Verificar que la configuración corresponda
       * al empleado actualmente autenticado.
       */
      if (
        Number(configuracion.empleadoId) !==
        empleadoID
      ) {
        return null;
      }

      if (
        typeof configuracion.requiereInternet !==
        'boolean'
      ) {
        return null;
      }

      return {
        empleadoId: empleadoID,

        foto:
          configuracion.foto === true,

        fotoObligatoria:
          configuracion.fotoObligatoria === true,

        ubicacionDesconocida:
          configuracion.ubicacionDesconocida === true,

        timbreEspecial:
          configuracion.timbreEspecial === true,

        requiereInternet:
          configuracion.requiereInternet,

        fechaActualizacion:
          String(
            configuracion.fechaActualizacion ?? ''
          ),
      };

    } catch (error) {
      console.warn(
        'La configuración local de marcación no es válida:',
        error
      );

      return null;
    }
  }

  /*
   * Construye una clave diferente para cada empleado.
   */
  private obtenerClaveConfiguracionMarcacion(
    empleadoID: number
  ): string {
    return (
      `${this.STORAGE_CONFIG_MARCACION}_` +
      `${empleadoID}`
    );
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

    /*
      Sí existen coordenadas, pero no pertenecen
      a ninguna zona permitida.
    */
    return 'FUERA DE ZONA';
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

  private NormalizarUbicacionParaTimbre(
    teclaFuncion: string
  ): boolean {

    const esFlexible =
      this.EsTimbreFlexibleUbicacion(
        teclaFuncion
      );

    const ubicacionActual =
      String(this.ubicacion ?? '')
        .trim()
        .toUpperCase();

    /*
      No se consiguieron coordenadas.
    */
    if (
      !ubicacionActual ||
      this.EsUbicacionNoValida(
        ubicacionActual
      )
    ) {
      if (esFlexible) {
        this.actualizarUbicacionPantalla(
          'SIN UBICACION'
        );

        return true;
      }

      return false;
    }

    /*
      Sí existen coordenadas, pero están
      fuera de las zonas permitidas.
    */
    if (ubicacionActual === 'FUERA DE ZONA') {
      return false;
    }

    /*
      Existen coordenadas, pero no coinciden
      con una zona registrada.
    */
    if (ubicacionActual === 'DESCONOCIDO') {
      return (
        this.desconocida === true ||
        esFlexible
      );
    }

    return true;
  }

  private obtenerMensajeErrorUbicacion(): string {
    const ubicacionNormalizada =
      String(this.ubicacion ?? '')
        .trim()
        .toUpperCase();

    return ubicacionNormalizada === 'FUERA DE ZONA'
      ? 'La ubicación obtenida está fuera de las zonas permitidas para realizar este timbre.'
      : 'No fue posible obtener una ubicación válida. Verifique que el GPS y la ubicación precisa estén activos y vuelva a intentarlo.';
  }

  private async validarUbicacionParaContinuar(
    teclaFuncion: string
  ): Promise<boolean> {
    const ubicacionValida =
      this.NormalizarUbicacionParaTimbre(teclaFuncion);

    if (ubicacionValida) {
      return true;
    }

    this.enviandoTimbre = false;

    await this.abrirToas(
      this.obtenerMensajeErrorUbicacion(),
      'danger',
      6000,
      'middle'
    );

    return false;
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

  async guardarTimbrePendiente(
    data: any,
    motivo:
      | 'SIN_INTERNET'
      | 'ERROR_SERVIDOR'
      | 'TIMEOUT'
  ): Promise<void> {

    data.conexion = false;
    data.dispositivo_timbre =
      this.APP_MOVIL;

    /*
     * Todavía no se ha enviado al servidor.
     */
    data.fecha_subida_servidor = null;

    if (!data.novedades_conexion) {
      data.novedades_conexion =
        motivo === 'SIN_INTERNET'
          ? this.ObtenerNovedadConexion(
            'SIN_INTERNET'
          )
          : motivo === 'TIMEOUT'
            ? this.ObtenerNovedadConexion(
              'TIMEOUT'
            )
            : this.ObtenerNovedadConexion(
              'ERROR_SERVIDOR'
            );
    }

    if (!data.ubicacion) {
      data.ubicacion =
        this.ubicacion ||
        'Sin Ubicación';
    }

    this.actualizarUbicacionPantalla(
      data.ubicacion
    );

    this.nuevoTimbre.conexion = false;
    this.nuevoTimbre.fecha_subida_servidor =
      null;

    this.nuevoTimbre.novedades_conexion =
      data.novedades_conexion;

    /*
     * Guardar el objeto completo:
     *
     * - fecha y hora;
     * - acción;
     * - ubicación;
     * - coordenadas;
     * - foto;
     * - autenticación;
     * - datos del dispositivo.
     */
    this.dataLocalService
      .guardarTimbresPerdidos(data);

    this.enviandoTimbre = false;

    /*
     * Mostrar una confirmación informativa.
     * La pantalla se cierra únicamente cuando
     * el usuario presiona OK.
     */
    await this.mostrarConfirmacionTimbrePendiente(
      data,
      motivo
    );
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

  private async mostrarConfirmacionTimbrePendiente(
    data: any,
    motivo: 'SIN_INTERNET' | 'ERROR_SERVIDOR' | 'TIMEOUT'
  ): Promise<void> {
    const nombreTimbre =
      this.nombre_timbre ||
      this.nombreInfo_timbre ||
      'TIMBRE';

    const fechaTimbre =
      data.fec_hora_timbre ||
      this.fechaHora ||
      'No disponible';

    const ubicacionTimbre =
      data.ubicacion ||
      'Sin ubicación';

    const tieneFoto =
      !!data.imagen;

    let mensajeMotivo =
      'El timbre fue almacenado en la memoria del teléfono.';

    if (motivo === 'SIN_INTERNET') {
      mensajeMotivo =
        'No existe conexión a Internet. El timbre fue almacenado en la memoria del teléfono.';
    }

    if (motivo === 'TIMEOUT') {
      mensajeMotivo =
        'El servidor no respondió a tiempo. El timbre fue almacenado en la memoria del teléfono.';
    }

    if (motivo === 'ERROR_SERVIDOR') {
      mensajeMotivo =
        'No fue posible comunicarse con el servidor. El timbre fue almacenado en la memoria del teléfono.';
    }

    const alert = await this.alertController.create({
      header: 'Timbre guardado',
      subHeader: 'Pendiente de sincronización',

      message: `
      <div style="text-align: left;">
        <p>${mensajeMotivo}</p>

        <p>
          <strong>Tipo:</strong><br>
          ${nombreTimbre}
        </p>

        <p>
          <strong>Fecha y hora:</strong><br>
          ${fechaTimbre}
        </p>

        <p>
          <strong>Ubicación:</strong><br>
          ${ubicacionTimbre}
        </p>

        <p>
          <strong>Foto:</strong><br>
          ${tieneFoto ? 'Sí, guardada con el timbre' : 'No registrada'}
        </p>

        <p style="margin-top: 16px;">
          El timbre se enviará automáticamente cuando vuelva a existir conexión con el servidor.
        </p>
      </div>
    `,

      backdropDismiss: false,

      buttons: [
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.navCtroller.navigateRoot([
              '/reloj/bienvenido'
            ]);
          }
        }
      ]
    });

    await alert.present();
  }
}