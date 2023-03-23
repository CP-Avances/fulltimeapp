import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ModulopipesModule } from 'src/app/pipes/modulopipes.module';
import { ComponentesModule } from 'src/app/componentes/componentes.module';

import { ListaPermisosComponent } from './lista-permisos/lista-permisos.component';
import { RegistrarPermisoComponent } from './registrar-permiso/registrar-permiso.component';
import { VerPermisoComponent } from './ver-permiso/ver-permiso.component';
import { EditarPermisoComponent } from './editar-permiso/editar-permiso.component';

//Modulo paginacion NxgPaginationModule
import{NgxPaginationModule}from 'ngx-pagination';
 
@NgModule({
  declarations: [
    ListaPermisosComponent,
    RegistrarPermisoComponent,
    VerPermisoComponent,
    EditarPermisoComponent
  ],
  exports: [
    ListaPermisosComponent,
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
export class PermisosEmpleadoModule { }
