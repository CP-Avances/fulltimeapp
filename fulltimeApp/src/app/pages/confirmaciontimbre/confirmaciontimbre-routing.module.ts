import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfirmaciontimbrePage } from './confirmaciontimbre.page';

const routes: Routes = [
  {
    path: '',
    component: ConfirmaciontimbrePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfirmaciontimbrePageRoutingModule {}
