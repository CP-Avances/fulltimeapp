import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.casapazmino.aqhora',
  appName: 'AQHora',
  webDir: 'www',
  server: {
    cleartext: false,
    androidScheme: 'http',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      style: KeyboardStyle.Default,
      resizeOnFullScreen: true,
    },
    LocalNotifications: {
      smallIcon: 'ic_launcher',
      iconColor: '#488AFF',
      sound: 'beep.wav',
    },
    assets: {
      iconPath: 'resources/icon.png',
      splashPath: 'resources/splash.png',
    },
  },
};

export default config;