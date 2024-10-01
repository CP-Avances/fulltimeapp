import { Component, OnInit } from '@angular/core';
import { ModalController, Platform, ToastController } from '@ionic/angular';
import { VerTimbreEmpleadoComponent } from 'src/app/modals/ver-timbre-empleado/ver-timbre-empleado.component';
import { NetworkService } from 'src/app/libs/network.service';
import { ConnectivityService } from 'src/app/services/conexion-servidor.service';

@Component({
  selector: 'app-timbres-empleados',
  templateUrl: './timbres-empleados.page.html',
  styleUrls: ['./timbres-empleados.page.scss'],
})
export class TimbresEmpleadosPage implements OnInit {

  modal: any;
  serverConnected: boolean = true;
  constructor(
    public toastController: ToastController,
    public modalController: ModalController,
    public platform: Platform,
    private networkService: NetworkService,
    private connectivityService: ConnectivityService
  ) { }

  async ngOnInit() {
    this.serverConnected = await this.connectivityService.checkServerConnection();
    this.networkSubscriber();
  }

  async ionViewWillEnter() {
    this.serverConnected = await this.connectivityService.checkServerConnection();
    this.networkSubscriber();
  }

  // METODO PARA VISUALIZAR LA LISTA DE TIMBRES DEL EMPLADO SELECCIONADO
  isConnected: boolean;
  async presentModal(codigo: number | string) {
    console.log('entro a modal...');

    const modal = await this.modalController.create({
      component: VerTimbreEmpleadoComponent,
      componentProps: {
        'data': codigo,
      },
      cssClass: 'my-custom-class'
    });
    this.modal = modal;
    return await modal.present();
  }

  // METODO PARA VERIFICAR LA CONEXION A INTERNET
  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
    console.log("Esta conectado: ", this.isConnected)
  }

}
