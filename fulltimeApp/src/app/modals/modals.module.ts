import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
//modulo paginacion
import {NgxPaginationModule} from 'ngx-pagination';
import { ComponentesModule } from '../componentes/componentes.module';
import { ModulopipesModule } from '../pipes/modulopipes.module';
import { VerHorariosEmpleadosComponent } from './ver-horarios-empleados/ver-horarios-empleados.component';
import { TimbreJustificadoComponent } from './timbre-justificado/timbre-justificado.component';
import { VerTimbreEmpleadoComponent } from './ver-timbre-empleado/ver-timbre-empleado.component';
import { EnviarUsuarioComponent } from '../pages/paginas-admin/comunicado/enviar-usuario/enviar-usuario.component';

// componentes modals autorizaciones
import { UpdateAutorizacionComponent } from './update-autorizacion/update-autorizacion.component';
import { ShowPermisoComponent } from './update-autorizacion/show-permiso/show-permiso.component';
import { ShowVacacionComponent } from './update-autorizacion/show-vacacion/show-vacacion.component';

// componentes modals autorizaciones multiple
import { UpdateAutorizacionMultipleComponent } from './update-autorizacion-multiple/update-autorizacion-multiple.component';
import { ShowPermisoMultipleComponent } from './update-autorizacion-multiple/show-permiso-multiple/show-permiso-multiple.component';
import { ShowVacacionMultipleComponent } from './update-autorizacion-multiple/show-vacacion-multiple/show-vacacion-multiple.component';

// componente modals Reporteria
import { ReporteTimbreComponent } from './reporte-timbre/reporte-timbre.component';
import { ReporteTimbreConNovedadesComponent } from './reporte-timbreConNovedades/reporte-timbreConNovedades.component';
import { ReporteVacacionComponent } from './reporte-vacacion/reporte-vacacion.component';
import { VerImagenModalPage } from './ver-timbre-empleado/ver-imagen/ver-imagen.component';



@NgModule({
  declarations: [
    VerHorariosEmpleadosComponent,
    TimbreJustificadoComponent,
    VerTimbreEmpleadoComponent,
    EnviarUsuarioComponent,
    UpdateAutorizacionComponent,
    ShowPermisoComponent,
    ShowVacacionComponent,
    UpdateAutorizacionMultipleComponent,
    ShowPermisoMultipleComponent,
    ShowVacacionMultipleComponent,
    ReporteTimbreComponent,
    ReporteTimbreConNovedadesComponent,
    ReporteVacacionComponent,
    VerImagenModalPage
  ],
  exports:[
    VerHorariosEmpleadosComponent,
    TimbreJustificadoComponent,
    VerTimbreEmpleadoComponent,
    EnviarUsuarioComponent,
    UpdateAutorizacionComponent,
    UpdateAutorizacionMultipleComponent,
    ReporteTimbreComponent,
    ReporteTimbreConNovedadesComponent,
    ReporteVacacionComponent,
    VerImagenModalPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentesModule,
    ModulopipesModule,
    NgxPaginationModule
  ],
})
export class ModalsPageModule {}
