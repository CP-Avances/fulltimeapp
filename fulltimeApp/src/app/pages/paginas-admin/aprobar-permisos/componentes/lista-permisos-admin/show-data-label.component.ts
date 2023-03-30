import { Component, Input } from '@angular/core';
import { Permiso } from 'src/app/interfaces/Permisos';

@Component({
  selector: 'item-permiso',
  template: `
  <div style="margin: 2% 0% 2% 5%; text-align: left;">
    <p style="font-size: 14px; margin-right:6%;">
      <ion-label *ngIf="permiso.estado == 1"> 
        <strong>No. Permiso: </strong> {{ permiso.num_permiso }}
        <strong style="color: #81F0FB; float:right"> Pendiente  </strong> 
      </ion-label>
      <ion-label *ngIf="permiso.estado != 1"> 
        <strong>No. Permiso: </strong> {{ permiso.num_permiso }} 
        <strong style="color: #81F0FB; float:right"> {{ permiso.estado | estadoSolicitudes }} </strong>
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
