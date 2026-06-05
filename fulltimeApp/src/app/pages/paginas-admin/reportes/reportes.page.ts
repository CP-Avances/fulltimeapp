import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, ToastController } from '@ionic/angular';
import { NetworkService } from 'src/app/libs/network.service';
import { ConnectivityService } from 'src/app/services/conexion-servidor.service';

@Component({
  selector: 'app-reportes',
  template: `
    <ion-content class="reportes-content">

      <ng-container *ngIf="isConnected && serverConnected">

        <section class="titulo-contenedor">
          <div class="titulo-icono">
            <ion-icon name="documents-outline"></ion-icon>
          </div>

          <h3>Reportes</h3>
          <p>Consulta y descarga la información disponible.</p>
        </section>

        <section class="opciones-contenedor">

          <ion-card class="opcion-card" button="true" [routerLink]="['/reloj/reportes/timbres']">
            <ion-card-content>
              <div class="opcion-icono">
                <ion-icon name="alarm-outline"></ion-icon>
              </div>

              <div class="opcion-texto">
                <h2>Timbres</h2>
                <p>Consulta el historial de marcaciones registradas.</p>
              </div>

              <ion-icon class="opcion-flecha" name="chevron-forward-outline"></ion-icon>
            </ion-card-content>
          </ion-card>

        </section>

      </ng-container>

      <ng-container *ngIf="!isConnected || !serverConnected">

        <app-refresh-info
          (onRefresh)="ngOnInit()"
          removeItem="noClean">
        </app-refresh-info>

        <section class="offline-card">
          <div class="offline-icon">
            <ion-icon name="cloud-offline-outline"></ion-icon>
          </div>

          <h3>Reportes no disponibles</h3>

          <p>
            En esta vista encontrará información de reportes.
          </p>

          <p *ngIf="!isConnected">
            Se podrá visualizar cuando tenga conexión a internet.
          </p>

          <p *ngIf="!serverConnected">
            Se podrá visualizar cuando tenga conexión al servidor.
          </p>
        </section>

        <section class="offline-image-card">
          <div class="logo-card">
            <img
              class="logo-reportes"
              src="../../../assets/images/ISOLOGO.png"
              alt="AQHora">
          </div>

          <ion-label mode="md">
            <h1><b>Reloj Virtual</b></h1>
          </ion-label>

          <img
            class="offline-img"
            src="../../../assets/images/lost_timee.svg"
            alt="Sin conexión" />
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
    /* =========================
       VARIABLES
    ========================= */

    :host {
      --app-primary: #0f75bc;
      --app-primary-dark: #0b4f86;
      --app-primary-light: #e8f4fd;

      --app-bg: #f4f7fb;
      --app-card: #ffffff;
      --app-text: #1f2937;
      --app-text-soft: #64748b;
      --app-border: rgba(15, 23, 42, 0.09);
      --app-shadow: 0 6px 18px rgba(15, 23, 42, 0.10);
    }

    /* =========================
       CONTENIDO
    ========================= */

    .reportes-content {
      --background: var(--app-bg);
      text-align: center;
    }

    /* =========================
       TÍTULO
    ========================= */

    .titulo-contenedor {
      margin: 18px 14px 10px 14px;
      padding: 22px 16px;
      border-radius: 22px;
      background: linear-gradient(135deg, var(--app-primary), var(--app-primary-dark));
      color: #ffffff;
      box-shadow: 0 7px 18px rgba(15, 117, 188, 0.24);
      text-align: center;
    }

    .titulo-icono {
      width: 58px;
      height: 58px;
      margin: 0 auto 12px auto;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.16);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .titulo-icono ion-icon {
      font-size: 32px;
      color: #ffffff;
    }

    .titulo-contenedor h3 {
      margin: 0;
      font-size: 21px;
      font-weight: 900;
      color: #ffffff;
    }

    .titulo-contenedor p {
      margin: 8px 0 0 0;
      font-size: 13px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.88);
      line-height: 1.35;
    }

    /* =========================
       OPCIONES
    ========================= */

    .opciones-contenedor {
      padding: 8px 14px 18px 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .opcion-card {
      margin: 0;
      border-radius: 20px;
      background: var(--app-card);
      color: var(--app-text);
      box-shadow: var(--app-shadow);
      border: 1px solid var(--app-border);
      overflow: hidden;
    }

    .opcion-card::part(native) {
      border-radius: 20px;
    }

    .opcion-card ion-card-content {
      padding: 16px 14px;
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .opcion-icono {
      width: 56px;
      height: 56px;
      min-width: 56px;
      border-radius: 18px;
      background: linear-gradient(135deg, var(--app-primary), var(--app-primary-dark));
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 7px 16px rgba(15, 117, 188, 0.28);
    }

    .opcion-icono ion-icon {
      font-size: 30px;
    }

    .opcion-texto {
      flex: 1;
      min-width: 0;
      text-align: left;
    }

    .opcion-texto h2 {
      margin: 0 0 5px 0;
      color: var(--app-text);
      font-size: 16px;
      font-weight: 900;
    }

    .opcion-texto p {
      margin: 0;
      color: var(--app-text-soft);
      font-size: 12px;
      font-weight: 600;
      line-height: 1.35;
    }

    .opcion-flecha {
      font-size: 24px;
      color: var(--app-primary);
      opacity: 0.85;
    }

    .opcion-card:active {
      transform: scale(0.985);
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

    .logo-card {
      width: fit-content;
      max-width: 78%;
      margin: 0 auto;
      padding: 8px 22px;
      border-radius: 18px;
      background: #ffffff;
      border: 1px solid rgba(15, 23, 42, 0.08);
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
    }

    .logo-reportes {
      display: block;
      width: 145px;
      max-width: 100%;
      height: auto;
      object-fit: contain;
    }

    .offline-image-card h1 {
      margin: 7px 0 12px 0;
      font-size: 13px;
      color: var(--app-text-soft);
      font-weight: 900;
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
        --app-text: #f8fafc;
        --app-text-soft: #cbd5e1;
        --app-border: rgba(255, 255, 255, 0.08);
        --app-shadow: 0 6px 18px rgba(0, 0, 0, 0.38);
        --app-primary-light: rgba(14, 165, 233, 0.16);
      }

      .titulo-contenedor {
        box-shadow: 0 7px 18px rgba(0, 0, 0, 0.30);
      }

      .opcion-icono {
        box-shadow: 0 7px 16px rgba(56, 189, 248, 0.18);
      }

      .logo-card {
        background: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.18);
        box-shadow:
          0 8px 18px rgba(0, 0, 0, 0.35),
          0 0 0 1px rgba(56, 189, 248, 0.08);
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
      .titulo-contenedor {
        margin: 14px 10px 8px 10px;
        padding: 20px 14px;
        border-radius: 20px;
      }

      .titulo-contenedor h3 {
        font-size: 19px;
      }

      .opciones-contenedor {
        padding: 8px 10px 16px 10px;
      }

      .opcion-card ion-card-content {
        padding: 14px 12px;
        gap: 12px;
      }

      .opcion-icono {
        width: 50px;
        height: 50px;
        min-width: 50px;
        border-radius: 16px;
      }

      .opcion-icono ion-icon {
        font-size: 27px;
      }

      .opcion-texto h2 {
        font-size: 15px;
      }

      .opcion-texto p {
        font-size: 11.5px;
      }

      .offline-card,
      .offline-image-card,
      .offline-message {
        margin-left: 10px;
        margin-right: 10px;
      }

      .logo-card {
        padding: 7px 18px;
        border-radius: 16px;
      }

      .logo-reportes {
        width: 135px;
      }

      .offline-img {
        width: 78%;
      }
    }
  `],
})
export class ReportesPage implements OnInit {
  serverConnected: boolean = true;
  deshabilitado: boolean = true;
  isConnected: boolean;

  constructor(
    public platform: Platform,
    private router: Router,
    public toastController: ToastController,
    private networkService: NetworkService,
    private connectivityService: ConnectivityService
  ) { }

  async ngOnInit() {
    this.networkSubscriber();
    this.serverConnected = await this.connectivityService.checkServerConnection();
  }

  async ionViewWillEnter() {
    this.networkSubscriber();
    this.serverConnected = await this.connectivityService.checkServerConnection();
  }

  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
    console.log('Esta conectado: ', this.isConnected);
  }
}