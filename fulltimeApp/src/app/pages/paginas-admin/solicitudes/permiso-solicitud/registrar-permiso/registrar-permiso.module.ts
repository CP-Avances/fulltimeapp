import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistrarPermisoPageRoutingModule } from './registrar-permiso-routing.module';

import { RegistrarPermisoPage } from './registrar-permiso.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistrarPermisoPageRoutingModule
  ],
  declarations: [RegistrarPermisoPage]
})
export class RegistrarPermisoPageModule {}
