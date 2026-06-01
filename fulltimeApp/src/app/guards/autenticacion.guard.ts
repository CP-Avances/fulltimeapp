import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
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

  async canActivate(): Promise<boolean> {
    const logueado = await this.relojServiceService.estaLogueado();

    if (logueado) {
      return true;
    }

    this.navCtroller.navigateRoot('/login');
    return false;
  }


}
