import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TimbresEmpleadosPageRoutingModule } from './timbres-empleados-routing.module';
import { TimbresEmpleadosPage } from './timbres-empleados.page';
import { ComponentesModule } from 'src/app/componentes/componentes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TimbresEmpleadosPageRoutingModule,
    ComponentesModule
  ],
  declarations: [TimbresEmpleadosPage]
})
export class TimbresEmpleadosPageModule {}
