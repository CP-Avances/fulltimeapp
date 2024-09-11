import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToastController, ModalController, Platform, AlertController } from '@ionic/angular';
import { TimbresPerdidosComponent } from './showTimbresGuardados.component';
import { ParametrosService } from 'src/app/services/parametros.service';
import { Router } from '@angular/router';
import { RelojServiceService } from 'src/app/services/reloj-service.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AutorizacionesService } from 'src/app/services/autorizaciones.service';
import { NetworkService } from '../../libs/network.service';
import { NavegadorAdminComponent } from 'src/app/componentes/navegador-admin/navegador-admin.component';

@Component({
  selector: 'app-bienvenido',
  templateUrl: './bienvenido.page.html',
  styleUrls: ['./bienvenido.page.scss']
})
export class BienvenidoPage implements OnInit, OnDestroy {

  @ViewChild(NavegadorAdminComponent) navegadorAdmin: NavegadorAdminComponent;
  pipe: DatePipe = new DatePipe('es-EC', null);
  time: Date = new Date();
  horaTransformada = this.pipe.transform(Date.now(), 'hh:mm a');
  fechaTransformada = this.pipe.transform(Date.now(), 'fullDate');

  horarioAbierto: boolean = false;
  valorsol: string = "none";
  valorluna: string = "none";
  intervalo: any;
  funciones: any = [];
  apro_permisos: any;
  colorIp: any;
  colorFp: any;

  constructor(
    public toastController: ToastController,
    public modalController: ModalController,
    public alertCrtl: AlertController,
    public parametros: ParametrosService,
    public router: Router,
    public relojService: RelojServiceService,
    public empleadoService: EmpleadosService,
    public autorizacionesServices: AutorizacionesService,
    private networkService: NetworkService,

  ) {
    this.cambioimagen();
  }


  ngOnInit() {
    this.startClock();
    const subscription = interval(10000) // Intervalo de 1 hora en milisegundos
      .pipe(
        switchMap(() => this.checkSession(localStorage.getItem("empleadoID")))
      )
      .subscribe(
        () => {
        },
        error => console.error('Error fetching data:', error)
      );
    this.autorizacionesServices.setSubscription(subscription); // Guardar la suscripción en el servicio
    this.networkSubscriber();
    this.refreshNavegadorAdmin();

  }

  ionViewWillEnter() {
    this.startClock();
    this.networkSubscriber();
    this.refreshNavegadorAdmin();
  }

  refreshNavegadorAdmin() {
    if (this.navegadorAdmin) {
      this.navegadorAdmin.ngOnInit(); // O cualquier otro método que necesites ejecutar para refrescar
    }
  }

  startClock() {
    setInterval(() => {
      this.horaTransformada = this.pipe.transform(Date.now(), 'hh:mm:ss a');
      this.fechaTransformada = this.pipe.transform(Date.now(), 'fullDate');
    }, 1000);
  }

  async usuarioIncorrectoToas(mensaje: string, duracion: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: "warning"
    });
    toast.present();
  }

  async presentModalTimbresPerdidos() {

    const modal = await this.modalController.create({
      component: TimbresPerdidosComponent,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  //Funcion para el cambio del sol y la luna en la imagen svg//
  cambioimagen() {
    this.intervalo = setInterval(() => {
      if (this.time.getHours() >= 6 && this.time.getHours() <= 18) {
        document.getElementById('Sol').style.display = "block";
        document.getElementById('Luna').style.display = "none";

      } else if (this.time.getHours() > 18 && this.time.getHours() <= 24) {
        document.getElementById('Sol').style.display = "none";
        document.getElementById('Luna').style.display = "block"
      } else {
        document.getElementById('Sol').style.display = "none";
        document.getElementById('Luna').style.display = "block"
      }
    }, 1000);
  }



  isConnected: boolean;
  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
    console.log("Esta conectado: ", this.isConnected)
    if (!this.isConnected) {
      this.abrirToas('Por favor verifique su conexión a Internet', "danger", 3000, "bottom");
      console.log('Desconectado');
      this.colorIp = localStorage.getItem("colorIp")
      this.colorFp = localStorage.getItem("colorFp")
    } else {
      console.log('conectado');
      this.BuscarParametroTimbreSinInternet();
      this.VerificarFunciones();
    }
  }

  async VerificarTimbresSinInternet(accion: string) {

    if (this.networkService.getNetworkStatusDispositivo() == true) {
      this.parametros.ObtenerDetallesParametros(13).subscribe(
        res => {
          localStorage.setItem('timbrarSinInternet', res[0].descripcion);
            this.router.navigate(['/enviartimbre', accion]);       
        },
      );
    } else {
      if (localStorage.getItem("timbrarSinInternet") == "Si") {
        this.router.navigate(['/enviartimbre', accion]);
      } else {
        this.abrirToas('No puede realizar timbres sin conexión a Internet', "danger", 3000, "bottom");
      }
    };
  }
  BuscarParametroTimbreSinInternet() {

    this.parametros.ObtenerDetallesParametros(13).subscribe(
      res => {
        console.log("ver parametro sin internet:", res[0])
        localStorage.setItem('timbrarSinInternet', res[0].descripcion);
      },
    );
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


  VerificarFunciones() {
    this.parametros.ObtenerFunciones().subscribe(res => {
      this.funciones = res[0];
      this.apro_permisos = this.funciones.permisos;
      if (this.apro_permisos == true) {
        this.colorIp = "primary"
        this.colorFp = "dark"
        localStorage.setItem("colorIp", "primary")
        localStorage.setItem("colorFp", "dark")
      } else {
        this.colorIp = "deshabilitado"
        this.colorFp = "deshabilitado"
        localStorage.setItem("colorIp", "deshabilitado")
        localStorage.setItem("colorFp", "deshabilitado")
      }
    }
    );
  }

  btn_InicioPermisosClick() {
    if (this.apro_permisos == true) {
      // this.router.navigateByUrl("/reloj/aprobar-permisos");
      //this.closeAdmin()

      if (localStorage.getItem('timbrarSinInternet') == "Si") {
        this.router.navigate(['/enviartimbre', 'Inicio de permiso']);

      } else {
        this.abrirToas('No puede realizar timbres sin conexión a Internet', "danger", 3000, "bottom");
      }

    } else {
      this.mostrarToas(" Ups!!! al parecer no tienes activado en tu plan el Módulo de Permisos.");
    }
  }

  btn_FinPermisosClick() {
    if (this.apro_permisos == true) {
      // this.router.navigateByUrl("/reloj/aprobar-permisos");
      //this.closeAdmin()
      if (localStorage.getItem('timbrarSinInternet') == "Si") {
        this.router.navigate(['/enviartimbre', 'Fin de permiso']);

      } else {
        this.abrirToas('No puede realizar timbres sin conexión a Internet', "danger", 3000, "bottom");
      }
    } else {
      this.mostrarToas(" Ups!!! al parecer no tienes activado en tu plan el Módulo de Permisos.");
    }
  }

  async mostrarToas(mensaje: string) {
    const toast = await this.toastController.create({
      message: `<div style="text-align: left;">
                  <ion-icon name="information-circle-outline"></ion-icon>`
        + mensaje
        + `<br><br>Te gustaría activarlo? <br> Comunícate con nosotros: www.casapazmino.com.ec
                </div>`,
      duration: 4500,
      position: "top",
      color: "notificacicon",
      mode: "ios",
    });
    await toast.present();
  }


  async checkSession(id_empleado) {
    this.empleadoService.accesoMovil(id_empleado).subscribe((x: any) => {

      if (x[0].app_habilita == false) {
        console.log('Session invalid. Closing session...');

        this.cerrarSesion();
      } else {
        console.log('Session valid');

      }
    })
  }


  cerrarSesion() {
    this.relojService.cerrarSesion();
    this.autorizacionesServices.unsubscribe(); // Desuscribirse usando el servicio

  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
  }

}
