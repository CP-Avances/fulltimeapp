import { Component } from '@angular/core';

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

  constructor() {
    this.initializeApp();
  }
  

  async initializeApp(){
    await SplashScreen.show({
      showDuration: 2000,
      autoHide: true,
    });
    setTimeout(() => this.splash = false, 2000);
  }
}
