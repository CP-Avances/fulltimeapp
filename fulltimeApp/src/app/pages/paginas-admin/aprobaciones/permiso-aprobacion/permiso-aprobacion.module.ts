import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PermisoAprobacionPageRoutingModule } from './permiso-aprobacion-routing.module';

import { PermisoAprobacionPage } from './permiso-aprobacion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PermisoAprobacionPageRoutingModule
  ],
  declarations: [PermisoAprobacionPage]
})
export class PermisoAprobacionPageModule {}
