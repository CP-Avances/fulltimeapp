import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VacacionSolicitudPage } from './vacacion-solicitud.page';

const routes: Routes = [
  {
    path: '',
    component: VacacionSolicitudPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VacacionSolicitudPageRoutingModule {}
