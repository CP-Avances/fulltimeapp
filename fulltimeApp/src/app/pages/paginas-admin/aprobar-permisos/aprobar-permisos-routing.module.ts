import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AprobarPermisosPage } from './aprobar-permisos.page';

const routes: Routes = [
  {
    path: '',
    component: AprobarPermisosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AprobarPermisosPageRoutingModule {}
