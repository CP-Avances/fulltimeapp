import { Component } from '@angular/core';
import { NetworkService } from './libs/network.service';

import { Platform, AlertController, ToastController  } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';




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
    private platform: Platform,
    public alertController: AlertController,
    private toastController: ToastController,
    private networkService: NetworkService,
  ) {
    this.initializeApp();
    this.networkSubscriber();
  }
  
  async initializeApp(){
    await SplashScreen.show({
      showDuration: 2000,
      autoHide: true,
    });
    setTimeout(() => this.splash = false, 2000);
  }
  
  private networkSubscriber(): void{
    this.networkService
    .getNetworkStatus()
    .then((connected: boolean) => {
      console.log('[app] is Connected ',connected);
    });

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
