import { Component, OnDestroy, OnInit } from '@angular/core';
import { Moment } from 'moment';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy{

  time: Date = new Date('es');

  rol: any;
  intervalo: any;

  constructor() {
    this.cambioimagen();
    this.rol = localStorage.getItem('rol');
  }

  ionViewDidLoad() {
    this.cambioimagen();
  }

  ngOnInit() {
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
