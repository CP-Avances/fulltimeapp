import { Component, Input } from '@angular/core';
import { HoraExtra } from 'src/app/interfaces/HoraExtra';

@Component({
  selector: 'item-horas-extras',
  template: `
  <div style="margin: 2% 0% 2% 5%; text-align: left;">
    <p style="font-size: 14px; margin-right:6%;">
      <ion-label *ngIf="horasExtras.estado == 1"> 
        <strong>No. Solicitud: {{ horasExtras.id }}</strong> 
        <strong style="color: #81F0FB; float:right"> Pendiente  </strong> 
      </ion-label>
      <ion-label *ngIf="horasExtras.estado != 1"> 
          <strong>No. Solicitud: {{ horasExtras.id }}</strong>
          <strong style="float:right"> 
          <p *ngIf="horasExtras.estado == 2" class="pre_autorizado">{{ horasExtras.estado | estadoSolicitudes }}</p>
          <p *ngIf="horasExtras.estado == 3" class="autorizada">{{ horasExtras.estado | estadoSolicitudes }}</p>
          <p *ngIf="horasExtras.estado == 4" class="negado">{{ horasExtras.estado | estadoSolicitudes }}</p>
        </strong>
      </ion-label>
    </p>

    <p align=left style="font-size: 13px; padding-right: 20%; margin-top:-3%;">
      <strong>Usuario: </strong> {{ horasExtras.nempleado | titlecase }}
      <br><strong>Solicita horas extras para</strong><br>
      {{ horasExtras.descripcion | titlecase }}
    </p>

    <p align=left style="font-size: 12px; margin-top:-2%;">
      <strong>Fecha </strong><br>
      <strong>Desde: </strong> {{ horasExtras.fecha_inicio_ }} - 
      <strong>Hasta: </strong> {{ horasExtras.fecha_fin_ }}<br>
      <strong>Horario </strong><br>
      <strong>Inicia: </strong> {{ horasExtras.hora_inicio_ }} - 
      <strong>Finaliza: </strong> {{ horasExtras.hora_fin_ }}<br>
      <strong>Tiempo: </strong> {{ horasExtras.num_hora }}
    </p>

  </div>
  `,
  styleUrls: ['../../aprobar-horas-extras.page.scss'],
})
export class ShowLabelComponent {

  @Input() horasExtras: HoraExtra;

  constructor(
  ) { }

}
