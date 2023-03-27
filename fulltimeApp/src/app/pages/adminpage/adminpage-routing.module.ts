import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminpagePage } from './adminpage.page';

const routes: Routes = [
  {
    path: '',
    component: AdminpagePage,
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
            loadChildren: () => import('../informacion-admin/informacion-admin.module').then(m => m.InformacionAdminPageModule)
          }
        ]
      },
      {
        path: 'verTimbre',
        children: [
          {
            path: '',
            loadChildren: () => import('../vertimbre/vertimbre.module').then(m => m.VertimbrePageModule)
          }
        ]
      },
      {
        path: 'solicitudes',
        loadChildren: () => import('../paginas-admin/solicitudes/solicitudes.module').then(m => m.SolicitudesPageModule)
      },
      {
        path: 'comunicado',
        loadChildren: () => import('../paginas-admin/comunicado/comunicado.module').then(m => m.ComunicadoPageModule)
      },
      {
        path: '',
        redirectTo: '/adminpage/bienvenido',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/adminpage/bienvenido',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminpagePageRoutingModule {}
