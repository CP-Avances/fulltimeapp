import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InformacionEmpleadoPage } from './informacion-empleado.page';

const routes: Routes = [
  {
    path: '',
    component: InformacionEmpleadoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InformacionEmpleadoPageRoutingModule {}
