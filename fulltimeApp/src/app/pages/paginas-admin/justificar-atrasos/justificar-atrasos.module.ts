import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { JustificarAtrasosPageRoutingModule } from './justificar-atrasos-routing.module';
import { JustificarAtrasosPage } from './justificar-atrasos.page';
import { ComponentesModule } from 'src/app/componentes/componentes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JustificarAtrasosPageRoutingModule,
    ComponentesModule
  ],
  declarations: [JustificarAtrasosPage]
})
export class JustificarAtrasosPageModule { }
