import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ActualizarTimbresPageRoutingModule } from './actualizar-timbres-routing.module';

import { ActualizarTimbresPage } from './actualizar-timbres.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ActualizarTimbresPageRoutingModule
  ],
  declarations: [ActualizarTimbresPage]
})
export class ActualizarTimbresPageModule { }
