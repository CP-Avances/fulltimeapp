import { Component, Input } from '@angular/core';
import { Permiso } from 'src/app/interfaces/Permisos';

@Component({
  selector: 'item-permiso',
  template: `
  <div style="margin: 2% 0% 2% 5%; text-align: left;">
    <p style="font-size: 14px; margin-right:6%;">
      <ion-label> 
        <strong>No. Solicitud: {{ permiso.num_permiso }}</strong>
        <strong style="float:right">
          <p *ngIf="permiso.estado == 1" style="color: #81F0FB">Pendiente</p>
          <p *ngIf="permiso.estado == 2" class="pre_autorizado">{{ permiso.estado | estadoSolicitudes }}</p>
          <p *ngIf="permiso.estado == 3" class="autorizada">{{ permiso.estado | estadoSolicitudes }}</p>
          <p *ngIf="permiso.estado == 4" class="negado">{{ permiso.estado | estadoSolicitudes }}</p>
        </strong>
      </ion-label>
    </p>

    <p align=left style="font-size: 13px; padding-right: 3%; margin-top:-2%;">
      <strong>Usuario </strong> {{ permiso.nempleado }} <br>
      <ion-label> 
        <strong> Realizo un permiso por </strong> 
        <strong style="float:right; margin-right: 3%"> {{ permiso.ntipopermiso | titlecase }} </strong> 
      </ion-label>
    </p>

    <p align=left style="font-size: 12px; margin-top:-2%;">
      <strong>Fecha </strong><br>
      <strong>Desde: </strong> {{ permiso.fec_inicio_ }} - 
      <strong>Hasta: </strong> {{ permiso.fec_final_ }} <br>
      <strong>Horario</strong><br>
      Hora Inicio: {{ permiso.hora_salida_ }} - 
      Hora Final: {{ permiso.hora_ingreso_ }}<br>
    </p>

    <p align=left style="font-size: 12px; margin-top:-2%;">
      <strong> Calculo </strong><br>
      <strong>Días: </strong> {{ permiso.dia }} - 
      <strong>Horas permiso: </strong> {{ permiso.hora_numero }}
    </p>

    <p align=left style="font-size: 13px; margin-top:-2%;">
      <strong> Observacion </strong> <br>
      {{ permiso.descripcion}}
    </p>

  </div>
  `,
  styleUrls: ['../../aprobar-permisos.page.scss'],
})
export class ShowLabelComponent {

  @Input() permiso: Permiso;

  constructor(
  ) { }

}
