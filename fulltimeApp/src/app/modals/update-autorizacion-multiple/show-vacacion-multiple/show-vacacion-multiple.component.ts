import { Component, Input, OnInit } from '@angular/core';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { Vacacion } from '../../../interfaces/Vacacion';

@Component({
  selector: 'app-show-vacacion-multiple',
  template: `
  <div style="margin: 5% 4% 2% 4%;">
    <ion-card *ngFor="let vacacion of vacaciones" style="padding: 3% 7% 3% 5%;">
      <ion-card-title style="text-align: center; font-size: 13px;"><b> {{ vacacion.nempleado | titlecase}} </b> </ion-card-title>

      <h6>
        <p style="font-size: 12px; margin-top:-4%;"> Solicita {{ vacacion.nperivacacion }}</p>

        <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 12px;"><b> Informacion </b></ion-card-title>
        <p style="font-size: 11px; margin: top -0.5em;">
          <strong> Usuario - </strong>{{ vacacion.nempleado | titlecase }} &nbsp;
          <strong> Código - </strong>{{ vacacion.codigo }}<br> 
          <strong> Cargo - </strong> {{ vacacion.ncargo }}
        </p>

        <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 12px;"><b> Fecha </b></ion-card-title>
        <p style="font-size: 10px; margin: top -0.5em;">
          <strong> Inicia: </strong>{{ vacacion.fec_inicio_ }} - 
          <strong> Finaliza: </strong> {{ vacacion.fec_final_ }}<br>
          <strong> Días libres:</strong> {{ vacacion.dia_libre }} - 
          <strong> Días laborables: </strong> {{ vacacion.dia_laborable }}<br>
          <br>
          <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 100%;"> <b> Fecha solicita:</b> {{ vacacion.fec_ingreso_ }}</ion-card-title> 
        </p>
      </h6> 
    </ion-card>
  </div>
  `,
  // styleUrls: ['./show-vacacion.component.scss'],
})
export class ShowVacacionMultipleComponent implements OnInit {

  @Input() vacaciones: Vacacion[];
  username: any;

  constructor(
    private userService: DataUserLoggedService,
  ) { }
  ngOnInit() {
    this.username = this.userService.UserFullname;
  }

}
