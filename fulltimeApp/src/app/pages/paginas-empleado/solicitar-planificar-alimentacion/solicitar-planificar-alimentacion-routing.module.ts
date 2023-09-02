import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolicitarPlanificarAlimentacionPage } from './solicitar-planificar-alimentacion.page';

const routes: Routes = [
  {
    path: '',
    component: SolicitarPlanificarAlimentacionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolicitarPlanificarAlimentacionPageRoutingModule {}
