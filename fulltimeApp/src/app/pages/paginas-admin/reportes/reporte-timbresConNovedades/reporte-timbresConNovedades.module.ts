import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ReporteTimbresConNovedadesPageRoutingModule } from './reporte-timbresConNovedades-routing.module';
import {ReporteTimbresConNovedadesPage } from './reporte-timbresConNovedades.page';

import { IonicModule } from '@ionic/angular';

import { ComponentesModule } from '../../../../componentes/componentes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReporteTimbresConNovedadesPageRoutingModule, 
    ComponentesModule
  ],
  declarations: [ReporteTimbresConNovedadesPage]
})
export class ReporteTimbresConNovedadesPageModule { }
