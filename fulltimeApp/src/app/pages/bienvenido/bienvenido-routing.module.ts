import { LOCALE_ID, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BienvenidoPage } from './bienvenido.page';

import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localeEs, 'es');

const routes: Routes = [
  {
    path: '',
    component: BienvenidoPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [{provide: LOCALE_ID, useValue: 'es'}],
})
export class BienvenidoPageRoutingModule {}
