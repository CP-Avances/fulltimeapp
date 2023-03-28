import { Component, OnInit } from '@angular/core';
import { ModalController, Platform, ToastController } from '@ionic/angular';
import { Socket } from 'ngx-socket-io';
import { EnviarUsuarioComponent } from './enviar-usuario/enviar-usuario.component';

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

  constructor(
    public toastController: ToastController,
    public modalController: ModalController,
    public platform: Platform,
    public socket: Socket,
    ) {

     
    }

  ngOnInit() {
    this.noti.asunto = '';
    this.noti.mensaje = '';

    console.log("Conecion:", this.socket.connect());
    console.log("Sokect recibe", this.socket.on('recibir_aviso', (data: any) => {}));
    
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
