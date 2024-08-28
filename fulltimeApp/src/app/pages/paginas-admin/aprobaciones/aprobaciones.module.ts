import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

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
    NgxPaginationModule
  ],
  declarations: [AprobacionesPage]
})
export class AprobacionesPageModule { }
