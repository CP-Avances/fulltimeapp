import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ComponentesModule } from '../componentes/componentes.module';
import { ModulopipesModule } from '../pipes/modulopipes.module';
import { FormsModule } from '@angular/forms';

import { VerTimbresEmpleadoComponent } from './ver-timbres-empleado/ver-timbres-empleado.component';
import { VerHorariosEmpleadosComponent } from './ver-horarios-empleados/ver-horarios-empleados.component';
import { TimbreJustificadoComponent } from './timbre-justificado/timbre-justificado.component';
import { AtrasoJustificadoComponent } from './atraso-justificado/atraso-justificado.component';

import { EnviarUsuarioComponent } from '../pages/paginas-admin/comunicado/enviar-usuario/enviar-usuario.component';

// componentes modals reportes
import { ReporteAlimentacionComponent } from './reporte-alimentacion/reporte-alimentacion.component';
import { ReporteAtrasoComponent } from './reporte-atraso/reporte-atraso.component';
import { ReporteHoraExtraComponent } from './reporte-hora-extra/reporte-hora-extra.component';
import { ReporteInasistenciaComponent } from './reporte-inasistencia/reporte-inasistencia.component';
import { ReporteSolicitudComponent } from './reporte-solicitud/reporte-solicitud.component';
import { ReporteTimbreComponent } from './reporte-timbre/reporte-timbre.component';
import { ReporteTimbreConNovedadesComponent } from './reporte-timbreConNovedades/reporte-timbreConNovedades.component';
import { ReporteVacacionComponent } from './reporte-vacacion/reporte-vacacion.component';

import { UpdateAutorizacionMultipleComponent } from './update-autorizacion-multiple/update-autorizacion-multiple.component';
import { ShowHoraExtraMultipleComponent } from './update-autorizacion-multiple/show-hora-extra-multiple/show-hora-extra-multiple.component';
import { ShowPermisoMultipleComponent } from './update-autorizacion-multiple/show-permiso-multiple/show-permiso-multiple.component';
import { ShowVacacionMultipleComponent } from './update-autorizacion-multiple/show-vacacion-multiple/show-vacacion-multiple.component';

import { UpdateAutorizacionComponent } from './update-autorizacion/update-autorizacion.component';
import { ShowHoraExtraComponent } from './update-autorizacion/show-hora-extra/show-hora-extra.component';
import { ShowPermisoComponent } from './update-autorizacion/show-permiso/show-permiso.component';
import { ShowVacacionComponent } from './update-autorizacion/show-vacacion/show-vacacion.component';

//modulo paginacion
import {NgxPaginationModule} from 'ngx-pagination';


@NgModule({
  declarations: [
    VerTimbresEmpleadoComponent,
    VerHorariosEmpleadosComponent,
    TimbreJustificadoComponent,
    AtrasoJustificadoComponent,
    ReporteAlimentacionComponent,
    ReporteAtrasoComponent,
    ReporteHoraExtraComponent,
    ReporteInasistenciaComponent,
    ReporteSolicitudComponent,
    ReporteTimbreComponent,
    ReporteTimbreConNovedadesComponent,
    ReporteVacacionComponent,
    UpdateAutorizacionMultipleComponent,
    ShowHoraExtraMultipleComponent,
    ShowPermisoMultipleComponent,
    ShowVacacionMultipleComponent,
    UpdateAutorizacionComponent,
    ShowHoraExtraComponent,
    ShowPermisoComponent,
    ShowVacacionComponent,
    EnviarUsuarioComponent
  ],
  exports: [
    VerTimbresEmpleadoComponent,
    VerHorariosEmpleadosComponent,
    TimbreJustificadoComponent,
    AtrasoJustificadoComponent,
    ReporteAlimentacionComponent,
    ReporteAtrasoComponent,
    ReporteHoraExtraComponent,
    ReporteInasistenciaComponent,
    ReporteSolicitudComponent,
    ReporteTimbreComponent,
    ReporteTimbreConNovedadesComponent,
    ReporteVacacionComponent,
    UpdateAutorizacionComponent,
    UpdateAutorizacionMultipleComponent,
    EnviarUsuarioComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ComponentesModule,
    ModulopipesModule,
    NgxPaginationModule
  ]
})
export class ModalsModule { }
