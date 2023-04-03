import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReporteAtrasosPage } from './reporte-atrasos.page';

const routes: Routes = [
  {
    path: '',
    component: ReporteAtrasosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReporteAtrasosPageRoutingModule {}
