import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReporteHorasExtrasPage } from './reporte-horas-extras.page';

const routes: Routes = [
  {
    path: '',
    component: ReporteHorasExtrasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReporteHorasExtrasPageRoutingModule {}
