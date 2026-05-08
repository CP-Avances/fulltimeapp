import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PermisoSolicitudPage } from './permiso-solicitud.page';

const routes: Routes = [
  {
    path: '',
    component: PermisoSolicitudPage
  },
  {
    path: 'registrar-permiso',
    loadChildren: () => import('./registrar-permiso/registrar-permiso.module').then( m => m.RegistrarPermisoPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PermisoSolicitudPageRoutingModule {}
