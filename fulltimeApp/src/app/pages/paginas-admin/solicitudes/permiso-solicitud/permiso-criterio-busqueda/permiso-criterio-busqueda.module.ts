import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PermisoCriterioBusquedaPageRoutingModule } from './permiso-criterio-busqueda-routing.module';

import { PermisoCriterioBusquedaPage } from './permiso-criterio-busqueda.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PermisoCriterioBusquedaPageRoutingModule
  ],
  declarations: [PermisoCriterioBusquedaPage]
})
export class PermisoCriterioBusquedaPageModule {}
