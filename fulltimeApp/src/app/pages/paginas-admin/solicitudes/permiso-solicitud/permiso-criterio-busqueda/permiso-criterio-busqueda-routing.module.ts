import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PermisoCriterioBusquedaPage } from './permiso-criterio-busqueda.page';

const routes: Routes = [
  {
    path: '',
    component: PermisoCriterioBusquedaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PermisoCriterioBusquedaPageRoutingModule {}
