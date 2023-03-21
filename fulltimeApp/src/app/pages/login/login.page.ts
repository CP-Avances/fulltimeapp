import { Component, OnInit } from '@angular/core';
import { RelojServiceService } from "src/app/services/reloj-service.service";
import { NavController, ToastController, Platform, AlertController } from "@ionic/angular";
import { Usuario, UsuarioValueDefault } from 'src/app/interfaces/Usuario';
import { IdDispositivos } from 'src/app/interfaces/Usuario';
import { ParametrosService } from 'src/app/services/parametros.service';
import { Device } from '@capacitor/device';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  iniciandoSesion = false;
  user = {
    usuario: "",
    contrasena: ""
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
  ) { }

  ionViewWillEnter(){
    this.infoDispositivo();
  }

  ngOnInit() {

    this.BuscarParametro();
    if (!this.relojService.esPrimeraVez()) {
      this.navCtroller.navigateForward(['inicio']);
    } else if (this.relojService.estaLogueado() && this.relojService.existeRol()) {
      if (localStorage.getItem('rol') == "1") 
      { 
        this.navCtroller.pop();
        this.navCtroller.navigateRoot(['adminpage']);
      }

      else 
      { 
        this.navCtroller.pop();
        this.navCtroller.navigateRoot(['empleado']);
      }
    }
  }

  rango_dispositivos: any;
  BuscarParametro() {
    // id_tipo_parametro PARA RANGO DE UBICACIÓN = 22
    let datos = [];
    this.parametros.ObtenerDetallesParametros(32).subscribe(
      res => {
        datos = res;
        if (datos.length != 0) {
          return this.rango_dispositivos = (parseInt(datos[0].descripcion));
        }else{
          return this.rango_dispositivos = 1;
        }
    });
  }

  infoDispositivo(){
    Device.getId().then((id) => {
      this.id_celular = id.uuid;
    });

    Device.getInfo().then((info) => {
      this.dispositi = info.model;
    });
  }

  mostrarPassword(): void{
    this.verPassword = !this.verPassword;   
  }

  iniciarSesion1() {
    this.infoDispositivo();
    this.user.usuario = this.user.usuario.trim();
    this.user.contrasena = this.user.contrasena.trim();
    this.iniciandoSesion = true;
    
    if (this.user.usuario == "" && this.user.contrasena == "") {
      this.iniciandoSesion = false;
      this.usuarioIncorrectoToas("Ups! Ingrese sus datos.", 2000);
    } else {
      this.relojService.iniciarSesion(this.user).subscribe(
        res => {
          this.iniciandoSesion = false;
          this.usuarioObtenido = res.body.usuario;
          const id_empleado = parseInt((this.usuarioObtenido.codigo));
          let existeId_Dispositivo: boolean;
          
          console.log('usuarioObtenido: ',res);
          console.log('usuarioObtenido.body: ',res.body);
          console.log('Token impreso: ',res.body.autenticacion);

          this.relojService.obtenerIdDispositivosUsuario(id_empleado).subscribe(
                dispositivos => {
                
                  //Buscar el id_dispositivo y el id_empleado si son el mismo
                  dispositivos.forEach((item: any) => {
                    if(item.id_dispositivo == this.id_celular){
                      this.iddispositivos = dispositivos
                      existeId_Dispositivo = true;
                    }
                  });

                  if(existeId_Dispositivo == true){
                    localStorage.setItem('token', res.body.autorizacion);
                    localStorage.setItem('Uid', String(this.usuarioObtenido.id));
                    localStorage.setItem('nom', String(this.usuarioObtenido.nombre));
                    localStorage.setItem('ap', String(this.usuarioObtenido.apellido));
                    localStorage.setItem('correo', String(this.usuarioObtenido.correo));
                    localStorage.setItem('rol', String(this.usuarioObtenido.id_rol));
                    localStorage.setItem('UCedula', this.usuarioObtenido.cedula);
                    localStorage.setItem('username', this.usuarioObtenido.usuario);
                    localStorage.setItem('codigo', this.usuarioObtenido.codigo);
                    localStorage.setItem('empleadoID', res.body.usuario.id_registro_empleado);
                    localStorage.setItem('id_empresa', res.body.empresa.id_empresa);
                    localStorage.setItem('cperi_vacacion', res.body.empresa.id_peri_vacacion);
                    localStorage.setItem('ccontr', res.body.empresa.id_contrato);
                    localStorage.setItem('cdepar', res.body.empresa.id_departamento);
                    localStorage.setItem('ccargo', res.body.empresa.id_cargo);
                    localStorage.setItem('csucur', res.body.empresa.id_sucursal);
                    localStorage.setItem('horas_trabaja', res.body.empresa.hora_trabaja);
                    localStorage.setItem('ndepartamento', res.body.empresa.ndepartamento);
                    localStorage.setItem('config_noti', JSON.stringify(res.body.config_noti));
                    localStorage.setItem('app_info', JSON.stringify(res.body.app));
                    localStorage.setItem('vacuna_info', JSON.stringify(res.body.vacuna));
                    //console.log(res.body.usuario);
                    //console.log(res.body.vacuna);
                    //console.log(res.body.empresa);
                    //console.log(res.body.config_noti);
                    this.usuarioSuccessToas(res.message, 2000);
                    this.cambiodepantallas(this.usuarioObtenido.id_rol);  

                  }else{
                    console.log("rango dispositivos: ",this.rango_dispositivos);
                    if(dispositivos.length >= this.rango_dispositivos){
                      this.usuarioIncorrectoToas("Ups! El usuario llego al limite de dispositivos permitidos", 3000);
                      var FormId = 'formulariologin';
                      var resetForm = <HTMLFormElement>document.getElementById(FormId);
                      resetForm.reset();
                    }else{
                      this.registrarCelular();
                      localStorage.setItem('token', res.body.autorizacion);
                      localStorage.setItem('Uid', String(this.usuarioObtenido.id));
                      localStorage.setItem('nom', String(this.usuarioObtenido.nombre));
                      localStorage.setItem('ap', String(this.usuarioObtenido.apellido));
                      localStorage.setItem('correo', String(this.usuarioObtenido.correo));
                      localStorage.setItem('rol', String(this.usuarioObtenido.id_rol));
                      localStorage.setItem('UCedula', this.usuarioObtenido.cedula);
                      localStorage.setItem('username', this.usuarioObtenido.usuario);
                      localStorage.setItem('codigo', this.usuarioObtenido.codigo);
                      localStorage.setItem('empleadoID', res.body.usuario.id_registro_empleado);
                      localStorage.setItem('id_empresa', res.body.empresa.id_empresa);
                      localStorage.setItem('cperi_vacacion', res.body.empresa.id_peri_vacacion);
                      localStorage.setItem('ccontr', res.body.empresa.id_contrato);
                      localStorage.setItem('cdepar', res.body.empresa.id_departamento);
                      localStorage.setItem('ccargo', res.body.empresa.id_cargo);
                      localStorage.setItem('csucur', res.body.empresa.id_sucursal);
                      localStorage.setItem('horas_trabaja', res.body.empresa.hora_trabaja);
                      localStorage.setItem('ndepartamento', res.body.empresa.ndepartamento);
                      localStorage.setItem('config_noti', JSON.stringify(res.body.config_noti));
                      localStorage.setItem('app_info', JSON.stringify(res.body.app));
                      localStorage.setItem('vacuna_info', JSON.stringify(res.body.vacuna));
                      //console.log(res.body.usuario);
                      //console.log(res.body.vacuna);
                      //console.log(res.body.empresa);
                      //console.log(res.body.config_noti);
                      this.usuarioSuccessToas(res.message, 2000);
                      this.cambiodepantallas(this.usuarioObtenido.id_rol);  
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
        },
        err => {
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
      );
    }

  }

  cambiodepantallas(rol: number){
    if (rol === 1) {
      this.navCtroller.pop();
      this.navCtroller.navigateRoot(['adminpage']); 
    }else { 
      this.navCtroller.pop();
      this.navCtroller.navigateRoot(['empleado']); 
    }

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

  registrarIdDispositivoenBDD(id_celular: any, model_dispositivo: any){
    const id_usuario = this.usuarioObtenido.codigo;
    this.relojService.registrarCelularUsuario(id_usuario, id_celular, model_dispositivo).subscribe(
      res => {
        localStorage.setItem('UidDispositivo', id_celular);
        res.id_empleado = id_usuario
        res.id_dispositivo = id_celular;
        res.modelo_dispositivo = model_dispositivo;
      },err => {
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
