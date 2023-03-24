import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AlimentacionSolicitudPageRoutingModule } from './alimentacion-solicitud-routing.module';
import { AlimentacionSolicitudPage } from './alimentacion-solicitud.page';
import { AlimentacionAdminModule } from './componentes/alimentacion-admin/alimentacion-admin.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AlimentacionSolicitudPageRoutingModule,
    AlimentacionAdminModule
  ],
  declarations: [AlimentacionSolicitudPage]
})
export class AlimentacionSolicitudPageModule { }
