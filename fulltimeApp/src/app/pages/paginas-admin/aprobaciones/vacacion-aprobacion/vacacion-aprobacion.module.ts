import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VacacionAprobacionPageRoutingModule } from './vacacion-aprobacion-routing.module';

import { VacacionAprobacionPage } from './vacacion-aprobacion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VacacionAprobacionPageRoutingModule
  ],
  declarations: [VacacionAprobacionPage]
})
export class VacacionAprobacionPageModule {}
