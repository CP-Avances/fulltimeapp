import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { VerHorariosEmpleadosComponent } from 'src/app/modals/ver-horarios-empleados/ver-horarios-empleados.component';

@Component({
  selector: 'app-horarios-empleados',
  templateUrl: './horarios-empleados.page.html',
  styleUrls: ['./horarios-empleados.page.scss'],
})
export class HorariosEmpleadosPage implements OnInit {

  modal: any;

  constructor(
    public modalController: ModalController,
    public platform: Platform,
    private router: Router,
    ) {}

  ngOnInit() {
  }

  async presentModal(codigo: number) {
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

}
