import { Component, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ListaAlimentacionAdminComponent } from './componentes/lista-alimentacion-admin/lista-alimentacion-admin.component';

@Component({
  selector: 'app-aprobar-alimentacion',
  templateUrl: './aprobar-alimentacion.page.html',
  styleUrls: ['./aprobar-alimentacion.page.scss'],
})
export class AprobarAlimentacionPage {

  @ViewChild(ListaAlimentacionAdminComponent ) listaAlimentacion : ListaAlimentacionAdminComponent ;

  constructor( 
    public platform: Platform,
    ) {}

  ionViewWillLeave(){
    console.log("sali de aprobacion de Alimentacion");
    this.listaAlimentacion.limpiarRango_fechas();
    this.listaAlimentacion.obtenerAllAlimentacion();
  }

}
