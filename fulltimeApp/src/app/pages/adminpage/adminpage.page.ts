import { Component, OnInit, ViewChild } from '@angular/core';
import { RelojServiceService } from 'src/app/services/reloj-service.service';
import { AlertController, NavController, Platform, ToastController } from '@ionic/angular';
import { NavegadorAdminComponent } from 'src/app/componentes/navegador-admin/navegador-admin.component';
import { Usuario } from 'src/app/interfaces/Usuario';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-adminpage',
  templateUrl: './adminpage.page.html',
  styleUrls: ['./adminpage.page.scss'],
})
export class AdminpagePage implements OnInit {

  AdimNav: NavegadorAdminComponent;

  usuarioObtenido: Usuario;

  usuario: Usuario = {
    nombre: "",
    apellido: "",
    cedula: "",
    usuario: "",
    id_rol: 0
  }

  constructor(
    private relojServiceService: RelojServiceService, 
    private navCtroller: NavController,
    public alertCrtl: AlertController,
    public platform: Platform,
    private statusBar: StatusBar,
    public alertController: AlertController,
    private toastController: ToastController,
  ) {}

  ngOnInit() {
  }

  esAdministrador(): boolean {
    console.log('llego a la pagina de administrador');
    if (this.relojServiceService.esAdministrador()) {
      this.navCtroller.navigateRoot(['adminpage']);
      return true;
    } else {
    this.navCtroller.navigateForward('login');
     return false;
    }
  }

  mostrarbar(){
    this.statusBar.styleLightContent();
  }

  mostrarbartextoOscuro(){
    this.statusBar.styleDefault();
  }
}
