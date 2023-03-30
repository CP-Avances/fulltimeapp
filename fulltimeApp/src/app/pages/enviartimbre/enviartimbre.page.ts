import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, AlertController } from '@ionic/angular';
import { Platform, PopoverController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

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


@Component({
  selector: 'app-enviartimbre',
  templateUrl: './enviartimbre.page.html',
  styleUrls: ['./enviartimbre.page.scss'],
})
export class EnviartimbrePage implements OnInit {

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
  ) {}

  ngOnInit() {
    this.VerificarFunciones();
    this.networkSubscriber();
    this.id_usuario = parseInt(localStorage.getItem('codigo'));
    this.nombre_usuario = localStorage.getItem('nom');
    this.apellido_usuario = this.apellido_usuario = localStorage.getItem('ap');
    this.nombreInfo_timbre = this.activateRoute.snapshot.paramMap.get('idTimbre')
    this.nombre_timbre = this.nombreInfo_timbre.toUpperCase();

    this.obtenerIdCelular();
    this.BuscarParametro();
    // this.BuscarUbicacion(this.id_usuario);
  }

  private readonly IDENTIFICACION_BIOMETRICA = "B"
  private readonly NINGUNA_IDENTIFICACION = "N"
  private readonly IDENTIFICACION_DESACTIVADA = "D"

  cargandoPosicion = false;
  public nuevoTimbre: Timbre = {
    tecl_funcion: "",
    id_empleado: 0,
    observacion: "",
    latitud: "",
    longitud: "",
    id_reloj: 97,
    ubicacion: "",
  };

  pipe = new DatePipe('en-US');
  horaTransformada = this.pipe.transform(Date.now(), 'h:mm:ss a');
  fechaTransformada = this.pipe.transform(Date.now(), 'yyyy-MM-dd');
  id_usuario = 0;
  nombre_usuario = "";
  apellido_usuario = "";
  nombre_timbre = "";
  nombreInfo_timbre = "";
  geoLatitude: number = 0;
  geoLongitude: number = 0;
  numeroCaracteres = 0;
  intentos: number = 0;
  modelo_dispositivo:string = "";
  conexion = true;
  novedades_conexion: string = "";
  
  networkSubscriber(){
    this.networkService.getNetworkStatus().subscribe((connected: boolean) => {
      this.isConnected = connected;
      if(!this.isConnected){
        this.abrirToas('Por favor verifique su conexión a Internet', "danger", 3000, "bottom");
        console.log('Desconectado');
        this.geoLatitude = 0;
        this.geoLongitude = 0;
      }else{
        console.log('conectado');
        if (this.platform.is('capacitor')) {
          console.log('entra 1')
          this.comprobarGPS();
        }
        else {
          console.log('entra 2')
          this.obtenerPosicion();
        }
      }
    });
  }

  //UBICACION
  async comprobarGPS() {
    const checkPermissions = async () => {
      const permiso = await Geolocation.checkPermissions().then((isAvailable) => {
        if (isAvailable){
          this.obtenerPosicion();
        }else{
          if (this.isConnected) {
            this.abrirToas('Ups, al parecer no tiene activada la localización. Por favor, active el GPS.', "warning", 3000, "bottom");
          }
        }
      }).catch(
        (e) => console.error(e)
      )
    }

    return checkPermissions();
  }

  async obtenerPosicion() {
    this.cargandoPosicion = true;
      await Geolocation.getCurrentPosition().then((resp) => {
        this.geoLongitude = resp.coords.longitude;
        this.geoLatitude = resp.coords.latitude;
        this.cargandoPosicion = false;
      }).catch((error) => {
        this.cargandoPosicion = false;
        this.abrirToas('Ups, al parecer no ha otorgado el permiso de acceder a la ubicación al Reloj Virtual. Por favor vaya a las configuraciones de nuestra app y permita al Reloj Virtual acceder a su ubicación.', "danger", 6000, "bottom");
        console.log('No se pudo obtener la posicion:', error);
      });
  }
  //FIN UBICACION

  //obtener ID de celular, para identificar en que celular timbró
  obtenerIdCelular() {
    Device.getInfo().then((info) => {
      return this.modelo_dispositivo = info.model;
    }).catch((e) =>{
      return this.modelo_dispositivo = "Desconocido";
    });

    Device.getId().then((id) => {
      return this.nuevoTimbre.dispositivo_timbre = id.uuid+'';
    }).catch((e) =>{
      return this.nuevoTimbre.dispositivo_timbre = "Desconocido";
    });
  }

  funciones: any = [];
  VerificarFunciones() {
    this.restP.ObtenerFunciones().subscribe(res => {
      this.funciones = res;
    });
  }

  //Inicio autenticarse mediante biometrico
  async identificarUsuario() {
    await FingerprintAIO.isAvailable().then(() => {
      console.log(FingerprintAIO.BIOMETRIC_HARDWARE_NOT_SUPPORTED)
      this.openAutenticacion();
    }).catch(() => {
      this.enviarTimbreSinAuth();
    });
  }
  
  async openAutenticacion(){
    await FingerprintAIO.show(
      {
        disableBackup: false, 
        title: 'Comprobando', 
        fallbackButtonTitle: 'PIN', 
        subtitle: 'Es necesario autenticarse para envíar el timbre',
        description: 'Casa Pazmiño S.A' 
      }).then((resul: any) => {
        if(resul){
          console.log('verified: ',resul.verified);
          this.nuevoTimbre.tipo_autenticacion = this.IDENTIFICACION_BIOMETRICA;
          this.guardarEnBDD();
        }
      }).catch((error: any) => {
        console.log(error);
        this.abrirToas('Ocurrió un error al autenticar del usuario. El timbre no se envío', "danger", 1000, "bottom");
        this.intentos = this.intentos + 1;
        if(this.intentos == 2){
          this.enviarTimbreAuthProble();
          this.intentos = 0;
        }
      }
    );
  }
  //Fin autenticarse mediante biometrico 

  //mostrar Alerta que pregunta si enviar timbre sin autenticarse
  async enviarTimbreSinAuth() {
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
            this.nuevoTimbre.tipo_autenticacion=this.IDENTIFICACION_DESACTIVADA;
            this.guardarEnBDD();
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
      header: 'Problema con la autenticacion',
      message: 'Al parecer tiene problemas con la autenticacion.\n ¿Desea enviar el timbre de todos modos?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        }, {
          text: 'Listo',
          handler: () => {
            this.nuevoTimbre.tipo_autenticacion=this.NINGUNA_IDENTIFICACION;
            this.guardarEnBDD();
          }
        }
      ]
    });
    await alert.present();
  }//fin mostrar Alerta

  enviarTimbre(ev?: any) {
    //comprueba si estamos en un emulador o PC para envíar el timbre
    if ((this.platform.is('ios')) || (this.platform.is('android')) || (this.platform.is('capacitor'))) {
      this.identificarUsuario();
    }
    else {
      this.abrirToas('No se detecto autenticación, se guardara el timbre con esta observación.', "warning", 2000, "bottom");
      this.nuevoTimbre.tipo_autenticacion = this.NINGUNA_IDENTIFICACION;
      this.guardarEnBDD();
    }

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
          return "6";
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
    this.nuevoTimbre.id_empleado = this.id_usuario;
    this.nuevoTimbre.tecl_funcion = this.obtenerIdTipo();
    this.nuevoTimbre.fec_hora_timbre = this.fechaTransformada + " " + this.horaTransformada;

    if (this.nuevoTimbre.accion === "HA" && this.nuevoTimbre.observacion === null) return this.abrirToas('Lo siento! Debes ingresar una observación antes de enviar un timbre abierto 😅', "danger", 5000, "bottom");
    if (this.nuevoTimbre.accion === "HA" && this.nuevoTimbre.observacion === "") return this.abrirToas('Lo siento! Debes ingresar una observación antes de enviar un timbre abierto 😅', "danger", 5000, "bottom");

    if (this.isConnected == true) {
      if (this.geoLatitude == 0) return this.abrirToas('Ups, Debe activar la ubicacion para enviar el timbre', "success", 1000, "bottom");

      this.nuevoTimbre.latitud = this.geoLatitude + "";
      this.nuevoTimbre.longitud = this.geoLongitude + "";
      this.nuevoTimbre.conexion = this.isConnected;
      this.nuevoTimbre.novedades_conexion = 'Sin problemas de conexion';
      this.ValidarModulo(this.geoLatitude, this.geoLongitude, this.rango, this.nuevoTimbre);
      console.log('paso validaciones de horario abierto');
    } else {
      //Proceso de almacenamiento de informacion del timbre cuendo no tiene conexion al Internet.
      console.log('entro aqui timbres sin conexion');
      if(this.geoLatitude != 0 || this.geoLongitude != 0){
        this.nuevoTimbre.latitud = this.geoLatitude + "";
        this.nuevoTimbre.longitud = this.geoLongitude + "";
      }else{
        this.nuevoTimbre.latitud = "0";
        this.nuevoTimbre.longitud = "0";
      }

      this.nuevoTimbre.ubicacion = 'Sin Ubicacion';
      this.storageUbica = this.nuevoTimbre.ubicacion;
      this.nuevoTimbre.conexion = this.isConnected;
      this.nuevoTimbre.novedades_conexion = 'Fallo conexion al Internet';
      this.guardarTimbreStorage(this.nuevoTimbre);
      localStorage.setItem("storageUbicacion", this.storageUbica);
      return;
    }

  }

  //Metodo para guardar los timbres en la memoria del telefono cuando se pierde la conexion al Internet.
  guardarTimbreStorage(timbre: Timbre) {
    this.dataLocalService.guardarTimbre(timbre);
    console.log('timbre enviado, sin internet: ',timbre);
    this.navCtroller.navigateForward(['confirmaciontimbre'])//Abre la ventana de confirmacion de timbre enviado
  }

  //Metodo que valida la tolerancia de la ubicacion, de la tabla tipo de parametro,
  rango: any;
  BuscarParametro() {
    // id_tipo_parametro PARA RANGO DE UBICACIÓN = 22
    let datos = [];
    this.restP.ObtenerDetallesParametros(22).subscribe(
      res => {
        datos = res;
        console.log('Parametro Detalle: ',datos)
        if (datos.length != 0) {
          return this.rango = ((parseInt(datos[0].descripcion) * (0.0048)) / 500) //0.006719999999999999 - DOMICILIO
        }
        else {
          return this.rango = 0.00
        }
    });
  }

  ubicacion: string = '';
  contar: number = 0;
  sin_ubicacion: number = 0;
  // MÉTODO QUE VERIFICAR SI EL TIMBRE FUE REALIZADO EN UN PERíMETRO DEFINIDO
  CompararCoordenadas(informacion: any, timbre: any, descripcion: any, data: any) {
    this.restP.ObtenerCoordenadas(informacion).subscribe(
      res => {
        if (res[0].verificar === 'ok') {
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
          this.sin_ubicacion = this.sin_ubicacion + 1;
          if (this.sin_ubicacion === data.length) {
            this.ValidarDomicilio(informacion, timbre);
          }
        }
    },err => {
      this.storageUbica = "DESCONOCIDO";
      this.EnviarDatos(timbre);
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
        console.log('Obteniendo Ubicacion ------')
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
      timbre.ubicacion = 'DESCONOCIDO';
      this.storageUbica = timbre.ubicacion;
      this.EnviarDatos(timbre);
    });
  }


  ValidarModulo(latitud: any, longitud: any, rango: any, timbre: any) {
    console.log('--------- Validacion Modulo----------')

    if(this.funciones[0] === undefined){
      //Fallo conexion al Servidor
      console.log('Validad Modulo Funciones: ', this.funciones)
      timbre.ubicacion = 'DESCONOCIDO';
      this.storageUbica = timbre.ubicacion;
      this.EnviarDatos(timbre);
      //this.navCtroller.navigateForward(['confirmaciontimbre'])
    }else{
      //Sin fallos en el serividor y red
      if (this.funciones[0].geolocalizacion === true) {
        console.log('BuscarUbicacion validar Modulo------')
        this.BuscarUbicacion(latitud, longitud, rango, timbre);
      }
      else {
        //Fallo conexion al Servidor
        timbre.ubicacion = 'DESCONOCIDO';
        this.storageUbica = timbre.ubicacion;
        this.EnviarDatos(timbre);
      }
    }
    
  }

  ValidarDomicilio(informacion: any, timbre: any) {
    console.log('ValidarDomicilio ------')

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
            timbre.ubicacion = 'DESCONOCIDO';
            this.storageUbica = timbre.ubicacion;
            this.abrirToas('Marcación realizada dentro de un perímetro DESCONOCIDO.', "primary", 3000, "top");
            this.EnviarDatos(timbre);
          }

        }, err =>{
          timbre.ubicacion = 'DESCONOCIDO';
          this.storageUbica = timbre.ubicacion;
          this.EnviarDatos(timbre);
        });
      }
      else {
        timbre.ubicacion = 'DESCONOCIDO';
        this.storageUbica = timbre.ubicacion;
        this.abrirToas('Marcación realizada dentro de un perímetro DESCONOCIDO.', "primary", 3000, "top");
        this.EnviarDatos(timbre);
      }

    }, err => {
      timbre.ubicacion = 'DESCONOCIDO';
      this.storageUbica = timbre.ubicacion;
      this.GuardartimbresinServidor(timbre);
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
        this.abrirToas('Error con la conexión al servidor. El timbre se guardo en memoria del telefono', "danger", 5000, "bottom");
      }
    ),error =>{
      this.GuardartimbresinServidor(data);
      this.abrirToas('Problemas con el servidor', "danger", 5000, "bottom");

    };

  }

  GuardartimbresinServidor(data){
    console.log('Error con la conexión al servidor. El timbre se guardo en memoria del telefono', data);
    data.conexion = false;
    data.novedades_conexion = 'Fallo conexion al servidor';
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
