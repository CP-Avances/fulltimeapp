import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { TimbreJustificadoComponent } from 'src/app/modals/timbre-justificado/timbre-justificado.component';

@Component({
  selector: 'app-justificar-timbres',
  templateUrl: './justificar-timbres.page.html',
  styleUrls: ['./justificar-timbres.page.scss'],
})
export class JustificarTimbresPage implements OnInit {

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
      component: TimbreJustificadoComponent,
      componentProps: {
        'data': objeto,
      },
      cssClass: 'my-custom-class'
    });
    this.modal = modal;
    return await modal.present();
  }

}
