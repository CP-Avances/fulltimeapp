import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SolicitarHorasExtrasPageRoutingModule } from './solicitar-horas-extras-routing.module';
import { SolicitarHorasExtrasPage } from './solicitar-horas-extras.page';
import { HorasExtrasEmpleadoModule } from './componentes/horas-extras-empleado.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SolicitarHorasExtrasPageRoutingModule,
    HorasExtrasEmpleadoModule
  ],
  declarations: [SolicitarHorasExtrasPage]
})
export class SolicitarHorasExtrasPageModule { }
