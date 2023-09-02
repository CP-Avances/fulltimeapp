import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-vacacion-solicitud',
  templateUrl: './vacacion-solicitud.page.html',
  styleUrls: ['./vacacion-solicitud.page.scss'],
})
export class VacacionSolicitudPage implements OnInit {

  constructor(
    public platform: Platform,
    ) {}

  ngOnInit() {
  }

}
