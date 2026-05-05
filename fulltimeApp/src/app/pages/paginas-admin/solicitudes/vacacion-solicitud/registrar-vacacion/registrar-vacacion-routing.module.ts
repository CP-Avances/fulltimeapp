import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistrarVacacionPage } from './registrar-vacacion.page';

const routes: Routes = [
  {
    path: '',
    component: RegistrarVacacionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrarVacacionPageRoutingModule {}
