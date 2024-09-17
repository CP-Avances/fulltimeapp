import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { IonicModule } from '@ionic/angular';
import { ReporteInasistenciaPageRoutingModule } from './reporte-inasistencia-routing.module';
import { ReporteInasistenciaPage } from './reporte-inasistencia.page';
import { ComponentesModule } from '../../../../componentes/componentes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReporteInasistenciaPageRoutingModule,
    ComponentesModule,
    NgxPaginationModule

  ],
  declarations: [ReporteInasistenciaPage]
})
export class ReporteInasistenciaPageModule { }
