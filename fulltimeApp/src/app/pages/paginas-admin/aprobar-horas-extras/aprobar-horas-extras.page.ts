import { Component, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ListaHorasExtrasAdminComponent } from './componentes/lista-horas-extras-admin/lista-horas-extras-admin.component';

@Component({
  selector: 'app-aprobar-horas-extras',
  templateUrl: './aprobar-horas-extras.page.html',
  styleUrls: ['./aprobar-horas-extras.page.scss'],
})
export class AprobarHorasExtrasPage {
  @ViewChild(ListaHorasExtrasAdminComponent) listaHorasExtras: ListaHorasExtrasAdminComponent;

  constructor( 
    public platform: Platform,
    ) {}

  ionViewWillLeave(){
    console.log("sali de aprobacion de horas extras")
    this.listaHorasExtras.limpiarRango_fechas();
    this.listaHorasExtras.obtenerAllHorasExtras();
  }

}
