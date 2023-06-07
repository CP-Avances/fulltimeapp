import { Component, Input, OnInit } from '@angular/core';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { Vacacion } from '../../../interfaces/Vacacion';
import { AutorizacionesService } from 'src/app/services/autorizaciones.service';

@Component({
  selector: 'app-show-vacacion-multiple',
  template: `
  <div>
    <ion-card style="padding: 3% 7% 3% 5%;">
      <ion-card-title style="text-align: center; font-size: 13px;">
        <strong style="float:right; margin-left:-10%;">Soli #: {{ VacacionDato.id }} </strong> 
        {{ VacacionDato.nempleado | titlecase}}
      </ion-card-title>

      <h6>
        <p style="font-size: 12px; margin-top:-4%;"> Solicita {{ VacacionDato.nperivacacion }}</p>

        <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 12px;"><b> Informacion </b></ion-card-title>
        <p style="font-size: 11px; margin: top -0.5em;">
          <strong> Usuario - </strong>{{ VacacionDato.nempleado | titlecase }} &nbsp;
          <strong> Código - </strong>{{ VacacionDato.codigo }}<br> 
          <strong> Cargo - </strong> {{ VacacionDato.ncargo }}
        </p>

        <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 12px;"><b> Fecha </b></ion-card-title>
        <p style="font-size: 10px; margin: top -0.5em;">
          <strong> Inicia: </strong>{{ VacacionDato.fec_inicio_ }} - 
          <strong> Finaliza: </strong> {{ VacacionDato.fec_final_ }}<br>
          <strong> Días libres:</strong> {{ VacacionDato.dia_libre }} - 
          <strong> Días laborables: </strong> {{ VacacionDato.dia_laborable }}<br>
          <br>
          <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 100%; float: right;"> <b> Fecha solicitada:</b> {{ VacacionDato.fec_ingreso_ }}</ion-card-title> 
        </p>
      </h6> 
    </ion-card>
  </div>
  `,
  // styleUrls: ['./show-vacacion.component.scss'],
})
export class ShowVacacionMultipleComponent implements OnInit {

  @Input() vacacion: Vacacion[];
  username: any;
  idEmpleado: any;
  estado_auto: any;
  autorizacion: any = [];
  ArrayAutorizacionTipos: any = [];
  FiltroVacaciones: any = [];
  VacacionDato: any = [];

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
    this.FiltroVacaciones = [];
    this.VacacionDato = this.vacacion;

    /*
    let i = 0;
    this.vacaciones.filter(item => {
      this.autoService.getAutorizacionVacacion(item.id).subscribe(
        autorizacion => { 
          this.autorizacion = autorizacion
          var autorizaciones = this.autorizacion.id_documento.split(',');
          this.autoService.BuscarListaAutorizaDepa(this.autorizacion.id_departamento).subscribe(res => {
            this.listadoDepaAutoriza = res;
            i = i+1;
            this.listadoDepaAutoriza.filter(i => {
              this.nivel_padre = i.nivel_padre;
              if((this.idEmpleado == i.id_contrato) && (autorizaciones.length ==  i.nivel)){
                return this.FiltroVacaciones.push(item);
              }
            })
    
            if (this.vacaciones.length === i) {
              this.mensaje = 'No tiene Solicitudes de Vacaciones para APROBAR';
            }
          });
        }
      )
    });
    */

  }
}
