import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vacacion-solicitud',
  templateUrl: './vacacion-solicitud.page.html',
  styleUrls: ['./vacacion-solicitud.page.scss'],
})
export class VacacionSolicitudPage implements OnInit {

  constructor(
    public platform: Platform,
    private router: Router,
  ) {}

  ngOnInit() {
  }

  irSolicitarVacacion() {
    this.router.navigateByUrl('/reloj/solicitudes/vacacion-solicitud/registrar-vacacion');
  }

  irMisSolicitudes() {
    this.router.navigateByUrl('/reloj/solicitudes/vacacion-solicitud/vacacion-criterio-busqueda');
  }
}