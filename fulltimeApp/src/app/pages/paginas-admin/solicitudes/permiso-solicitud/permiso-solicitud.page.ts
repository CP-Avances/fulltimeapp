import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';

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

  irSolicitarPermiso() {
    this.router.navigateByUrl('/reloj/solicitudes/permiso-solicitud/registrar-permiso');
  }

  irMisSolicitudes() {
    this.router.navigateByUrl('/reloj/solicitudes/permiso-solicitud/permiso-criterio-busqueda');
  }
}