import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PermisoDetalleSolicitudPageRoutingModule } from './permiso-detalle-solicitud-routing.module';

import { PermisoDetalleSolicitudPage } from './permiso-detalle-solicitud.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PermisoDetalleSolicitudPageRoutingModule
  ],
  declarations: [PermisoDetalleSolicitudPage]
})
export class PermisoDetalleSolicitudPageModule {}
