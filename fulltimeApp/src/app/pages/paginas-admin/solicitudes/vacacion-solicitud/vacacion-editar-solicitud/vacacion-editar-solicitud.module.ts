import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VacacionEditarSolicitudPageRoutingModule } from './vacacion-editar-solicitud-routing.module';

import { VacacionEditarSolicitudPage } from './vacacion-editar-solicitud.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VacacionEditarSolicitudPageRoutingModule
  ],
  declarations: [VacacionEditarSolicitudPage]
})
export class VacacionEditarSolicitudPageModule {}
