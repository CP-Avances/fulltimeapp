import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VertimbrePage } from './vertimbre.page';

const routes: Routes = [
  {
    path: '',
    component: VertimbrePage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VertimbrePageRoutingModule {}
