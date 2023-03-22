import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InformacionAdminPage } from './informacion-admin.page';

const routes: Routes = [
  {
    path: '',
    component: InformacionAdminPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InformacionAdminPageRoutingModule {}
