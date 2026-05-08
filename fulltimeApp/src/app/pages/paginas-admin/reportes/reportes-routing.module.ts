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
    redirectTo: '/reloj/reportes',
    pathMatch: 'full'
  },
  {
    path: 'timbres',
    loadChildren: () => import('./reporte-timbres/reporte-timbres.module').then(m => m.ReporteTimbresPageModule)
  },
  {
    path: 'timbresConNovedades',
    loadChildren: () => import('./reporte-timbresConNovedades/reporte-timbresConNovedades.module').then(m => m.ReporteTimbresConNovedadesPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportesPageRoutingModule { }
