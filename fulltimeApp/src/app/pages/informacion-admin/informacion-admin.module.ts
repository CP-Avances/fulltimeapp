import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentesModule } from '../../componentes/componentes.module';

import { InformacionAdminPage } from './informacion-admin.page';
import { InformacionAdminPageRoutingModule } from './informacion-admin-routing.module';

//modulo paginacion
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ComponentesModule,
    NgxPaginationModule,
    InformacionAdminPageRoutingModule
  ],
  declarations: [InformacionAdminPage]
})
export class InformacionAdminPageModule {}
