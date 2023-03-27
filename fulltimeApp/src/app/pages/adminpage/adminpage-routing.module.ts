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
        loadChildren: () => import('../vertimbre/vertimbre.module').then(m => m.VertimbrePageModule)
      },
      {
        path: 'solicitudes',
        loadChildren: () => import('../paginas-admin/solicitudes/solicitudes.module').then(m => m.SolicitudesPageModule)
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
