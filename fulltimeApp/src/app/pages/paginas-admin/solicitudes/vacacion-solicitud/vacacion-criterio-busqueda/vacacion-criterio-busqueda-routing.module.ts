import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VacacionCriterioBusquedaPage } from './vacacion-criterio-busqueda.page';

const routes: Routes = [
  {
    path: '',
    component: VacacionCriterioBusquedaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VacacionCriterioBusquedaPageRoutingModule {}
