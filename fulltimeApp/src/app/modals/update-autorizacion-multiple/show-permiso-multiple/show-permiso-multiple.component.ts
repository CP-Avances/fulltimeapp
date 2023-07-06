import { Component, Input, OnInit } from '@angular/core';
import { Permiso } from '../../../interfaces/Permisos';
import { AutorizacionesService } from 'src/app/services/autorizaciones.service';

@Component({
  selector: 'app-show-permiso-multiple',
  template: `
  <div>
    <ion-card style="padding: 3% 7% 3% 5%;">
        <ion-card-title style="text-align: center; font-size: 13px;">
          <strong *ngIf="PermisoDato.aprobacion === 'NO'" style="float:left; margin-left:1%; color:#e0065d " > {{ PermisoDato.aprobacion }} </strong> 
          <strong *ngIf="PermisoDato.aprobacion === 'SI'" style="float:left; margin-left:1%; color:#3de006"> {{ PermisoDato.aprobacion }} </strong> 
          <strong style="float:right; margin-left:-10%;"> Soli #: {{ PermisoDato.num_permiso }}</strong> 
          {{PermisoDato.nempleado | titlecase }}
        </ion-card-title>
          
  
        <h6>
          <ion-card-title style="margin-top:-2%; margin-bottom:2%; font-size: 12px;"><b> Informacion </b></ion-card-title>

          <p style="font-size: 12px; margin-top:-2%;"> Solicita Permiso por {{ PermisoDato.ntipopermiso | titlecase }}</p>
          <p style="font-size: 12px; margin-top:-2%;" *ngIf="PermisoDato.descripcion != null">Descripcion<br>{{ PermisoDato.descripcion }}</p>
          <p style="font-size: 12px; margin-top:-2%;" *ngIf="PermisoDato.descripcion == null" > El Usuario no ha ingresado una descrcipcion</p>

          <p style="font-size: 11px; margin-top:-2%">
            <strong> Código del usuario - </strong>{{ PermisoDato.codigo }}<br> 
          </p>

          <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 12px;"><b> Fecha </b></ion-card-title>
          <p style="font-size: 10px; margin: top -0.5em;">   
            <strong> Desde: </strong>{{ PermisoDato.fec_inicio_ }} - 
            <strong> Hasta: </strong> {{ PermisoDato.fec_final_ }}<br>
            <strong> Hora inicia: </strong> {{ PermisoDato.hora_salida_ }} - 
            <strong> Hora finaliza:</strong> {{ PermisoDato.hora_ingreso_ }} <br>
            <strong> Permiso - Horas: </strong> {{ PermisoDato.hora_numero }} /&nbsp;
            <strong> Dias: </strong> {{ PermisoDato.dia }} <br>
            <br>
            <ion-card-title style="margin-top:-2%; margin-bottom:-3%; font-size: 100%; float: right;"> <b> Fecha solicitada:</b> {{ PermisoDato.fec_creacion_ }}</ion-card-title> 
          </p>
        </h6>
 
    </ion-card>
  </div>
  `,
  // styleUrls: ['./show-permiso.component.scss'],
})
export class ShowPermisoMultipleComponent implements OnInit {
  @Input() permiso: Permiso[];

  idEmpleado: any;
  estado_auto: any;
  autorizacion: any = [];
  ArrayAutorizacionTipos: any = [];
  Filtropermisos: any = [];
  PermisoDato: any = [];
  colorApro: any;

  constructor(
    private autoService: AutorizacionesService,
  ){
    this.idEmpleado = parseInt(localStorage.getItem('empleadoID'));
  }

  ngOnInit(){
    this.PermisoDato = this.permiso;
    this.ConfiguracionAutorizacion();
  }

  nivel_padre: number = 0;
  mensaje: any;
  listadoDepaAutoriza: any = []
  ConfiguracionAutorizacion(){
    this.listadoDepaAutoriza = [];
    this.Filtropermisos = [];
  }
}
