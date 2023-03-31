import { Component, Input } from '@angular/core';
import { Vacacion } from 'src/app/interfaces/Vacacion';

@Component({
  selector: 'item-vacacion',
  template: `
    <div style="margin: 2% 0% 2% 5%; text-align: left;">

      <p style="font-size: 14px; margin-right:6%;">
        <ion-label *ngIf="vacacion.estado == 1">
          <strong>No. Solicitud: {{ vacacion.id}}</strong>
          <strong style="color: #81F0FB; float:right"> Pendiente </strong> 
        </ion-label>
        <ion-label *ngIf="vacacion.estado != 1"> 
          <strong>No. Solicitud: {{ vacacion.id}}</strong>
          <strong style="float:right">
            <p *ngIf="vacacion.estado == 2" class="pre_autorizado">{{ vacacion.estado | estadoSolicitudes }}</p>
            <p *ngIf="vacacion.estado == 3" class="autorizada">{{ vacacion.estado | estadoSolicitudes }}</p>
            <p *ngIf="vacacion.estado == 4" class="negado">{{ vacacion.estado | estadoSolicitudes }}</p>
          </strong>
        </ion-label>
      </p>

      <p align=left style="font-size: 13px; padding-right: 20%; margin-top:-3%;">
        <strong>Usuario </strong> {{ vacacion.nempleado | titlecase }}<br>
        <strong>Cargo </strong> {{ vacacion.ncargo | titlecase}}<br>
      </p>

      <p align=left style="font-size: 12px; margin-top:-2%;">
        <strong>Fecha </strong><br>
        <strong>Desde: </strong> {{ vacacion.fec_inicio_ }} - 
        <strong>Hasta: </strong> {{ vacacion.fec_final_ }} <br>
      </p>

      <p align=left style="font-size: 12px; margin-top:-2%;">
        <strong> Calculo </strong><br>
        <strong>Días laborales: </strong> {{ vacacion.dia_laborable}} - 
        <strong>Días Libres: </strong> {{ vacacion.dia_libre}}
      </p>

    </div>
  `,
  styleUrls: ['../../aprobar-vacaciones.page.scss'],
})
export class ShowLabelComponent {

  @Input() vacacion: Vacacion;

  constructor(
  ) { }

}
