import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReporteSolicitudesPageRoutingModule } from './reporte-solicitudes-routing.module';

import { ReporteSolicitudesPage } from './reporte-solicitudes.page';
import { ComponentesModule } from '../../../../componentes/componentes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReporteSolicitudesPageRoutingModule,
    ComponentesModule
  ],
  declarations: [ReporteSolicitudesPage]
})
export class ReporteSolicitudesPageModule { }
