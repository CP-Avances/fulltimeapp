import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AprobarVacacionesPage } from './aprobar-vacaciones.page';

const routes: Routes = [
  {
    path: '',
    component: AprobarVacacionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AprobarVacacionesPageRoutingModule {}
