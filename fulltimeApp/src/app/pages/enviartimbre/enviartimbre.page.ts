import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, AlertController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FingerprintAIO } from '@awesome-cordova-plugins/fingerprint-aio/ngx';
import { Geolocation } from '@capacitor/geolocation';
import { Device } from '@capacitor/device';
import { Timbre } from '../../interfaces/Timbre';
import { DataLocalService } from '../../libs/data-local.service';
import { NetworkService } from '../../libs/network.service';

// Servicios
import { RelojServiceService } from '../../services/reloj-service.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { Camera, CameraDirection, CameraResultType, CameraSource } from '@capacitor/camera';
import { FechaHoraService } from 'src/app/services/fecha-hora.service';
import { timeout } from 'rxjs/operators';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { ParametrosSistema } from 'src/app/libs/parametros.emun';

@Component({
  selector: 'app-enviartimbre',
  templateUrl: './enviartimbre.page.html',
  styleUrls: ['./enviartimbre.page.scss'],
})
export class EnviartimbrePage implements OnInit {

  ips_locales: any = '';

  // PARAMETROS / OPCIONES DE MARCACION
  rango: number = 0;
  capturar_segundos: boolean = false;

  foto: boolean = false;
  foto_obligatorio: boolean = false;
  desconocida: boolean = false;
  especial: boolean = false;

  // Si está en true, NO permite timbrar sin internet.
  requiereInternet: boolean = false;

  // Se mantiene solo por compatibilidad con partes antiguas del HTML/código
  timbrarSinInternet: string = 'No';
  timbrarConFoto: string = 'No';
  timbreFotoObligatoria: string = 'No';
  timbrarDesconocido: string = 'No';

  // Variables foto
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

  ngOnInit() {
    this.VerificarFunciones();
    this.networkSubscriber();

    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    this.id_usuario = localStorage.getItem('empleadoID') ?? '';
    this.codigo = localStorage.getItem('codigo') ?? '';
    this.nombre_usuario = localStorage.getItem('nom') ?? '';
    this.apellido_usuario = localStorage.getItem('ap') ?? '';

    this.nombreInfo_timbre = this.activateRoute.snapshot.paramMap.get('idTimbre') ?? '';
    this.nombre_timbre = this.nombreInfo_timbre.toUpperCase();

    this.obtenerIdCelular();

    this.BuscarParametros();
    this.BuscarOpcionMarcacion();

    this.fechaHoraService.fechaHora$.subscribe(async (fechaHora) => {
      const data = await fechaHora;

      this.fechaHora = data.fechaHora;
      this.fecha = data.fecha;
      this.hora = data.hora;
      this.zonaHoraria = data.zonaHoraria;
      this.gmtDispositivo = data.gmtDispositivo;
    });
  }

  // METODO PARA VERIFICAR LAS FUNCIONES DISPONIBLES
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

  // METODO PARA VERIFICAR LA CONEXION A INTERNET
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

  // METODO PARA VERIFICAR LA UBICACION ACTIVADA
  async comprobarGPS() {
    if (this.platform.is('hybrid')) {
      Geolocation.checkPermissions()
        .then(() => this.requestLocationPermission())
        .catch((error) => {
          console.log('Error al verificar permisos de GPS:', error);

          this.abrirToas(
            'Ups, al parecer no tiene activada la localización. Por favor, active el GPS.',
            'warning',
            3000,
            'middle'
          );
        });

      return;
    }

    this.obtenerPosicionWeb();
  }

  // METODO PARA SOLICITAR EL PERMISO DE UBICACION
  async requestLocationPermission() {
    try {
      if (!this.platform.is('hybrid')) {
        this.obtenerPosicionWeb();
        return;
      }

      const status = await Geolocation.requestPermissions();

      if (status.location === 'granted') {
        this.obtenerPosicion();
      } else {
        this.abrirToas(
          'Ups!!! Al parecer no ha otorgado el permiso de acceder a la ubicación al Reloj Virtual. Por favor vaya a las configuraciones de nuestra app y permita al Reloj Virtual acceder a su ubicación.',
          'danger',
          3000,
          'middle'
        );
      }

    } catch {
      this.abrirToas(
        'Ups!!! Al parecer no ha otorgado el permiso de acceder a la ubicación al Reloj Virtual. Por favor vaya a las configuraciones de nuestra app y permita al Reloj Virtual acceder a su ubicación.',
        'danger',
        3000,
        'middle'
      );
    }
  }

  // METODO PARA OBTENER LAS COORDENADAS EN APP MOVIL
  async obtenerPosicion() {
    this.cargandoPosicion = true;

    await Geolocation.getCurrentPosition({
      enableHighAccuracy: true
    }).then((resp) => {
      this.geoLongitude = resp.coords.longitude;
      this.geoLatitude = resp.coords.latitude;
      this.cargandoPosicion = false;

    }).catch((error) => {
      this.cargandoPosicion = false;

      this.abrirToas(
        'Ups!!! No se ha obtenido coordenadas de ubicación.',
        'danger',
        6000,
        'middle'
      );

    });
  }

  // METODO PARA OBTENER COORDENADAS EN NAVEGADOR WEB
  obtenerPosicionWeb() {
    this.cargandoPosicion = true;

    if (!navigator.geolocation) {
      this.geoLatitude = -0.180653;
      this.geoLongitude = -78.467834;
      this.cargandoPosicion = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.geoLatitude = position.coords.latitude;
        this.geoLongitude = position.coords.longitude;
        this.cargandoPosicion = false;

      },
      (error) => {
        console.warn('No se pudo obtener ubicación en navegador:', error);

        // Coordenadas de prueba para no bloquear el flujo en ionic serve
        this.geoLatitude = -0.180653;
        this.geoLongitude = -78.467834;
        this.cargandoPosicion = false;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  }

  // METODO PARA OBTENER LA INFORMACION DEL DISPOSITIVO
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

  // METODO PARA INICIAR CON EL PROCESO DE FOTO SEGUN LOS PARAMETROS
  async iniciarProcesoFoto() {
    if (this.foto === true) {

      if (this.foto_obligatorio === true) {
        await this.tomarFoto()
          .then(() => {
            this.identificarUsuario();
          })
          .catch(() => {
            this.abrirToas(
              'No se pudo obtener la foto, timbre cancelado.',
              'warning',
              2000,
              'middle'
            );
          });

        return;
      }

      if (this.activarOpcion === true) {
        await this.tomarFoto()
          .then(() => {
            this.identificarUsuario();
          })
          .catch(() => {
            this.abrirToas(
              'No se pudo obtener la foto, timbre cancelado.',
              'warning',
              2000,
              'middle'
            );
          });

        return;
      }

      this.identificarUsuario();
      return;
    }

    this.identificarUsuario();
  }

  // METODO PARA ABRIR LA CAMARA Y GUARDAR LA IMAGEN
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

  // METODO PARA VERIFICAR LA AUTENTICACION POR HUELLA DACTILAR
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

  // METODO PARA ABRIR EL COMPONENTE DE AUTENTICACION POR HUELLA DACTILAR
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

  // METODO PARA ENVIAR TIMBRES SIN AUTENTICACION
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

  // METODO PARA ENVIAR TIMBRE SI EXISTE PROBLEMA DE AUTENTICACION
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

  // METODO PARA VERIFICAR LOS PERMISOS
  async verificarPermisoLocation(): Promise<boolean> {
    if (!this.platform.is('hybrid')) {
      return true;
    }

    const result = await Geolocation.checkPermissions();
    return result.location === 'granted';
  }

  // METODO PARA ENVIAR EL TIMBRE SEGUN LOS PARAMETROS
  async enviarTimbre(ev?: any) {
    if (this.platform.is('hybrid')) {

      await this.verificarPermisoLocation()
        .then(async () => {
          const status = await Geolocation.requestPermissions();

          if (status.location === 'granted') {
            this.iniciarProcesoFoto();
          } else {
            this.abrirToas(
              'Ups, al parecer no ha otorgado el permiso de acceder a la ubicación al Reloj Virtual. Por favor vaya a las configuraciones de nuestra app y permita al Reloj Virtual acceder a su ubicación.',
              'danger',
              6000,
              'middle'
            );
          }
        })
        .catch(() => {
          this.abrirToas(
            'Ups!!! Debe activar la ubicación para enviar el timbre',
            'danger',
            3000,
            'middle'
          );
        });

      return;
    }

    console.log('Probando timbre desde navegador web');

    this.abrirToas(
      'Prueba desde navegador: no se usará autenticación biométrica.',
      'warning',
      2000,
      'middle'
    );

    this.nuevoTimbre.tipo_autenticacion = this.NINGUNA_IDENTIFICACION;

    if (!this.geoLatitude || !this.geoLongitude) {
      this.geoLatitude = -0.180653;
      this.geoLongitude = -78.467834;
    }

    this.iniciarProcesoFoto();
  }

  // METODO PARA OBTENER LA ACCION DEL TIMBRE
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

  // METODO PARA REFRESCAR LA PAGINA
  refrescoEspecial() {
    this.cargandoPosicion = false;
    this.geoLatitude = 0;
    this.geoLongitude = 0;
    this.comprobarGPS();
  }

  // METODO PARA VERIFICAR EL NUMERO DE CARACTERES
  ionChange() {
    this.numeroCaracteres = this.nuevoTimbre.observacion?.length ?? 0;
  }

  // METODO PARA GUARDAR LA INFORMACION DEL TIMBRE EN LA BASE DE DATOS
  guardarEnBDD() {
    const fechaHoraTimbre = this.formatearFechaTimbreParaBackend(this.fechaHora);

    if (!fechaHoraTimbre) {
      return this.abrirToas(
        'No se pudo obtener la fecha y hora del timbre. Intente nuevamente.',
        'warning',
        3000,
        'middle'
      );
    }

    this.nuevoTimbre.codigo = this.codigo;
    this.nuevoTimbre.fec_hora_timbre = fechaHoraTimbre;
    this.nuevoTimbre.zona_dispositivo = this.zonaHoraria;
    this.nuevoTimbre.tecl_funcion = this.obtenerIdTipo();
    this.nuevoTimbre.imagen = this.imagen || null;
    this.nuevoTimbre.capturar_segundos = this.capturar_segundos;
    this.nuevoTimbre.gmt_dispositivo = this.gmtDispositivo;

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
      this.nuevoTimbre.latitud = this.geoLatitude ? String(this.geoLatitude) : '0';
      this.nuevoTimbre.longitud = this.geoLongitude ? String(this.geoLongitude) : '0';
      this.nuevoTimbre.conexion = true;
      this.nuevoTimbre.novedades_conexion = 'Sin problemas de conexión';

      this.ValidarModulo(
        this.geoLatitude,
        this.geoLongitude,
        this.rango,
        this.nuevoTimbre
      );

      return;
    }

    // SIN INTERNET
    if (this.requiereInternet === true) {
      this.abrirToas(
        'Timbre sin conexión a Internet. No Permitido',
        'danger',
        5000,
        'middle'
      );

      return this.router.navigate(['/login']);
    }

    this.nuevoTimbre.latitud = this.geoLatitude ? String(this.geoLatitude) : '0';
    this.nuevoTimbre.longitud = this.geoLongitude ? String(this.geoLongitude) : '0';
    this.nuevoTimbre.ubicacion = 'Sin Ubicación';
    this.storageUbica = this.nuevoTimbre.ubicacion;
    this.nuevoTimbre.conexion = false;
    this.nuevoTimbre.novedades_conexion = 'Falló conexión al Internet';

    this.guardarTimbreStorage(this.nuevoTimbre);
    localStorage.setItem('storageUbicacion', this.storageUbica);
  }

  // METODO PARA FORMATEAR LA FECHA DEL TIMBRE PARA EL BACKEND
  formatearFechaTimbreParaBackend(fecha: any): string {
    if (!fecha) return '';

    const fechaDate = new Date(fecha);

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

  // METODO PARA GUARDAR LOS TIMBRES EN MEMORIA CUANDO NO HAY INTERNET
  guardarTimbreStorage(timbre: Timbre) {
    this.dataLocalService.guardarTimbre(timbre);

    this.navCtroller.navigateForward(['confirmaciontimbre'], {
      queryParams: {
        data: JSON.stringify(timbre)
      }
    });
  }

  // METODO PARA BUSCAR PARAMETROS GENERALES DEL SISTEMA
  BuscarParametros() {
    this.rango = 0;
    this.capturar_segundos = false;

    const detalles = [
      ParametrosSistema.TOLERANCIA_UBICACION,
      ParametrosSistema.CONSIDERAR_SEGUNDOS_MARCACIONES
    ];

    this.restP.ObtenerFormatos(detalles).subscribe({
      next: (res: any[]) => {
        res.forEach((p: any) => {

          if (p.id_parametro === ParametrosSistema.TOLERANCIA_UBICACION) {
            this.rango = Number(p.descripcion);
          }

          if (p.id_parametro === ParametrosSistema.CONSIDERAR_SEGUNDOS_MARCACIONES) {
            this.capturar_segundos = p.descripcion === 'Si';
          }

        });

      },
      error: () => {
        this.rango = 0;
        this.capturar_segundos = false;
      }
    });
  }

  // METODO PARA BUSCAR OPCIONES DE MARCACION DEL EMPLEADO
  BuscarOpcionMarcacion() {
    const empleadoID = parseInt(localStorage.getItem('empleadoID') ?? '0', 10);

    const buscar = {
      ids_empleados: [empleadoID],
    };

    this.foto = false;
    this.foto_obligatorio = false;
    this.desconocida = false;
    this.especial = false;
    this.requiereInternet = false;

    this.parametros.ObtenerDetalleParametroUsuario(buscar).subscribe({
      next: (res: any) => {
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

      },
      error: () => {
        this.foto = false;
        this.foto_obligatorio = false;
        this.desconocida = false;
        this.especial = false;
        this.requiereInternet = false;

        this.guardarParametrosMarcacionEnLocalStorage();
      }
    });
  }

  // SOLO PARA COMPATIBILIDAD CON CODIGO ANTIGUO QUE AUN LEE LOCALSTORAGE
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

  PermitirUbicacionDesconocida(timbre: any, guardarSinServidor: boolean = false) {
    if (this.desconocida === true) {
      timbre.ubicacion = 'DESCONOCIDO';
      this.storageUbica = timbre.ubicacion;

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
      'Timbre con ubicación Desconocida. No Permitido',
      'danger',
      5000,
      'middle'
    );

    return this.router.navigate(['/login']);
  }

  // METODO QUE VERIFICA SI EL TIMBRE FUE REALIZADO EN UN PERIMETRO DEFINIDO
  CompararCoordenadas(informacion: any, timbre: any, descripcion: any, data: any) {
    this.restP.ObtenerCoordenadas(informacion).subscribe(
      {
        next: (res: any) => {

          if (res.data[0].verificar === 'ok') {
            this.contar = this.contar + 1;
            this.ubicacion = descripcion;

            if (this.contar === 1) {
              timbre.ubicacion = this.ubicacion;
              this.storageUbica = timbre.ubicacion;

              this.abrirToas(
                'Timbre realizado dentro del perímetro definido como ' + this.ubicacion + '.',
                'primary',
                3000,
                'top'
              );

              this.EnviarDatos(timbre);
            }
          } else {
            this.sin_ubicacion = this.sin_ubicacion + 1;

            if (this.sin_ubicacion === data.length) {
              this.ValidarDomicilio(informacion, timbre);
            }
          }
        }, error: () => {
          this.PermitirUbicacionDesconocida(timbre);
        }
      }
    );
  }

  // METODO QUE PERMITE VALIDACIONES DE UBICACION
  BuscarUbicacion(latitud: any, longitud: any, rango: any, timbre: any) {
    let datosUbicacion: any[] = [];
    this.contar = 0;
    this.sin_ubicacion = 0;

    const informacion: any = {
      lat1: String(latitud),
      lng1: String(longitud),
      lat2: '',
      lng2: '',
      valor: rango
    };

    this.restP.ObtenerUbicacionUsuario(this.id_usuario).subscribe(
      {
        next: (res: any) => {
          datosUbicacion = res.data ?? res ?? [];

          if (datosUbicacion.length !== 0) {
            datosUbicacion.forEach((obj: any) => {
              informacion.lat2 = obj.latitud;
              informacion.lng2 = obj.longitud;

              this.CompararCoordenadas(
                informacion,
                timbre,
                obj.descripcion,
                datosUbicacion
              );
            });

          } else {
            this.ValidarDomicilio(informacion, timbre);
          }
        }, error: () => {
          this.PermitirUbicacionDesconocida(timbre);
        }
      }
    );
  }

  // METODO PARA VERIFICAR SI ESTA ACTIVO EL MODULO GEOLOCALIZACION
  ValidarModulo(latitud: any, longitud: any, rango: any, timbre: any) {

    if (this.modulo_geolocalizacion === true) {
      this.BuscarUbicacion(latitud, longitud, rango, timbre);
    } else {
      timbre.ubicacion = 'DESCONOCIDO';
      this.storageUbica = timbre.ubicacion;
      this.EnviarDatos(timbre);
    }
  }

  // METODO PARA VALIDAR LAS COORDENADAS DEL DOMICILIO
  ValidarDomicilio(informacion: any, timbre: any) {
    this.restE.ObtenerUbicacion(this.id_usuario).subscribe(
      {
        next: (res: any) => {
          if (res.data[0].longitud != null) {
            informacion.lat2 = res.data[0].latitud;
            informacion.lng2 = res.data[0].longitud;

            this.restP.ObtenerCoordenadas(informacion).subscribe(
              {
                next: (resu: any) => {
                  if (resu.data[0].verificar === 'ok') {
                    timbre.ubicacion = 'DOMICILIO';
                    this.storageUbica = timbre.ubicacion;

                    this.abrirToas(
                      'Marcación realizada dentro del perímetro definido como DOMICILIO.',
                      'primary',
                      3000,
                      'top'
                    );

                    this.EnviarDatos(timbre);
                  } else {
                    this.PermitirUbicacionDesconocida(timbre);
                  }
                }, error: () => {
                  this.PermitirUbicacionDesconocida(timbre);
                }
              }
            );
          } else {
            this.PermitirUbicacionDesconocida(timbre);
          }
        }, error: () => {
          this.PermitirUbicacionDesconocida(timbre);
        }
      }
    );
  }

  // METODO PARA ENVIAR DATOS DEL TIMBRE MEDIANTE EL SERVICIO
  EnviarDatos(data: any) {
    localStorage.setItem('storageUbicacion', this.storageUbica);

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

  // METODO PARA ALMACENAR LOS TIMBRES SIN CONEXION AL SERVIDOR
  GuardartimbresinServidor(data: any) {

    data.conexion = false;
    data.novedades_conexion = 'Falló conexión al servidor';

    this.nuevoTimbre.conexion = data.conexion;
    this.nuevoTimbre.novedades_conexion = data.novedades_conexion;

    this.dataLocalService.guardarTimbresPerdidos(data);

    this.navCtroller.navigateForward(['confirmaciontimbre'], {
      queryParams: {
        data: JSON.stringify(data)
      }
    });
  }

  // METODO PARA DEFINIR LOS TOAST
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