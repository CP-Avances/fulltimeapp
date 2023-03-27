import { Component, Input, OnInit } from '@angular/core';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { HoraExtra } from '../../../interfaces/HoraExtra';

@Component({
  selector: 'app-show-hora-extra-multiple',
  template: `
  <div style="margin: 5% 4% 2% 4%;">

    <ion-card *ngFor="let hora_extra of horas_extras" style="padding: 3% 7% 3% 5%;">
      <ng-container *ngIf="hora_extra.nempleado == username else showhoras_extras"></ng-container>
      <ng-template #showhoras_extras>
        <ion-card-title style="text-align: center; font-size: 13px;"> {{ hora_extra.nempleado | titlecase }}</ion-card-title>
     
        <h6>
          <p style="font-size: 12px; margin-top:-4%;" *ngIf="hora_extra.descripcion != null"> Solicita horas extras para <br>{{ hora_extra.descripcion }}</p>
          <p style="font-size: 12px; margin-top:-4%;" *ngIf="hora_extra.descripcion == null" > El Usuario no ha ingresado una descrcipcion</p>

          <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 12px;"><b> Informacion </b></ion-card-title>
          <p style="font-size: 11px; margin: top -0.5em;">
            <strong> Usuario - </strong>{{ hora_extra.nempleado | titlecase }} &nbsp;
            <strong> Código - </strong>{{ hora_extra.codigo }}<br> 
            <strong> Cargo - </strong> {{ hora_extra.ncargo }}
          </p>

          <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 12px;"><b> Fecha </b></ion-card-title>
          <p style="font-size: 10px; margin: top -0.5em;">
            <strong> Desde: </strong>{{ hora_extra.fecha_inicio_ }} - 
            <strong> Hasta: </strong> {{ hora_extra.fecha_fin_ }}<br>
            <br>
          <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 100%;"><b> Horario </b></ion-card-title><br>
            <strong> Inicia: </strong>{{ hora_extra.hora_inicio_ }} - 
            <strong> Finaliza: </strong> {{ hora_extra.hora_fin_ }}<br>
            <strong> Tiempo: </strong> {{ hora_extra.num_hora }} &nbsp;
            <strong> Tiempo autorizado: </strong> {{ hora_extra.tiempo_autorizado }} <br>          
            <br>
          <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 100%;"> <b> Fecha solicita:</b> {{ hora_extra.fec_solicita_ }}</ion-card-title> 
          </p>
        </h6>
        
      </ng-template>
    </ion-card>
  </div>
  `,
  // styleUrls: ['./show-hora-extra.component.scss'],
})
export class ShowHoraExtraMultipleComponent implements OnInit {

  @Input() horas_extras: HoraExtra[];
  username: any;

  constructor(
    private userService: DataUserLoggedService,
  ) { }
  ngOnInit() {
    this.username = this.userService.UserFullname;
  }
}
