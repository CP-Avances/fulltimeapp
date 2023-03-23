import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolicitarPermisosPage } from './solicitar-permisos.page';

const routes: Routes = [
  {
    path: '',
    component: SolicitarPermisosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolicitarPermisosPageRoutingModule {}
