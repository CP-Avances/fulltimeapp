import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReporteResumenAsistenciaPageRoutingModule } from './reporte-resumen-asistencia-routing.module';

import { ReporteResumenAsistenciaPage } from './reporte-resumen-asistencia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReporteResumenAsistenciaPageRoutingModule
  ],
  declarations: [ReporteResumenAsistenciaPage]
})
export class ReporteResumenAsistenciaPageModule {}
