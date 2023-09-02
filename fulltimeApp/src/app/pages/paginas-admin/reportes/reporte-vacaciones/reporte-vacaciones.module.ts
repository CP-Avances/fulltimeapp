import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReporteVacacionesPageRoutingModule } from './reporte-vacaciones-routing.module';

import { ReporteVacacionesPage } from './reporte-vacaciones.page';
import { ComponentesModule } from '../../../../componentes/componentes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReporteVacacionesPageRoutingModule,
    ComponentesModule
  ],
  declarations: [ReporteVacacionesPage]
})
export class ReporteVacacionesPageModule { }
