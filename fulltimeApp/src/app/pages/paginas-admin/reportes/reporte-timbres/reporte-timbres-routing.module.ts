import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReporteTimbresPage } from './reporte-timbres.page';

const routes: Routes = [
  {
    path: '',
    component: ReporteTimbresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReporteTimbresPageRoutingModule { }
