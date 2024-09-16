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



@Component({
  selector: 'app-enviartimbre',
  templateUrl: './enviartimbre.page.html',
  styleUrls: ['./enviartimbre.page.scss'],
})
export class EnviartimbrePage implements OnInit {


  //Parametros
  timbrarSinInternet: string;
  timbrarConFoto: string;

  //variables Foto
  imagen: string;


  storageUbica: string;
  public isConnected: any;

  showFallback = true;
  hasBiometricAuth = false;

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
  ) { }

  ngOnInit() {
    this.VerificarFunciones();
    this.networkSubscriber();
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
  }

  private readonly IDENTIFICACION_BIOMETRICA = "B"
  private readonly NINGUNA_IDENTIFICACION = "N"
  private readonly IDENTIFICACION_DESACTIVADA = "D"

  cargandoPosicion = false;
  public nuevoTimbre: Timbre = {
    tecla_funcion: "",
    codigo: "",
    observacion: "",
    latitud: "",
    longitud: "",
    id_reloj: 97,
    ubicacion: "",
    ip: "",
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

  //UBICACION
  async comprobarGPS() {
      const permiso = await Geolocation.checkPermissions().then(() => {
        this.obtenerPosicion();
      })
      .catch((error) => {
        this.abrirToas('Ups, al parecer no tiene activada la localización. Por favor, active el GPS.', "warning", 3000, "middle");
      });
      return permiso;
  }0


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
      this.abrirToas('Ups, al parecer no ha otorgado el permiso de acceder a la ubicación al Reloj Virtual. Por favor vaya a las configuraciones de nuestra app y permita al Reloj Virtual acceder a su ubicación.', "danger", 6000, "middle");
      console.log('No se pudo obtener la posicion:', error);
    });
  }
  //FIN UBICACION

  //obtener ID de celular, para identificar en que celular timbró
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

  funciones: any = [];
  VerificarFunciones() {
    this.restP.ObtenerFunciones().subscribe(res => {
      this.funciones = res;

      console.log("Ver funciones", res)
    });
  }


  async iniciarProcesoFoto() {
    console.log("ENTRA A iniciarProcesoFoto")
    if (localStorage.getItem('timbrarConFoto') == 'Si') {
      console.log("ENTRA CON SI")
      await this.tomarFoto()
        .then(() => {
          this.identificarUsuario();
        })
        .catch((error) => {
          this.abrirToas('No se pudo obtener la foto, timbre cancelado.', "warning", 2000, "middle");
        });
    } else {
      console.log("ENTRA CON NO")
      this.identificarUsuario();
    }
  }


  async tomarFoto() {
    const cameraPhoto = await Camera.getPhoto({
      quality: 0.9,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      correctOrientation: true,
      source: CameraSource.Camera,
      direction: CameraDirection.Front,
      width: 1200,
      height: 1200,
    });
    if (cameraPhoto.dataUrl) {
      this.imagen = cameraPhoto.dataUrl;
    } else {
      this.imagen = "";
    }
  }

  //Inicio autenticarse mediante biometrico
  async identificarUsuario() {
    await FingerprintAIO.isAvailable().then(() => {
      console.log(FingerprintAIO.BIOMETRIC_HARDWARE_NOT_SUPPORTED)

      //FIXME
      this.openAutenticacion();
    }).catch(() => {
      this.enviarTimbreSinAuth();
    });
  }

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
  //Fin autenticarse mediante biometrico 

  //mostrar Alerta que pregunta si enviar timbre sin autenticarse
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
            //this.BuscarParametroTimbreConFoto();
            //this.iniciarProcesoFoto();
          }
        }
      ]
    });
    await alert.present();
  }
  //FIN mostrar Alerta

  //mostrar Alerta que pregunta si enviar timbre sin autenticarse porque hay un problema para autenticarse
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
            //this.BuscarParametroTimbreConFoto()
            //this.iniciarProcesoFoto();
          }
        }
      ]
    });
    await alert.present();
  }//fin mostrar Alerta

  async verificarPermisoLocation(): Promise<boolean> {
    const result = await Geolocation.checkPermissions();
    if (result.location === 'granted') {
      return true;
    } else {
      return false
    }
  }


  async enviarTimbre(ev?: any) {
    //comprueba si estamos en un emulador o PC para envíar el timbre
    this.BuscarParametroTimbreSinInternet();
    this.BuscarParametroTimbreUbicacionDesconocida();

    await this.verificarPermisoLocation()
      .then(() => {
        if ((this.platform.is('ios')) || (this.platform.is('android')) || (this.platform.is('capacitor'))) {
          console.log("Entrando en TIMBRES VER")

          //this.identificarUsuario();

          this.BuscarParametroTimbreConFoto();
          this.iniciarProcesoFoto();
        }
        else {
          console.log("Entrando en web")
          this.abrirToas('No se detecto autenticación, se guardara el timbre con esta observación.', "warning", 2000, "middle");
          this.nuevoTimbre.tipo_autenticacion = this.NINGUNA_IDENTIFICACION;
          this.BuscarParametroTimbreConFoto();
          this.iniciarProcesoFoto();
        }

      }).catch((error) => {
        this.abrirToas('Ups, Debe activar la ubicación para enviar el timbre', "danger", 3000, "middle");

      });
  }

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




  obtenerIdTipoTresBotones(): string {
    switch (this.nombreInfo_timbre) {
      case "Inicio de jornada laboral":
        {
          this.nuevoTimbre.accion = "EoS";
          return "0";
        }
        break;

      case "Fin de jornada laboral":
        {
          this.nuevoTimbre.accion = "EoS";
          return "0";
        }
        break;

      case "Inicio de almuerzo":
        {
          this.nuevoTimbre.accion = "AES";
          return "1";
        }
        break;

      case "Fin de almuerzo":
        {
          this.nuevoTimbre.accion = "AES";
          return "1";
        }
        break;

      case "Inicio de permiso":
        {
          this.nuevoTimbre.accion = "PES";
          return "2";
        }
        break;

      case "Fin de permiso":
        {
          this.nuevoTimbre.accion = "PES";
          return "2";
        }
        break;

      case "Timbre abierto":
        {
          this.nuevoTimbre.accion = "HA";
          return "6";
        }
        break;

      default:
        break;
    }
  }

  //refrescar la pagina
  refrescoEspecial() {
    this.cargandoPosicion = false;
    this.geoLatitude = 0;
    this.geoLongitude = 0;
    this.comprobarGPS();
  }

  ionChange() {
    this.numeroCaracteres = this.nuevoTimbre.observacion.length;
  }


  //Metodo que guarda el timbre en la base de datos en la tabla timbres.
  guardarEnBDD() {
    this.nuevoTimbre.codigo = this.codigo;
    //this.nuevoTimbre.tecla_funcion = this.obtenerIdTipo();
    this.nuevoTimbre.fecha_hora_timbre = this.fechaTransformada + " " + this.horaTransformada;
    this.nuevoTimbre.tecla_funcion = this.obtenerIdTipo();
    this.nuevoTimbre.user_name = this.userService.username;
    this.nuevoTimbre.ip = localStorage.getItem('ip');
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
      //SIN INTERNET
      //Proceso de almacenamiento de informacion del timbre cuendo no tiene conexion al Internet.
      if (localStorage.getItem('timbrarSinInternet') == 'Si') {

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
  //Metodo que valida la tolerancia de la ubicacion, de la tabla tipo de parametro,
  rango: any;
  BuscarParametro() {
    // id_tipo_parametro PARA RANGO DE UBICACION = 4
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

  BuscarParametroTimbreUbicacionDesconocida() {
    // id_tipo_parametro PARA PERMITIR TIMBRE UBICACION DESCONOCIDA = 4
    this.parametros.ObtenerDetallesParametros(5).subscribe(
      res => {

        this.timbrarDesconocido = res[0].descripcion;
        localStorage.setItem('timbrarUbicacionDesconocida', res[0].descripcion);

        console.log("ver parametro ubicacion desconocidad:", this.timbrarDesconocido)
      });
  }

  BuscarParametroTimbreSinInternet() {

    this.parametros.ObtenerDetallesParametros(13).subscribe(
      res => {
        localStorage.setItem('timbrarSinInternet', res[0].descripcion);
      });
  }

  BuscarParametroTimbreConFoto() {
    // id_tipo_parametro PARA TIMBRAR CON FOTO = 14
    this.parametros.ObtenerDetallesParametros(14).subscribe(
      res => {
        localStorage.setItem('timbrarConFoto', res[0].descripcion);
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

    //Usa el servicio de buscar coordenadas del usuario
    this.restP.ObtenerUbicacionUsuario(this.id_usuario).subscribe(
      res => {
        console.log('Obteniendo Ubicacion de Usuario ------', res)
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
          console.log("entra aqui??? si")
          timbre.ubicacion = 'DESCONOCIDO';
          this.storageUbica = timbre.ubicacion;
          this.EnviarDatos(timbre);
        } else {

          console.log("entra aqui??? no")

          this.abrirToas('Timbre con ubicación Desconocida. No Permitido', "danger", 5000, "middle");

          return this.router.navigate(['/login']);


        }
      });
  }

  ValidarModulo(latitud: any, longitud: any, rango: any, timbre: any) {
    console.log('--------- Validacion Modulo----------')

    if (this.funciones[0] === undefined) {
      //Fallo conexion al Servidor
      console.log('Validad Modulo Funciones: ', this.funciones)
      timbre.ubicacion = 'DESCONOCIDO';
      this.storageUbica = timbre.ubicacion;
      this.EnviarDatos(timbre);
      //this.navCtroller.navigateForward(['confirmaciontimbre'])
    } else {
      console.log("ver geoloca", this.funciones[0].geolocalizacion)
      //Sin fallos en el servidor y red
      if (this.funciones[0].geolocalizacion === true) {
        console.log('BuscarUbicacion validar Modulo------')
        this.BuscarUbicacion(latitud, longitud, rango, timbre);
      }
      else {
        //Fallo conexion al Servidor
        console.log("ver si entra aquiiiiii")
        timbre.ubicacion = 'DESCONOCIDO';
        this.storageUbica = timbre.ubicacion;
        this.EnviarDatos(timbre);
      }
    }
  }

  ValidarDomicilio(informacion: any, timbre: any) {
    console.log('ValidarDomicilio ------')

    this.restE.ObtenerUbicacion(this.id_usuario).subscribe(res => {
      console.log('OBTENER UBICACION ------')

      if (res[0].longitud != null) {

        console.log('TIENE LONGITUD ------')

        informacion.lat2 = res[0].latitud;
        informacion.lng2 = res[0].longitud;
        this.restP.ObtenerCoordenadas(informacion).subscribe(resu => {

          console.log('COORDENADAS DE DOMICILIO ------')

          if (resu[0].verificar === 'ok') {

            console.log('COORDENADAS DE DOMICILIO  OK------')

            timbre.ubicacion = 'DOMICILIO';
            this.storageUbica = timbre.ubicacion;
            this.abrirToas('Marcación realizada dentro del perímetro definido como DOMICILIO.', "primary", 3000, "top");
            this.EnviarDatos(timbre);
          }
          else {
            console.log('COORDENADAS DE DOMICILIO  NOOOOOOOO------')


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

  EnviarDatos(data) {
    localStorage.setItem("storageUbicacion", this.storageUbica);
    console.log('Ubicacion storage: ', localStorage.getItem("storageUbicacion"))
    this.relojService.enviarTimbre(data).subscribe(
      res => {
        console.log('ver respuesta', res.message);
        this.navCtroller.navigateForward(['confirmaciontimbre']);
      },
      () => {
        this.GuardartimbresinServidor(data);
        this.abrirToas('Error con la conexión al servidor. El timbre se guardo en memoria del teléfono', "danger", 5000, "middle");
      }
    ), error => {
      this.GuardartimbresinServidor(data);
      this.abrirToas('Problemas con el servidor', "danger", 5000, "middle");

    };

  }

  GuardartimbresinServidor(data) {
    console.log('Error con la conexión al servidor. El timbre se guardó en memoria del teléfono', data);
    data.conexion = false;
    data.novedades_conexion = 'Falló conexión al servidor';
    this.nuevoTimbre.conexion = data.conexion;
    this.nuevoTimbre.novedades_conexion = data.novedades_conexion;
    this.dataLocalService.guardarTimbresPerdidos(data);
    this.navCtroller.navigateForward(['confirmaciontimbre']);
  }


  async abrirToas(mensaje: string, color: string, duracion: number, position: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      position: position
    });
    toast.present();
  }

}
