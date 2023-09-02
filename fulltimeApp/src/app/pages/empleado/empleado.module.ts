import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { EmpleadoPage } from './empleado.page';
import { EmpleadoPageRoutingModule } from './empleado-routing.module';
import { ComponentesModule } from 'src/app/componentes/componentes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmpleadoPageRoutingModule,
    ComponentesModule
  ],
  declarations: [EmpleadoPage]
})
export class EmpleadoPageModule {}
