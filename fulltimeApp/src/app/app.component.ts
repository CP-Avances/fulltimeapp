import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AlertController, ToastController } from '@ionic/angular';

import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';
import { TimbresPendientesSyncService } from './services/timbres-pendientes-sync.service';
import { NetworkService } from './libs/network.service';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {

  showSplash = true;
  splash = true;
  id_celular: any;
  private sincronizandoPendientes = false;

  private networkSubscription?: Subscription;
  private appStateListener?: PluginListenerHandle;

  constructor(
    public alertController: AlertController,
    private toastController: ToastController,
    private networkService: NetworkService,
    private socketService: SocketService,
    private timbresPendientesSync: TimbresPendientesSyncService,
  ) {
  }

  async ngAfterViewInit() {
    requestAnimationFrame(async () => {
      await SplashScreen.hide();
    });

    setTimeout(() => {
      this.splash = false;
    }, 2000);
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
  private async enviarTimbresByConnected(): Promise<void> {
    if (this.sincronizandoPendientes) {
      return;
    }

    const idEmpleado = parseInt(localStorage.getItem('empleadoID') ?? '0', 10);

    if (!idEmpleado || idEmpleado <= 0) {
      return;
    }

    this.sincronizandoPendientes = true;

    try {
      const resultado = await this.timbresPendientesSync.sincronizarPendientes(idEmpleado);

      if (resultado.sesionRevocada) {
        return;
      }

      if (!resultado.huboPendientes) {
        return;
      }

      if (resultado.enviados > 0 && resultado.fallidos === 0) {
        await this.mostrarToastSincronizacion(
          resultado.mensaje,
          'success'
        );

        return;
      }

      if (resultado.enviados > 0 && resultado.fallidos > 0) {
        await this.mostrarToastSincronizacion(
          resultado.mensaje,
          'warning'
        );

        return;
      }

      if (resultado.enviados === 0 && resultado.fallidos > 0) {
        await this.mostrarToastSincronizacion(
          resultado.mensaje,
          'warning'
        );
      }

    } catch (error: any) {
      if (
        error?.status === 401 &&
        error?.error?.code === 'dispositivo_revocado'
      ) {
        return;
      }

      console.error(
        '[app] Error sincronizando timbres pendientes:',
        error
      );

    } finally {
      this.sincronizandoPendientes = false;
    }
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

  private async mostrarToastSincronizacion(
    mensaje: string,
    color: string
  ): Promise<void> {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3500,
      color,
      position: 'middle',
      mode: 'ios'
    });

    await toast.present();
  }
}