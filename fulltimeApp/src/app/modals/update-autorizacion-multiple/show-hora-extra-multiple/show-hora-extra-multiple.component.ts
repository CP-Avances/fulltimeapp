import { Component, Input, OnInit } from '@angular/core';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { HoraExtra } from '../../../interfaces/HoraExtra';
import { AutorizacionesService } from 'src/app/services/autorizaciones.service';

@Component({
  selector: 'app-show-hora-extra-multiple',
  template: `
  <div>
    <ion-card style="padding: 3% 7% 3% 5%;">
      <ng-container *ngIf="horaExtraDato.nempleado == username else showhoras_extras"></ng-container>
      <ng-template #showhoras_extras>
        <ion-card-title style="text-align: center; font-size: 13px;">
          <strong style="float:right; margin-left:-10%;">Soli #: {{ horaExtraDato.id }}</strong>
          {{horaExtraDato.nempleado | titlecase }}
        </ion-card-title>
     
        <h6>
          <p style="font-size: 12px; margin-top:-4%;" *ngIf="horaExtraDato.descripcion != null"> Solicita horas extras para <br>{{ horaExtraDato.descripcion }}</p>
          <p style="font-size: 12px; margin-top:-4%;" *ngIf="horaExtraDato.descripcion == null" > El Usuario no ha ingresado una descrcipcion</p>

          <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 12px;"><b> Informacion </b></ion-card-title>
          <p style="font-size: 11px; margin: top -0.5em;">
            <strong> Usuario - </strong>{{ horaExtraDato.nempleado | titlecase }} &nbsp;
            <strong> Código - </strong>{{ horaExtraDato.codigo }}<br> 
            <strong> Cargo - </strong> {{ horaExtraDato.ncargo }}
          </p>

          <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 12px;"><b> Fecha </b></ion-card-title>
          <p style="font-size: 10px; margin: top -0.5em;">
            <strong> Desde: </strong>{{ horaExtraDato.fecha_inicio_ }} - 
            <strong> Hasta: </strong> {{ horaExtraDato.fecha_fin_ }}<br>
            <br>
          <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 100%;"><b> Horario </b></ion-card-title><br>
            <strong> Inicia: </strong>{{ horaExtraDato.hora_inicio_ }} - 
            <strong> Finaliza: </strong> {{ horaExtraDato.hora_fin_ }}<br>
            <strong> Tiempo: </strong> {{ horaExtraDato.num_hora }} &nbsp;
            <strong> Tiempo autorizado: </strong> {{ horaExtraDato.tiempo_autorizado }} <br>          
            <br>
          <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 100%; float: right;"> <b> Fecha solicitada:</b> {{ horaExtraDato.fec_solicita_ }}</ion-card-title> 
          </p>
        </h6>
        
      </ng-template>
    </ion-card>
  </div>
  `,
  // styleUrls: ['./show-hora-extra.component.scss'],
})
export class ShowHoraExtraMultipleComponent implements OnInit {

  @Input() hora_extra: HoraExtra[];
  username: any;
  idEmpleado: any;
  estado_auto: any;
  autorizacion: any = [];
  ArrayAutorizacionTipos: any = [];
  horaExtraDato: any = [];

  constructor(
    private userService: DataUserLoggedService,
    private autoService: AutorizacionesService,
  ) { 
    this.idEmpleado = parseInt(localStorage.getItem('empleadoID'));
  }
  ngOnInit() {
    this.username = this.userService.UserFullname;
    this.ConfiguracionAutorizacion();
  }

  nivel_padre: number = 0;
  mensaje: any;
  listadoDepaAutoriza: any = [];
  ConfiguracionAutorizacion(){
    this.listadoDepaAutoriza = [];
    this.horaExtraDato = [];
    this.horaExtraDato = this.hora_extra;
    /*
    let i = 0;
    this.hora_extra.filter(item => {
      this.autoService.getAutorizacionHoraExtra(item.id).subscribe(
        autorizacion => { 
          this.autorizacion = autorizacion
          var autorizaciones = this.autorizacion.id_documento.split(',');
          this.autoService.BuscarListaAutorizaDepa(this.autorizacion.id_departamento).subscribe(res => {
            this.listadoDepaAutoriza = res;
            i = i+1;
            this.listadoDepaAutoriza.filter(i => {
              this.nivel_padre = i.nivel_padre;
              if((this.idEmpleado == i.id_contrato) && (autorizaciones.length ==  i.nivel)){
                return this.Filtrohoras_extras.push(item);
              }
            })
    
            if (this.hora_extra.length === i) {
              this.mensaje = 'No tiene Solicitudes de Horas extras para APROBAR';
            }
          });
        }
      )
    });*/
  }
}
