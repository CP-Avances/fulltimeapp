import { Component, Input } from '@angular/core';
import { Alimentacion } from 'src/app/interfaces/Alimentacion';

@Component({
  selector: 'app-show-alimentacion-multiple',
  template: `
  <div style="margin: 6% 3% 7% 3%;">
    <ion-card *ngFor="let alimentacion of alimentacion" style="padding: 3% 7% 3% 5%; font-size: 16px;">
      <ion-card-title style="text-align: center; font-size: 100%;"> {{ alimentacion.nempleado | titlecase }}  </ion-card-title>
      <h6>
        <ion-card-title style="font-size: 90%; margin-top:-2%;" *ngIf="alimentacion.observacion != null"> <b>Observacion</b></ion-card-title>
        <p align="justify" style="font-size: 90%; margin-top:-1%;" *ngIf="alimentacion.observacion != null"> {{ alimentacion.observacion}}</p>
        <p style="font-size: 90%; margin-top:-4%;" *ngIf="alimentacion.observacion == null"> El Usuario no ha ingresado una Observacion</p>

        <ion-card-title style="margin-top:-1%; margin-bottom:-4%; font-size: 90%;"><b> Descripcion </b></ion-card-title>
        <p style="font-size: 85%; margin: top -0.5em;">
          <strong>Servicio -</strong> {{ alimentacion.nservicio | titlecase }}<br>
          <strong>Detalle Comida </strong><br> 
          El Plato consta de {{ alimentacion.ncomida }} de {{ alimentacion.ndetallecomida }}<br>
          Tiene un valor de {{ alimentacion.nvalor }}<br>
          <strong *ngIf="alimentacion.extra == true">Extra - Si / &nbsp;</strong>
          <strong *ngIf="alimentacion.extra != true">Extra - No / &nbsp;</strong> 
          <strong *ngIf="alimentacion.aprobada == true">Aprobada - Si</strong>
          <strong *ngIf="alimentacion.aprobada != true">Aprobada - No</strong>
        </p>

        <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 90%;"><b> Fecha </b></ion-card-title>
        <p style="font-size: 85%; margin: top -0.5em;">
          <strong>Registro: </strong> {{ alimentacion.fecha_ }}<br> 
          <strong>Consumo: </strong> {{ alimentacion.fec_comida_ }}<br>
          <br>
        <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 95%;"> <b> Horario:</b> </ion-card-title> <br>
          <strong> Hora inicia: </strong> {{ alimentacion.hora_inicio_ }} <br>
          <strong> Hora finaliza:</strong> {{ alimentacion.hora_fin_ }}<br> 
          <br>
        <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 95%;"> <b> Fecha solicita:</b> {{ alimentacion.fecha_ }}</ion-card-title> 
        </p>
      </h6>
    </ion-card>
  </div>
  
  `,
  //styleUrls: ['../../aprobar-alimentacion.page.scss'],
})
export class ShowAlimentacionMultipleComponent {

  @Input() alimentacion: Alimentacion[];

  constructor() { }

}
