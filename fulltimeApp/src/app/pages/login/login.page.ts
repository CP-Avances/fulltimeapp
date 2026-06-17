import { Component, OnInit } from '@angular/core';
import { RelojServiceService } from "src/app/services/reloj-service.service";
import { NavController, ToastController, Platform, AlertController } from "@ionic/angular";
import { IdDispositivos } from 'src/app/interfaces/Usuario';
import { ParametrosService } from 'src/app/services/parametros.service';
import { Device } from '@capacitor/device';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { ParametrosSistema } from 'src/app/libs/parametros.emun';
import { SocketService } from 'src/app/services/socket.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { PushNotificationService } from 'src/app/services/push-notification.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
 
export class LoginPage implements OnInit {
  ips_locales: any = '';

  iniciandoSesion = false;
  aceptaTerminos: boolean = false; // Inicialización predeterminada

  user = {
    nombre_usuario: "",
    pass: "",
    codigo_empresa: "",
  }

  iddispositivos: IdDispositivos[] = [];
  verPassword = false;
  id_celular: any;
  dispositi: any;

  existeId_Dispositivo: boolean;
  mostrarCheckboxInicialmente: boolean;

  constructor(
    private relojService: RelojServiceService,
    private navCtroller: NavController,
    public toastController: ToastController,
    public alertController: AlertController,
    public parametros: ParametrosService,
    public platform: Platform,
    private empleadoService: EmpleadosService,
    public validar: ValidacionesService,
    public sessionStorageService: SessionStorageService,
    private readonly socketService: SocketService,
    private pushNotificationService: PushNotificationService,
  ) { }

  ionViewWillEnter() {
    this.infoDispositivo();

  }

  async ngOnInit() {
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    this.obtenerInfoTerminosCondiciones();

    const logueado = await this.relojService.estaLogueado();

    if (logueado && this.relojService.existeRol()) {
      this.BuscarParametroTimbreUbicacionDesconocida();
      this.navCtroller.navigateRoot(['reloj']);
      return;
    }

    this.BuscarParametroTimbreUbicacionDesconocida();
  }

  rango_dispositivos: any;


  // METODO PARA OBTENER PARAMETRO DE UBICACION DESCONOCIDA
  BuscarParametroTimbreUbicacionDesconocida() {
    const empleadoID = parseInt(localStorage.getItem("empleadoID") ?? "0", 10);

    const buscar = {
      ids_empleados: [empleadoID],
    };

    this.parametros.ObtenerDetalleParametroUsuario(buscar).subscribe(
      {
        next: (res) => {
          const parametro = res.data?.[0];

          if (!parametro) {
            localStorage.setItem("timbrarUbicacionDesconocida", "No");
            return;
          }

          const timbreUbicacionDesconocida = parametro.timbre_ubicacion_desconocida;
          const resultado = timbreUbicacionDesconocida ? "Si" : "No";

          localStorage.setItem("timbrarUbicacionDesconocida", resultado);
        },
        error: () => {
          localStorage.setItem("timbrarUbicacionDesconocida", "No");
        }
      }
    );
  }

  // METODO PARA OBTENER LA INFORMACION DEL DISPOSITIVO
  infoDispositivo() {
    Device.getId().then((id) => {
      this.id_celular = id.identifier;
    });
    Device.getInfo().then((info) => {
      this.dispositi = info.model;
    });
  }

  // METODO PARA CONTROLAR LA ACPETACION DE TERMINOS Y CONDICIONES
  obtenerInfoTerminosCondiciones() {
    this.infoDispositivo();
    Device.getId().then((id) => {
      this.relojService.obtenerDispositivoPorID(id.identifier).subscribe(
        {
          next: dispositivos => {
            if (dispositivos.terminos_condiciones != null) {
              this.aceptaTerminos = dispositivos.terminos_condiciones;
              this.mostrarCheckboxInicialmente = this.aceptaTerminos;
            } else {
              this.aceptaTerminos = false;
            }
          }, error: () => {
            this.aceptaTerminos = false;
          }
        }
      )
    });

  }

  mostrarPassword(): void {
    this.verPassword = !this.verPassword;
  }

  //METODO PARA VER EL NUMERO DE DISPOSITIVOS QUE PUEDE TENER UN USUARIO
  async BuscarParametroNumeroDispositivos(datos: any) {
    this.rango_dispositivos = 1;
    this.parametros.ObtenerDetallesParametros(ParametrosSistema.DISPOSITIVOS_MOVILES).subscribe(
      {
        next: res => {
          res.forEach(p => {
            this.rango_dispositivos = parseInt(p.descripcion);
          });
          this.obtenerIdDispositivosUsuario(datos);
        }, error: () => {
          this.obtenerIdDispositivosUsuario(datos);
        }
      });
  }


  // METODO PARA INICIAR SESION
  async validarEmpresa() {
    if (this.iniciandoSesion) {
      return;
    }

    this.iniciandoSesion = true;
    this.existeId_Dispositivo = false;
    this.infoDispositivo();

    const credenciales = {
      nombre_usuario: this.user.nombre_usuario,
      pass: this.user.pass,
      movil: true,
      codigoEmpresa: this.user.codigo_empresa,
    };

    if (!credenciales.nombre_usuario || !credenciales.pass || !credenciales.codigoEmpresa) {
      this.iniciandoSesion = false;
      return this.usuarioIncorrectoToas("Ups! Ingrese sus datos.", 2000);
    }

    try {
      const datos = await this.relojService.ValidarCredencialesMT(credenciales);

      await this.registrarDatosLocales(datos);
      try {
        await this.pushNotificationService.inicializarPushNotifications();
      } catch (error) {
        console.log('Error inicializando push:', error);
      }

      await this.obtenerImagen64();
      await this.BuscarParametroNumeroDispositivos(datos);

    } catch (error: any) {
      this.iniciandoSesion = false;

      const mensaje =
        error?.error?.message ??
        error?.message ??
        'Error al validar credenciales.';

      this.usuarioIncorrectoToas(mensaje, 3000);
    }
  }

  async registrarDatosLocales(datos: any) {
    await this.sessionStorageService.setToken(datos.token);

    localStorage.setItem('rol', datos.rol);
    localStorage.setItem('ip', datos.ip_adress);
    localStorage.setItem('username', datos.usuario);
    localStorage.setItem('imagen', datos.imagen);
    localStorage.setItem('codigo_empresa', datos.codigo_empresa);

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
    localStorage.setItem('modulos', JSON.stringify(datos.modulos));

    // SOCKET: conectar y registrar empresa (room)
    this.socketService.conectar(datos.codigo_empresa);
    this.socketService.setEmpresa(datos.codigo_empresa);
  }

  async obtenerIdDispositivosUsuario(datos: any) {
    this.relojService.obtenerIdDispositivosUsuario(datos.empleado).subscribe({
      next: async (dispositivos) => {

        //Buscar el id_dispositivo y el id_celular si son el mismo
        dispositivos.forEach((item: any) => {
          if (item.id_dispositivo == this.id_celular) {
            this.iddispositivos = dispositivos
            this.existeId_Dispositivo = true;
          }
        });

        if (this.existeId_Dispositivo) {
          this.usuarioSuccessToas("Ingreso exitoso", 2000);
          this.cambiodepantallas();
        }
        else {
          if (dispositivos.length >= this.rango_dispositivos) {
            this.iniciandoSesion = false;
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
      error: (err) => {
        this.iniciandoSesion = false;
        if (err.status == 0) {
          this.usuarioIncorrectoToas("Halgo ha salido mal. COMPRUEBA TU CONEXION A INTERNET o PONGASE EN CONTACTO CON EL ADMINISTRADOR", 3000);
        } else {
          this.usuarioIncorrectoToas(err.error.message, 3000)
        }
      }
    });
  }


  // METODO PARA OBTENER LA IMAGEN EN BASE 64
  async obtenerImagen64() {
    this.empleadoService.ObtenerImagen(localStorage.getItem("empleadoID")).subscribe(data => {
      if (!data) {
        localStorage.setItem('imagen64', '');

      }
      else {
        let imagen = data;
        localStorage.setItem('imagen64', imagen);
      }
    });
  }

  // METODO PARA CAMBIAR A LA PANTALLA DE BIENVENIDA
  cambiodepantallas() {
     this.iniciandoSesion = false;
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
          handler: async () => {
            await this.relojService.cerrarSesion();
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

  // METODO PARA REGISTRAR EL DISPOSITIVO
  registrarIdDispositivoenBDD(id_celular: any, model_dispositivo: any) {
    this.obtenerInfoTerminosCondiciones();

    const id_usuario = localStorage.getItem('empleadoID');

    this.relojService.registrarCelularUsuario(id_usuario, id_celular, model_dispositivo, true).subscribe(
      {
        next: res => {
          localStorage.setItem('UidDispositivo', id_celular);
          res.id_empleado = id_usuario
          res.id_dispositivo = id_celular;
          res.modelo_dispositivo = model_dispositivo;

        }, error: (err) => {
          this.iniciandoSesion = false;
          if (err.status == 0) {
            this.usuarioIncorrectoToas("Ups! halgo ha salido mal. COMPRUEBA TU CONEXION A INTERNET o PONGASE EN CONTACTO CON EL ADMINISTRADOR", 3000);
          } else {
            this.usuarioIncorrectoToas(err.error.message, 3000)
          }
        }
      }
    )
  }

  //METODO PARA CREAR LAS ALERTAS
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
