import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, ToastController } from '@ionic/angular';
import { NetworkService } from 'src/app/libs/network.service';

@Component({
  selector: 'app-reportes',
  template: `
  <br><br><br>
  <ion-content>
    <header style="text-align: center;">
      <h3>Consulta tus reportes</h3>
    </header>

    <ion-grid *ngIf="isConnected">

    <ion-row>
        <ion-col size="6">
          <ion-button expand="block" fill="clear" [routerLink]="['/reloj/reportes/timbres']">
            <div>
              <ion-icon name="alarm-outline"></ion-icon> <br>
              <ion-text>
                Timbres
              </ion-text>
            </div>
          </ion-button>
        </ion-col>
        <ion-col size="6">
        <ion-button expand="block" fill="clear" [routerLink]="['/reloj/reportes/timbresConNovedades']">
          <div>
            <ion-icon name="alarm-outline"></ion-icon> <br>
            <ion-text>
              Timbres <br> con Novedades 
            </ion-text>
          </div>
        </ion-button>
      </ion-col>
      </ion-row>

      <ion-row>
        <ion-col size="6">
          <ion-button expand="block" fill="clear" [routerLink]="['/reloj/reportes/inasistencia']">
            <div>
              <ion-icon name="timer-outline"></ion-icon> <br>
              <ion-text>
                Faltas
              </ion-text>
            </div>
          </ion-button>
        </ion-col>
        <ion-col size="6">
          <ion-button expand="block" fill="clear" [routerLink]="['/reloj/reportes/atrasos']">
            <div>
              <ion-icon name="time-outline"></ion-icon> <br>
              <ion-text>
                Atrasos
              </ion-text>
            </div>
          </ion-button>
        </ion-col>
      </ion-row>

      <ion-row>
        <ion-col size="6">
          <ion-button expand="block" fill="clear" [routerLink]="['/reloj/reportes/solicitud']" [disabled]="deshabilitado">
            <div>
              <ion-icon name="mail-unread-outline"></ion-icon> <br>
              <ion-text>
                Solicitudes <br> Pendientes
              </ion-text>
            </div>
          </ion-button>
        </ion-col>
        <ion-col size="6">
          <ion-button expand="block" fill="clear" [routerLink]="['/reloj/reportes/vacaciones']" [disabled]="deshabilitado">
            <div>
              <ion-icon name="airplane-outline"></ion-icon> <br>
              <ion-text>
                Vacaciones
              </ion-text>
            </div>
          </ion-button>
        </ion-col>
      </ion-row>

      <ion-row>
      <ion-col size="6">
          <ion-button expand="block" fill="clear" [routerLink]="['/reloj/reportes/horas-extras']" [disabled]="deshabilitado">
            <div>
              <ion-icon name="hourglass-outline"></ion-icon> <br>
              <ion-text>
                Horas Extras
              </ion-text>
            </div>
          </ion-button>
        </ion-col>
     <ion-col size="6">
       <ion-button expand="block" fill="clear" [routerLink]="['/reloj/reportes/alimentacion']" [disabled]="deshabilitado">
         <div>
           <ion-icon name="fast-food-outline"></ion-icon> <br>
           <ion-text>
             Alimentación
           </ion-text>
         </div>
       </ion-button>
     </ion-col>
   </ion-row>
      

    </ion-grid>

    <ion-content *ngIf="!isConnected">
    <app-refresh-info (onRefresh)="ngOnInit()" removeItem="noClean"></app-refresh-info>

        <!-- Ventana de no conexion a internet-->
        <div style="margin: 2%; padding: 2%; text-align: center; border-radius: 2%;">
          <ion-text color='medium' style="font-family: Arial, Helvetica, sans-serif; font-size: 90%;">
            En esta vista encontrará información de Reportes.
          </ion-text>
          <br>
          <br>
          <ion-text color='medium' style="font-family: Arial, Helvetica, sans-serif; font-size: 80%;">
            Se podrá visualizar cuando tenga conexión a internet
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
          <ion-text color='dark' style="font-family: Arial, Helvetica, sans-serif;">
            No tiene conexión a internet
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
      color: rgb(226, 226, 226);;
      font-size: 80%;
    }
  `],
})
export class ReportesPage implements OnInit {

  constructor(
    public platform: Platform,
    private router: Router,
    public toastController: ToastController,
    private networkService: NetworkService,

  ) { }
  deshabilitado: boolean = true;


  isConnected: boolean;

  ngOnInit() {
    this.networkSubscriber();
  }
  ionViewWillEnter() {
    this.networkSubscriber();
  }

  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
    console.log("Esta conectado: ", this.isConnected)
    if (!this.isConnected) {
      this.abrirToas('Por favor verifique su conexión a Internet', "danger", 3000, "middle");

    } else {

      console.log('conectado');
    }
  }

  async abrirToas(mensaje: string, color: string, duracion: number, position: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      position: position
    });
    toast.present();
  }
}
