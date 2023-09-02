import { Component, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ListaPermisosAdminComponent } from './componentes/lista-permisos-admin/lista-permisos-admin.component';

@Component({
  selector: 'app-aprobar-permisos',
  templateUrl: './aprobar-permisos.page.html',
  styleUrls: ['./aprobar-permisos.page.scss'],
})
export class AprobarPermisosPage {
  @ViewChild(ListaPermisosAdminComponent) listaPermisos: ListaPermisosAdminComponent;

  constructor( 
    public platform: Platform,
    ) {}

  ionViewWillLeave(){
    console.log("sali de aprobacion de Permisos");
    this.listaPermisos.limpiarRango_fechas();
    this.listaPermisos.obtenerAllPermisos();
  }

}
