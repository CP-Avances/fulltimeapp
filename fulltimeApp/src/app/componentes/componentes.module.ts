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
import { RangoFechasComponent } from './rango-fechas/rango-fechas.component';
import { CloseModalComponent } from './close-modal/close-modal.component';
import { SaveRegisterComponent } from './accion-buttons/save-register/save-register.component';
import { SearchRegisterComponent } from './accion-buttons/search-register/search-register.component';
import { DeleteRegisterComponent } from './accion-buttons/delete-register/delete-register.component';
import { UpdateRegisterComponent } from './accion-buttons/update-register/update-register.component';
import { RefreshInfoComponent } from './refresh-info/refresh-info.component';
import { ListaNotificacionComponent } from './lista-notificaciones/lista-notificacion.component';
import { PestaniasEstadosComponent } from './pestaniasEstados/pestaniasEstados.component';
import { AprobacionMultipleComponent } from './aprobacion-multiple/aprobacion-multiple.component';



@NgModule({
    declarations: [
        NavegadorAdminComponent,
        NotificacionPopoverComponent,
        CloseModalComponent,
        SaveRegisterComponent,
        SearchRegisterComponent,
        DeleteRegisterComponent,
        UpdateRegisterComponent,
        RefreshInfoComponent,
        ListaEmpleadosComponent,
        ListaNotificacionComponent,
        AprobacionMultipleComponent,
        PestaniasEstadosComponent,
        RangoFechasComponent,
    ],
    exports: [
        NavegadorAdminComponent,
        NotificacionPopoverComponent,
        CloseModalComponent,
        SaveRegisterComponent,
        SearchRegisterComponent,
        DeleteRegisterComponent,
        UpdateRegisterComponent,
        RefreshInfoComponent,
        ListaEmpleadosComponent,
        ListaNotificacionComponent,
        AprobacionMultipleComponent,
        PestaniasEstadosComponent,
        RangoFechasComponent,
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
