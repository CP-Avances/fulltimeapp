import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { VacacionSolicitudPageRoutingModule } from './vacacion-solicitud-routing.module';
import { VacacionSolicitudPage } from './vacacion-solicitud.page';
import { VacacionAdminModule } from './componentes/vacacion-admin/vacacion-admin.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VacacionSolicitudPageRoutingModule,
    VacacionAdminModule
  ],
  declarations: [VacacionSolicitudPage]
})
export class VacacionSolicitudPageModule { }
