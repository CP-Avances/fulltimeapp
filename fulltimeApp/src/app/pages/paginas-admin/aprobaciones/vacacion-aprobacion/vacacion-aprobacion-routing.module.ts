import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VacacionAprobacionPage } from './vacacion-aprobacion.page';

const routes: Routes = [
  {
    path: '',
    component: VacacionAprobacionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VacacionAprobacionPageRoutingModule {}
