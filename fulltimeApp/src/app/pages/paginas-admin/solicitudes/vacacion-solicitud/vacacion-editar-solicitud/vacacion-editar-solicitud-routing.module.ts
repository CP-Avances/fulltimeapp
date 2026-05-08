import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VacacionEditarSolicitudPage } from './vacacion-editar-solicitud.page';

const routes: Routes = [
  {
    path: '',
    component: VacacionEditarSolicitudPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VacacionEditarSolicitudPageRoutingModule {}
