import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SolicitarVacacionesPageRoutingModule } from './solicitar-vacaciones-routing.module';
import { SolicitarVacacionesPage } from './solicitar-vacaciones.page';
import { VacacionesEmpleadoModule } from './componentes/vacaciones-empleado.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SolicitarVacacionesPageRoutingModule,
    VacacionesEmpleadoModule
  ],
  declarations: [SolicitarVacacionesPage]
})
export class SolicitarVacacionesPageModule { }
