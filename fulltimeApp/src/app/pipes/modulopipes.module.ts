import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EstadoSolicitudesPipe } from './estado-solicitudes.pipe'

@NgModule({
  declarations: [
    EstadoSolicitudesPipe
  ],
  exports: [
    EstadoSolicitudesPipe
  ],
  imports: [
    CommonModule
  ]
})
export class ModulopipesModule { }
