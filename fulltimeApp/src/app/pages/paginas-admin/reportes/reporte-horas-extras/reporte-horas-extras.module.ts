import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReporteHorasExtrasPageRoutingModule } from './reporte-horas-extras-routing.module';

import { ReporteHorasExtrasPage } from './reporte-horas-extras.page';
import { ComponentesModule } from '../../../../componentes/componentes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReporteHorasExtrasPageRoutingModule,
    ComponentesModule
  ],
  declarations: [ReporteHorasExtrasPage]
})
export class ReporteHorasExtrasPageModule { }
