import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-alimentacion-solicitud',
  templateUrl: './alimentacion-solicitud.page.html',
  styleUrls: ['./alimentacion-solicitud.page.scss'],
})
export class AlimentacionSolicitudPage implements OnInit{

  constructor(
    public platform: Platform,
    ) {}

  ngOnInit() {
  }

}
