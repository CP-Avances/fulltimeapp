import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, Platform, ToastController } from '@ionic/angular';
import { TimbreJustificadoComponent } from 'src/app/modals/timbre-justificado/timbre-justificado.component';
import { NetworkService } from 'src/app/libs/network.service';
import { ConnectivityService } from 'src/app/services/conexion-servidor.service';

@Component({
  selector: 'app-justificar-timbres',
  templateUrl: './justificar-timbres.page.html',
  styleUrls: ['./justificar-timbres.page.scss'],
})
export class JustificarTimbresPage implements OnInit {

  modal: any;
  isConnected: boolean;
  serverConnected: boolean = true;

  constructor(
    public toastController: ToastController,

    public modalController: ModalController,
    public platform: Platform,
    private router: Router,
    private networkService: NetworkService,
    private connectivityService: ConnectivityService

    ) {}

    async ngOnInit() {
      this.serverConnected = await this.connectivityService.checkServerConnection();
      this.networkSubscriber();
    }
  
    async ionViewWillEnter() {
      this.serverConnected = await this.connectivityService.checkServerConnection();
      this.networkSubscriber();
    }

  async presentModal(objeto: any) {
    console.log('entro a modal...');
    const modal = await this.modalController.create({
      component: TimbreJustificadoComponent,
      componentProps: {
        'data': objeto,
      },
      cssClass: 'my-custom-class'
    });
    this.modal = modal;
    return await modal.present();
  }

  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
    console.log("Esta conectado: ", this.isConnected)
    if (!this.isConnected) {
     // this.abrirToas('Por favor verifique su conexión a Internet', "danger", 3000, "middle");
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

}
