import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentesModule } from '../../componentes/componentes.module';

import { BienvenidoPage } from './bienvenido.page';
import { BienvenidoPageRoutingModule } from './bienvenido-routing.module';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    BienvenidoPageRoutingModule,
    ComponentesModule
  ],
  declarations: [BienvenidoPage]
})
export class BienvenidoPageModule {}
