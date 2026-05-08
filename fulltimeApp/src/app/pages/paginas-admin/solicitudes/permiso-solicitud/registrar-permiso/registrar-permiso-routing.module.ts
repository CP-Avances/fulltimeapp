import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistrarPermisoPage } from './registrar-permiso.page';

const routes: Routes = [
  {
    path: '',
    component: RegistrarPermisoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrarPermisoPageRoutingModule {}
