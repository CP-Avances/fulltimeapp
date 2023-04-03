import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportesPage } from './reportes.page';

const routes: Routes = [
  {
    path: '',
    component: ReportesPage,
  },
  {
    path: '',
    redirectTo: '/adminpage/reportes',
    pathMatch: 'full'
  },
  {
    path: 'timbres',
    loadChildren: () => import('./reporte-timbres/reporte-timbres.module').then(m => m.ReporteTimbresPageModule)
  },
  {
    path: 'timbresConNovedades',
    loadChildren: () => import('./reporte-timbresConNovedades/reporte-timbresConNovedades.module').then(m => m.ReporteTimbresConNovedadesPageModule)
  },
  {
    path: 'atrasos',
    loadChildren: () => import('./reporte-atrasos/reporte-atrasos.module').then(m => m.ReporteAtrasosPageModule)
  },
  {
    path: 'inasistencia',
    loadChildren: () => import('./reporte-inasistencia/reporte-inasistencia.module').then(m => m.ReporteInasistenciaPageModule)
  },
  {
    path: 'solicitud',
    loadChildren: () => import('./reporte-solicitudes/reporte-solicitudes.module').then(m => m.ReporteSolicitudesPageModule)
  },
  {
    path: 'alimentacion',
    loadChildren: () => import('./reporte-alimentacion/reporte-alimentacion.module').then(m => m.ReporteAlimentacionPageModule)
  },
  {
    path: 'horas-extras',
    loadChildren: () => import('./reporte-horas-extras/reporte-horas-extras.module').then(m => m.ReporteHorasExtrasPageModule)
  },
  {
    path: 'vacaciones',
    loadChildren: () => import('./reporte-vacaciones/reporte-vacaciones.module').then(m => m.ReporteVacacionesPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportesPageRoutingModule { }
