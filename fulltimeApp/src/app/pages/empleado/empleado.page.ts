import { Component, OnInit } from '@angular/core';
import { RelojServiceService } from 'src/app/services/reloj-service.service';
import { AlertController, NavController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-empleado',
  templateUrl: './empleado.page.html',
  styleUrls: ['./empleado.page.scss'],
})
export class EmpleadoPage implements OnInit {

  constructor(
    private relojServiceService:RelojServiceService, 
    private navCtroller:NavController,
    public alertCrtl: AlertController,
    
    )
    {}

  ngOnInit() {
  }

  noesAdministrador(): boolean {
    if (this.relojServiceService.esEmpleado()) {
      this.navCtroller.navigateRoot(['empleado']);
      return true;
    }else{
      this.navCtroller.navigateForward('login');
      return false;
   
    }
  }

}
