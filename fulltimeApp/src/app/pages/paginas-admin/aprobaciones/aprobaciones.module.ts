import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ComponentesModule } from 'src/app/componentes/componentes.module';

import {
  AprobacionesPageRoutingModule
} from './aprobaciones-routing.module';
import { AprobacionesPage } from './aprobaciones.page';

//modulo paginacion
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AprobacionesPageRoutingModule,
    NgxPaginationModule,
    ComponentesModule

  ],
  declarations: [AprobacionesPage]
})
export class AprobacionesPageModule { }
