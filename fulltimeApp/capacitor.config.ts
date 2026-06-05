import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.casapazmino.aqhora',
  appName: 'AQHora',
  webDir: 'www',
  server: {
    cleartext: false,
    androidScheme: 'https',
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
    assets: {
      iconPath: 'resources/icon.png',
      splashPath: 'resources/splash.png',
    },
  },
};

export default config;