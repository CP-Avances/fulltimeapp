import { Component, OnInit } from '@angular/core';
import { RelojServiceService } from "src/app/services/reloj-service.service";
import { NavController, ToastController, Platform, AlertController } from "@ionic/angular";
import { ParametrosService } from 'src/app/services/parametros.service';
import { Device } from '@capacitor/device';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { SocketService } from 'src/app/services/socket.service';
import { SessionStorageService } from 'src/app/services/session-storage.service';
import { PushNotificationService } from 'src/app/services/push-notification.service';
import { TimbresPendientesSyncService } from 'src/app/services/timbres-pendientes-sync.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {
  ips_locales: any = '';

  iniciandoSesion = false;
  aceptaTerminos: boolean = false; // Inicialización predeterminada
  private readonly VERSION_SESION_DISPOSITIVO = '2';
  private readonly CLAVE_VERSION_SESION_DISPOSITIVO = 'sesion_dispositivo_version';

  user = {
    nombre_usuario: "",
    pass: "",
    codigo_empresa: "",
  }

  verPassword = false;
  id_celular: any;
  dispositi: any;
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
    private timbresPendientesSync: TimbresPendientesSyncService,
  ) { }

  ionViewWillEnter() {
    this.aceptaTerminos = false;
    this.infoDispositivo();

  }

  async ngOnInit() {
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    const logueado = await this.relojService.estaLogueado();

    if (logueado && this.relojService.existeRol()) {
      this.BuscarParametroTimbreUbicacionDesconocida();
      this.navCtroller.navigateRoot(['reloj']);
      return;
    }

    this.BuscarParametroTimbreUbicacionDesconocida();
  }


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
  async infoDispositivo(): Promise<void> {
    const id =
      await Device.getId();

    const info =
      await Device.getInfo();

    this.id_celular =
      id.identifier;

    this.dispositi =
      info.model;
  }

  mostrarPassword(): void {
    this.verPassword = !this.verPassword;
  }


  // METODO PARA INICIAR SESION
  async validarEmpresa() {
    if (this.iniciandoSesion) {
      return;
    }

    this.iniciandoSesion = true;

    await this.infoDispositivo();

    if (!this.aceptaTerminos) {
      this.iniciandoSesion = false;

      return this.usuarioIncorrectoToas(
        'Debe aceptar los Términos y Condiciones AQHora y la Política de Privacidad AQHora.',
        3000
      );
    }

    if (!this.user.nombre_usuario || !this.user.pass || !this.user.codigo_empresa) {
      this.iniciandoSesion = false;

      return this.usuarioIncorrectoToas(
        'Ups! Ingrese sus datos.',
        2000
      );
    }

    await this.ejecutarLogin(false);
  }

  private async ejecutarLogin(confirmarDispositivo: boolean) {
    this.iniciandoSesion = true;

    const credenciales = {
      nombre_usuario: this.user.nombre_usuario,
      pass: this.user.pass,
      movil: true,
      codigoEmpresa: this.user.codigo_empresa,
      id_dispositivo: this.id_celular,
      modelo_dispositivo: this.dispositi,
      confirmar_dispositivo: confirmarDispositivo,
      acepta_terminos: this.aceptaTerminos
    };

    try {
      const datos = await this.relojService.ValidarCredencialesMT(credenciales);

      await this.registrarDatosLocales(datos);
      this.sincronizarTimbresDespuesLogin(Number(datos.empleado));
      await this.pushNotificationService.inicializarPushNotifications();
      await this.obtenerImagen64();

      this.usuarioSuccessToas("Ingreso exitoso", 2000);
      this.cambiodepantallas();

    } catch (error: any) {
      this.iniciandoSesion = false;

      const etapaError = error?.error?.etapa ?? null;

      if (
        !confirmarDispositivo &&
        error?.status === 409 &&
        etapaError === "validar_dispositivo_movil"
      ) {
        await this.registrarCelular();
        return;
      }

      const mensaje =
        error?.error?.message ??
        error?.error?.detalle ??
        error?.message ??
        'Error al validar credenciales.';

      this.usuarioIncorrectoToas(mensaje, 3000);
    }
  }

  private async sincronizarTimbresDespuesLogin(idEmpleado: number): Promise<void> {
    if (!idEmpleado || idEmpleado <= 0) {
      return;
    }

    try {
      const resultado = await this.timbresPendientesSync.sincronizarPendientes(idEmpleado);

      if (resultado.sesionRevocada || !resultado.huboPendientes) {
        return;
      }

      await this.abrirToas(
        resultado.mensaje,
        resultado.fallidos === 0 ? 'success' : 'warning',
        3500
      );

    } catch (error) {
      console.error(
        '[login] Error sincronizando timbres pendientes:',
        error
      );
    }
  }

  async registrarDatosLocales(datos: any) {
    await this.sessionStorageService.setToken(datos.token);
    localStorage.setItem(
      this.CLAVE_VERSION_SESION_DISPOSITIVO,
      this.VERSION_SESION_DISPOSITIVO
    );

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
    localStorage.setItem('version_movil', datos.version_movil);
    //APP INFORMACION
    localStorage.setItem('ruc', datos.ruc);
    localStorage.setItem('version', datos.version);
    localStorage.setItem('modulos', JSON.stringify(datos.modulos));
    localStorage.setItem('storage_mb_usado', datos.storage_mb_usado);
    localStorage.setItem('storage_mb_contratado', datos.storage_mb_contratado);

    localStorage.setItem('UidDispositivo', String(this.id_celular ?? ''));

    // SOCKET: conectar y registrar empresa (room)
    this.socketService.conectar(datos.codigo_empresa);
    this.socketService.setEmpresa(datos.codigo_empresa);
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
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.iniciandoSesion = false;

            this.abrirToas(
              'Debe registrar un dispositivo para usar el sistema',
              'danger',
              3500
            );
          }
        },
        {
          text: 'Listo',
          handler: async () => {
            await this.ejecutarLogin(true);
          }
        }
      ],
      backdropDismiss: false
    });

    await alert.present();
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
