import { Component, OnInit } from '@angular/core';
import { ModalController, Platform, ToastController } from '@ionic/angular';
import { Socket } from 'ngx-socket-io';
import { EnviarUsuarioComponent } from './enviar-usuario/enviar-usuario.component';
import { NetworkService } from 'src/app/libs/network.service';
import { ConnectivityService } from 'src/app/services/conexion-servidor.service';

@Component({
  selector: 'app-comunicado',
  templateUrl: './comunicado.page.html',
  styleUrls: ['./comunicado.page.scss'],
})

export class ComunicadoPage implements OnInit {
  serverConnected: boolean = true;

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
    private connectivityService: ConnectivityService

  ) { }

  async ngOnInit() {
    this.networkSubscriber();
    this.serverConnected = await this.connectivityService.checkServerConnection();
    this.noti.asunto = '';
    this.noti.mensaje = '';
  }

  async ionViewWillEnter() {
    this.networkSubscriber();
    this.serverConnected = await this.connectivityService.checkServerConnection();
  }

  // METODO PARA LEER EL ASUNTO Y MENSAJE INGRESADO
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

  // METODO PARA VERIFICAR LA CONEXION A INTERNET
  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
  }

  // METODO PARA LIMITAR EL NUMERO DE CARACTERES
  textareaMaxLengthValidation() {
    if (this.noti.mensaje.length > 255) {
      this.noti.mensaje = this.noti.mensaje.slice(0, 5);
    }
  }

  // METOODO PARA CONFIGURAR EL MENSAJE EN EL CASO DE QUE LOS CAMPOS ESTEN VACIOS
  async mensajeVacioToas(mensaje: string, duracion: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: "warning",
      mode: "ios"
    });
    toast.present();
  }

  // METODO PARA ABRIR EL MODAL DE ENVIAR USUARIO
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
