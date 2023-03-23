import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmpleadoPage } from './empleado.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'bienvenido',
    pathMatch: 'full'
  },
  {
    path: '',
    component: EmpleadoPage,
    children: [
      {
        path: 'bienvenido',
        children: [
          {
            path: '',
            loadChildren: () => import('../bienvenido/bienvenido.module').then(m => m.BienvenidoPageModule)
          }
        ]
      },
      {
        path: 'informacion',
        children: [
          {
            path: '',
            loadChildren: () => import('../informacion-empleado/informacion-empleado.module').then(m => m.InformacionEmpleadoPageModule)
          }
        ]
      },
      {
        path: 'solicitar-permisos',
        loadChildren: () => import('../paginas-empleado/solicitar-permisos/solicitar-permisos.module').then(m => m.SolicitarPermisosPageModule)
      },
    ]
  },
  {
    path: '',
    redirectTo: '/empleado/bienvenido',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmpleadoPageRoutingModule { }
