import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolicitarVacacionesPage } from './solicitar-vacaciones.page';

const routes: Routes = [
  {
    path: '',
    component: SolicitarVacacionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolicitarVacacionesPageRoutingModule {}
