import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistrarVacacionPageRoutingModule } from './registrar-vacacion-routing.module';

import { RegistrarVacacionPage } from './registrar-vacacion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistrarVacacionPageRoutingModule
  ],
  declarations: [RegistrarVacacionPage]
})
export class RegistrarVacacionPageModule {}
