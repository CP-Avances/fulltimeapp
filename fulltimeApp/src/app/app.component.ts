import { Component, OnDestroy, OnInit } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AlertController, ToastController } from '@ionic/angular';

import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';

import { NetworkService } from './libs/network.service';
import { DataLocalService } from './libs/data-local.service';
import { RelojServiceService } from './services/reloj-service.service';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {

  showSplash = true;
  splash = true;
  id_celular: any;

  private networkSubscription?: Subscription;
  private appStateListener?: PluginListenerHandle;

  constructor(
    public alertController: AlertController,
    private toastController: ToastController,
    private networkService: NetworkService,
    private dataLocalService: DataLocalService,
    private relojService: RelojServiceService,
    private socketService: SocketService,
  ) {
    this.initializeApp();
  }

  ngOnInit(): void {
    this.conectarSocketEmpresa();
    this.networkSubscriber();
    this.escucharEstadoApp();
  }

  ngOnDestroy(): void {
    this.networkSubscription?.unsubscribe();

    if (this.appStateListener) {
      this.appStateListener.remove();
    }
  }

  async initializeApp() {
    await SplashScreen.show({
      showDuration: 2000,
      autoHide: true,
    });

    setTimeout(() => {
      this.splash = false;
    }, 2000);
  }

  // METODO PARA CONECTAR SOCKET SEGUN LA EMPRESA
  private conectarSocketEmpresa(): void {
    const codigoEmpresa = localStorage.getItem('codigo_empresa');

    if (!codigoEmpresa) {
      console.log('[socket] No existe codigo_empresa todavía.');
      return;
    }

    console.log('[socket] Conectando socket empresa:', codigoEmpresa);
    this.socketService.conectar(codigoEmpresa);
  }

  // METODO PARA ESCUCHAR CAMBIOS DE CONEXION
  private networkSubscriber(): void {
    this.networkSubscription = this.networkService
      .getNetworkStatus()
      .pipe(debounceTime(300))
      .subscribe((connected: boolean) => {
        console.log('[app] is Connected ', connected);

        if (connected) {
          this.conectarSocketEmpresa();
          this.enviarTimbresByConnected();
        }
      });
  }

  // METODO PARA RECONECTAR SOCKET CUANDO LA APP VUELVE A PRIMER PLANO
  private async escucharEstadoApp(): Promise<void> {
    this.appStateListener = await App.addListener('appStateChange', ({ isActive }) => {
      console.log('[app] estado activo:', isActive);

      if (isActive) {
        this.conectarSocketEmpresa();

        const connected = this.networkService.getNetworkStatusDispositivo();

        if (connected) {
          this.enviarTimbresByConnected();
        }
      }
    });
  }

  // METODO PARA ENVIAR TIMBRES GUARDADOS CUANDO VUELVE LA CONEXION
  private enviarTimbresByConnected(): void {
    const timbres = [...this.dataLocalService.timbresStorage];

    if (timbres.length === 0) return;

    let procesados = 0;

    timbres.forEach((t) => {
      t.fecha_hora_timbre_servidor = t.fecha_hora_timbre;

      this.relojService.enviarTimbre(t).subscribe({
        next: () => {
          procesados++;

          if (procesados === timbres.length) {
            this.dataLocalService.eliminarInfo('timbres');

            setTimeout(() => {
              this.presentAlert();
            }, 1000);
          }
        },
        error: () => {
          procesados++;

          this.dataLocalService.guardarTimbresPerdidos(t);

          if (procesados === timbres.length) {
            this.dataLocalService.eliminarInfo('timbres');

            setTimeout(() => {
              this.presentAlert();
            }, 1000);
          }
        }
      });
    });
  }

  private async presentAlert() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Mensaje',
      message: 'Los timbres guardados se han enviado automáticamente.',
      mode: 'ios',
      buttons: ['OK']
    });

    await alert.present();
  }

  // PESTAÑAS DE MENSAJES
  async mostrarToas(mensaje: string) {
    const toast = await this.toastController.create({
      message: `<ion-icon name="information-circle-outline"></ion-icon>` + mensaje + '\n\n',
      duration: 4500,
      position: 'top',
      color: 'notificacicon',
      mode: 'ios',
      cssClass: 'toast-custom-class',
    });

    await toast.present();
  }
}