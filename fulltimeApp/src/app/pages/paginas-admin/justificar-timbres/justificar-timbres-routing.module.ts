import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JustificarTimbresPage } from './justificar-timbres.page';

const routes: Routes = [
  {
    path: '',
    component: JustificarTimbresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JustificarTimbresPageRoutingModule {}
