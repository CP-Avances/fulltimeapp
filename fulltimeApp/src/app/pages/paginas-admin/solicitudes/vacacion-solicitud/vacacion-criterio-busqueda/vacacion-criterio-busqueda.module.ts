import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VacacionCriterioBusquedaPageRoutingModule } from './vacacion-criterio-busqueda-routing.module';

import { VacacionCriterioBusquedaPage } from './vacacion-criterio-busqueda.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VacacionCriterioBusquedaPageRoutingModule
  ],
  declarations: [VacacionCriterioBusquedaPage]
})
export class VacacionCriterioBusquedaPageModule {}