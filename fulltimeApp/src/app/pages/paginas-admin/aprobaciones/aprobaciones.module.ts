import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AprobacionesPageRoutingModule } from './aprobaciones-routing.module';

import { AprobacionesPage } from './aprobaciones.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AprobacionesPageRoutingModule
  ],
  declarations: [AprobacionesPage]
})
export class AprobacionesPageModule {}
