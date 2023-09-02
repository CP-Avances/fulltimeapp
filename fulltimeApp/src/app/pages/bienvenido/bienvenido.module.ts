import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BienvenidoPage } from './bienvenido.page';
import { BienvenidoPageRoutingModule } from './bienvenido-routing.module';
import { TimbresPerdidosComponent } from './showTimbresGuardados.component';
import { ComponentesModule } from '../../componentes/componentes.module';




@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    BienvenidoPageRoutingModule,
    ComponentesModule
  ],
  declarations: [BienvenidoPage, TimbresPerdidosComponent]
})
export class BienvenidoPageModule {}
