import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToastController, ModalController, Platform, AlertController } from '@ionic/angular';
import { TimbresPerdidosComponent } from './showTimbresGuardados.component';
import { ParametrosService } from 'src/app/services/parametros.service'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-bienvenido',
  templateUrl: './bienvenido.page.html',
  styleUrls: ['./bienvenido.page.scss']
})
export class BienvenidoPage implements OnInit, OnDestroy {

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
    public router: Router

  ) {
    this.cambioimagen();
  }

  ionViewDidLoad() {
    this.cambioimagen();
  }

  ngOnInit() {
    setInterval(() => {
      this.horaTransformada = this.pipe.transform(Date.now(), 'hh:mm:ss a');
      this.fechaTransformada = this.pipe.transform(Date.now(), 'fullDate');
    }, 1000);
    this.VerificarFunciones();
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


  VerificarFunciones() {
    this.parametros.ObtenerFunciones().subscribe(res => {
      this.funciones = res[0];
      this.apro_permisos = this.funciones.permisos;


      if (this.apro_permisos == true) {
        this.colorIp = "primary"
        this.colorFp = "dark"

      } else {
        this.colorIp = "deshabilitado"
        this.colorFp = "deshabilitado"

      }
    });
  }

  btn_InicioPermisosClick() {
    if (this.apro_permisos == true) {
     // this.router.navigateByUrl("/reloj/aprobar-permisos");
      this.router.navigate(['/enviartimbre', 'Inicio de permiso']);
      //this.closeAdmin()
    } else {
      this.mostrarToas(" Ups!! Al parecer no tienes activado en tu plan el Modulo 'Aprobar Permisos'");
    }
  }

  btn_FinPermisosClick() {
    if (this.apro_permisos == true) {
     // this.router.navigateByUrl("/reloj/aprobar-permisos");
      this.router.navigate(['/enviartimbre','Fin de permiso']);
      //this.closeAdmin()
    } else {
      this.mostrarToas(" Ups!! Al parecer no tienes activado en tu plan el Modulo 'Aprobar Permisos'");
    }
  }



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


  ngOnDestroy() {
    clearInterval(this.intervalo);
  }

}
