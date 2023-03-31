import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { ListaHorasExtrasAdminComponent } from './lista-horas-extras-admin/lista-horas-extras-admin.component';
import { ModulopipesModule } from '../../../../pipes/modulopipes.module';
import { ComponentesModule } from '../../../../componentes/componentes.module';
import { ShowLabelComponent } from './lista-horas-extras-admin/show-data-label.component';

//modulo paginacion
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  declarations: [
    ListaHorasExtrasAdminComponent,
    ShowLabelComponent
  ],
  exports: [
    ListaHorasExtrasAdminComponent,
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
export class HorasExtrasAdminModule { }
