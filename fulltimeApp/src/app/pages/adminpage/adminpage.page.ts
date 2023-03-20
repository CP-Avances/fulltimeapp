import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { RelojServiceService } from 'src/app/services/reloj-service.service';

@Component({
  selector: 'app-adminpage',
  templateUrl: './adminpage.page.html',
  styleUrls: ['./adminpage.page.scss']
})
export class AdminpagePage {

  constructor(
    private relojServiceService: RelojServiceService,
    private navCtroller: NavController, 
  ) {}

  esAdministrador(): boolean {
    console.log('llego a la pagina de administrador');
    if (this.relojServiceService.esAdministrador()) {
      this.navCtroller.navigateRoot(['adminpage']);
      return true;
    } else {
    this.navCtroller.navigateForward('login');
     return false;
    }
  }

}
