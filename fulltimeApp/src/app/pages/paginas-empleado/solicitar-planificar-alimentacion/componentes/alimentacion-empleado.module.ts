import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ModulopipesModule } from 'src/app/pipes/modulopipes.module';
import { ComponentesModule } from 'src/app/componentes/componentes.module';

import { ListaAlimentacionComponent } from './lista-alimentacion/lista-alimentacion.component';
import { RegistrarAlimentacionComponent } from './registrar-alimentacion/registrar-alimentacion.component';
import { VerAlimentacionComponent } from './ver-alimentacion/ver-alimentacion.component';
import { EditarAlimentacionComponent } from './editar-alimentacion/editar-alimentacion.component';

//Modulo paginacion NxgPaginationModule
import{NgxPaginationModule}from 'ngx-pagination';

@NgModule({
  declarations: [
    ListaAlimentacionComponent,
    RegistrarAlimentacionComponent,
    VerAlimentacionComponent,
    EditarAlimentacionComponent,
  ],
  exports: [
    ListaAlimentacionComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ModulopipesModule,
    ComponentesModule,
    NgxPaginationModule
  ]
})
export class AlimentacionEmpleadoModule { }
