import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VacacionDetalleSolicitudPage } from './vacacion-detalle-solicitud.page';

const routes: Routes = [
  {
    path: '',
    component: VacacionDetalleSolicitudPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VacacionDetalleSolicitudPageRoutingModule {}
