import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { MenuController, ModalController, PopoverController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AutorizacionesService } from 'src/app/services/autorizaciones.service';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { RelojServiceService } from 'src/app/services/reloj-service.service';
import { NotificacionPopoverComponent } from '../notificacion-popover/notificacion-popover.component';
import { TimbresPerdidosComponent } from '../../pages/bienvenido/showTimbresGuardados.component';

import { Notificacion } from '../../interfaces/Notificaciones';
import { NotificacionTimbre } from '../../interfaces/Notificaciones';
import { ActionPerformed, LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';

import { Router } from '@angular/router';
import { ParametrosService } from 'src/app/services/parametros.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { NetworkService } from '../../libs/network.service';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-navegador-admin',
  templateUrl: './navegador-admin.component.html',
  styleUrls: ['./navegador-admin.component.scss'],
})
export class NavegadorAdminComponent implements OnInit {

  username: string = '';
  imagen: string = localStorage.getItem('imagen64');

  idEmpleadoIngresa: number = 0;
  valor: boolean = true;
  loading: boolean = true;
  notificaciones: Notificacion[] = [];
  notificaiontimbre: NotificacionTimbre[] = [];
  notificacionestimbres: any = [];
  notificacionesAll: any = [];

  public countNoti: number = 0;
  public countbadge: number = 0;
  mensaje: string = "";
  empleEnvia: string = "";

  ids: number[] = [];
  resume: boolean = false;

  colorNOtifi: string = '';

  socket: any;

  constructor(
    private userService: DataUserLoggedService,
    private relojService: RelojServiceService,
    private empleadoService: EmpleadosService,
    private menu: MenuController,
    public modalController: ModalController,
    public pooverCtrl: PopoverController,
    private notificacionService: AutorizacionesService,
    public platform: Platform,
    public alertCrtl: AlertController,
    private router: Router,
    public loadingController: LoadingController,
    private toastController: ToastController,
    public parametros: ParametrosService,
    private networkService: NetworkService,
    private socketService: SocketService,
  ) { }

  ionViewWillEnter() {
    this.ngOnInit();
    this.VerificarFunciones();
    this.networkSubscriber()

  }

  ngOnInit() {
    this.username = this.userService.username;
    this.idEmpleadoIngresa = parseInt(localStorage.getItem('empleadoID'));
    this.LlamarNotificcaccciones(this.idEmpleadoIngresa);

    this.socket = this.socketService.getSocket();

    if (this.socket) {
      this.socket.on('recibir_notificacion', (data_llega: any) => {
        this.LlamarNotificcaccciones(this.idEmpleadoIngresa);
        console.log("Notificacion: ", data_llega);
        if (data_llega.id_receives_empl === this.idEmpleadoIngresa) {
          this.mensaje = data_llega.usuario;
          try {
            var t = new Date();
            t.setSeconds(t.getSeconds() + 5);
            let id = this.ids.length;
            this.ids.push(id);

            let options: ScheduleOptions = {
              notifications: [{
                id: data_llega.id,
                title: "Fulltime Notificacion",
                body: this.mensaje,
                schedule: {
                  allowWhileIdle: false,
                },
                largeBody: this.mensaje + "\n" + data_llega.mensaje,
              }]
            }
            LocalNotifications.schedule(options);
          } catch (error) {
            this.mostrarToasNoti("No se pudo resibir la notificacion: \n" + error);
            console.log("Problemas en la notificacion: ", error);
          }
        }
      });

      this.socket.on('recibir_aviso', (data_llega: any) => {
        console.log(" entrando al proceso de notificaciones")
        this.LlamarNotificcaccciones(this.idEmpleadoIngresa);
        console.log("Aviso recibido", data_llega.id);

        if (data_llega.id_receives_empl === this.idEmpleadoIngresa) {
          this.mensaje = data_llega.usuario;
          console.log("Usuario envio", this.empleEnvia);

          try {
            this.mostrarToasNoti("Notificacion Recibida de " + data_llega + "\n");
            var t = new Date();
            t.setSeconds(t.getSeconds() + 5);
            let id = this.ids.length;
            this.ids.push(id);

            let options: ScheduleOptions = {
              notifications: [{
                id: data_llega.id,
                title: "Fulltime Aviso",
                body: this.mensaje,
                largeBody: this.mensaje + "\n" + data_llega.descripcion,
                schedule: {
                  allowWhileIdle: true,
                }
              }]
            }
            if(data_llega.mensaje.split(" ")[0] =='NOTIFICACIÓN'){
               options = {
                notifications: [{
                  id: data_llega.id,
                  title: data_llega.mensaje,
                  body: this.mensaje,
                  largeBody: this.mensaje + "\n" + data_llega.descripcion,
                  schedule: {
                    allowWhileIdle: true,
                  }
                }]
              }
            }


            console.log("ver options", options)

            LocalNotifications.schedule(options).then(() => { });

          } catch (error) {
            this.mostrarToasNoti("No se pudo resibir el Aviso: \n" + error);
            console.log("Problemas en el Aviso: ", error);
          }
        }

      });
    }

    this.networkSubscriber()
  }

  onImageError(event: any) {
    event.target.src = "../../../assets/images/perfildefecto.png";
  }

  // METODO DE VERIFICACION DE CONEXION A INTERNET
  isConnected: boolean;
  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
    console.log("Esta conectado: ", this.isConnected)
    if (!this.isConnected) {
      this.abrirToas('Por favor verifique su conexión a Internet', "danger", 3000, "middle");
      console.log('Desconectado');
      this.imagen = localStorage.getItem("imagen64")
    } else {
      console.log('conectado');
      this.imagen = localStorage.getItem("imagen64")
    }
  }

  // METODO DE CONFIGURACION DE TOAST
  async abrirToas(mensaje: string, color: string, duracion: number, position: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      position: position
    });
    toast.present();
  }

  // METODO PARA LEER LAS NOTIFICACIONES
  LlamarNotificcaccciones(id_empleado: number) {
    this.notificacionService.getNotificacionesByIdEmpleado(id_empleado).subscribe(
      notificacion => {
        console.log("ver todas la notificaciones del empleado: ", notificacion)
        this.notificaciones = notificacion;

        this.notificacionService.getNotificacionesTimbreByIdEmpleado(id_empleado).subscribe(
          notificaciontim => {
            this.notificacionestimbres = notificaciontim;
            this.notificacionesAll = this.notificaciones.concat(this.notificacionestimbres);
            this.countNoti = 0;
            this.notificacionesAll.forEach((item: any) => {
              if (item.visto === false) {
                this.countNoti++;
                this.empleEnvia = item.nempleadosend;
              }
            });

            //badge de notificacciones pendientes
            if (this.countNoti == 0) {
              this.valor = false;
            } else {
              this.valor = true;
            }

          },
          err => { console.log(err) }, () => { this.loading = false }
        )
      },
      err => {

        this.notificacionService.getNotificacionesTimbreByIdEmpleado(id_empleado).subscribe(
          notificaiontim => {
            this.notificacionesAll = notificaiontim;

            this.countNoti = 0;
            //cuenta las notificaciones que estan sin ver
            this.notificacionesAll.forEach((item: any) => {
              if (item.visto === false) {
                this.countNoti++;
                this.empleEnvia = item.nempleadosend;
              }
            });

            //badge de notificacciones pendientes
            if (this.countNoti == 0) {
              this.valor = false;
            } else {
              this.valor = true;
            }

          },
          err => { console.log(err) },
          () => { this.loading = false }
        )
        console.log(err)
      },
      () => { this.loading = false });
  }

  //Verifica si tiene activado los modulos mediante la tabla funciones
  funciones: any = [];
  apro_permisos: any;
  apro_vacaciones: any;
  apro_horasExtras: any;
  apro_alimentaciones: any;


  colorp: any;
  colorh: any;
  colorv: any;
  colora: any;

  // METODO PARA VERIFICAR LOS MODULOS ACTIVOS
  VerificarFunciones() {
    this.parametros.ObtenerFunciones().subscribe(res => {
      this.funciones = res[0];
      this.apro_permisos = this.funciones.permisos;
      this.apro_vacaciones = this.funciones.vacaciones;
      this.apro_horasExtras = this.funciones.hora_extra;
      this.apro_alimentaciones = this.funciones.alimentacion;

      if (this.apro_permisos == true) {
        this.colorp = "dark"
      } else {
        this.colorp = "medium"
      }

      if (this.apro_vacaciones == true) {
        this.colorv = "dark"
      } else {
        this.colorv = "medium"
      }

      if (this.apro_horasExtras == true) {
        this.colorh = "dark"
      } else {
        this.colorh = "medium"
      }

      if (this.apro_alimentaciones == true) {
        this.colora = "dark"
      } else {
        this.colora = "medium"
      }

    });
  }


  //METODOS DE CONFIGURACION DE MENSAJES
  async mostrarToas(mensaje: string) {
    const toast = await this.toastController.create({
      message: `<ion-icon name="information-circle-outline"></ion-icon>` + mensaje + "\n\n Te gustaria activarlo? \n Comunicate con nosotros: www.casapazmino.com.ec",
      duration: 4500,
      position: "top",
      color: "notificacicon",
      mode: "ios",
      cssClass: 'toast-custom-class',
    });
    await toast.present();
  }

  async mostrarToasNoti(mensaje: string) {
    const toast = await this.toastController.create({
      message: this.mensaje,
      duration: 3000,
      position: "top",
      color: "notificacicon",
      mode: "ios",
      cssClass: 'toast-custom-class',
    });
    await toast.present();
  }

  // METODO PARA MOSTRAR LAS NOTIFICACIONES
  async Mostrarpopnotificaciones(event: any) {
    this.countNoti = 0;
    this.valor = false;
    const popover = await this.pooverCtrl.create({
      component: NotificacionPopoverComponent,
      event: event,
      mode: "md",
      translucent: true,
      cssClass: 'noti-popover',
    });
    await popover.present();
    await popover.onDidDismiss();
  }


  // METOO PARA ABRIR EL MENU
  openAdmin() {
    this.menu.enable(true, 'admin');
    this.menu.open('admin');
    this.VerificarFunciones();
  }

  // METOO PARA CERRAR EL MENU
  closeAdmin() {
    this.menu.close('admin');
  }

  // METODO PARA CERRAR LA SESION
  cerrarSesion() {
    this.relojService.cerrarSesion();
    this.closeAdmin();

    this.notificacionService.unsubscribe(); // Desuscribirse usando el servicio

  }

  // METODO PARA MOSTRAL EL MODAL DE TIMBRES PERDIDOS
  async presentModalTimbresPerdidos() {
    this.closeAdmin();
    const modal = await this.modalController.create({
      component: TimbresPerdidosComponent,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

}
