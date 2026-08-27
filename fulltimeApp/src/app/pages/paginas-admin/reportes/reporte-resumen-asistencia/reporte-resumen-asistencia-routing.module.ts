import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReporteResumenAsistenciaPage } from './reporte-resumen-asistencia.page';

const routes: Routes = [
  {
    path: '',
    component: ReporteResumenAsistenciaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReporteResumenAsistenciaPageRoutingModule {}
