import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { VacacionSolicitudPageRoutingModule } from './vacacion-solicitud-routing.module';
import { VacacionSolicitudPage } from './vacacion-solicitud.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VacacionSolicitudPageRoutingModule,
  ],
  declarations: [VacacionSolicitudPage]
})
export class VacacionSolicitudPageModule { }
