import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HoraExtraSolicitudPage } from './hora-extra-solicitud.page';

const routes: Routes = [
  {
    path: '',
    component: HoraExtraSolicitudPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HoraExtraSolicitudPageRoutingModule {}
