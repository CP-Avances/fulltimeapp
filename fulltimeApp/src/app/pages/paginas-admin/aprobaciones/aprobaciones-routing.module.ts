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
    loadChildren: () => import('./permiso-aprobacion/permiso-aprobacion.module').then( m => m.PermisoAprobacionPageModule)
  },
  {
    path: 'vacacion-aprobacion',
    loadChildren: () => import('./vacacion-aprobacion/vacacion-aprobacion.module').then( m => m.VacacionAprobacionPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AprobacionesPageRoutingModule {}
