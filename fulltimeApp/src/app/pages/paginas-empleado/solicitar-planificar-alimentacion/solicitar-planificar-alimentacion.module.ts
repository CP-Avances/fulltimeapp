import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SolicitarPlanificarAlimentacionPageRoutingModule } from './solicitar-planificar-alimentacion-routing.module';
import { SolicitarPlanificarAlimentacionPage } from './solicitar-planificar-alimentacion.page';
import { AlimentacionEmpleadoModule } from './componentes/alimentacion-empleado.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SolicitarPlanificarAlimentacionPageRoutingModule,
    AlimentacionEmpleadoModule
  ],
  declarations: [SolicitarPlanificarAlimentacionPage]
})
export class SolicitarPlanificarAlimentacionPageModule { }
