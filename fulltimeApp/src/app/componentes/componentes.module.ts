import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavegadorAdminComponent } from './navegador-admin/navegador-admin.component';

import { NotificacionPopoverComponent } from './notificacion-popover/notificacion-popover.component';
import { ListaEmpleadosComponent } from './lista-empleados/lista-empleados.component';
import { DataUserLoggedService } from '../services/data-user-logged.service';
import { EmpleadosService } from '../services/empleados.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { CloseModalComponent } from './close-modal/close-modal.component';
import { RefreshInfoComponent } from './refresh-info/refresh-info.component';
import { ListaNotificacionComponent } from './lista-notificaciones/lista-notificacion.component';


@NgModule({
    declarations: [
        NavegadorAdminComponent,
        NotificacionPopoverComponent,
        CloseModalComponent,
        RefreshInfoComponent,
        ListaEmpleadosComponent,
        ListaNotificacionComponent
    ],
    exports: [
        NavegadorAdminComponent,
        NotificacionPopoverComponent,
        CloseModalComponent,
        RefreshInfoComponent,
        ListaEmpleadosComponent,
        ListaNotificacionComponent
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
