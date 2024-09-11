import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

import { IonicModule } from '@ionic/angular';

import { ReporteTimbresPageRoutingModule } from './reporte-timbres-routing.module';

import { ReporteTimbresPage } from './reporte-timbres.page';
import { ComponentesModule } from '../../../../componentes/componentes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReporteTimbresPageRoutingModule,
    ComponentesModule, 
    NgxPaginationModule
  ],
  declarations: [ReporteTimbresPage]
})
export class ReporteTimbresPageModule { }
