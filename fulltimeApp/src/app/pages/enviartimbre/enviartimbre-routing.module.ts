import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EnviartimbrePage } from './enviartimbre.page';

const routes: Routes = [
  {
    path: '',
    component: EnviartimbrePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EnviartimbrePageRoutingModule {}
