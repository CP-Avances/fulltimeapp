import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolicitudesPage } from './solicitudes.page';

const routes: Routes = [
  {
    path: '',
    component: SolicitudesPage
  },
  {
    path: '',
    redirectTo: '/adminpage/solicitudes',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolicitudesPageRoutingModule {}
