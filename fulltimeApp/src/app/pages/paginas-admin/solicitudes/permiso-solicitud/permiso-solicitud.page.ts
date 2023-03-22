import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

import { CloseModalComponent } from 'src/app/componentes/close-modal/close-modal.component';

@Component({
  selector: 'app-permiso-solicitud',
  templateUrl: './permiso-solicitud.page.html',
  styleUrls: ['./permiso-solicitud.page.scss'],
})
export class PermisoSolicitudPage implements OnInit {

  constructor(
    public platform: Platform,
    private router: Router,
    ) {}

  ngOnInit() {
  }

}
