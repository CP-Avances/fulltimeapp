import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReporteAlimentacionPageRoutingModule } from './reporte-alimentacion-routing.module';

import { ReporteAlimentacionPage } from './reporte-alimentacion.page';
import { ComponentesModule } from '../../../../componentes/componentes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReporteAlimentacionPageRoutingModule,
    ComponentesModule
  ],
  declarations: [ReporteAlimentacionPage]
})
export class ReporteAlimentacionPageModule { }
