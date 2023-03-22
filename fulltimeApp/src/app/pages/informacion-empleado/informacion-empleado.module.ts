import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InformacionEmpleadoPageRoutingModule } from './informacion-empleado-routing.module';

import { InformacionEmpleadoPage } from './informacion-empleado.page';
import { ComponentesModule } from '../../componentes/componentes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InformacionEmpleadoPageRoutingModule,
    ComponentesModule
  ],
  declarations: [InformacionEmpleadoPage]
})
export class InformacionEmpleadoPageModule { }
