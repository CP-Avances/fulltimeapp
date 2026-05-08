import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VacacionDetalleSolicitudPageRoutingModule } from './vacacion-detalle-solicitud-routing.module';

import { VacacionDetalleSolicitudPage } from './vacacion-detalle-solicitud.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VacacionDetalleSolicitudPageRoutingModule
  ],
  declarations: [VacacionDetalleSolicitudPage]
})
export class VacacionDetalleSolicitudPageModule {}
