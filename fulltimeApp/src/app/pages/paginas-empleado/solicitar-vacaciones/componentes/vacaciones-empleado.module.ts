import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ModulopipesModule } from '../../../../pipes/modulopipes.module';
import { ComponentesModule } from '../../../../componentes/componentes.module';

import { ListaVacacionComponent } from './lista-vacacion/lista-vacacion.component';
import { RegistrarVacacionComponent } from './registrar-vacacion/registrar-vacacion.component';
import { VerVacacionComponent } from './ver-vacacion/ver-vacacion.component';
import { EditarVacacionComponent } from './editar-vacacion/editar-vacacion.component';

//Modulo paginacion NxgPaginationModule
import{NgxPaginationModule}from 'ngx-pagination';

@NgModule({
  declarations: [
    ListaVacacionComponent,
    RegistrarVacacionComponent,
    VerVacacionComponent,
    EditarVacacionComponent
  ],
  exports: [
    ListaVacacionComponent,
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
export class VacacionesEmpleadoModule { }
