import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { PermisoSolicitudPageRoutingModule } from './permiso-solicitud-routing.module';
import { PermisoSolicitudPage } from './permiso-solicitud.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PermisoSolicitudPageRoutingModule,
  ],
  declarations: [PermisoSolicitudPage]
})
export class PermisoSolicitudPageModule { }
