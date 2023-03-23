import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { RegistrarPermisoComponent } from './componentes/registrar-permiso/registrar-permiso.component';

@Component({
  selector: 'app-solicitar-permisos',
  templateUrl: './solicitar-permisos.page.html',
  styleUrls: ['./solicitar-permisos.page.scss'],
})
export class SolicitarPermisosPage {

  constructor(
    public platform: Platform,
    private router: Router,
    ) {}

}
