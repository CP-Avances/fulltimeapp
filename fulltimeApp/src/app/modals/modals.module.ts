import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

//modulo paginacion
import {NgxPaginationModule} from 'ngx-pagination';

import { ComponentesModule } from '../componentes/componentes.module';
import { ModulopipesModule } from '../pipes/modulopipes.module';

import { AtrasoJustificadoComponent } from './atraso-justificado/atraso-justificado.component';
import { VerHorariosEmpleadosComponent } from './ver-horarios-empleados/ver-horarios-empleados.component';
import { TimbreJustificadoComponent } from './timbre-justificado/timbre-justificado.component';
import { VerTimbreEmpleadoComponent } from './ver-timbre-empleado/ver-timbre-empleado.component';
import { EnviarUsuarioComponent } from '../pages/paginas-admin/comunicado/enviar-usuario/enviar-usuario.component';


@NgModule({
  exports:[
    AtrasoJustificadoComponent,
    VerHorariosEmpleadosComponent,
    TimbreJustificadoComponent,
    VerTimbreEmpleadoComponent,
    EnviarUsuarioComponent
  ],declarations: [
    AtrasoJustificadoComponent,
    VerHorariosEmpleadosComponent,
    TimbreJustificadoComponent,
    VerTimbreEmpleadoComponent,
    EnviarUsuarioComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentesModule,
    ModulopipesModule,
    NgxPaginationModule
  ],
})
export class ModalsPageModule {}
