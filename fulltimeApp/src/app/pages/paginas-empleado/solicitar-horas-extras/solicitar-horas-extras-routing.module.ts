import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolicitarHorasExtrasPage } from './solicitar-horas-extras.page';

const routes: Routes = [
  {
    path: '',
    component: SolicitarHorasExtrasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolicitarHorasExtrasPageRoutingModule {}
