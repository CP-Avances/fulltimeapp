import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { HoraExtraSolicitudPageRoutingModule } from './hora-extra-solicitud-routing.module';
import { HoraExtraSolicitudPage } from './hora-extra-solicitud.page';
import { HoraExtraAdminModule } from './componentes/hora-extra-admin/hora-extra-admin.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HoraExtraSolicitudPageRoutingModule,
    HoraExtraAdminModule
  ],
  declarations: [HoraExtraSolicitudPage]
})
export class HoraExtraSolicitudPageModule { }
