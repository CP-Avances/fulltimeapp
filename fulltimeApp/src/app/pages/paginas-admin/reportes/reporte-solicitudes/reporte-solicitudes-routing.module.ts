import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReporteSolicitudesPage } from './reporte-solicitudes.page';

const routes: Routes = [
  {
    path: '',
    component: ReporteSolicitudesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReporteSolicitudesPageRoutingModule {}
