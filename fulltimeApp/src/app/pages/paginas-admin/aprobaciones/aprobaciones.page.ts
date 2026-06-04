import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, Platform, ToastController } from '@ionic/angular';

import { ParametrosService } from 'src/app/services/parametros.service';
import { NetworkService } from 'src/app/libs/network.service';
import { ConnectivityService } from 'src/app/services/conexion-servidor.service';

@Component({
  selector: 'app-aprobaciones',
  templateUrl: './aprobaciones.page.html',
  styleUrls: ['./aprobaciones.page.scss'],
})
export class AprobacionesPage implements OnInit {

  serverConnected: boolean = true;
  isConnected: boolean = true;

  Btn_permisos: boolean = false;
  Btn_vacaciones: boolean = false;

  colorp: any;
  colorv: any;

  constructor(
    public platform: Platform,
    private router: Router,
    public toastController: ToastController,
    public alertController: AlertController,
    public parametros: ParametrosService,
    private networkService: NetworkService,
    private connectivityService: ConnectivityService
  ) { }

  async ngOnInit() {
    this.networkSubscriber();
    this.serverConnected = await this.connectivityService.checkServerConnection();
    this.VerificarFunciones();
  }

  async ionViewWillEnter() {
    this.networkSubscriber();
    this.serverConnected = await this.connectivityService.checkServerConnection();
    this.VerificarFunciones();
  }

  doRefresh(event: any) {
    this.ngOnInit();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }

  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
  }

  VerificarFunciones() {
    const raw = localStorage.getItem('modulos');

    if (!raw) {
      this.Btn_permisos = false;
      this.Btn_vacaciones = false;
      this.colorp = 'deshabilitado';
      this.colorv = 'deshabilitado';
      return;
    }

    try {
      const modulos = JSON.parse(raw);

      const { permisos, vacaciones } = modulos;

      this.Btn_permisos = permisos === true;
      this.Btn_vacaciones = vacaciones === true;

      this.colorp = this.Btn_permisos ? 'habilitado' : 'deshabilitado';
      this.colorv = this.Btn_vacaciones ? 'habilitado' : 'deshabilitado';

    } catch {
      this.Btn_permisos = false;
      this.Btn_vacaciones = false;
      this.colorp = 'deshabilitado';
      this.colorv = 'deshabilitado';
    }
  }

  BtnPermisos_click() {
    if (this.Btn_permisos === true) {
      this.router.navigateByUrl('/reloj/aprobaciones/permiso-aprobacion');
    } else {
      this.usuarioIncorrectoToas(
        'Ups!!! al parecer no tienes activado en tu plan el Módulo de Permisos.\n\nTe gustaría activarlo?'
      );
    }
  }

  BtnVacaciones_click() {
    if (this.Btn_vacaciones === true) {
      this.router.navigateByUrl('/reloj/aprobaciones/vacacion-aprobacion');
    } else {
      this.usuarioIncorrectoToas(
        'Ups!!! al parecer no tienes activado en tu plan el Módulo de Vacaciones.\n\nTe gustaría activarlo?'
      );
    }
  }

  async usuarioIncorrectoToas(mensaje: string) {
    const toast = await this.toastController.create({
      message:
        `<ion-icon name="information-circle-outline"></ion-icon>` +
        mensaje +
        `\n Comunicate con nosotros: www.casapazmino.com.ec`,
      duration: 4500,
      position: 'top',
      color: 'notificacicon',
      mode: 'ios',
      cssClass: 'toast-custom-class',
    });

    await toast.present();
  }

}