import { Component, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ListaVacacionesAdminComponent } from './componentes/lista-vacaciones-admin/lista-vacaciones-admin.component';

@Component({
  selector: 'app-aprobar-vacaciones',
  templateUrl: './aprobar-vacaciones.page.html',
  styleUrls: ['./aprobar-vacaciones.page.scss'],
})
export class AprobarVacacionesPage {
  @ViewChild(ListaVacacionesAdminComponent) listaVacaciones: ListaVacacionesAdminComponent;

  constructor( 
    public platform: Platform,
    ) {}

  ngOnInit() {
  }

  ionViewWillLeave(){
    console.log("sali de aprobacion de Vacaciones");
    this.listaVacaciones.limpiarRango_fechas();
    this.listaVacaciones.obtenerAllVacaciones();
  }
}
