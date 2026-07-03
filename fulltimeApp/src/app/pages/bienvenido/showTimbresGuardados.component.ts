import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { RelojServiceService } from '../../services/reloj-service.service';
import { timeout } from 'rxjs/operators';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { TimbresPendientesSyncService } from 'src/app/services/timbres-pendientes-sync.service';

@Component({
  template: `
  <app-close-modal titleModal="Timbres no enviados"></app-close-modal>

  <ion-content class="timbres-perdidos-content">

    <section class="info-card">
      <div class="info-icon">
        <ion-icon name="cloud-offline-outline"></ion-icon>
      </div>

      <h2>Timbres pendientes</h2>

      <p>
        En esta lista encontrará los timbres que no se enviaron debido a un problema con la conexión al servidor.
      </p>

      <p class="info-secundaria">
        Cuando recupere conexión, podrá enviarlos nuevamente desde esta pantalla.
      </p>
    </section>

    <section class="contador-card" *ngIf="timbres.length > 0">
      <div>
        <span>Total pendiente</span>
        <strong>{{ timbres.length }}</strong>
      </div>

      <ion-icon name="time-outline"></ion-icon>
    </section>

    <ion-list class="lista-timbres" *ngIf="timbres.length > 0">
      <ion-item class="timbre-card" *ngFor="let t of timbres" lines="none">

        <div class="timbre-icono">
          <ion-icon name="calendar-outline"></ion-icon>
        </div>

        <ion-label>
          <h2>{{ t.fecha_hora_timbre || t.fec_hora_timbre }}</h2>

          <p
            class="coordenadas"
            *ngIf="t.latitud !== null && t.latitud !== '0' && t.latitud !== undefined && t.longitud !== null && t.longitud !== '0' && t.longitud !== ''">
            <ion-icon name="location-outline"></ion-icon>
            {{ t.latitud }} / {{ t.longitud }}
          </p>

          <p
            class="sin-coordenadas"
            *ngIf="t.longitud == null || t.longitud == '0' || t.longitud == ''">
            <ion-icon name="location-outline"></ion-icon>
            Sin coordenadas
          </p>
        </ion-label>

      </ion-item>
    </ion-list>

    <section class="estado-vacio" *ngIf="timbres.length == 0">
      <div class="logo-box">
        <div class="logo-card">
          <img
            class="logo-timbres"
            src="../../../assets/images/ISOLOGO.png"
            alt="AQHora">
        </div>

        <h3>Reloj Virtual</h3>
      </div>

      <img class="imagen-vacia" src="../../../assets/images/lost_timee.svg" />

      <h2>No tiene timbres almacenados</h2>
      <p>No existen timbres pendientes por enviar.</p>
    </section>

    <section class="envio-card" [hidden]="btn_Enviar">

      <div class="estado-servidor">
        <ion-icon name="checkmark-circle-outline"></ion-icon>

        <div>
          <h3>Conectado con el servidor</h3>
          <p>Puede enviar los timbres pendientes.</p>
        </div>
      </div>

      <ion-button
        color="secondary"
        shape="round"
        expand="block"
        class="btn-enviar"
        [disabled]="loadingBtn"
        (click)="Btn_enviar()">

        <ng-container *ngIf="!loadingBtn; then sendReg; else spiner"></ng-container>

        <ng-template #sendReg>
          <ion-icon slot="start" name="send-outline"></ion-icon>
          Enviar timbres
        </ng-template>

        <ng-template #spiner>
          <ion-spinner name="circles"></ion-spinner>
        </ng-template>

      </ion-button>

    </section>

  </ion-content>
`,
  styles: [`
  :host {
    --app-primary: #0f75bc;
    --app-primary-dark: #0b5a92;
    --app-primary-light: #e8f4fd;

    --app-success: #22c55e;
    --app-success-light: rgba(34, 197, 94, 0.14);

    --app-bg: #f4f7fb;
    --app-card: #ffffff;
    --app-input: #f8fafc;
    --app-text: #1f2937;
    --app-text-soft: #64748b;
    --app-border: rgba(15, 23, 42, 0.09);
    --app-shadow: 0 6px 18px rgba(15, 23, 42, 0.10);
  }

  .timbres-perdidos-content {
    --background: var(--app-bg);
  }

  .info-card {
    margin: 14px;
    padding: 20px 16px;
    border-radius: 22px;
    background: var(--app-card);
    color: var(--app-text);
    border: 1px solid var(--app-border);
    box-shadow: var(--app-shadow);
    text-align: center;
  }

  .info-icon {
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

  .info-icon ion-icon {
    font-size: 33px;
  }

  .info-card h2 {
    margin: 0 0 10px 0;
    color: var(--app-text);
    font-size: 19px;
    font-weight: 900;
  }

  .info-card p {
    margin: 0;
    color: var(--app-text-soft);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.45;
  }

  .info-card .info-secundaria {
    margin-top: 8px;
  }

  .contador-card {
    margin: 0 14px 14px 14px;
    padding: 14px 16px;
    border-radius: 18px;
    background: linear-gradient(135deg, var(--app-primary), var(--app-primary-dark));
    color: #ffffff;
    box-shadow: 0 6px 18px rgba(15, 117, 188, 0.25);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .contador-card span {
    display: block;
    font-size: 12px;
    font-weight: 700;
    opacity: 0.9;
  }

  .contador-card strong {
    display: block;
    margin-top: 3px;
    font-size: 24px;
    font-weight: 900;
  }

  .contador-card ion-icon {
    font-size: 34px;
    opacity: 0.95;
  }

  .lista-timbres {
    background: transparent;
    padding: 0 14px 10px 14px;
  }

  .timbre-card {
    --background: var(--app-card);
    --color: var(--app-text);
    --border-radius: 18px;
    --padding-start: 12px;
    --inner-padding-end: 12px;
    --min-height: 72px;
    margin-bottom: 10px;
    border-radius: 18px;
    border: 1px solid var(--app-border);
    box-shadow: var(--app-shadow);
  }

  .timbre-icono {
    width: 42px;
    height: 42px;
    min-width: 42px;
    margin-right: 12px;
    border-radius: 14px;
    background: var(--app-primary-light);
    color: var(--app-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .timbre-icono ion-icon {
    font-size: 23px;
  }

  .timbre-card ion-label h2 {
    margin: 0 0 6px 0;
    color: var(--app-text);
    font-size: 14px;
    font-weight: 900;
    line-height: 1.25;
  }

  .timbre-card ion-label p {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.25;
  }

  .coordenadas {
    color: var(--app-primary);
  }

  .sin-coordenadas {
    color: var(--app-text-soft);
  }

  .coordenadas ion-icon,
  .sin-coordenadas ion-icon {
    font-size: 15px;
  }

  .estado-vacio {
    margin: 16px 14px;
    padding: 22px 16px;
    border-radius: 22px;
    background: var(--app-card);
    color: var(--app-text);
    border: 1px solid var(--app-border);
    box-shadow: var(--app-shadow);
    text-align: center;
  }

  .logo-box {
    margin-bottom: 12px;
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

  .logo-timbres {
    display: block;
    width: 145px;
    max-width: 100%;
    height: auto;
    object-fit: contain;
  }

  .logo-box h3 {
    margin: 7px 0 0 0;
    color: var(--app-text-soft);
    font-size: 13px;
    font-weight: 800;
  }

  .imagen-vacia {
    width: 72%;
    max-width: 260px;
    display: block;
    margin: 12px auto 18px auto;
  }

  .estado-vacio h2 {
    margin: 0 0 8px 0;
    color: var(--app-text);
    font-size: 18px;
    font-weight: 900;
  }

  .estado-vacio p {
    margin: 0;
    color: var(--app-text-soft);
    font-size: 13px;
    font-weight: 600;
  }

  .envio-card {
    margin: 10px 14px 18px 14px;
    padding: 16px;
    border-radius: 22px;
    background: var(--app-card);
    color: var(--app-text);
    border: 1px solid var(--app-border);
    box-shadow: var(--app-shadow);
  }

  .estado-servidor {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
    padding: 12px;
    border-radius: 16px;
    background: var(--app-success-light);
    text-align: left;
  }

  .estado-servidor ion-icon {
    font-size: 31px;
    color: var(--app-success);
  }

  .estado-servidor h3 {
    margin: 0;
    color: var(--app-text);
    font-size: 14px;
    font-weight: 900;
  }

  .estado-servidor p {
    margin: 4px 0 0 0;
    color: var(--app-text-soft);
    font-size: 12px;
    font-weight: 600;
  }

  .btn-enviar {
    --border-radius: 16px;
    min-height: 46px;
    margin: 0;
    font-size: 14px;
    font-weight: 900;
    text-transform: none;
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --app-bg: #0f172a;
      --app-card: #1e293b;
      --app-input: #111827;
      --app-text: #f8fafc;
      --app-text-soft: #cbd5e1;
      --app-border: rgba(255, 255, 255, 0.08);
      --app-shadow: 0 6px 18px rgba(0, 0, 0, 0.38);
      --app-primary-light: rgba(14, 165, 233, 0.16);
      --app-success-light: rgba(34, 197, 94, 0.14);
    }

    .logo-card {
      background: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.18);
      box-shadow:
        0 8px 18px rgba(0, 0, 0, 0.35),
        0 0 0 1px rgba(56, 189, 248, 0.08);
    }
  }

  @media (max-width: 380px) {
    .info-card,
    .contador-card,
    .estado-vacio,
    .envio-card {
      margin-left: 10px;
      margin-right: 10px;
      border-radius: 20px;
    }

    .lista-timbres {
      padding-left: 10px;
      padding-right: 10px;
    }

    .info-card h2,
    .estado-vacio h2 {
      font-size: 17px;
    }

    .imagen-vacia {
      width: 78%;
    }

    .logo-card {
      padding: 7px 18px;
      border-radius: 16px;
    }

    .logo-timbres {
      width: 130px;
    }
  }
`],
})
export class TimbresPerdidosComponent implements OnInit {

  ips_locales: any = '';

  loadingBtn = false;
  btn_Enviar = true;
  mensage = '';

  iduser: number = 0;

  public get timbres(): any[] {
    return this.timbresPendientesSync.obtenerTimbresPendientes();
  }

  constructor(
    public modalController: ModalController,
    public alertController: AlertController,
    private toastController: ToastController,
    private relojService: RelojServiceService,
    public validar: ValidacionesService,
    private timbresPendientesSync: TimbresPendientesSyncService,
  ) { }

  ngOnInit() {
    this.iduser = parseInt(localStorage.getItem('empleadoID') ?? '0', 10);

    this.ComprobarConexionServidor();

    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
  }

  // ============================================================
  // CONEXIÓN
  // ============================================================

  ComprobarConexionServidor(): void {
    const timbres = this.timbresPendientesSync.obtenerTimbresPendientes();

    if (timbres.length === 0) {
      this.btn_Enviar = true;
      return;
    }

    this.relojService.obtenerUsuario(this.iduser)
      .pipe(timeout(3000))
      .subscribe({
        next: () => {
          this.btn_Enviar = false;
        },
        error: () => {
          this.mensage = `
            <div class="card-alert">
              <img src="../../../assets/images/LOGOBLFT.png" class="img-alert">
              <br>
              <p>Ups! Falló la conexión con el servidor, no se podrán enviar los timbres.</p>
              <p>Por favor inténtelo más tarde.</p>
            </div>
          `;

          this.presentAlert(this.mensage);
          this.btn_Enviar = true;
        }
      });
  }

  // ============================================================
  // ENVÍO MANUAL
  // ============================================================

  async Btn_enviar() {
    const timbres = this.timbresPendientesSync.obtenerTimbresPendientes();

    if (timbres.length === 0) {
      this.btn_Enviar = true;
      await this.presentAlert('No existen timbres pendientes por enviar.');
      return;
    }

    if (!this.iduser || this.iduser <= 0) {
      await this.presentAlert('No se pudo identificar al empleado. Inicie sesión nuevamente.');
      return;
    }

    this.loadingBtn = true;

    try {
      const resultado = await this.timbresPendientesSync.sincronizarPendientes(this.iduser);

      this.mensage = resultado.mensaje;

      if (resultado.enviados > 0 && resultado.fallidos === 0) {
        this.btn_Enviar = true;
        this.closeModal();
        await this.presentAlert(this.mensage);
        return;
      }

      if (resultado.enviados > 0 && resultado.fallidos > 0) {
        this.btn_Enviar = false;
        await this.presentAlert(this.mensage);
        return;
      }

      if (resultado.enviados === 0 && resultado.fallidos > 0) {
        this.btn_Enviar = false;
        await this.presentAlert(this.mensage);
        return;
      }

      this.btn_Enviar = true;
      await this.presentAlert(this.mensage);

    } catch {
      this.mensage = `
        <div class="card-alert">
          <img src="../../../assets/images/LOGOBLFT.png" class="img-alert">
          <br>
          <p>Ups!!! Falló la conexión con el servidor, no se pudieron enviar los timbres.</p>
          <p>Por favor inténtelo más tarde.</p>
        </div>
      `;

      await this.presentAlert(this.mensage);
      this.btn_Enviar = false;

    } finally {
      this.loadingBtn = false;
    }
  }

  // ============================================================
  // UI
  // ============================================================

  async presentAlert(mensaje: string) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      message: mensaje,
      mode: 'ios',
      buttons: ['OK']
    });

    await alert.present();
  }

  async abrirToas(mensaje: string, color: string, duracion: number, position: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color,
      mode: 'ios',
      position
    });

    await toast.present();
  }

  closeModal() {
    this.modalController.dismiss({
      refreshInfo: true
    });
  }
}