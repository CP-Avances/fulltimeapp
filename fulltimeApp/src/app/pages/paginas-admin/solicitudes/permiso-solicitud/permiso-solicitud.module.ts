import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { PermisoSolicitudPageRoutingModule } from './permiso-solicitud-routing.module';
import { PermisoSolicitudPage } from './permiso-solicitud.page';
import { PermisosAdminModule } from './componentes/permisos-admin/permisos-admin.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PermisoSolicitudPageRoutingModule,
    PermisosAdminModule
  ],
  declarations: [PermisoSolicitudPage]
})
export class PermisoSolicitudPageModule { }
