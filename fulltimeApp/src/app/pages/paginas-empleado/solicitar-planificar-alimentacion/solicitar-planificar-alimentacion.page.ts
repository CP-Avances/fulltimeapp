import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-solicitar-planificar-alimentacion',
  templateUrl: './solicitar-planificar-alimentacion.page.html',
  styleUrls: ['./solicitar-planificar-alimentacion.page.scss'],
})
export class SolicitarPlanificarAlimentacionPage {

  constructor(
    public platform: Platform,
    ) {}

}
