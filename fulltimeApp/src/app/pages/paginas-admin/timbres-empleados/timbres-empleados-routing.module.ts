import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TimbresEmpleadosPage } from './timbres-empleados.page';

const routes: Routes = [
  {
    path: '',
    component: TimbresEmpleadosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TimbresEmpleadosPageRoutingModule {}
