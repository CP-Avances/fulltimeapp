import { Component, Input } from '@angular/core';
import { Permiso } from '../../../interfaces/Permisos';

@Component({
  selector: 'app-show-permiso-multiple',
  template: `
  <div style="margin: 5% 4% 2% 4%;">
    <ion-card *ngFor="let permiso of permisos" style="padding: 3% 7% 3% 5%;">
        <ion-card-title style="text-align: center; font-size: 13px;"><b> N° de permiso:</b> {{ permiso.num_permiso }}</ion-card-title>
   
        <h6>
          <p style="font-size: 12px; margin-top:-4%;"> Solicita Permiso por {{ permiso.ntipopermiso | titlecase }}</p>
          <p style="font-size: 12px; margin-top:-2%;" *ngIf="permiso.descripcion != null">Descripcion<br>{{ permiso.descripcion }}</p>
          <p style="font-size: 12px; margin-top:-2%;" *ngIf="permiso.descripcion == null" > El Usuario no ha ingresado una descrcipcion</p>

          <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 12px;"><b> Informacion </b></ion-card-title>
          <p style="font-size: 11px; margin: top -0.5em;">
            <strong> Usuario - </strong>{{ permiso.nempleado | titlecase }} &nbsp;
            <strong> Código - </strong>{{ permiso.codigo }}<br> 
          </p>

          <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 12px;"><b> Fecha </b></ion-card-title>
          <p style="font-size: 10px; margin: top -0.5em;">   
            <strong> Desde: </strong>{{ permiso.fec_inicio_ }} - 
            <strong> Hasta: </strong> {{ permiso.fec_final_ }}<br>
            <strong> Hora inicia: </strong> {{ permiso.hora_salida_ }} - 
            <strong> Hora finaliza:</strong> {{ permiso.hora_ingreso_ }} <br>
            <strong> Permiso - Horas: </strong> {{ permiso.hora_numero }} /&nbsp;
            <strong> Dias: </strong> {{ permiso.dia }} <br>
            <br>
            <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 100%;"> <b> Fecha solicita:</b> {{ permiso.fec_creacion_ }}</ion-card-title> 
          </p>
        </h6>
 
    </ion-card>
  </div>
  `,
  // styleUrls: ['./show-permiso.component.scss'],
})
export class ShowPermisoMultipleComponent {

  @Input() permisos: Permiso[];

}
