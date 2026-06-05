import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ParametrosService } from 'src/app/services/parametros.service';
import { AlertController, ToastController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { NetworkService } from 'src/app/libs/network.service';
import { ConnectivityService } from 'src/app/services/conexion-servidor.service'

@Component({
  selector: 'app-solicitudes',
  template: `
  <ion-content class="solicitudes-content">

    <ng-container *ngIf="isConnected && serverConnected">

      <section class="hero-solicitudes">
        <div class="logo-box">
          <img src="../../../assets/images/ISOLOGO.png" />
          <h1>Reloj Virtual</h1>
        </div>

        <div class="hero-texto">
          <div class="hero-icono">
            <ion-icon name="folder-open-outline"></ion-icon>
          </div>

          <h2>Solicitudes</h2>
          <p>Seleccione el tipo de solicitud que desea gestionar.</p>
        </div>

        <img class="imagen-solicitudes" src="../../../assets/images/Solicitudes.svg" />
      </section>

      <section class="opciones-section">

        <ion-card
          class="opcion-card"
          [class.modulo-deshabilitado]="!Btn_vacaciones"
          button="true"
          (click)="BtnVacaciones_click()">

          <ion-card-content>
            <div class="opcion-icono vacaciones">
              <ion-icon name="airplane-outline"></ion-icon>
            </div>

            <div class="opcion-info">
              <h3>Vacaciones</h3>
              <p>Solicitar o consultar vacaciones.</p>
            </div>

            <ion-icon class="opcion-flecha" name="chevron-forward-outline"></ion-icon>
          </ion-card-content>

        </ion-card>

        <ion-card
          class="opcion-card"
          [class.modulo-deshabilitado]="!Btn_permisos"
          button="true"
          (click)="BtnPermisos_click()">

          <ion-card-content>
            <div class="opcion-icono permisos">
              <ion-icon name="reader-outline"></ion-icon>
            </div>

            <div class="opcion-info">
              <h3>Permisos</h3>
              <p>Solicitar o consultar permisos.</p>
            </div>

            <ion-icon class="opcion-flecha" name="chevron-forward-outline"></ion-icon>
          </ion-card-content>

        </ion-card>

      </section>

    </ng-container>

    <ng-container *ngIf="!isConnected || !serverConnected">

      <app-refresh-info (onRefresh)="ngOnInit()" removeItem="noClean"></app-refresh-info>

      <section class="offline-card">
        <div class="offline-icon">
          <ion-icon name="cloud-offline-outline"></ion-icon>
        </div>

        <h3>Solicitudes no disponibles</h3>

        <p>
          En esta vista encontrará información de solicitudes.
        </p>

        <p *ngIf="!isConnected">
          Se podrá visualizar cuando tenga conexión a internet.
        </p>

        <p *ngIf="!serverConnected">
          Se podrá visualizar cuando tenga conexión al servidor.
        </p>
      </section>

      <section class="offline-image-card">
        <span class="center1">
           <div class="logo-contenedor">
              <img src="../../../assets/images/ISOLOGO.png">
            </div>
          <ion-label mode="md" color="medium">
            <h1><b>Reloj Virtual</b></h1>
          </ion-label>
        </span>

        <img class="offline-img" src="../../../assets/images/lost_timee.svg" />
      </section>

      <section class="offline-message">
        <ion-text *ngIf="!isConnected">
          No tiene conexión a internet
        </ion-text>

        <ion-text *ngIf="!serverConnected">
          No tiene conexión al servidor
        </ion-text>
      </section>

    </ng-container>

  </ion-content>
`,
  styles: [`
  :host {
    --app-primary: #0f75bc;
    --app-primary-dark: #0b5a92;
    --app-primary-light: #e8f4fd;

    --app-bg: #f4f7fb;
    --app-card: #ffffff;
    --app-soft: #f8fafc;
    --app-text: #1f2937;
    --app-text-soft: #64748b;
    --app-border: rgba(15, 23, 42, 0.09);
    --app-shadow: 0 6px 18px rgba(15, 23, 42, 0.10);
  }

  .solicitudes-content {
    --background: var(--app-bg);
  }

  /* =========================
     HERO
  ========================= */

  .hero-solicitudes {
    margin: 14px;
    padding: 20px 16px;
    border-radius: 24px;
    background: linear-gradient(135deg, var(--app-primary), var(--app-primary-dark));
    color: #ffffff;
    box-shadow: 0 7px 18px rgba(15, 117, 188, 0.24);
    text-align: center;
    overflow: hidden;
  }

  .logo-box img {
    width: 42%;
    max-width: 155px;
    min-width: 110px;
    display: block;
    margin: auto;
    background: #ffffff;
    padding: 8px;
    border-radius: 18px;
  }

  .logo-box h1 {
    margin: 8px 0 16px 0;
    font-size: 14px;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.88);
  }

  .hero-texto {
    margin-top: 4px;
  }

  .hero-icono {
    width: 56px;
    height: 56px;
    margin: 0 auto 10px auto;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.16);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hero-icono ion-icon {
    font-size: 31px;
    color: #ffffff;
  }

  .hero-texto h2 {
    margin: 0;
    font-size: 21px;
    font-weight: 900;
    color: #ffffff;
  }

  .hero-texto p {
    margin: 8px 0 0 0;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.88);
    line-height: 1.4;
  }

  .imagen-solicitudes {
    width: 64%;
    max-width: 240px;
    display: block;
    margin: 18px auto 0 auto;
  }

  /* =========================
     OPCIONES
  ========================= */

  .opciones-section {
    margin: 0 14px 18px 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .opcion-card {
    margin: 0;
    border-radius: 20px;
    background: var(--app-card);
    color: var(--app-text);
    border: 1px solid var(--app-border);
    box-shadow: var(--app-shadow);
    overflow: hidden;
  }

  .opcion-card ion-card-content {
    padding: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .opcion-icono {
    width: 52px;
    height: 52px;
    min-width: 52px;
    border-radius: 17px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .opcion-icono ion-icon {
    font-size: 29px;
    color: #ffffff;
  }

  .opcion-icono.vacaciones {
    background: linear-gradient(135deg, #0ea5e9, #0369a1);
  }

  .opcion-icono.permisos {
    background: linear-gradient(135deg, #22c55e, #15803d);
  }

  .opcion-info {
    flex: 1;
    text-align: left;
    min-width: 0;
  }

  .opcion-info h3 {
    margin: 0;
    color: var(--app-text);
    font-size: 16px;
    font-weight: 900;
  }

  .opcion-info p {
    margin: 5px 0 0 0;
    color: var(--app-text-soft);
    font-size: 12px;
    font-weight: 600;
    line-height: 1.35;
  }

  .opcion-flecha {
    font-size: 22px;
    color: var(--app-primary);
  }

  .modulo-deshabilitado {
    opacity: 0.62;
  }

  .modulo-deshabilitado .opcion-icono {
    filter: grayscale(0.6);
  }

  .modulo-deshabilitado .opcion-flecha {
    color: var(--app-text-soft);
  }

  /* =========================
     SIN CONEXIÓN
  ========================= */

  .offline-card {
    margin: 16px 14px 14px 14px;
    padding: 22px 16px;
    border-radius: 22px;
    background: var(--app-card);
    color: var(--app-text);
    border: 1px solid var(--app-border);
    box-shadow: var(--app-shadow);
    text-align: center;
  }

  .offline-icon {
    width: 58px;
    height: 58px;
    margin: 0 auto 12px auto;
    border-radius: 18px;
    background: var(--app-primary-light);
    color: var(--app-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .offline-icon ion-icon {
    font-size: 32px;
  }

  .offline-card h3 {
    margin: 0 0 10px 0;
    color: var(--app-text);
    font-size: 18px;
    font-weight: 900;
  }

  .offline-card p {
    margin: 8px 0 0 0;
    color: var(--app-text-soft);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.4;
  }

  .offline-image-card {
    margin: 14px;
    padding: 18px 14px;
    border-radius: 22px;
    background: var(--app-card);
    border: 1px solid var(--app-border);
    box-shadow: var(--app-shadow);
    text-align: center;
  }

  .center1 {
    display: block;
    margin-bottom: 12px;
  }

  .center1 img {
    width: 42%;
    max-width: 150px;
    min-width: 110px;
  }

  .center1 h1 {
    margin: 6px 0 0 0;
    font-size: 13px;
    color: var(--app-text-soft);
  }

  .offline-img {
    width: 72%;
    max-width: 260px;
    display: block;
    margin: auto;
  }

  .offline-message {
    margin: 14px;
    padding: 14px;
    text-align: center;
    border-radius: 16px;
    background: rgba(239, 68, 68, 0.10);
    color: #b91c1c;
    font-size: 14px;
    font-weight: 800;
  }

  /* =========================
     MODO OSCURO
  ========================= */

  @media (prefers-color-scheme: dark) {
    :host {
      --app-bg: #0f172a;
      --app-card: #1e293b;
      --app-soft: #111827;
      --app-text: #f8fafc;
      --app-text-soft: #cbd5e1;
      --app-border: rgba(255, 255, 255, 0.08);
      --app-shadow: 0 6px 18px rgba(0, 0, 0, 0.38);
      --app-primary-light: rgba(14, 165, 233, 0.16);
    }

    .offline-message {
      background: rgba(239, 68, 68, 0.16);
      color: #fca5a5;
    }
  }

  /* =========================
     RESPONSIVE
  ========================= */

  @media (max-width: 380px) {
    .hero-solicitudes,
    .opciones-section,
    .offline-card,
    .offline-image-card,
    .offline-message {
      margin-left: 10px;
      margin-right: 10px;
    }

    .hero-texto h2 {
      font-size: 19px;
    }

    .hero-texto p {
      font-size: 12px;
    }

    .imagen-solicitudes {
      width: 72%;
    }

    .opcion-icono {
      width: 48px;
      height: 48px;
      min-width: 48px;
      border-radius: 16px;
    }

    .opcion-icono ion-icon {
      font-size: 26px;
    }

    .opcion-info h3 {
      font-size: 15px;
    }

    .opcion-info p {
      font-size: 11px;
    }
  }
`],
})
export class SolicitudesPage implements OnInit {
  serverConnected: boolean = true;
  Btn_permisos: boolean;
  Btn_horasExtras: boolean;
  Btn_alimentacion: boolean;
  Btn_vacaciones: boolean;

  colorp: any;
  colorh: any;
  colorv: any;
  colora: any;

  isConnected: boolean;
  constructor(
    public platform: Platform,
    private router: Router,
    public toastController: ToastController,
    public alertController: AlertController,
    public parametros: ParametrosService,
    private networkService: NetworkService,
    private connectivityService: ConnectivityService
  ) { }


  // METODO PARA REFRESCAR LA PAGINA
  doRefresh(event: any) {
    this.ngOnInit();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 1500);
  }

  async ionViewWillEnter() {
    this.networkSubscriber();
    this.serverConnected = await this.connectivityService.checkServerConnection();
    this.VerificarFunciones();
  }

  async ngOnInit() {
    this.networkSubscriber();
    this.serverConnected = await this.connectivityService.checkServerConnection();
    this.VerificarFunciones();
  }

  // METODO PARA VERIFICAR LA CONEXION A INTERNET
  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
  }

  // METODO PARA VERIFICAR LAS FUNCIONES HABILITADAS
  VerificarFunciones() {
    const raw = localStorage.getItem('modulos');

    const modulos = JSON.parse(raw);

    const { permisos, vacaciones } = modulos;

    this.Btn_permisos = permisos;
    this.Btn_vacaciones = vacaciones

    if (this.Btn_permisos == true) {
      this.colorp = "habilitado";
    } else {
      this.colorp = "deshabilitado";
    }

    if (this.Btn_vacaciones == true) {
      this.colorv = "habilitado";
    } else {
      this.colorv = "deshabilitado";
    }

  }

  // METODO PARA REDIRECCIONAR A LA PAGINA DE PERMISOS
  BtnPermisos_click() {
    if (this.Btn_permisos == true) {
      this.router.navigateByUrl("/reloj/solicitudes/permiso-solicitud");
    } else if (this.Btn_permisos == false) {
      this.usuarioIncorrectoToas("  Ups!!! al parecer no tienes activado en tu plan el Módulo de Permisos.\n\nTe gustaría activarlo?");
    } else {
      this.usuarioIncorrectoToas(" Ups! Parece que hay problemas con la conexion.\n Comprueba tu conexion a internet o");
    }
  }

  // METODO PARA REDIRECCIONAR A LA PAGINA DE ALIMENTACION
  BtnVacaciones_click() {
    if (this.Btn_vacaciones == true) {
      this.router.navigateByUrl("/reloj/solicitudes/vacacion-solicitud");
    } else if (this.Btn_vacaciones == false) {
      this.usuarioIncorrectoToas("  Ups!!! al parecer no tienes activado en tu plan el Módulo de Vacaciones.\n\nTe gustaría activarlo?");
    } else {
      this.usuarioIncorrectoToas(" Ups! Parece que hay problemas con la conexion.\n Comprueba tu conexion a internet o");
    }
  }

  //METODO PARA CONFIGUAR EL MENSAJE DE NO ACCESO A LOS MODULOS
  async usuarioIncorrectoToas(mensaje: string) {
    const toast = await this.toastController.create({
      message: `<ion-icon name="information-circle-outline"></ion-icon>` + mensaje + `\n Comunicate con nosotros: www.casapazmino.com.ec`,
      duration: 4500,
      position: "top",
      color: "notificacicon",
      mode: "ios",
      cssClass: 'toast-custom-class',
    });
    await toast.present();
  }

}
