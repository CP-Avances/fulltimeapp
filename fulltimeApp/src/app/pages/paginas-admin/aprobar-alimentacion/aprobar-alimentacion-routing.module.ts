import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AprobarAlimentacionPage } from './aprobar-alimentacion.page';

const routes: Routes = [
  {
    path: '',
    component: AprobarAlimentacionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AprobarAlimentacionPageRoutingModule {}
