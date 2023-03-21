import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Moment } from 'moment';

@Component({
  selector: 'app-bienvenido',
  templateUrl: './bienvenido.page.html',
  styleUrls: ['./bienvenido.page.scss']
})
export class BienvenidoPage implements OnInit, OnDestroy{

  pipe: DatePipe = new DatePipe('es-EC', null);
  time: Date = new Date();
  horaTransformada = this.pipe.transform(Date.now(), 'hh:mm a');
  fechaTransformada = this.pipe.transform(Date.now(), 'fullDate');

  horarioAbierto: boolean = false;
  valorsol: string = "none";
  valorluna: string = "none";

  rol: any;
  intervalo: any;

  constructor(
    
  ) {
    this.cambioimagen();
    this.rol = localStorage.getItem('rol');
  }

  ionViewDidLoad() {
    this.cambioimagen();
  }

  ngOnInit() {
    setInterval(() => {
      this.horaTransformada = this.pipe.transform(Date.now(), 'hh:mm:ss a');
      this.fechaTransformada = this.pipe.transform(Date.now(), 'fullDate');
    }, 1000);
  }

   //Funcion para el cambio del sol y la luna en la imagen svg//
   cambioimagen() {
    const sol = document.body.getElementsByClassName('Sol');
    const _sol = document.getElementById('Sol')
    const luna = document.getElementById('Luna');

    console.log('imagen sol: ',_sol)
    
    this.intervalo = setInterval(() => {
      if (this.time.getHours() >= 6 && this.time.getHours() <= 18) {
        //sol.style.display = "block";
        //luna.style.display = "none";

      } else if (this.time.getHours() > 18 && this.time.getHours() <= 24) {
        if(sol != null && luna != null){
          //sol.style.display = "none";
          luna.style.display = "block"
        }else{

        }
      } else {
        if(sol != null && luna != null){
          //sol.style.display = "none";
          luna.style.display = "block"
        }else{

        }
      }

    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
  }

}
