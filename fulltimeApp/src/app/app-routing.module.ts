import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AutenticacionGuard } from "./guards/autenticacion.guard";

const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'inicio',
    loadChildren: () => import('./pages/inicio/inicio.module').then(m => m.InicioPageModule)
  },
  {
    path: 'adminpage',
    loadChildren: () => import('./pages/adminpage/adminpage.module').then(m => m.AdminpagePageModule), canActivate: [AutenticacionGuard]
  },
  {
    path: 'empleado',
    loadChildren: () => import('./pages/empleado/empleado.module').then(m => m.EmpleadoPageModule)
  },
  {
    path: 'enviartimbre/:idTimbre',
    loadChildren: () => import('./pages/enviartimbre/enviartimbre.module').then(m => m.EnviartimbrePageModule), canActivate: [AutenticacionGuard]
  },
  {
    path: 'confirmaciontimbre',
    loadChildren: () => import('./pages/confirmaciontimbre/confirmaciontimbre.module').then(m => m.ConfirmaciontimbrePageModule), canActivate: [AutenticacionGuard]
  },
  {
    path: 'modals',
    loadChildren: () => import('./modals/modals.module').then( m => m.ModalsPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
