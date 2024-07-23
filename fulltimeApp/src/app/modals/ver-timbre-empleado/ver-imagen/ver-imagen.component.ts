import { Component } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-ver-imagen-modal',
  templateUrl: './ver-imagen.component.html',
  styleUrls: ['./ver-imagen.component.scss'], // Asegúrate de que el nombre del archivo coincida

})
export class VerImagenModalPage {

  imagen: string;

  constructor(private navParams: NavParams, private modalCtrl: ModalController) {
    this.imagen = this.navParams.get('imagen');
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }
}
