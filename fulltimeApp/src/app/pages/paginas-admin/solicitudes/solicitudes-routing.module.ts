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
    path: 'hora-extra-solicitud',
    loadChildren: () => import('./hora-extra-solicitud/hora-extra-solicitud.module').then( m => m.HoraExtraSolicitudPageModule)
  },
  {
    path: 'vacacion-solicitud',
    loadChildren: () => import('./vacacion-solicitud/vacacion-solicitud.module').then( m => m.VacacionSolicitudPageModule)
  },
  {
    path: 'alimentacion-solicitud',
    loadChildren: () => import('./alimentacion-solicitud/alimentacion-solicitud.module').then( m => m.AlimentacionSolicitudPageModule)
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
