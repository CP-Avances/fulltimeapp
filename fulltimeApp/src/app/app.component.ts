import { Component } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { AlertController, ToastController  } from '@ionic/angular';
import { Platform } from '@ionic/angular';

import { NetworkService } from './libs/network.service';
import { DataLocalService } from './libs/data-local.service';

import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';

import { RelojServiceService } from './services/reloj-service.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  showSplash = true;
  splash = true;
  id_celular: any;

  constructor(
    public alertController: AlertController,
    private toastController: ToastController,
    private networkService: NetworkService,
    private dataLocalService: DataLocalService,
    private relojService: RelojServiceService,
    private platform: Platform
  ) {
    this.initializeApp();
    this.networkSubscriber();
  }
  
  async initializeApp(){

    if((!this.platform.is("mobileweb")) && (this.platform.is('mobile'))){
      await StatusBar.hide();
    }
   

    await SplashScreen.show({
      showDuration: 2000,
      autoHide: true,
    });
    setTimeout(() => this.splash = false, 2000);
  }
  
  private networkSubscriber(): void{
    this.networkService
    .getNetworkStatus()
    .pipe(debounceTime(300))
    .subscribe((connected: boolean) => {
      console.log('[app] is Connected ',connected);
      if(connected){
        this.enviarTimbresByConnected();
      }
    });

  }

  private enviarTimbresByConnected(): void {
    const timbres = [...this.dataLocalService.timbresStorage]
    if (timbres.length > 0) {
      timbres.forEach(t => {
        t.fec_hora_timbre_servidor = null;
        this.relojService.enviarTimbreSinConexion(t).subscribe(
          res => { 
            setTimeout(() => {
              this.presentAlert();
            }, 1000);
          },
          err => {
            this.dataLocalService.guardarTimbresPerdidos(t);
          }
        );
      })
      this.dataLocalService.eliminarInfo('timbres');

    }
  }

  private async presentAlert() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Mensaje',
      message: 'Los timbres guardados se han enviado automaticamente.',
      mode: 'ios',
      buttons: ['OK']
    });
    await alert.present();
  }

  //Pestalas de mensajes
  async mostrarToas(mensaje: string) {
    const toast = await this.toastController.create({
      message: `<ion-icon name="information-circle-outline"></ion-icon>`+mensaje+"\n\n",
      duration: 4500,
      position: "top",
      color: "notificacicon",
      mode: "ios",
      cssClass: 'toast-custom-class',
    });
    await toast.present();
  }

  
}
