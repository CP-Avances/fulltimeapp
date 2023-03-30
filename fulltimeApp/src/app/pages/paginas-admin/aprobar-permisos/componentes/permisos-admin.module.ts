import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { ListaPermisosAdminComponent } from './lista-permisos-admin/lista-permisos-admin.component';
import { ModulopipesModule } from '../../../../pipes/modulopipes.module';
import { ComponentesModule } from '../../../../componentes/componentes.module';
import { ShowLabelComponent } from './lista-permisos-admin/show-data-label.component';

//modulo paginacion
import {NgxPaginationModule} from 'ngx-pagination';


@NgModule({
  declarations: [
    ListaPermisosAdminComponent,
    ShowLabelComponent
  ],
  exports: [
    ListaPermisosAdminComponent,
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
export class PermisosAdminModule { }
