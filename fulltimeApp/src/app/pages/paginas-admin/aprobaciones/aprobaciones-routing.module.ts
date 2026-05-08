import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AprobacionesPage } from './aprobaciones.page';

const routes: Routes = [
  {
    path: '',
    component: AprobacionesPage
  },
  {
    path: 'permiso-aprobacion',
    loadChildren: () => import('../aprobar-permisos/aprobar-permisos.module').then( m => m.AprobarPermisosPageModule)
  },
  {
    path: 'vacacion-aprobacion',
    loadChildren: () => import('../aprobar-vacaciones/aprobar-vacaciones.module').then( m => m.AprobarVacacionesPageModule)
  },
  {
    path: '',
    redirectTo: '/reloj/solicitudes',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AprobacionesPageRoutingModule {}
