import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VacacionSolicitudPage } from './vacacion-solicitud.page';

const routes: Routes = [
  {
    path: '',
    component: VacacionSolicitudPage
  },
  {
    path: 'registrar-vacacion',
    loadChildren: () => import('./registrar-vacacion/registrar-vacacion.module').then( m => m.RegistrarVacacionPageModule)
  },
  {
    path: 'vacacion-criterio-busqueda',
    loadChildren: () => import('./vacacion-criterio-busqueda/vacacion-criterio-busqueda.module').then( m => m.VacacionCriterioBusquedaPageModule)
  },
  {
    path: 'vacacion-detalle-solicitud',
    loadChildren: () => import('./vacacion-detalle-solicitud/vacacion-detalle-solicitud.module').then( m => m.VacacionDetalleSolicitudPageModule)
  },
  {
    path: 'vacacion-editar-solicitud',
    loadChildren: () => import('./vacacion-editar-solicitud/vacacion-editar-solicitud.module').then( m => m.VacacionEditarSolicitudPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VacacionSolicitudPageRoutingModule {}
