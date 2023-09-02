import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ModulopipesModule } from 'src/app/pipes/modulopipes.module';
import { ComponentesModule } from 'src/app/componentes/componentes.module';

import { VacacionListaComponent } from '../vacacion-lista/vacacion-lista.component';

//modulo paginacion
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  declarations: [
    VacacionListaComponent
  ],
  exports: [
    VacacionListaComponent,
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
export class VacacionAdminModule { }
