import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReporteInasistenciaPage } from './reporte-inasistencia.page';

const routes: Routes = [
  {
    path: '',
    component: ReporteInasistenciaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReporteInasistenciaPageRoutingModule {}
