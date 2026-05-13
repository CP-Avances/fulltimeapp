import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PermisoDetalleSolicitudPage } from './permiso-detalle-solicitud.page';

const routes: Routes = [
  {
    path: '',
    component: PermisoDetalleSolicitudPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PermisoDetalleSolicitudPageRoutingModule {}
