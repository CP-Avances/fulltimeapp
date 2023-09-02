import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { AtrasoJustificadoComponent } from 'src/app/modals/atraso-justificado/atraso-justificado.component';

@Component({
  selector: 'app-justificar-atrasos',
  templateUrl: './justificar-atrasos.page.html',
  styleUrls: ['./justificar-atrasos.page.scss'],
})
export class JustificarAtrasosPage implements OnInit {

  modal: any;

  constructor(
    public modalController: ModalController,
    public platform: Platform,
    private router: Router,
    ) {}

  ngOnInit() {
  }

  async presentModal(objeto: any) {
    console.log('entro a modal...');
    const modal = await this.modalController.create({
      component: AtrasoJustificadoComponent,
      componentProps: {
        'data': objeto,
      },
      cssClass: 'my-custom-class'
    });
    this.modal = modal;
    return await modal.present();
  }

}
