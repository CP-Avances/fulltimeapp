import { Component, OnInit } from '@angular/core';
import { RelojServiceService } from "src/app/services/reloj-service.service";
import { NavController, ToastController, Platform, AlertController } from "@ionic/angular";
import { Usuario, UsuarioValueDefault } from 'src/app/interfaces/Usuario';
import { IdDispositivos } from 'src/app/interfaces/Usuario';
import { ParametrosService } from 'src/app/services/parametros.service';
import { Device } from '@capacitor/device';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { Md5 } from 'ts-md5/dist/md5';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  iniciandoSesion = false;
  aceptaTerminos: boolean = false; // Inicialización predeterminada

  user = {
    nombre_usuario: "",
    pass: ""
  }

  iddispositivos: IdDispositivos[] = [];

  usuarioObtenido: Usuario = UsuarioValueDefault;

  verPassword = false;

  id_celular: any;
  dispositi: any;

  constructor(
    private relojService: RelojServiceService,
    private navCtroller: NavController,
    public toastController: ToastController,
    public alertController: AlertController,
    public parametros: ParametrosService,
    public platform: Platform,
    private userService: DataUserLoggedService,

  ) { }
  mostrarCheckboxInicialmente: boolean;

  ionViewWillEnter() {
    this.infoDispositivo();

  }

  ngOnInit() {

    this.obtenerInfoTerminosCondiciones();
    this.BuscarParametroTimbreSinInternet();
    this.BuscarParametroTimbreConFoto();
    this.BuscarParametroTimbreUbicacionDesconocida();

    if (!this.relojService.esPrimeraVez()) {
      this.navCtroller.navigateForward(['inicio']);
    } else if (this.relojService.estaLogueado() && this.relojService.existeRol()) {
     
        this.navCtroller.pop();
        this.navCtroller.navigateRoot(['reloj']);
  
    }

  }

  rango_dispositivos: any;


  BuscarParametroTimbreSinInternet() {

    this.parametros.ObtenerDetallesParametros(13).subscribe(
      res => {
        console.log("ver parametro sin internet:", res[0])
        localStorage.setItem('timbrarSinInternet', res[0].descripcion);
      });
  }

  BuscarParametroTimbreConFoto() {

    this.parametros.ObtenerDetallesParametros(14).subscribe(
      res => {
        console.log("ver parametro sin internet:", res[0])
        localStorage.setItem('timbrarConFoto', res[0].descripcion);
      });
  }

  BuscarParametroTimbreUbicacionDesconocida() {
    // id_tipo_parametro PARA PERMITIR TIMBRE UBICACION DESCONOCIDA = 4
    this.parametros.ObtenerDetallesParametros(5).subscribe(
      res => {

        localStorage.setItem('timbrarUbicacionDesconocida', res[0].descripcion);
      });
  }


  //Aqui

  infoDispositivo() {
    Device.getId().then((id) => {
      this.id_celular = id.identifier;
    });
    Device.getInfo().then((info) => {
      this.dispositi = info.model;
    });
  }

  obtenerInfoTerminosCondiciones() {
    this.infoDispositivo();
    Device.getId().then((id) => {
      this.relojService.obtenerDispositivoPorID(id.identifier).subscribe(
        dispositivos => {
          if (dispositivos.terminos_condiciones!=null) {
            this.aceptaTerminos = dispositivos.terminos_condiciones;
            this.mostrarCheckboxInicialmente = this.aceptaTerminos;
          } else {
            this.aceptaTerminos = false;
          }
          console.log("TERMINOS Y CONDICIONES", this.aceptaTerminos);
        }, error => {
          this.aceptaTerminos = false;
          console.log("TERMINOS Y CONDICIONES", this.aceptaTerminos);
        }
      )
    });

  }

  mostrarPassword(): void {
    this.verPassword = !this.verPassword;
  }



  BuscarParametroNumeroDispositivos() {
    let datos = [];
    this.parametros.ObtenerDetallesParametros(6).subscribe(
      res => {

        console.log("ver parametro:", res)
        datos = res;
        if (datos.length != 0) {
          return this.rango_dispositivos = (parseInt(datos[0].descripcion));
        } else {
          return this.rango_dispositivos = 1;
        }
      });


  }

  iniciarSesion1() {
    this.infoDispositivo();

    const md5 = new Md5();
    let clave = md5.appendStr(this.user.pass).end();

    let credenciales = {
      nombre_usuario: this.user.nombre_usuario,
      pass: clave,
      movil: true
    }

    if (credenciales.nombre_usuario == null && credenciales.pass == null) {
      this.iniciandoSesion = false;
      this.usuarioIncorrectoToas("Ups! Ingrese sus datos.", 2000);
    } else {
      console.log('ingresa ', credenciales)
      this.relojService.iniciarSesion(credenciales).subscribe(datos => 
        {
        console.log("ver datos del usuario", datos);
        let existeId_Dispositivo: boolean;
        if (datos.message === 'error') {
          this.usuarioIncorrectoToas("Usuario y contraseña incorrecta", 3000)
        }
        else if (datos.message === 'error_') {
          this.usuarioIncorrectoToas("Usuario no cumple con todos los requerimientos necesarios para acceder al sistema.", 3000)
        }

        else if (datos.message === 'inactivo') {
          this.usuarioIncorrectoToas("Usuario no se encuentra activo en el sistema.", 3000)
        }

        else if (datos.message === 'licencia_expirada') {
          this.usuarioIncorrectoToas("Licencia del sistema ha expirado.", 3000)
        }

        else if (datos.message === 'sin_permiso_acceso') {
          this.usuarioIncorrectoToas("Usuario no tiene permisos de acceso al sistema.", 3000)
        }

        else if (datos.message === 'licencia_no_existe') {
          this.usuarioIncorrectoToas("No se ha encontrado registro de licencia del sistema.", 3000)
        }

        else {
          localStorage.setItem('rol', datos.rol);
          localStorage.setItem('token', datos.token);
          localStorage.setItem('ip', datos.ip_adress);
          localStorage.setItem('username', datos.usuario);
          localStorage.setItem('imagen', datos.imagen);

          localStorage.setItem('id_empresa', datos.empresa);
          // localStorage.setItem('autoriza', datos.estado);
          localStorage.setItem('csucur', datos.sucursal);
          localStorage.setItem('ccargo', datos.cargo);
          localStorage.setItem('empleadoID', datos.empleado);
          localStorage.setItem('cdepar', datos.departamento);
          localStorage.setItem('ccontr', datos.id_contrato);
          //INFORMACION USUARIO
          localStorage.setItem('nom', datos.nombre);
          localStorage.setItem('ap', datos.apellido);
          localStorage.setItem('UCedula', datos.cedula);
          localStorage.setItem('codigo', datos.codigo);
          localStorage.setItem('caducidad_licencia', datos.caducidad_licencia);
          //APP INFORMACION
          localStorage.setItem('ruc', datos.ruc);
          localStorage.setItem('version', datos.version);
          //LOOK ME
          // localStorage.setItem('horas_trabaja', res.body.empresa.hora_trabaja);


          // localStorage.setItem('bool_timbres', datos.acciones_timbres);
          // localStorage.setItem('fec_caducidad_licencia', datos.caducidad_licencia);

          console.log("datos de ingreso ", datos)
          this.parametros.ObtenerDetallesParametros(6).subscribe(
            res => {
              console.log("ver parametro:", res)
              datos = res;
              if (datos.length != 0) {
                return this.rango_dispositivos = (parseInt(datos[0].descripcion));
              } else {
                return this.rango_dispositivos = 1;
              }
            });

          this.relojService.obtenerIdDispositivosUsuario(datos.empleado).subscribe(
            dispositivos => {
              console.log("ver dispositivos", dispositivos)

              //Buscar el id_dispositivo y el id_celular si son el mismo
              dispositivos.forEach((item: any) => {
                if (item.id_dispositivo == this.id_celular) {
                  this.iddispositivos = dispositivos
                  existeId_Dispositivo = true;
                }
              });
              if (existeId_Dispositivo == true) {
                this.usuarioSuccessToas("Ingreso exitoso", 2000);
                this.cambiodepantallas();
              } else {
                this.BuscarParametroNumeroDispositivos();
                console.log("ver rango_dispositivos", this.rango_dispositivos)
                if (dispositivos.length >= this.rango_dispositivos) {
                  this.usuarioIncorrectoToas("Ups! El usuario llego al limite de dispositivos permitidos", 3000);
                  var FormId = 'formulariologin';
                  var resetForm = <HTMLFormElement>document.getElementById(FormId);
                  resetForm.reset();
                } else {
                  this.registrarCelular();
                  this.usuarioSuccessToas("Ingreso exitoso", 2000);
                  this.cambiodepantallas();
                }
              }
            },
            err => {
              this.iniciandoSesion = false;
              if (err.status == 0) {
                console.log(err.url + "|" + err.message + "|" + err.statusText + "|" + err.name);
                this.usuarioIncorrectoToas("Halgo ha salido mal. COMPRUEBA TU CONEXION A INTERNET o PONGASE EN CONTACTO CON EL ADMINISTRADOR", 3000);
              } else {
                console.log(err.url + "|" + err.message + "|" + err.statusText + "|" + err.name);
                this.usuarioIncorrectoToas(err.error.message, 3000),
                  console.log(err)
              }
            }
          );
        }
      }, err => {
        this.usuarioIncorrectoToas("Error en la conexión con el servidor", 3000)
      }
      )
    }
  }

  cambiodepantallas() {
    this.navCtroller.pop();
    this.navCtroller.navigateRoot(['reloj']);

    var FormId = 'formulariologin';
    var resetForm = <HTMLFormElement>document.getElementById(FormId);
    resetForm.reset();
  }

  async usuarioIncorrectoToas(mensaje: string, duracion: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: "danger",
      mode: 'ios',
    });
    toast.present();
  }

  async usuarioSuccessToas(mensaje: string, duracion: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: "success",
      cssClass: "MsIngreso",
      mode: 'ios',
    });
    toast.present();
  }

  public irRecuperarPassword() {
    this.navCtroller.navigateForward(['recuperar-password']);
  }

  //Asignación de registro de dispositivo a usuario
  async registrarCelular() {
    const alert = await this.alertController.create({
      subHeader: 'Registro de dispositivo',
      message: 'Se va a registrar este celular para realizar sus timbres',
      mode: "ios",
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.relojService.cerrarSesion();
            this.abrirToas("Debe registrar un dispositivo para usar el sistema", "danger", 3500);
          }
        },
        {
          text: 'Listo',
          handler: () => {
            this.registrarIdDispositivoenBDD(this.id_celular, this.dispositi);
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }

  registrarIdDispositivoenBDD(id_celular: any, model_dispositivo: any) {
    this.obtenerInfoTerminosCondiciones();
    console.log('aceptaTerminos:', this.aceptaTerminos); // Depuración

    const id_usuario = localStorage.getItem('empleadoID');
    var ip = localStorage.getItem('ip');
    var user_name = this.userService.username;

    this.relojService.registrarCelularUsuario(id_usuario, id_celular, model_dispositivo, user_name, ip, true).subscribe(
      res => {
        localStorage.setItem('UidDispositivo', id_celular);
        res.id_empleado = id_usuario
        res.id_dispositivo = id_celular;
        res.modelo_dispositivo = model_dispositivo;

      }, err => {
        this.iniciandoSesion = false;
        if (err.status == 0) {
          console.log(err.url + "|" + err.message + "|" + err.statusText + "|" + err.name);
          this.usuarioIncorrectoToas("Ups! halgo ha salido mal. COMPRUEBA TU CONEXION A INTERNET o PONGASE EN CONTACTO CON EL ADMINISTRADOR", 3000);
        } else {
          console.log(err.url + "|" + err.message + "|" + err.statusText + "|" + err.name);
          this.usuarioIncorrectoToas(err.error.message, 3000),
            console.log(err)

        }
      }
    )
  }
  // fin de registro de dispositivo a usuario


  //Crea la ventana de mensaje
  async abrirToas(mensaje: string, color: string, duracion: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      mode: "ios",
    });
    toast.present();
  }

}
