import { Injectable } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { FCM } from '@capacitor-community/fcm';

import {
    PushNotifications,
    Token,
    PushNotificationSchema,
    ActionPerformed
} from '@capacitor/push-notifications';

import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PushNotificationService {

    private listenersRegistrados = false;
    private readonly CANAL_NOTIFICACIONES = 'fulltime_notificaciones_v2';

    constructor(
        private platform: Platform,
        private http: HttpClient,
        private navController: NavController
    ) { }

    async inicializarPushNotifications(): Promise<void> {
        if (!Capacitor.isNativePlatform()) {
            return;
        }

        await this.platform.ready();

        await this.crearCanalAndroid();

        const permiso = await PushNotifications.requestPermissions();

        if (permiso.receive !== 'granted') {
            return;
        }

        if (!this.listenersRegistrados) {
            this.registrarListenersPush();
            this.listenersRegistrados = true;
        }

        await PushNotifications.register();
    }

    private async crearCanalAndroid(): Promise<void> {
        if (Capacitor.getPlatform() !== 'android') {
            return;
        }

        try {
            await PushNotifications.createChannel({
                id: this.CANAL_NOTIFICACIONES,
                name: 'AQHora Notificaciones',
                description: 'Canal principal de notificaciones de AQHora',
                importance: 5,
                visibility: 1,
                sound: 'default',
                vibration: true,
                lights: true,
                lightColor: '#0f75bc'
            });
        } catch (error) {
            console.warn('No se pudo crear el canal de notificaciones Android:', error);
        }
    }

    private registrarListenersPush(): void {
        PushNotifications.addListener('registration', async (token: Token) => {
            try {
                if (Capacitor.getPlatform() === 'ios') {
                    const fcmToken = await FCM.getToken();

                    if (!fcmToken?.token) {
                        console.warn('No se pudo obtener token FCM en iOS.');
                        return;
                    }

                    await this.registrarTokenPushEnBackend(fcmToken.token);
                    return;
                }

                await this.registrarTokenPushEnBackend(token.value);

            } catch (error) {
                console.warn('Error procesando token push:', error);
            }
        });

        PushNotifications.addListener('registrationError', (error: any) => {
            console.warn('Error al registrar push:', error);
        });

        PushNotifications.addListener(
            'pushNotificationReceived',
            (_notification: PushNotificationSchema) => {
                // La notificación se recibió con la app abierta.
            }
        );

        PushNotifications.addListener(
            'pushNotificationActionPerformed',
            async (_notification: ActionPerformed) => {
                await this.navController.navigateRoot('/reloj');
            }
        );
    }

    private async registrarTokenPushEnBackend(tokenPush: string): Promise<void> {
        if (!tokenPush) {
            return;
        }

        const idEmpleado = Number(localStorage.getItem('empleadoID') ?? 0);

        if (!idEmpleado) {
            return;
        }

        const info = await Device.getInfo();
        const id = await Device.getId();

        const datos = {
            id_empleado: idEmpleado,
            id_dispositivo: id.identifier,
            token_push: tokenPush,
            plataforma: info.platform,
            modelo_dispositivo: info.model
        };

        this.http.post(`${environment.urlMultitenant}/push/registrar-token`, datos).subscribe({
            next: () => { },
            error: (error) => {
                console.warn('Error al registrar token push:', error);
            }
        });
    }
}