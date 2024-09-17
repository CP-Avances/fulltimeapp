import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ParametrosService } from 'src/app/services/parametros.service';
import { AlertController, MenuController, ToastController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { NetworkService } from 'src/app/libs/network.service';
import { ConnectivityService } from 'src/app/services/conexion-servidor.service'


@Component({
  selector: 'app-aprobaciones',
  template: `
  <br><br><br>
  <hr>
  <ion-content>
    <header style="text-align: center;">
      <h3 *ngIf="isConnected && serverConnected">Aprobaciones</h3>
    </header>

    <div class="Imagen" *ngIf="isConnected && serverConnected">
      <img class="center" src="../../../assets/images/C_FTLOGORV.png">
        <ion-label style="text-align:center" mode="md" color="medium">
          <h1 style="font-size: 3vw"><b>Reloj Virtual</b></h1>
        </ion-label>
        <img class="tamanoImagen" src="../../../assets/images/Solicitudes.svg">
    </div>

    <ion-grid *ngIf="isConnected && serverConnected">
      <ion-row>
        <ion-col size="6">
          <ion-button [color] = "colorp" expand="block" (click)="BtnPermisos_click()">
            <div>
              <ion-icon name="reader-outline"></ion-icon> <br>
              <ion-text>
                Permisos
              </ion-text>
            </div>
          </ion-button>
        </ion-col>
        
        <ion-col size="6">
          <ion-button [color] = "colorh" expand="block" (click)="BtnHorasExtras_click()">
            <div>
              <ion-icon name="hourglass-outline"></ion-icon> <br>
              <ion-text>
                Horas Extras
              </ion-text>
            </div>
          </ion-button>
        </ion-col>
      </ion-row>

      <ion-row>
        <ion-col size="6">
          <ion-button [color] = "colorv" expand="block" (click)="BtnVacaciones_click()">
            <div>
              <ion-icon name="airplane-outline"></ion-icon> <br>
              <ion-text>
                Vacaciones
              </ion-text>
            </div>
          </ion-button>
        </ion-col>

        <ion-col size="6">
          <ion-button [color] = "colora" expand="block"  (click)="BtnAlimentacion_click()">
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

    <ion-content *ngIf="!isConnected || !serverConnected">
    <app-refresh-info (onRefresh)="ngOnInit()" removeItem="noClean"></app-refresh-info>

        <!-- Ventana de no conexion a internet-->
        <div style="margin: 2%; padding: 2%; text-align: center; border-radius: 2%;">
          <ion-text color='medium' style="font-family: Arial, Helvetica, sans-serif; font-size: 90%;">
            En esta vista encontrará información de Aprobaciones.
          </ion-text>
          <br>
          <br>
          <ion-text color='medium' style="font-family: Arial, Helvetica, sans-serif; font-size: 80%;"  *ngIf="serverConnected">
            Se podrá visualizar cuando tenga conexión a internet
          </ion-text>
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
        <ion-text color='dark' style="font-family: Arial, Helvetica, sans-serif;" *ngIf="serverConnected">
          No tiene conexión a internet
        </ion-text>
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
      margin: 1%;
      height: 110px;
      border-radius: 10%;
    }

    ion-icon {
      text-align: center;
      font-size: 25px;
      margin: 8px 0px;
      color: rgb(226, 226, 226 );
    }

    ion-text{
      color: rgb(226, 226, 226);;
      font-size: 80%;
    }

    .tamanoImagen{
      width: 62%;
      display: block;
      margin-left: auto;
      margin-right: auto;
    }

    .Imagen{
      padding:3%;
      margin: 5%;
      border-radius: 2%;
      background-color:rgb(255, 255, 255);
    }

    .center {
      display: block;
      margin-left: auto;
      margin-right: auto;
      width: 35%;
    }

  `],
})
export class AprobacionesPage implements OnInit {
  serverConnected: boolean = true;

  constructor(
    private menu: MenuController,
    public platform: Platform,
    private router: Router,
    public toastController: ToastController,
    public alertController: AlertController,
    public parametros: ParametrosService,
    private networkService: NetworkService,
    private connectivityService: ConnectivityService

  ) {}
  isConnected: boolean;

  ionViewWillEnter(){
    this.VerificarFunciones();
    this.networkSubscriber();

  }

  async ngOnInit() {
    this.VerificarFunciones();
    this.networkSubscriber();
    this.serverConnected = await this.connectivityService.checkServerConnection();

  }

  Btn_permisos: boolean;
  Btn_horasExtras: boolean;
  Btn_alimentacion: boolean;
  Btn_vacaciones: boolean;

  colorp: any;
  colorh: any;
  colorv: any;
  colora: any;

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
  funciones: any = [];
  VerificarFunciones() {
    this.parametros.ObtenerFunciones().subscribe(res => {
      this.funciones = res[0]; 
      this.Btn_permisos = this.funciones.permisos;
      this.Btn_horasExtras = this.funciones.hora_extra;
      this.Btn_alimentacion = this.funciones.alimentacion;
      this.Btn_vacaciones = this.funciones.vacaciones

      if(this.Btn_permisos == true){
        this.colorp = "habilitado";
      }else{
        this.colorp = "deshabilitado";
      }

      if(this.Btn_horasExtras == true){
        this.colorh = "habilitado";
      }else{
        this.colorh = "deshabilitado";
      }

      if(this.Btn_alimentacion == true){
        this.colora = "habilitado";
      }else{
        this.colora = "deshabilitado";
      }

      if(this.Btn_vacaciones == true){
        this.colorv = "habilitado";
      }else{
        this.colorv = "deshabilitado";
      }
    }, error => {
      this.colorp = "c";
      this.colorh = "deshabilitado";
      this.colorv = "deshabilitado";
      this.colora = "deshabilitado";
    });
  }

  BtnPermisos_click(){
    if(this.Btn_permisos == true){
      this.router.navigateByUrl("/reloj/aprobaciones/permiso-aprobacion");
    }else if(this.Btn_permisos == false){
      this.usuarioIncorrectoToas("Ups!!! al parecer no tienes activado en tu plan el Módulo de Permisos.\n\nTe gustaría activarlo?");
    }else{
      this.usuarioIncorrectoToas(" Ups! Parece que hay problemas con la conexión. \n Comprueba tu conexión a internet o");
    }
  }

  BtnHorasExtras_click(){
    if(this.Btn_horasExtras == true){
      this.router.navigateByUrl("/reloj/aprobaciones/hora-extra-aprobacion");
    }else if(this.Btn_horasExtras == false){
      this.usuarioIncorrectoToas("Ups!!! al parecer no tienes activado en tu plan el Módulo de Horas Extras.\n\nTe gustaría activarlo?");
    }else{
      this.usuarioIncorrectoToas(" Ups! Parece que hay problemas con la conexión. \n Comprueba tu conexión a internet o");
    }
  }

  BtnAlimentacion_click(){
    if(this.Btn_alimentacion == true){
      this.router.navigateByUrl("/reloj/aprobaciones/alimentacion-aprobacion");
    }else if(this.Btn_alimentacion == false){
      this.usuarioIncorrectoToas("  Ups!!! al parecer no tienes activado en tu plan el Módulo de Alimentación.\n\nTe gustaría activarlo?");
    }else{
      this.usuarioIncorrectoToas(" Ups! Parece que hay problemas con la conexión.\n Comprueba tu conexión a internet o");
    }
  }

  BtnVacaciones_click(){
    if(this.Btn_vacaciones == true){
      this.router.navigateByUrl("/reloj/aprobaciones/vacacion-aprobacion");
    }else if(this.Btn_vacaciones == false){
      this.usuarioIncorrectoToas(" Ups!!! al parecer no tienes activado en tu plan el Módulo de Vacaciones.\n\nTe gustaría activarlo?");
    }else{
      this.usuarioIncorrectoToas(" Ups! Parece que hay problemas con la conexión. \n Comprueba tu conexión a internet o");
    }
  }


  async usuarioIncorrectoToas(mensaje: string) {
    const toast = await this.toastController.create({
      message: `<ion-icon name="information-circle-outline"></ion-icon>`+mensaje+`\n Comunicate con nosotros: www.casapazmino.com.ec`,
      duration: 4500,
      position: "top",
      color: "notificacicon",
      mode: "ios",
      cssClass: 'toast-custom-class',
    });
    await toast.present();
  }

}
