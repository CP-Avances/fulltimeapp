import { Component, Input } from '@angular/core';
import { Alimentacion } from 'src/app/interfaces/Alimentacion';

@Component({
  selector: 'item-alimentacion',
  template: `
  <div style="margin: 2% 0% 2% 5%; text-align: left;">

    <p style="font-size: 14px; margin-right:6%;">
      <ion-label *ngIf="alimentacion.aprobada === null"> 
        <strong>Servicio: </strong> {{ alimentacion.nservicio | titlecase }}
        <strong style="color: #81F0FB; float:right"> Pendiente  </strong> 
      </ion-label>
      <ion-label *ngIf="alimentacion.aprobada === true"> 
        <strong>Servicio: </strong> {{ alimentacion.nservicio | titlecase }}
        <strong style="float:right;">
          <p class="autorizada">Autorizado </p>
        </strong>
      </ion-label>
      <ion-label *ngIf="alimentacion.aprobada === false"> 
        <strong>Servicio: </strong> {{ alimentacion.nservicio | titlecase }}
        <strong style="float:right;"> 
          <p class="negado">Negado</p>
        </strong>
      </ion-label>
    </p>

    <p align=left style="font-size: 13px; padding-right: 20%; margin-top:-3%;">
      <strong>Usuario </strong> {{ alimentacion.nempleado }} 
      <br><strong>Realizo una solicitud de alimentacion</strong><br>
      <strong>Plato: </strong> {{ alimentacion.ncomida }} &nbsp;
      <strong>Precio: </strong> {{ alimentacion.nvalor }}<br>
      <strong>Detalle Comida: </strong> {{ alimentacion.ndetallecomida }}
      <br>
    </p>

    <p align=left style="font-size: 12px; margin-top:-2%;">
      <strong>Fecha </strong><br>
      <strong>Registro: </strong> {{ alimentacion.fecha_ }} <br>
      <strong>Consumo: </strong> {{ alimentacion.fec_comida_ }}
      <br>
      <strong>Horario </strong><br>
      Hora inicia: {{ alimentacion.hora_inicio_ }} &nbsp; <br>
      Hora finaliza:  {{ alimentacion.hora_fin_ }}
    </p>

  </div>
  `,
  styleUrls: ['../../aprobar-alimentacion.page.scss'],
})
export class ShowLabelComponent {

  @Input() alimentacion: Alimentacion;

  constructor() { }

}
