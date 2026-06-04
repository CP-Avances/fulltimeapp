import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { DataLocalService } from '../../libs/data-local.service';
import { Timbre } from '../../interfaces/Timbre';
import { RelojServiceService } from '../../services/reloj-service.service';
import { Router } from '@angular/router';
import { ParametrosService } from 'src/app/services/parametros.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { timeout } from 'rxjs/operators';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { ParametrosSistema } from 'src/app/libs/parametros.emun';
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
          <h2>{{ t.fecha_hora_timbre }}</h2>

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
        <img src="../../../assets/images/ISOLOGO.png">
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
  }

  .logo-box img {
    width: 42%;
    max-width: 150px;
    min-width: 110px;
  }

  .logo-box h3 {
    margin: 6px 0 0 0;
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
  }
`],

})
export class TimbresPerdidosComponent implements OnInit {
  ips_locales: any = '';

  // METODO PARA LEER LOS timbresPerdidosStorage
  public get timbres(): Timbre[] {
    return [
      ...this.dataLocalService.timbresPerdidosStorage,
      ...this.dataLocalService.timbresStorage
    ];
  }


  loadingBtn: boolean = false;
  btn_Enviar: boolean = true;
  mensage: string = '';
  iduser: any;
  valor: any;
  ubicacion: string = '';
  latitud: any;
  longitud: any;


  constructor(
    public modalController: ModalController,
    private dataLocalService: DataLocalService,
    private relojService: RelojServiceService,
    public alertController: AlertController,
    private toastController: ToastController,
    private restP: ParametrosService,
    private restE: EmpleadosService,
    private router: Router,
    public validar: ValidacionesService,
  ) { }

  ngOnInit() {
    this.iduser = parseInt(localStorage.getItem('empleadoID'))
    this.ComprobarConexionServidor();
    this.BuscarParametroTimbreUbicacionDesconocida();
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
  }

  BuscarParametroTimbreUbicacionDesconocida() {
    const empleadoID = parseInt(localStorage.getItem("empleadoID") ?? "0", 10);

    const buscar = {
      ids_empleados: [empleadoID],
    };

    this.restP.ObtenerDetalleParametroUsuario(buscar)
      .pipe(timeout(3000))
      .subscribe(
        {
          next: res => {

            const parametro = res.data?.[0];

            if (!parametro) {
              localStorage.setItem('timbrarUbicacionDesconocida', 'No');
              return;
            }

            const timbreUbicacionDesconocida = parametro.timbre_ubicacion_desconocida;

            const resultado = timbreUbicacionDesconocida ? 'Si' : 'No';
            localStorage.setItem('timbrarUbicacionDesconocida', resultado);
          },
          error: () => {
            localStorage.setItem('timbrarUbicacionDesconocida', 'No');
          }
        }
      );
  }


  ComprobarConexionServidor(): void {
    const timbres = [...this.dataLocalService.timbresPerdidosStorage];

    if (timbres.length === 0) {
      this.btn_Enviar = true;
      return;
    }

    this.relojService.obtenerUsuario(this.iduser)
      .pipe(timeout(3000))
      .subscribe({
        next: () => {

          this.BuscarParametro();

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


  rango: any;
  //PARAMETROS
  // METODO QUE VALIDA LA TOLERANCIA DE LA UBICACION
  BuscarParametro() {
    this.rango = 0.00;
    this.restP.ObtenerDetallesParametros(ParametrosSistema.TOLERANCIA_UBICACION).pipe(timeout(3000)).subscribe(
      {
        next: res => {
          res.forEach(p => {
            this.rango = Number(p.descripcion);
          });
        }
      }
    );
  }

  contar: number = 0;
  sin_ubicacion: number = 0;
  // MÉTODO QUE VERIFICAR SI EL TIMBRE FUE REALIZADO EN UN PERíMETRO DEFINIDO
  CompararCoordenadas(informacion: any, timbre: any, descripcion: any, data: any) {
    this.restP.ObtenerCoordenadas(informacion).pipe(timeout(3000)).subscribe(
      {
        next: res => {
          if (res.data[0].verificar === 'ok') {
            this.contar = this.contar + 1;
            this.ubicacion = descripcion;
            if (this.contar === 1) {
              timbre.ubicacion = this.ubicacion;
              this.abrirToas('Timbre realizado dentro del perímetro definido como ' + this.ubicacion + '.', "primary", 3000, "top");
              this.EnviarTimbres(this.latitud, this.longitud, timbre);
            }
          }
          else {
            this.sin_ubicacion = this.sin_ubicacion + 1;
            if (this.sin_ubicacion === data.length) {
              this.ValidarDomicilio(informacion, timbre);
            }
          }
        },
        error: () => {
          this.dataLocalService.guardarTimbresPerdidos(timbre);
        }
      }
    );
  }

  id_usuario: any = parseInt(localStorage.getItem('empleadoID'));
  // MÉTODO QUE PERMITE VALIDACIONES DE UBICACIÓN
  BuscarUbicacion(latitud: any, longitud: any, rango: any, timbre: any) {
    var datosUbicacion: any = [];
    this.contar = 0;
    let informacion = {
      lat1: String(latitud),
      lng1: String(longitud),
      lat2: '',
      lng2: '',
      valor: rango
    }

    //Usa el servicio de buscar coordenadas del usuario
    this.restP.ObtenerUbicacionUsuario(this.id_usuario).pipe(timeout(3000)).subscribe(
      {
        next: res => {
          if (res.length != 0) {
            datosUbicacion = res.data;
            datosUbicacion.forEach((obj: any) => {
              informacion.lat2 = obj.latitud;
              informacion.lng2 = obj.longitud;
              this.CompararCoordenadas(informacion, timbre, obj.descripcion, datosUbicacion);
            })
          }
          else {
            this.ValidarDomicilio(informacion, timbre);
          }
        }, error: () => {
          if (localStorage.getItem('timbrarUbicacionDesconocida') === 'Si') {
            timbre.ubicacion = 'DESCONOCIDO';
            this.EnviarTimbres(latitud, longitud, timbre);
          } else {
            this.abrirToas('Timbre con ubicación Desconocida. No Permitido', "danger", 5000, "bottom");
            return this.router.navigate(['/login']);
          }
        }
      }
    );
  }

  // METODO PARA VALIDAR LAS COORDENADAD DEL DOMICILIO QUE ESTEN REGISTRADAS EN LA TABLA EMPLEADOS
  ValidarDomicilio(informacion: any, timbre: any) {
    this.restE.ObtenerUbicacion(this.id_usuario).subscribe(res => {
      if (res.data[0].longitud != null || res.data[0].latitud != null) {
        informacion.lat2 = res[0].latitud;
        informacion.lng2 = res[0].longitud;
        this.restP.ObtenerCoordenadas(informacion).subscribe(resu => {
          if (resu.data[0].verificar === 'ok') {
            timbre.ubicacion = "DOMICILIO";
            this.EnviarTimbres(this.latitud, this.longitud, timbre);
          }
          else {
            timbre.ubicacion = "DESCONOCIDO";
            this.EnviarTimbres(this.latitud, this.longitud, timbre);
          }
        })
      }
      else {
        timbre.ubicacion = "DESCONOCIDO";
        this.EnviarTimbres(this.latitud, this.longitud, timbre);
      }
    })
  }

  // METODO PARA ENVIAR EL TIMBRE ALMACENADO EN STORAGE
  Btn_enviar() {
    const timbres = [...this.dataLocalService.timbresPerdidosStorage];
    if (timbres.length > 0) {
      //obtener datos de usuario para ver si no hay problemas con el servidor
      this.relojService.obtenerUsuario(this.iduser).pipe(timeout(3000)).subscribe(
        {
          next: () => {
            timbres.forEach(t => {
              this.longitud = t.longitud;
              this.latitud = t.latitud;
              this.BuscarUbicacion(this.latitud, this.longitud, this.rango, t);
            });

            this.closeModal();
            setTimeout(() => {
              this.dataLocalService.eliminarInfo('timbresPerdidos');
              if (timbres.length > 1) {
                this.mensage = 'Los ' + timbres.length + ' timbres se han enviado.';
              } else {
                this.mensage = 'El timbre ha sido enviado exitosamente.';
              }
              this.presentAlert(this.mensage);
            }, 1000);

          },
          error: () => {
            this.mensage = `<div class="card-alert">
                            <img src="../../../assets/images/LOGOBLFT.png" class="img-alert">
                            <br>
                            <p> Ups!!! Falló la conexión con el servidor, no se podrán enviar los timbres </p>
                            <p> Por favor intentelo más tarde </p>
                          </div>`;
            this.presentAlert(this.mensage);
            return this.btn_Enviar = true;
          }
        }
      );
    }
  }

  //METODO PARA ENVIAR EL TIMBRE
  EnviarTimbres(latitud: any, longitud: any, timbre: any): void {
    timbre.fecha_hora_timbre_servidor = null;
    timbre.latitud = latitud + "";
    timbre.longitud = longitud + "";
    timbre.novedades_conexion = "Falló conexión al servidor";

    this.relojService.enviarTimbre(timbre).pipe(timeout(3000)).subscribe(
      {
        next: () => { },
        error: () => {
          this.dataLocalService.guardarTimbresPerdidos(timbre);
        }
      }
    );
  }

  // METODO PARA CONFIGURAR LAS ALERTAS
  async presentAlert(mensaje: string) {
    const toast = await this.alertController.create({
      cssClass: 'my-custom-class',
      message: mensaje,
      mode: 'ios',
      buttons: ['OK']
    });
    toast.present();
  }

  // METODO PARA CONFIGURAR LAS ALERTAS
  async abrirToas(mensaje: string, color: string, duracion: number, position: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      mode: 'ios',
      position: position
    });
    toast.present();
  }

  closeModal() {
    this.modalController.dismiss({
      'refreshInfo': true
    });
  }
}
