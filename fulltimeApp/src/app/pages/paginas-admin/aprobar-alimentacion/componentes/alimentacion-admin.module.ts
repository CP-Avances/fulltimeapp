import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { ListaAlimentacionAdminComponent } from './lista-alimentacion-admin/lista-alimentacion-admin.component';
import { ModulopipesModule } from '../../../../pipes/modulopipes.module';
import { ComponentesModule } from '../../../../componentes/componentes.module';
import { EstadosComponent } from './estados/estados.component';
import { ShowLabelComponent } from './lista-alimentacion-admin/show-data-label.component';
import { AprobacionMultipleComponent } from './aprobacion-multiple/aprobacion-multiple.component';
import { UpdateAutorizacionMultipleComponent } from './update-autorizacion-multiple/update-autorizacion-multiple.component';
import { ShowAlimentacionMultipleComponent } from './update-autorizacion-multiple/show-alimentacion-multiple.component';

//modulo paginacion
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  declarations: [
    ListaAlimentacionAdminComponent,
    EstadosComponent,
    ShowLabelComponent,
    AprobacionMultipleComponent,
    UpdateAutorizacionMultipleComponent,
    ShowAlimentacionMultipleComponent
  ],
  exports: [
    ListaAlimentacionAdminComponent,
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
export class AlimentacionAdminModule { }
