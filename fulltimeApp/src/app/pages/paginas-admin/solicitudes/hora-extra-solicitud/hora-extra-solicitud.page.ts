import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-hora-extra-solicitud',
  templateUrl: './hora-extra-solicitud.page.html',
  styleUrls: ['./hora-extra-solicitud.page.scss'],
})
export class HoraExtraSolicitudPage implements OnInit {

  constructor(
    public platform: Platform,
    ) {}

  ngOnInit() {
  }

}
