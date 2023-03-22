import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminpagePage } from './adminpage.page';

const routes: Routes = [
  {
    path: 'adminpage',
    component: AdminpagePage,
    children: [
      {
        path: 'bienvenido',
        loadChildren: () => import('../bienvenido/bienvenido.module').then(m => m.BienvenidoPageModule)
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
        path: 'tab3',
        loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule)
      },
      {
        path: 'solicitudes',
        loadChildren: () => import('../paginas-admin/solicitudes/solicitudes.module').then(m => m.SolicitudesPageModule)
      },
      {
        path: '',
        redirectTo: 'adminpage/bienvenido',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'adminpage/bienvenido',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminpagePageRoutingModule {}
