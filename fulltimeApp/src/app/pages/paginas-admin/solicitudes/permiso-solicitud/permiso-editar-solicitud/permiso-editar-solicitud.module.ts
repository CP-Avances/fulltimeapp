import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PermisoEditarSolicitudPageRoutingModule } from './permiso-editar-solicitud-routing.module';

import { PermisoEditarSolicitudPage } from './permiso-editar-solicitud.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PermisoEditarSolicitudPageRoutingModule
  ],
  declarations: [PermisoEditarSolicitudPage]
})
export class PermisoEditarSolicitudPageModule {}
