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

  private readonly IDENTIFICACION_BIOMETRICA = 'B';
  private readonly NINGUNA_IDENTIFICACION = 'N';
  private readonly IDENTIFICACION_DESACTIVADA = 'D';

  cargandoPosicion = false;

  public nuevoTimbre: any = {
    codigo: '',
    observacion: '',
    latitud: null,
    longitud: null,
    id_reloj: 97,
    ubicacion: '',
    imagen: null
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

  conexion = true;
  novedades_conexion: string = '';

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

    /**
     * IMPORTANTE:
     * Aquí ya se valida y se muestra la ubicación ANTES de presionar Continuar.
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
        await this.obtenerPosicion();
        return true;
      }

      const request: any = await Geolocation.requestPermissions({
        permissions: ['location']
      } as any);

      const requestGranted =
        request.location === 'granted' ||
        request.coarseLocation === 'granted';

      if (requestGranted) {
        await this.obtenerPosicion();
        return true;
      }

      await this.abrirToas(
        'No se otorgó permiso de ubicación. Para timbrar debe permitir el acceso a la ubicación.',
        'warning',
        5000,
        'middle'
      );

      return false;

    } catch (error: any) {
      console.log('Error solicitando permiso de ubicación:', error);

      await this.abrirToas(
        'No fue posible solicitar el permiso de ubicación. Revise que la ubicación esté activa y que la app tenga permiso desde la configuración del teléfono.',
        'danger',
        6000,
        'middle'
      );

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

    } catch (error) {
      console.log('Error solicitando permiso de cámara:', error);

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
        'Por favor verifique su conexión a Internet',
        'danger',
        3000,
        'middle'
      );
    }

    this.comprobarGPS();
  }

  async comprobarGPS() {
    if (this.platform.is('hybrid')) {
      await this.solicitarPermisoUbicacionInicial();
      return;
    }

    await this.obtenerPosicionWeb();
  }

  async requestLocationPermission() {
    await this.solicitarPermisoUbicacionInicial();
    await this.actualizarUbicacionAntesDeContinuar();
  }

  async obtenerPosicion() {
    this.cargandoPosicion = true;

    try {
      const resp = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      this.geoLongitude = resp.coords.longitude;
      this.geoLatitude = resp.coords.latitude;

      console.log('Coordenadas obtenidas:', {
        latitud: this.geoLatitude,
        longitud: this.geoLongitude
      });

    } catch (error) {
      console.log('Error al obtener coordenadas:', error);

      this.geoLatitude = 0;
      this.geoLongitude = 0;

      await this.abrirToas(
        'Ups!!! No se ha obtenido coordenadas de ubicación.',
        'danger',
        6000,
        'middle'
      );

    } finally {
      this.cargandoPosicion = false;
    }
  }

  obtenerPosicionWeb(): Promise<void> {
    this.cargandoPosicion = true;

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        this.geoLatitude = 0;
        this.geoLongitude = 0;
        this.cargandoPosicion = false;
        resolve();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.geoLatitude = position.coords.latitude;
          this.geoLongitude = position.coords.longitude;
          this.cargandoPosicion = false;
          resolve();
        },
        (error) => {
          console.warn('No se pudo obtener ubicación en navegador:', error);

          this.geoLatitude = 0;
          this.geoLongitude = 0;
          this.cargandoPosicion = false;
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
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
      this.modelo_dispositivo = info.model;
    }).catch(() => {
      this.modelo_dispositivo = 'Desconocido';
    });

    Device.getId().then((id) => {
      this.nuevoTimbre.dispositivo_timbre = id.identifier + '';
    }).catch(() => {
      this.nuevoTimbre.dispositivo_timbre = 'Desconocido';
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
        } catch (error) {
          console.log('Error al tomar foto:', error);

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
      console.log('Autenticación biométrica no disponible en navegador');

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
        console.log('verified: ', resul.verified);

        this.nuevoTimbre.tipo_autenticacion = this.IDENTIFICACION_BIOMETRICA;
        this.guardarEnBDD();
      }
    }).catch(() => {
      this.abrirToas(
        'Ocurrió un error al autenticar del usuario. El timbre no se envió',
        'danger',
        1000,
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
    const alert = await this.alertController.create({
      header: 'Autenticación no disponible',
      message: 'El timbre se enviará pero en su reporte de timbres se reflejará este particular.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Listo',
          handler: () => {
            this.nuevoTimbre.tipo_autenticacion = this.IDENTIFICACION_DESACTIVADA;
            this.guardarEnBDD();
          }
        }
      ]
    });

    await alert.present();
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
    if (this.platform.is('hybrid')) {
      const tienePermisoUbicacion = await this.solicitarPermisoUbicacionInicial();

      if (!tienePermisoUbicacion) {
        return this.abrirToas(
          'Ups, al parecer no ha otorgado el permiso de acceder a la ubicación al Reloj Virtual. Por favor vaya a las configuraciones de nuestra app y permita al Reloj Virtual acceder a su ubicación.',
          'danger',
          6000,
          'middle'
        );
      }

      if (!this.geoLatitude || !this.geoLongitude) {
        await this.obtenerPosicion();
      }
    } else {
      console.log('Probando timbre desde navegador web');

      this.abrirToas(
        'Prueba desde navegador: no se usará autenticación biométrica.',
        'warning',
        2000,
        'middle'
      );

      this.nuevoTimbre.tipo_autenticacion = this.NINGUNA_IDENTIFICACION;

      if (!this.geoLatitude || !this.geoLongitude) {
        await this.obtenerPosicionWeb();
      }
    }

    /**
     * Antes de continuar, volvemos a validar la ubicación.
     * Así no se envía el timbre con ubicación vacía.
     */
    await this.actualizarUbicacionAntesDeContinuar();

    if (!this.ubicacion) {
      return this.abrirToas(
        'No se pudo validar la ubicación. Intente refrescar la pantalla.',
        'warning',
        4000,
        'middle'
      );
    }

    if (
      this.ubicacion === 'DESCONOCIDO' &&
      this.desconocida !== true
    ) {
      return this.abrirToas(
        'Timbre con ubicación desconocida. No permitido.',
        'danger',
        5000,
        'middle'
      );
    }

    await this.iniciarProcesoFoto();
  }

  obtenerIdTipo(): string {
    switch (this.nombreInfo_timbre) {
      case 'Inicio de jornada laboral':
        this.nuevoTimbre.accion = 'E';
        return '0';

      case 'Fin de jornada laboral':
        this.nuevoTimbre.accion = 'S';
        return '1';

      case 'Inicio de almuerzo':
        this.nuevoTimbre.accion = 'S/A';
        return '2';

      case 'Fin de almuerzo':
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

    this.nuevoTimbre.ubicacion = this.ubicacion || 'Sin Ubicación';

    if (this.nuevoTimbre.accion === 'HA' && !this.nuevoTimbre.observacion) {
      return this.abrirToas(
        'Lo siento! Debes ingresar una observación antes de enviar un timbre abierto 😅',
        'danger',
        5000,
        'middle'
      );
    }

    this.isConnected = this.networkService.getNetworkStatusDispositivo();

    if (this.isConnected === true) {
      this.nuevoTimbre.conexion = true;
      this.nuevoTimbre.novedades_conexion = 'Sin problemas de conexión';

      this.EnviarDatos(this.nuevoTimbre);
      return;
    }

    if (this.requiereInternet === true) {
      this.abrirToas(
        'Timbre sin conexión a Internet. No permitido',
        'danger',
        5000,
        'middle'
      );

      return this.router.navigate(['/login']);
    }

    this.nuevoTimbre.ubicacion = this.ubicacion || 'Sin Ubicación';
    this.actualizarUbicacionPantalla(this.nuevoTimbre.ubicacion);

    this.nuevoTimbre.conexion = false;
    this.nuevoTimbre.novedades_conexion = 'Falló conexión al Internet';

    this.guardarTimbreStorage(this.nuevoTimbre);
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
    const segundos = String(fechaDate.getSeconds()).padStart(2, '0');

    const ampm = horas >= 12 ? 'PM' : 'AM';

    horas = horas % 12;
    horas = horas ? horas : 12;

    return `${dd}/${mm}/${yyyy} ${horas}:${minutos}:${segundos} ${ampm}`;
  }

  guardarTimbreStorage(timbre: Timbre) {
    this.dataLocalService.guardarTimbre(timbre);

    this.navCtroller.navigateForward(['confirmaciontimbre'], {
      queryParams: {
        data: JSON.stringify(timbre)
      }
    });
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
          await this.obtenerPosicion();
        } else {
          await this.obtenerPosicionWeb();
        }
      }

      if (!this.geoLatitude || !this.geoLongitude) {
        this.actualizarUbicacionPantalla('Sin Ubicación');
        return;
      }

      const ubicacionCalculada = await this.calcularUbicacionActual(
        this.geoLatitude,
        this.geoLongitude,
        this.rango
      );

      this.actualizarUbicacionPantalla(ubicacionCalculada);

    } catch (error) {
      console.log('Error validando ubicación antes de continuar:', error);
      this.actualizarUbicacionPantalla('Sin Ubicación');
    } finally {
      this.cargandoPosicion = false;
    }
  }

  async calcularUbicacionActual(latitud: any, longitud: any, rango: any): Promise<string> {
    if (this.modulo_geolocalizacion !== true) {
      return 'DESCONOCIDO';
    }

    const informacion: any = {
      lat1: String(latitud ?? '0'),
      lng1: String(longitud ?? '0'),
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

    if (this.desconocida === true) {
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

    } catch (error) {
      console.log('Error buscando ubicación permitida:', error);
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

    } catch (error) {
      console.log('Error buscando ubicación domicilio:', error);
      return '';
    }
  }

  async validarCoordenadas(informacion: any): Promise<boolean> {
    try {
      const res: any = await firstValueFrom(this.restP.ObtenerCoordenadas(informacion));
      const resultado = res.data?.[0] ?? res?.[0];

      return resultado?.verificar === 'ok';

    } catch (error) {
      console.log('Error comparando coordenadas:', error);
      return false;
    }
  }

  PermitirUbicacionDesconocida(timbre: any, guardarSinServidor: boolean = false) {
    if (this.desconocida === true) {
      timbre.ubicacion = 'DESCONOCIDO';
      this.actualizarUbicacionPantalla(timbre.ubicacion);

      if (guardarSinServidor) {
        this.GuardartimbresinServidor(timbre);
      } else {
        this.abrirToas(
          'Marcación realizada dentro de un perímetro DESCONOCIDO.',
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

    return this.router.navigate(['/login']);
  }

  // ============================================================
  // GUARDADO / ENVÍO
  // ============================================================

  EnviarDatos(data: any) {
    this.actualizarUbicacionPantalla(data.ubicacion || 'DESCONOCIDO');

    this.relojService.enviarTimbre(data).pipe(timeout(5000)).subscribe({
      next: () => {
        this.navCtroller.navigateForward(['confirmaciontimbre'], {
          queryParams: {
            data: JSON.stringify(data)
          }
        });
      },
      error: () => {
        this.GuardartimbresinServidor(data);

        this.abrirToas(
          'Error con la conexión al servidor. El timbre se guardó en memoria del teléfono',
          'danger',
          3000,
          'middle'
        );
      }
    });
  }

  GuardartimbresinServidor(data: any) {
    data.conexion = false;
    data.novedades_conexion = 'Falló conexión al servidor';

    if (!data.ubicacion) {
      data.ubicacion = this.ubicacion || 'Sin Ubicación';
    }

    this.actualizarUbicacionPantalla(data.ubicacion);

    this.nuevoTimbre.conexion = data.conexion;
    this.nuevoTimbre.novedades_conexion = data.novedades_conexion;

    this.dataLocalService.guardarTimbresPerdidos(data);

    this.navCtroller.navigateForward(['confirmaciontimbre'], {
      queryParams: {
        data: JSON.stringify(data)
      }
    });
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