import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, ToastController } from '@ionic/angular';
import { NetworkService } from 'src/app/libs/network.service';
import { ConnectivityService } from 'src/app/services/conexion-servidor.service'

@Component({
  selector: 'app-reportes',
  template: `
  <br><br><br>
  <ion-content>
    <header style="text-align: center;">
      <h3>Consulta tus reportes</h3>
    </header>

    <ion-grid *ngIf="isConnected && serverConnected">

    <ion-row>
        <ion-col size="12">
          <ion-button expand="block" fill="clear" [routerLink]="['/reloj/reportes/timbres']">
            <div>
              <ion-icon name="alarm-outline"></ion-icon> <br>
              <ion-text class="text-primario">
                Timbres
              </ion-text>
            </div>
          </ion-button>
        </ion-col>
      </ion-row>

    </ion-grid>

    <ion-content *ngIf="!isConnected || !serverConnected">
    <app-refresh-info (onRefresh)="ngOnInit()" removeItem="noClean"></app-refresh-info>

        <!-- Ventana de no conexion a internet-->
        <div style="margin: 2%; padding: 2%; text-align: center; border-radius: 2%;">
          <ion-text color='medium' style="font-family: Arial, Helvetica, sans-serif; font-size: 90%;">
            En esta vista encontrará información de Reportes.
          </ion-text>
          <br>
          <br>
          <ion-text color='medium' style="font-family: Arial, Helvetica, sans-serif; font-size: 80%;"  *ngIf="!isConnected">
            Se podrá visualizar cuando tenga conexión a internet
          </ion-text>
          <br>

          <ion-text color='medium' style="font-family: Arial, Helvetica, sans-serif; font-size: 80%;" *ngIf="!serverConnected" >
            Se podrán visualizar cuando tenga conexión al servidor
          </ion-text>
        </div>
        <div class="Imagen">
          <span class="center1">
            <img src="../../../assets/images/C_FTLOGORV.png">
            <ion-label style="text-align:center" mode="md" color="medium">
              <h1 style="font-size: 3vw"><b>Reloj Virtual</b></h1>
            </ion-label>
          </span>
          <img src="../../../assets/images/lost_timee.svg" />
        </div>

        <div style="margin: 4%; padding: 4%; text-align: center; border-radius: 2%;">
        <ion-text color='dark' style="font-family: Arial, Helvetica, sans-serif;" *ngIf="!isConnected">
          No tiene conexión a internet
        </ion-text>
        <br>

        <ion-text color='dark' style="font-family: Arial, Helvetica, sans-serif;" *ngIf="!serverConnected">
          No tiene conexión al servidor
        </ion-text>
        </div>
    </ion-content>
  </ion-content>
  `,
  styles: [`

    ion-grid{
      margin: 1% 2% 0% 2%
    }

    ion-button {
      margin: 0px;
      height: 105px;
      border-radius: 8%;
      background-color: rgba(5, 52, 85, 0.636);
    }

    ion-icon {
      text-align: center;
      font-size: 22px;
      margin: 6px 0px;
      color: rgb(226, 226, 226 );
    }

    ion-text{
      font-size: 80%;
    }

    .text-primario {
      color: rgb(226, 226, 226);;
      font-weight: bold;
    }  
  `],
})
export class ReportesPage implements OnInit {
  serverConnected: boolean = true;

  constructor(
    public platform: Platform,
    private router: Router,
    public toastController: ToastController,
    private networkService: NetworkService,
    private connectivityService: ConnectivityService
  ) { }
  deshabilitado: boolean = true;


  isConnected: boolean;

  async ngOnInit() {
    this.networkSubscriber();
    this.serverConnected = await this.connectivityService.checkServerConnection();
  }
  async ionViewWillEnter() {
    this.networkSubscriber();
    this.serverConnected = await this.connectivityService.checkServerConnection();
  }

  // METODO DE VERIFICACION DE CONEXION A INTERNET
  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
    console.log("Esta conectado: ", this.isConnected)
  }


}
