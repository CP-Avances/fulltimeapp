import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ModulopipesModule } from 'src/app/pipes/modulopipes.module';
import { ComponentesModule } from 'src/app/componentes/componentes.module';

import { PermisosListaComponent } from '../permisos-lista/permisos-lista.component';
import { EditarPermisoComponent } from '../editar-permiso/editar-permiso.component';
import { RegistrarPermisoComponent } from '../registrar-permiso/registrar-permiso.component';
import { VerPermisoComponent } from '../ver-permiso/ver-permiso.component';
//modulo paginacion
import {NgxPaginationModule} from 'ngx-pagination';

@NgModule({
  declarations: [
    PermisosListaComponent,
    EditarPermisoComponent,
    RegistrarPermisoComponent,
    VerPermisoComponent
  ],
  exports: [
    PermisosListaComponent,
    EditarPermisoComponent,
    RegistrarPermisoComponent,
    VerPermisoComponent
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
export class PermisosAdminModule { }
