import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AprobarPermisosPageRoutingModule } from './aprobar-permisos-routing.module';
import { PermisosAdminModule } from './componentes/permisos-admin.module';

import { AprobarPermisosPage } from './aprobar-permisos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AprobarPermisosPageRoutingModule,
    PermisosAdminModule
  ],
  declarations: [AprobarPermisosPage]
})
export class AprobarPermisosPageModule { }
