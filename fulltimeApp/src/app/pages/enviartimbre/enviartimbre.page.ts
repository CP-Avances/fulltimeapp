import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, AlertController } from '@ionic/angular';
import { Platform, PopoverController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { DataUserLoggedService } from '../../services/data-user-logged.service';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio';
import { Geolocation } from '@capacitor/geolocation';
import { Device } from '@capacitor/device';
import { BiometricAuth } from 'capacitor-biometric-auth';
import { Timbre } from "../../interfaces/Timbre";
import { DataLocalService } from '../../libs/data-local.service';
import { NetworkService } from '../../libs/network.service';
//Servicios
import { RelojServiceService } from "../../services/reloj-service.service";
import { ParametrosService } from 'src/app/services/parametros.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { Camera, CameraDirection, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { FechaHoraService } from 'src/app/services/fecha-hora.service';
import { timeout } from 'rxjs/operators';
import { ValidacionesService } from 'src/app/libs/validaciones.service';

@Component({
  selector: 'app-enviartimbre',
  templateUrl: './enviartimbre.page.html',
  styleUrls: ['./enviartimbre.page.scss'],
})
export class EnviartimbrePage implements OnInit {
  ips_locales: any = '';
  //Parametros
  timbrarSinInternet: string;
  timbrarConFoto: string = localStorage.getItem('timbrarConFoto');
  timbreFotoObligatoria: string = localStorage.getItem('opcional_obligatorio');
  //variables Foto
  imagen: string;
  storageUbica: string;
  public isConnected: any;
  showFallback = true;
  hasBiometricAuth = false;
  fechaHora: string;
  fecha: string = '';
  hora: string = '';
  observaciones: string = '';
  zonaHoraria: string = '';

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
    private userService: DataUserLoggedService,
    private fechaHoraService: FechaHoraService,
    public validar: ValidacionesService,

  ) { }

  ngOnInit() {
    this.VerificarFunciones();
    this.networkSubscriber();
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    this.id_usuario = localStorage.getItem('empleadoID');
    this.codigo = localStorage.getItem('codigo');
    this.nombre_usuario = localStorage.getItem('nom');
    this.apellido_usuario = this.apellido_usuario = localStorage.getItem('ap');
    this.nombreInfo_timbre = this.activateRoute.snapshot.paramMap.get('idTimbre')
    this.nombre_timbre = this.nombreInfo_timbre.toUpperCase();
    this.obtenerIdCelular();
    this.BuscarParametro();
    this.BuscarParametroTimbreUbicacionDesconocida();
    this.BuscarParametroTimbreConFoto();
    this.BuscarParametroTimbreSinInternet();
    this.fechaHoraService.fechaHora$.subscribe(async (fechaHora) => {
      this.fechaHora = (await fechaHora).fechaHora;
      this.fecha = (await fechaHora).fecha;
      this.hora = (await fechaHora).hora;
      this.zonaHoraria = (await fechaHora).zonaHoraria;
    });
  }

  private readonly IDENTIFICACION_BIOMETRICA = "B"
  private readonly NINGUNA_IDENTIFICACION = "N"
  private readonly IDENTIFICACION_DESACTIVADA = "D"

  cargandoPosicion = false;
  public nuevoTimbre: any = {
    tecla_funcion: "",
    codigo: "",
    observacion: "",
    latitud: "",
    longitud: "",
    id_reloj: 97,
    ubicacion: "",
    ip: "",
    ip_local: "",
    user_name: ""
  };

  pipe = new DatePipe('en-US');
  horaTransformada = this.pipe.transform(Date.now(), 'h:mm:ss a');
  fechaTransformada = this.pipe.transform(Date.now(), 'yyyy-MM-dd');
  id_usuario = "";
  codigo = "";
  nombre_usuario = "";
  apellido_usuario = "";
  nombre_timbre = "";
  nombreInfo_timbre = "";
  geoLatitude: number = 0;
  geoLongitude: number = 0;
  numeroCaracteres = 0;
  intentos: number = 0;
  modelo_dispositivo: string = "";
  conexion = true;
  novedades_conexion: string = "";

  // METODO PARA VERIFICAR LA CONEXION A INTERNET
  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
    if (!this.isConnected) {
      this.abrirToas('Por favor verifique su conexión a Internet', "danger", 3000, "middle");
      console.log('Desconectado');
      this.comprobarGPS();
    } else {
      this.comprobarGPS();
    }
  }

  // METODO PARA VERIFICAR LA UBICACION ACTIVADA
  async comprobarGPS() {
    Geolocation.checkPermissions().then(
      result => this.requestLocationPermission(),
    ).catch((error) => {
      this.abrirToas('Ups, al parecer no tiene activada la localización. Por favor, active el GPS.', "warning", 3000, "middle");
    });;
  }

  // METODO PARA SOLICITAR EL PERMISO DE UBICACION
  async requestLocationPermission() {
    try {
      // Solicitar permiso para acceder a la ubicación
      const status = await Geolocation.requestPermissions();

      if (status.location === 'granted') {

        this.obtenerPosicion()

      } else {
        this.abrirToas('Ups!!! Al parecer no ha otorgado el permiso de acceder a la ubicación al Reloj Virtual. Por favor vaya a las configuraciones de nuestra app y permita al Reloj Virtual acceder a su ubicación.', "danger", 3000, "middle");
      }
    } catch (error) {
      this.abrirToas('Ups!!! Al parecer no ha otorgado el permiso de acceder a la ubicación al Reloj Virtual. Por favor vaya a las configuraciones de nuestra app y permita al Reloj Virtual acceder a su ubicación.', "danger", 3000, "middle");
    }
  }

  // METODO PARA OBTENER LAS COORDENADAS
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
      this.abrirToas('Ups!!! No se ha obtenido coordenadas de ubicación.', "danger", 6000, "middle");
      console.log('No se pudo obtener la posicion:', error);
    });
  }

  // METODO PARA OBTENER LA INFORMACION DEL DISPOSITIVO
  obtenerIdCelular() {
    Device.getInfo().then((info) => {
      return this.modelo_dispositivo = info.model;
    }).catch((e) => {
      return this.modelo_dispositivo = "Desconocido";
    });

    Device.getId().then((id) => {
      return this.nuevoTimbre.dispositivo_timbre = id.identifier + '';
    }).catch((e) => {
      return this.nuevoTimbre.dispositivo_timbre = "Desconocido";
    });
  }

  // METODO PARA VERIFICAR LAS FUNCIONES DISPONIBLES
  funciones: any = [];
  VerificarFunciones() {
    this.restP.ObtenerFunciones().subscribe(res => {
      this.funciones = res;
      console.log("Ver funciones", res)
    });
  }

  //FIX ME
  // METODO PARA INICIAR CON EL PROCESO DE FOTO SEGUN LOS PARAMETROS
  async iniciarProcesoFoto() {

    if (localStorage.getItem('timbrarConFoto') == 'Si') {

      if (localStorage.getItem('opcional_obligatorio') == 'Si') {
        await this.tomarFoto()
          .then(() => {
            this.identificarUsuario();
          })
          .catch((error) => {
            this.abrirToas('No se pudo obtener la foto, timbre cancelado.', "warning", 2000, "middle");
          });
      } else {
        if (this.activarOpcion) {
          await this.tomarFoto()
            .then(() => {
              this.identificarUsuario();
            })
            .catch((error) => {
              this.abrirToas('No se pudo obtener la foto, timbre cancelado.', "warning", 2000, "middle");
            });
        } else {
          this.identificarUsuario();
        }
      }
    } else {
      console.log("ENTRA CON NO")
      this.identificarUsuario();
    }
  }

  // METODO PARA ABRIR LA CAMARA Y GUARDAR LA IMAGEN
  async tomarFoto() {
    const cameraPhoto = await Camera.getPhoto({
      quality: 100, // CALIDAD DE LA IMAGEN
      allowEditing: false, // PERMITE EDITAR LA IMAGEN
      resultType: CameraResultType.DataUrl, // TIPO DE RESULTADO (BASE64)
      correctOrientation: true, // CORREGIR ORIENTACIÓN DE LA IMAGEN
      source: CameraSource.Camera, // FUENTE DE LA IMAGEN (CÁMARA)
      direction: CameraDirection.Front, // DIRECCIÓN DE LA CÁMARA (FRONTAL) SOLO PARA IOS
      width: 600, // ANCHO DE LA IMAGEN
      height: 600, // ALTO DE LA IMAGEN
    });

    if (cameraPhoto.dataUrl) {
      this.imagen = await this.convertirBase64AWebP(cameraPhoto.dataUrl);
    } else {
      this.imagen = '';
    }
  }

  async convertirBase64AWebP(base64: string): Promise<string> {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const webpBase64 = canvas.toDataURL("image/webp", 0.9);
        resolve(webpBase64);
      };
      img.onerror = reject;
      img.src = base64;
    });
  }

  //METODO PARA VERIFICAR LA AUNTENTICACION POR HUELLA DACTILAR 
  async identificarUsuario() {
    await FingerprintAIO.isAvailable().then(() => {
      console.log(FingerprintAIO.BIOMETRIC_HARDWARE_NOT_SUPPORTED)

      //FIXME
      this.openAutenticacion();
    }).catch(() => {
      this.enviarTimbreSinAuth();
    });
  }

  // METODO PARA ABRIR EL COMPONENTE DE AUNTENTICACION POR HUELLA DACTILAR
  async openAutenticacion() {
    await FingerprintAIO.show(
      {
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
      }).catch((error: any) => {
        console.log(error);
        this.abrirToas('Ocurrió un error al autenticar del usuario. El timbre no se envió', "danger", 1000, "middle");
        this.intentos = this.intentos + 1;
        if (this.intentos == 2) {
          this.enviarTimbreAuthProble();

          this.intentos = 0;
        }
      }
      );
  }
  // METODO PARA ENVIAR TIMBRES SIN AUNTENTICACION
  async enviarTimbreSinAuth() {

    console.log("Entra AQUIII SIN AUNTENTICACION")
    const alert = await this.alertController.create({
      header: 'Autenticación no disponible',
      message: 'El timbre se enviará pero en su reporte de timbres se reflejará este particular.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        }, {
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

  // METODO PARA VERIFICAR LA AUNTENTICACION POR HUELLA DACTILAR
  async enviarTimbreAuthProble() {
    const alert = await this.alertController.create({
      header: 'Problema con la autenticación',
      message: 'Al parecer tiene problemas con la autenticación.\n ¿Desea enviar el timbre de todos modos?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        }, {
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
    const result = await Geolocation.checkPermissions();
    if (result.location === 'granted') {
      return true;
    } else {
      return false
    }
  }

  // METODO PARA ENVIAR EL TIMBRE SEGUN LOS PARAMETROS
  async enviarTimbre(ev?: any) {
    this.BuscarParametroTimbreSinInternet();
    this.BuscarParametroTimbreUbicacionDesconocida();
    //Comprobación de movil o navegador
    if (this.platform.is('hybrid')) {
      // Verificación del permiso de Ubicación
      await this.verificarPermisoLocation()
        .then(async () => {
          const status = await Geolocation.requestPermissions();
          if (status.location === 'granted') {
            this.BuscarParametroTimbreConFoto();
            this.iniciarProcesoFoto();
          } else {
            this.abrirToas('Ups, al parecer no ha otorgado el permiso de acceder a la ubicación al Reloj Virtual. Por favor vaya a las configuraciones de nuestra app y permita al Reloj Virtual acceder a su ubicación.', "danger", 6000, "middle");
          }
        }).catch((error) => {
          this.abrirToas('Ups!!! Debe activar la ubicación para enviar el timbre', "danger", 3000, "middle");
        });
    } else {
      //Navegador
      this.abrirToas('No se detecto autenticación, se guardara el timbre con esta observación.', "warning", 2000, "middle");
      this.nuevoTimbre.tipo_autenticacion = this.NINGUNA_IDENTIFICACION;
      this.BuscarParametroTimbreConFoto();
      this.iniciarProcesoFoto();
    }
  }

  // METODO PARA OBTENER LA ACCION DEL TIMBRE
  obtenerIdTipo(): string {
    switch (this.nombreInfo_timbre) {
      case "Inicio de jornada laboral":
        {
          this.nuevoTimbre.accion = "E";
          return "0";
        }
        break;

      case "Fin de jornada laboral":
        {
          this.nuevoTimbre.accion = "S";
          return "1";
        }
        break;

      case "Inicio de almuerzo":
        {
          this.nuevoTimbre.accion = "S/A";
          return "2";
        }
        break;

      case "Fin de almuerzo":
        {
          this.nuevoTimbre.accion = "E/A";
          return "3";
        }
        break;

      case "Inicio de permiso":
        {
          this.nuevoTimbre.accion = "S/P";
          return "4";
        }
        break;

      case "Fin de permiso":
        {
          this.nuevoTimbre.accion = "E/P";
          return "5";
        }
        break;

      case "Timbre abierto":
        {
          this.nuevoTimbre.accion = "HA";
          return "7";
        }
        break;

      default:
        break;
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
    this.numeroCaracteres = this.nuevoTimbre.observacion.length;
  }

  // METODO PARA GUARDA LA INFORMACION DEL TIMBRE EN LA BASE DE DATOS 
  guardarEnBDD() {
    this.nuevoTimbre.codigo = this.codigo;
    this.nuevoTimbre.fecha_hora_timbre = this.fechaHora;
    this.nuevoTimbre.zona_horaria_dispositivo = this.zonaHoraria;
    this.nuevoTimbre.tecla_funcion = this.obtenerIdTipo();
    this.nuevoTimbre.user_name = this.userService.username;
    this.nuevoTimbre.ip = localStorage.getItem('ip');
    this.nuevoTimbre.ip_local = this.ips_locales;

    this.nuevoTimbre.imagen = this.imagen;

    if (this.nuevoTimbre.accion === "HA" && this.nuevoTimbre.observacion === null) return this.abrirToas('Lo siento! Debes ingresar una observación antes de enviar un timbre abierto 😅', "danger", 5000, "middle");
    if (this.nuevoTimbre.accion === "HA" && this.nuevoTimbre.observacion === "") return this.abrirToas('Lo siento! Debes ingresar una observación antes de enviar un timbre abierto 😅', "danger", 5000, "middle");

    this.isConnected = this.networkService.getNetworkStatusDispositivo();

    if (this.isConnected == true) {

      this.nuevoTimbre.latitud = this.geoLatitude + "";
      this.nuevoTimbre.longitud = this.geoLongitude + "";
      this.nuevoTimbre.conexion = this.isConnected;
      this.nuevoTimbre.novedades_conexion = 'Sin problemas de conexión';

      this.ValidarModulo(this.geoLatitude, this.geoLongitude, this.rango, this.nuevoTimbre);
      console.log('paso validaciones de horario abierto');
    } else {
      if (localStorage.getItem('timbrarSinInternet') != 'Si') {
        console.log('entro aqui timbres sin conexion');
        if (this.geoLatitude != 0 || this.geoLongitude != 0) {
          this.nuevoTimbre.latitud = this.geoLatitude + "";
          this.nuevoTimbre.longitud = this.geoLongitude + "";
        } else {
          this.nuevoTimbre.latitud = "0";
          this.nuevoTimbre.longitud = "0";
        }
        this.nuevoTimbre.ubicacion = 'Sin Ubicación';
        this.storageUbica = this.nuevoTimbre.ubicacion;
        this.nuevoTimbre.conexion = this.isConnected;
        this.nuevoTimbre.novedades_conexion = 'Falló conexión al Internet';
        this.guardarTimbreStorage(this.nuevoTimbre);
        localStorage.setItem("storageUbicacion", this.storageUbica);
        return;
      } else {
        this.abrirToas('Timbre sin conexión a Internet. No Permitido', "danger", 5000, "middle");
        return this.router.navigate(['/login']);
      }
    }
  }

  //Metodo para guardar los timbres en la memoria del telefono cuando se pierde la conexion al Internet.
  guardarTimbreStorage(timbre: Timbre) {
    this.dataLocalService.guardarTimbre(timbre);
    console.log('timbre enviado, sin internet: ', timbre);
    this.navCtroller.navigateForward(['confirmaciontimbre'])//Abre la ventana de confirmacion de timbre enviado
  }

  //PARAMETROS
  // METODO QUE VALIDA LA TOLERANCIA DE LA UBICACION
  rango: any;
  BuscarParametro() {
    let datos = [];
    this.restP.ObtenerDetallesParametros(4).subscribe(
      res => {
        datos = res;
        console.log('Parametro Detalle: ', datos)
        if (datos.length != 0) {
          return this.rango = (parseInt(datos[0].descripcion));
        }
        else {
          return this.rango = 0.00
        }
      });
  }

  timbrarDesconocido: string;

  // METODO PARA VALIDAR EL PARAMETO DE TIMBRE CON UBICACION DESCONOCIDA
  BuscarParametroTimbreUbicacionDesconocida() {

    let buscar = {
      ids_empleados: [parseInt(localStorage.getItem("empleadoID"), 10)],
    };

    this.parametros.ObtenerDetalleParametroUsuario(buscar).subscribe(
      res => {
        const timbreFoto = res.respuesta[0].timbre_ubicacion_desconocida;
        console.log("ver parametro de ubicacion desconocida", timbreFoto);
        const resultado = timbreFoto ? 'Si' : 'No';
        localStorage.setItem('timbrarUbicacionDesconocida', resultado);
      },
      error => {
        console.log('Error 404 Not Found');
        localStorage.setItem('timbrarUbicacionDesconocida', 'No');
      }
    );
  }

  // METODO PARA VALIDAR EL PARAMETRO DEL EMPLEADO DE TIMBRE CON INTERNET REQUERIDO
  BuscarParametroTimbreSinInternet() {
    let buscar = {
      ids_empleados: [parseInt(localStorage.getItem("empleadoID"), 10)],
    };

    this.parametros.ObtenerDetalleParametroUsuario(buscar).subscribe(
      res => {
        console.log("ver si hay respuesta de parametros de usuario", res)

        const timbreFoto = res.respuesta[0].timbre_internet;
        console.log("ver parametro de internet", timbreFoto)

        const resultado = timbreFoto ? 'Si' : 'No';
        localStorage.setItem('timbrarSinInternet', resultado);
      },
      error => {
        console.log('Error 404 Not Found');
      });
  }

  // METODO PARA VALIDAR EL PARAMETRO DEL EMPLEADO DE TIMBRE CON FOTO
  BuscarParametroTimbreConFoto() {
    let buscar = {
      ids_empleados: [parseInt(localStorage.getItem("empleadoID"), 10)],
    };

    this.parametros.ObtenerDetalleParametroUsuario(buscar).subscribe(
      res => {
        const timbreFoto = res.respuesta[0].timbre_foto;
        const resultado = timbreFoto ? 'Si' : 'No';
        localStorage.setItem('timbrarConFoto', resultado);
        const resultado_opcional = res.respuesta[0].opcional_obligatorio ? 'Si' : 'No';
        this.timbrarConFoto = localStorage.getItem('timbrarConFoto')
        localStorage.setItem('opcional_obligatorio', resultado_opcional);
        this.timbreFotoObligatoria = localStorage.getItem('opcional_obligatorio');

      },
      error => {
        console.log('Error 404 Not Found');
      });
  }

  ubicacion: string = '';
  contar: number = 0;
  sin_ubicacion: number = 0;
  // MÉTODO QUE VERIFICAR SI EL TIMBRE FUE REALIZADO EN UN PERíMETRO DEFINIDO
  CompararCoordenadas(informacion: any, timbre: any, descripcion: any, data: any) {
    this.restP.ObtenerCoordenadas(informacion).subscribe(
      res => {
        console.log("datos de ObtenerCoordenadas", res)
        if (res[0].verificar === 'ok') {
          console.log("coordenadas OK")
          this.contar = this.contar + 1;
          this.ubicacion = descripcion;
          if (this.contar === 1) {
            timbre.ubicacion = this.ubicacion;
            this.storageUbica = timbre.ubicacion;
            this.abrirToas('Timbre realizado dentro del perímetro definido como ' + this.ubicacion + '.', "primary", 3000, "top");
            this.EnviarDatos(timbre);
          }
        }
        else {
          console.log("coordenadas NOOO")
          this.sin_ubicacion = this.sin_ubicacion + 1;
          if (this.sin_ubicacion === data.length) {

            console.log("SIN UBICACION")

            this.ValidarDomicilio(informacion, timbre);
          }
        }
      }, err => {
        if (localStorage.getItem('timbrarUbicacionDesconocida') == 'Si') {
          timbre.ubicacion = 'DESCONOCIDO';
          this.storageUbica = timbre.ubicacion;
          this.EnviarDatos(timbre);
        } else {
          this.abrirToas('Timbre con ubicación Desconocida. No Permitido', "danger", 5000, "middle");
          return this.router.navigate(['/login']);
        }
      }
    );
  }

  // MÉTODO QUE PERMITE VALIDACIONES DE UBICACIÓN
  BuscarUbicacion(latitud: any, longitud: any, rango: any, timbre: any) {
    var datosUbicacion: any = [];
    this.contar = 0;
    let informacion = {
      lat1: String(latitud),
      lng1: String(longitud),
      lat2: '',
      lng2: '',
      valor: rango
    }
    this.restP.ObtenerUbicacionUsuario(this.id_usuario).subscribe(
      res => {
        if (res.length != 0) {
          datosUbicacion = res;
          datosUbicacion.forEach((obj: any) => {
            informacion.lat2 = obj.latitud;
            informacion.lng2 = obj.longitud;
            this.CompararCoordenadas(informacion, timbre, obj.descripcion, datosUbicacion);

          })
          console.log('ver empleado....... ', res)
        }
        else {
          this.ValidarDomicilio(informacion, timbre);
        }
      }, () => {
        if (localStorage.getItem('timbrarUbicacionDesconocida') === 'Si') {
          timbre.ubicacion = 'DESCONOCIDO';
          this.storageUbica = timbre.ubicacion;
          this.EnviarDatos(timbre);
        } else {
          this.abrirToas('Timbre con ubicación Desconocida. No Permitido', "danger", 5000, "middle");
          return this.router.navigate(['/login']);
        }
      });
  }

  // METODO PARA VERIFICAR SI SE EL MODULO GEOLOCALIZACION
  ValidarModulo(latitud: any, longitud: any, rango: any, timbre: any) {
    console.log('--------- Validacion Modulo----------')

    if (this.funciones[0] === undefined) {
      console.log('Validad Modulo Funciones: ', this.funciones)
      timbre.ubicacion = 'DESCONOCIDO';
      this.storageUbica = timbre.ubicacion;
      this.EnviarDatos(timbre);
    } else {
      console.log("ver geoloca", this.funciones[0].geolocalizacion)
      if (this.funciones[0].geolocalizacion === true) {
        console.log('BuscarUbicacion validar Modulo------')
        this.BuscarUbicacion(latitud, longitud, rango, timbre);
      }
      else {
        console.log("ver si entra aquiiiiii")
        timbre.ubicacion = 'DESCONOCIDO';
        this.storageUbica = timbre.ubicacion;
        this.EnviarDatos(timbre);
      }
    }
  }

  // METODO PARA VALIDAR LAS COORDENADAD DEL DOMICILIO QUE ESTEN REGISTRADAS EN LA TABLA EMPLEADOS
  ValidarDomicilio(informacion: any, timbre: any) {

    this.restE.ObtenerUbicacion(this.id_usuario).subscribe(res => {
      if (res[0].longitud != null) {
        informacion.lat2 = res[0].latitud;
        informacion.lng2 = res[0].longitud;
        this.restP.ObtenerCoordenadas(informacion).subscribe(resu => {
          if (resu[0].verificar === 'ok') {
            timbre.ubicacion = 'DOMICILIO';
            this.storageUbica = timbre.ubicacion;
            this.abrirToas('Marcación realizada dentro del perímetro definido como DOMICILIO.', "primary", 3000, "top");
            this.EnviarDatos(timbre);
          }
          else {
            if (localStorage.getItem('timbrarUbicacionDesconocida') == 'Si') {
              timbre.ubicacion = 'DESCONOCIDO';
              this.storageUbica = timbre.ubicacion;
              this.abrirToas('Marcación realizada dentro de un perímetro DESCONOCIDO.', "primary", 3000, "top");
              this.EnviarDatos(timbre);
            } else {
              this.abrirToas('Timbre con ubicación Desconocida. No Permitido', "danger", 5000, "middle");
              return this.router.navigate(['/login']);
            }
          }

        }, err => {

          console.log('SIN COORDENADAS DE DOMICILIO ------')

          if (localStorage.getItem('timbrarUbicacionDesconocida') == 'Si') {

            timbre.ubicacion = 'DESCONOCIDO';
            this.storageUbica = timbre.ubicacion;
            this.EnviarDatos(timbre);

          } else {
            this.abrirToas('Timbre con ubicación Desconocida. No Permitido', "danger", 5000, "middle");
            return this.router.navigate(['/login']);

          }
        });
      }
      else {

        console.log("no tiene longitud")
        if (localStorage.getItem('timbrarUbicacionDesconocida') == 'Si') {
          timbre.ubicacion = 'DESCONOCIDO';
          this.storageUbica = timbre.ubicacion;
          this.abrirToas('Marcación realizada dentro de un perímetro DESCONOCIDO.', "primary", 3000, "top");
          this.EnviarDatos(timbre);
        } else {
          this.abrirToas('Timbre con ubicación Desconocida. No Permitido', "danger", 5000, "middle");
          return this.router.navigate(['/login']);

        }

      }

    }, err => {

      if (localStorage.getItem('timbrarUbicacionDesconocida') == 'Si') {
        timbre.ubicacion = 'DESCONOCIDO';
        this.storageUbica = timbre.ubicacion;
        this.GuardartimbresinServidor(timbre);
      } else {
        this.abrirToas('Timbre con ubicación Desconocida. No Permitido', "danger", 5000, "middle");

        return this.router.navigate(['/login']);

      }
    })

  }

  // METODO PARA ENVIAR DATOS DEL TIMBRE MEDIANTE EL SERVICIO
  EnviarDatos(data) {
    localStorage.setItem("storageUbicacion", this.storageUbica);

    console.log("ver datos de enviarTimbre", data);
    this.relojService.enviarTimbre(data).pipe(timeout(5000)).subscribe(
      res => {
        console.log('ver respuesta', res.message);
        this.navCtroller.navigateForward(['confirmaciontimbre'], {
          queryParams: {
            data: JSON.stringify(data)
          }
        });
      },
      () => {
        this.GuardartimbresinServidor(data);
        this.abrirToas('Error con la conexión al servidor. El timbre se guardo en memoria del teléfono', "danger", 3000, "middle");
      }
    ), error => {
      this.GuardartimbresinServidor(data);
      this.abrirToas('Problemas con el servidor', "danger", 5000, "middle");

    };

  }

  // METODO PARA ALMACENAR LOS TIMBRES SIN CONEXION AL SERVIDOR
  GuardartimbresinServidor(data) {
    console.log('Error con la conexión al servidor. El timbre se guardó en memoria del teléfono', data);
    data.conexion = false;
    data.novedades_conexion = 'Falló conexión al servidor';
    this.nuevoTimbre.conexion = data.conexion;
    this.nuevoTimbre.novedades_conexion = data.novedades_conexion;
    this.dataLocalService.guardarTimbresPerdidos(data);
    this.navCtroller.navigateForward(['confirmaciontimbre']);
  }

  // METODO PARA DEFIRNIR LOS TOAST
  async abrirToas(mensaje: string, color: string, duracion: number, position: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      position: position
    });
    toast.present();
  }

  activarOpcion: boolean = false;
  toggleChanged(event: any) {
    this.activarOpcion = event.detail.checked;
    if (this.activarOpcion) {
      console.log('El interruptor está activado');
    } else {
      console.log('El interruptor está desactivado');
    }
  }

}
