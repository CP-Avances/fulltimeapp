import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActualizarTimbresPage } from './actualizar-timbres.page';

const routes: Routes = [
  {
    path: '',
    component: ActualizarTimbresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActualizarTimbresPageRoutingModule {}
