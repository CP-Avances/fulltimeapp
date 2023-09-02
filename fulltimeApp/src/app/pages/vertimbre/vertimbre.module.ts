import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { VertimbrePage } from './vertimbre.page';
import { ComponentesModule } from 'src/app/componentes/componentes.module';
import { VertimbrePageRoutingModule } from './vertimbre-routing.module';

//modulo paginacion
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    VertimbrePageRoutingModule,
    ComponentesModule,
    NgxPaginationModule
  ],
  declarations: [VertimbrePage]
})
export class VertimbrePageModule {}
