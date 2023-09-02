import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AprobarHorasExtrasPageRoutingModule } from './aprobar-horas-extras-routing.module';
import { HorasExtrasAdminModule } from './componentes/horas-extras-admin.module';

import { AprobarHorasExtrasPage } from './aprobar-horas-extras.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AprobarHorasExtrasPageRoutingModule,
    HorasExtrasAdminModule
  ],
  declarations: [AprobarHorasExtrasPage]
})
export class AprobarHorasExtrasPageModule { }
