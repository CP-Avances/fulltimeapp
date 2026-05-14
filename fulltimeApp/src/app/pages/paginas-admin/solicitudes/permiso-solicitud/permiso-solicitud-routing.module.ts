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
  },
  {
    path: 'permiso-criterio-busqueda',
    loadChildren: () => import('./permiso-criterio-busqueda/permiso-criterio-busqueda.module').then( m => m.PermisoCriterioBusquedaPageModule)
  },
  {
    path: 'permiso-detalle-solicitud',
    loadChildren: () => import('./permiso-detalle-solicitud/permiso-detalle-solicitud.module').then( m => m.PermisoDetalleSolicitudPageModule)
  },
  {
    path: 'permiso-editar-solicitud',
    loadChildren: () => import('./permiso-editar-solicitud/permiso-editar-solicitud.module').then( m => m.PermisoEditarSolicitudPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PermisoSolicitudPageRoutingModule {}
