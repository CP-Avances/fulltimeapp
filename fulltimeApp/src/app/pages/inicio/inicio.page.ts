import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RelojServiceService } from 'src/app/services/reloj-service.service';

import { NavController, Platform, PopoverController } from '@ionic/angular';


@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {

  id_celular: any;

  hoy: Date = new Date();
  pipe = new DatePipe('es');
  fechaLicencia: any;

  constructor(
    private relojService: RelojServiceService, 
    private navCtroller: NavController, 
    public popoverController: PopoverController,
    public platform: Platform
    ) 
  {}

  ngOnInit() {
    this.fechaLicencia = this.pipe.transform(this.hoy.setDate(this.hoy.getDate() + 5), 'fullDate');
  }
  
  irLogin() {
    this.relojService.yaNoEsPrimeraVez();
    //this.presentPopover(true);
    this.navCtroller.navigateForward(['login'])
  }

}
