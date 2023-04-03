import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReporteAtrasosPageRoutingModule } from './reporte-atrasos-routing.module';

import { ReporteAtrasosPage } from './reporte-atrasos.page';
import { ComponentesModule } from '../../../../componentes/componentes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReporteAtrasosPageRoutingModule,
    ComponentesModule
  ],
  declarations: [ReporteAtrasosPage]
})
export class ReporteAtrasosPageModule { }
