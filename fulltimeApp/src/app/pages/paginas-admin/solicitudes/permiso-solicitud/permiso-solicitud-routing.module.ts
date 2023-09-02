import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PermisoSolicitudPage } from './permiso-solicitud.page';

const routes: Routes = [
  {
    path: '',
    component: PermisoSolicitudPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PermisoSolicitudPageRoutingModule {}
