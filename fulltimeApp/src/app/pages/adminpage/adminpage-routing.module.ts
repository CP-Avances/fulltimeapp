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
        path: 'timbres-empleados',
        loadChildren: () => import('../paginas-admin/timbres-empleados/timbres-empleados.module').then(m => m.TimbresEmpleadosPageModule)
      },
      {
        path: 'horarios-empleados',
        loadChildren: () => import('../paginas-admin/horarios-empleados/horarios-empleados.module').then(m => m.HorariosEmpleadosPageModule)
      },
      {
        path: 'justificar-atrasos',
            loadChildren: () => import('../paginas-admin/justificar-atrasos/justificar-atrasos.module').then(m => m.JustificarAtrasosPageModule)
      },
      {
        path: 'justificar-timbres',
        loadChildren: () => import('../paginas-admin/justificar-timbres/justificar-timbres.module').then(m => m.JustificarTimbresPageModule)
      },
      {
        path: 'aprobar-permisos',
        loadChildren: () => import('../paginas-admin/aprobar-permisos/aprobar-permisos.module').then(m => m.AprobarPermisosPageModule)
      },
      {
        path: 'aprobar-vacaciones',
        loadChildren: () => import('../paginas-admin/aprobar-vacaciones/aprobar-vacaciones.module').then(m => m.AprobarVacacionesPageModule)
      },
      {
        path: 'aprobar-horas-extras',
        loadChildren: () => import('../paginas-admin/aprobar-horas-extras/aprobar-horas-extras.module').then(m => m.AprobarHorasExtrasPageModule)
      },
      {
        path: 'aprobar-alimentacion',
         loadChildren: () => import('../paginas-admin/aprobar-alimentacion/aprobar-alimentacion.module').then(m => m.AprobarAlimentacionPageModule)
        },
      {
        path: '',
        redirectTo: '/adminpage/bienvenido',
        pathMatch: 'full'
      },
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
