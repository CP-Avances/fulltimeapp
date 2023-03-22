import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SolicitudesPageRoutingModule } from './solicitudes-routing.module';
import { SolicitudesPage } from './solicitudes.page';

//modulo paginacion
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SolicitudesPageRoutingModule,
    NgxPaginationModule
  ],
  declarations: [SolicitudesPage]
})
export class SolicitudesPageModule {}
