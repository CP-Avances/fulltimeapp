import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HorariosEmpleadosPage } from './horarios-empleados.page';

const routes: Routes = [
  {
    path: '',
    component: HorariosEmpleadosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HorariosEmpleadosPageRoutingModule {}
