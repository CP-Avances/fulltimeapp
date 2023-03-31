import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { ListaVacacionesAdminComponent } from './lista-vacaciones-admin/lista-vacaciones-admin.component';
import { ModulopipesModule } from 'src/app/pipes/modulopipes.module';
import { ComponentesModule } from 'src/app/componentes/componentes.module';
import { ShowLabelComponent } from './lista-vacaciones-admin/show-data-label.component';

//modulo paginacion
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  declarations: [
    ListaVacacionesAdminComponent,
    ShowLabelComponent
  ],
  exports: [
    ListaVacacionesAdminComponent,
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
export class VacacionesAdminModule { }
