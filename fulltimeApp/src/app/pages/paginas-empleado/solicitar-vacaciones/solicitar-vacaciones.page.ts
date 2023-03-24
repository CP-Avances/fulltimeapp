import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-solicitar-vacaciones',
  templateUrl: './solicitar-vacaciones.page.html',
  styleUrls: ['./solicitar-vacaciones.page.scss'],
})
export class SolicitarVacacionesPage {

  constructor(
    public platform: Platform,
    ) {}

}
