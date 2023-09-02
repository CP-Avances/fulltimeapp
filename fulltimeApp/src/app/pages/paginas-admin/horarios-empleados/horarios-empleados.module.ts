import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { HorariosEmpleadosPage } from './horarios-empleados.page';
import { HorariosEmpleadosPageRoutingModule } from './horarios-empleados-routing.module';
import { ComponentesModule } from 'src/app/componentes/componentes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HorariosEmpleadosPageRoutingModule,
    ComponentesModule
  ],
  declarations: [HorariosEmpleadosPage]
})
export class HorariosEmpleadosPageModule {}
