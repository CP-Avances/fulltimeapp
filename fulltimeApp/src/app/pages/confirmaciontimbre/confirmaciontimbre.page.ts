import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-confirmaciontimbre',
  templateUrl: './confirmaciontimbre.page.html',
  styleUrls: ['./confirmaciontimbre.page.scss'],
})
export class ConfirmaciontimbrePage implements OnInit {
 
  pipe = new DatePipe('en-US');
  
  horaTransformada = this.pipe.transform(Date.now(), 'HH:mm');
  fechaTransformada = this.pipe.transform(Date.now(), 'yyyy-MM-dd');

  nombre_usuario = "";
  apellido_usuario = "";
  ubicacion: any = "";

  constructor( private navCtroller: NavController,) { 
    this.ubicacion = localStorage.getItem('storageUbicacion');
  }

  ngOnInit() {
   
    this.nombre_usuario = localStorage.getItem('nom');
    this.apellido_usuario = localStorage.getItem('ap');
    console.log('Ubicacion: ', localStorage.getItem('storageUbicacion'));
    console.log('Variable this.ubicacion: ', this.ubicacion);
  }

  irABienvenido(){
    if( parseInt(localStorage.getItem('rol'))==1){
      this.navCtroller.navigateForward(['adminpage'])
    }else{
      this.navCtroller.navigateForward(['empleado'])

    }
    
  }
}
