import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SolicitarPermisosPageRoutingModule } from './solicitar-permisos-routing.module';
import { SolicitarPermisosPage } from './solicitar-permisos.page';
import { PermisosEmpleadoModule } from './componentes/permisos-empleado.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SolicitarPermisosPageRoutingModule,
    PermisosEmpleadoModule
  ],
  declarations: [SolicitarPermisosPage]
})
export class SolicitarPermisosPageModule { }
