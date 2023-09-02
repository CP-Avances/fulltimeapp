import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Route, Router } from '@angular/router';
import { RelojServiceService } from "../services/reloj-service.service";
import { NavController } from "@ionic/angular";

@Injectable({
  providedIn: 'root'
})
export class AutenticacionGuard implements CanActivate {

  constructor(
    private relojServiceService: RelojServiceService,
    private navCtroller: NavController,
    ) { }

  canActivate(): boolean {
    // console.log('AutenticacionGuard: ',this.relojServiceService.estaLogueado());
    if (this.relojServiceService.estaLogueado()) {
      return true;
    } else {
      this.navCtroller.navigateForward('login');
      return false;
    }

  }

}
