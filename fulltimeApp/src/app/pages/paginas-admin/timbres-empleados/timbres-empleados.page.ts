import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { VerTimbreEmpleadoComponent } from 'src/app/modals/ver-timbre-empleado/ver-timbre-empleado.component';

@Component({
  selector: 'app-timbres-empleados',
  templateUrl: './timbres-empleados.page.html',
  styleUrls: ['./timbres-empleados.page.scss'],
})
export class TimbresEmpleadosPage implements OnInit {

  modal: any;

  constructor(
    public modalController: ModalController,
    public platform: Platform,
    private router: Router,
    ) {}

  ngOnInit() {
  }

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

}
