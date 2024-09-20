import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ModulopipesModule } from 'src/app/pipes/modulopipes.module';
import { ComponentesModule } from 'src/app/componentes/componentes.module';
import { VerAlimentacionComponent } from '../ver-alimentacion/ver-alimentacion.component';
import { AlimentacionListaComponent } from '../alimentacion-lista/alimentacion-lista.component';
import { EditarAlimentacionComponent } from '../editar-alimentacion/editar-alimentacion.component';
import { RegistrarAlimentacionComponent } from '../registrar-alimentacion/registrar-alimentacion.component';
//modulo paginacion
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  declarations: [
    AlimentacionListaComponent,
    VerAlimentacionComponent,
    EditarAlimentacionComponent,
    RegistrarAlimentacionComponent
  ],
  exports: [
    AlimentacionListaComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ModulopipesModule,
    ComponentesModule,
    NgxPaginationModule
  ]
})
export class AlimentacionAdminModule { }
