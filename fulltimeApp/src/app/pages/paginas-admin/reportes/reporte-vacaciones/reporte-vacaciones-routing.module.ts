import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReporteVacacionesPage } from './reporte-vacaciones.page';

const routes: Routes = [
  {
    path: '',
    component: ReporteVacacionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReporteVacacionesPageRoutingModule {}
