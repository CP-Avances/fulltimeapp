import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PermisoEditarSolicitudPage } from './permiso-editar-solicitud.page';

const routes: Routes = [
  {
    path: '',
    component: PermisoEditarSolicitudPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PermisoEditarSolicitudPageRoutingModule {}
