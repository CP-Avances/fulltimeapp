import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AprobarVacacionesPageRoutingModule } from './aprobar-vacaciones-routing.module';
import { VacacionesAdminModule } from './componentes/vacaciones-admin.module';

import { AprobarVacacionesPage } from './aprobar-vacaciones.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AprobarVacacionesPageRoutingModule,
    VacacionesAdminModule
  ],
  declarations: [AprobarVacacionesPage]
})
export class AprobarVacacionesPageModule { }
