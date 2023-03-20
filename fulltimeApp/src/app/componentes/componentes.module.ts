import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavegadorAdminComponent } from './navegador-admin/navegador-admin.component';
import { NotificacionPopoverComponent } from './notificacion-popover/notificacion-popover.component';
import { DataUserLoggedService } from '../services/data-user-logged.service';
import { EmpleadosService } from '../services/empleados.service';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
    declarations: [
        NavegadorAdminComponent,
        NotificacionPopoverComponent
    ],
    exports: [
        NavegadorAdminComponent,
        NotificacionPopoverComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        FormsModule,
        RouterModule,
        NgxPaginationModule
    ],
    providers: [
        DataUserLoggedService,
        EmpleadosService
    ]
})
export class ComponentesModule { }
