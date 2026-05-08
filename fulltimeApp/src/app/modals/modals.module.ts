import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
//modulo paginacion
import {NgxPaginationModule} from 'ngx-pagination';
import { ComponentesModule } from '../componentes/componentes.module';
import { VerHorariosEmpleadosComponent } from './ver-horarios-empleados/ver-horarios-empleados.component';
import { TimbreJustificadoComponent } from './timbre-justificado/timbre-justificado.component';
import { VerTimbreEmpleadoComponent } from './ver-timbre-empleado/ver-timbre-empleado.component';
import { EnviarUsuarioComponent } from '../pages/paginas-admin/comunicado/enviar-usuario/enviar-usuario.component';

// componente modals Reporteria
import { ReporteTimbreComponent } from './reporte-timbre/reporte-timbre.component';
import { ReporteTimbreConNovedadesComponent } from './reporte-timbreConNovedades/reporte-timbreConNovedades.component';
import { VerImagenModalPage } from './ver-timbre-empleado/ver-imagen/ver-imagen.component';



@NgModule({
  declarations: [
    VerHorariosEmpleadosComponent,
    TimbreJustificadoComponent,
    VerTimbreEmpleadoComponent,
    EnviarUsuarioComponent,
    ReporteTimbreComponent,
    ReporteTimbreConNovedadesComponent,
    VerImagenModalPage
  ],
  exports:[
    VerHorariosEmpleadosComponent,
    TimbreJustificadoComponent,
    VerTimbreEmpleadoComponent,
    EnviarUsuarioComponent,
    ReporteTimbreComponent,
    ReporteTimbreConNovedadesComponent,
    VerImagenModalPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentesModule,
    NgxPaginationModule
  ],
})
export class ModalsPageModule {}
