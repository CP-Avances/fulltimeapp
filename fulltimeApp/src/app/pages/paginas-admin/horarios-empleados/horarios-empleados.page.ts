import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, Platform  , ToastController } from '@ionic/angular';
import { VerHorariosEmpleadosComponent } from 'src/app/modals/ver-horarios-empleados/ver-horarios-empleados.component';
import { NetworkService } from 'src/app/libs/network.service';

@Component({
  selector: 'app-horarios-empleados',
  templateUrl: './horarios-empleados.page.html',
  styleUrls: ['./horarios-empleados.page.scss'],
})
export class HorariosEmpleadosPage implements OnInit {

  modal: any;

  constructor(
    public toastController: ToastController,
    public modalController: ModalController,
    public platform: Platform,
    private router: Router,
    private networkService: NetworkService,

    ) {}

  ngOnInit() {
    this.networkSubscriber();
  }

  ionViewWillEnter() {
    this.networkSubscriber();
  }
  isConnected: boolean;

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

  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
    console.log("Esta conectado: ", this.isConnected)
    if (!this.isConnected) {
      this.abrirToas('Por favor verifique su conexión a Internet', "danger", 3000, "middle");

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
