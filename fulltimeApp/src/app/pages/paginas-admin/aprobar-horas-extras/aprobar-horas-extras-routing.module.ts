import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AprobarHorasExtrasPage } from './aprobar-horas-extras.page';

const routes: Routes = [
  {
    path: '',
    component: AprobarHorasExtrasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AprobarHorasExtrasPageRoutingModule {}
