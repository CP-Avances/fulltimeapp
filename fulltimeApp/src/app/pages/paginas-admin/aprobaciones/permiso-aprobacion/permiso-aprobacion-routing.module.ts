import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PermisoAprobacionPage } from './permiso-aprobacion.page';

const routes: Routes = [
  {
    path: '',
    component: PermisoAprobacionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PermisoAprobacionPageRoutingModule {}
