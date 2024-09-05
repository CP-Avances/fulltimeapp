import { Component, OnInit } from '@angular/core';
import { ModalController, Platform, ToastController } from '@ionic/angular';
import { Socket } from 'ngx-socket-io';
import { EnviarUsuarioComponent } from './enviar-usuario/enviar-usuario.component';
import { NetworkService } from 'src/app/libs/network.service';

@Component({
  selector: 'app-comunicado',
  templateUrl: './comunicado.page.html',
  styleUrls: ['./comunicado.page.scss'],
})

export class ComunicadoPage implements OnInit {

  noti = {
    asunto: "",
    mensaje: ""
  }

  modal: any;
  isConnected: boolean;

  constructor(
    public toastController: ToastController,
    public modalController: ModalController,
    public platform: Platform,
    public socket: Socket,
    private networkService: NetworkService,

    ) {}

  ngOnInit() {
    this.noti.asunto = '';
    this.noti.mensaje = '';
    this.networkSubscriber();
  }
  
  ionViewWillEnter() {
    this.networkSubscriber();
  }

  EnviarComunicado() {
    this.noti.asunto = this.noti.asunto.trim();
    this.noti.mensaje = this.noti.mensaje.trim();

    if (this.noti.asunto === '' || this.noti.mensaje === '') {
      this.mensajeVacioToas("Los campos no pueden estar vacios.", 3000)
    }
    else {
      this.presentModal(this.noti.asunto, this.noti.mensaje);
    }
  }

  
  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
    console.log("Esta conectado: ", this.isConnected)
    if (!this.isConnected) {
      this.abrirToas('Por favor verifique su conexión a Internet', "danger", 3000, "bottom");

    } else {
      console.log('conectado');
    }
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

  textareaMaxLengthValidation() {
    if (this.noti.mensaje.length > 255) {
      this.noti.mensaje = this.noti.mensaje.slice(0, 5);
    }
  }

  async mensajeVacioToas(mensaje: string, duracion: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: "warning",
      mode: "ios"
    });
    toast.present();
  }

  async presentModal(asunto: string, mensaje: string) {
    let comunicado = {
      asunto: asunto,
      mensaje: mensaje
    }
    const modal = await this.modalController.create({
      component: EnviarUsuarioComponent,
      componentProps: {
        'data': comunicado,
      },
      cssClass: 'my-custom-class'
    });
    this.modal = modal;
    await modal.present();


    const { data: { refreshInfo } } = await modal.onDidDismiss()

    if (refreshInfo) {
      this.ngOnInit()
    }
  }

}
