import { Component, OnInit } from '@angular/core';
import { ModalController, Platform, ToastController } from '@ionic/angular';
import { VerHorariosEmpleadosComponent } from 'src/app/modals/ver-horarios-empleados/ver-horarios-empleados.component';
import { NetworkService } from 'src/app/libs/network.service';
import { ConnectivityService } from 'src/app/services/conexion-servidor.service';

@Component({
  selector: 'app-horarios-empleados',
  templateUrl: './horarios-empleados.page.html',
  styleUrls: ['./horarios-empleados.page.scss'],
})
export class HorariosEmpleadosPage implements OnInit {

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
    this.networkSubscriber();

    this.serverConnected = await this.connectivityService.checkServerConnection();
  }

  async ionViewWillEnter() {
    this.networkSubscriber();
    this.serverConnected = await this.connectivityService.checkServerConnection();
  }
  isConnected: boolean;

  // METODO PARA ABRIR EL MODAL DE HORARIOS EMPLEADO
  async presentModal(codigo: number | string) {
    console.log('entro a modal...');
    const modal = await this.modalController.create({
      component: VerHorariosEmpleadosComponent,
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
