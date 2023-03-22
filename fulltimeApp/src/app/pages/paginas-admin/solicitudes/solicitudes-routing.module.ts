import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolicitudesPage } from './solicitudes.page';

const routes: Routes = [
  {
    path: '',
    component: SolicitudesPage
  },
  {
    path: 'permiso-solicitud',
    loadChildren: () => import('./permiso-solicitud/permiso-solicitud.module').then( m => m.PermisoSolicitudPageModule)
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
