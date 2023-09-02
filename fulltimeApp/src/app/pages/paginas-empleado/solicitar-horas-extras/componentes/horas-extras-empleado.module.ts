import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ModulopipesModule } from 'src/app/pipes/modulopipes.module';
import { ComponentesModule } from 'src/app/componentes/componentes.module';

import { ListaHoraExtraComponent } from './lista-hora-extra/lista-hora-extra.component';
import { RegistrarHoraExtraComponent } from './registrar-hora-extra/registrar-hora-extra.component';
import { VerHoraExtraComponent } from './ver-hora-extra/ver-hora-extra.component';
import { EditarHoraExtraComponent } from './editar-hora-extra/editar-hora-extra.component';

import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  declarations: [
    ListaHoraExtraComponent,
    RegistrarHoraExtraComponent,
    VerHoraExtraComponent,
    EditarHoraExtraComponent
  ],
  exports: [
    ListaHoraExtraComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ModulopipesModule,
    ComponentesModule,
    NgxPaginationModule,
  ]
})
export class HorasExtrasEmpleadoModule { }
