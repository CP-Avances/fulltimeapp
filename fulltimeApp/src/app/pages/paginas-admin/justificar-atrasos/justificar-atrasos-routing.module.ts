import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JustificarAtrasosPage } from './justificar-atrasos.page';

const routes: Routes = [
  {
    path: '',
    component: JustificarAtrasosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JustificarAtrasosPageRoutingModule {}
