import { Injectable } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

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

    private listenersRegistrados: boolean = false;

    constructor(
        private platform: Platform,
        private http: HttpClient,
        private navController: NavController
    ) { }

    async inicializarPushNotifications(): Promise<void> {
        if (!Capacitor.isNativePlatform()) {
            console.log('Push Notifications solo se inicializa en app nativa.');
            return;
        }

        await this.platform.ready();

        await this.crearCanalAndroid();

        const permiso = await PushNotifications.requestPermissions();

        if (permiso.receive !== 'granted') {
            console.log('Permiso de notificaciones no concedido.');
            return;
        }

        if (!this.listenersRegistrados) {
            this.registrarListenersPush();
            this.listenersRegistrados = true;
        }

        await PushNotifications.register();
    }

    private async crearCanalAndroid(): Promise<void> {
        if (Capacitor.getPlatform() !== 'android') return;

        try {
            await PushNotifications.createChannel({
                id: 'default',
                name: 'Notificaciones AQHora',
                description: 'Canal principal de notificaciones de AQHora',
                importance: 5,
                visibility: 1,
                sound: 'default',
                vibration: true,
                lights: true
            });
        } catch (error) {
            console.log('No se pudo crear el canal de notificaciones Android:', error);
        }
    }

    private registrarListenersPush(): void {
        PushNotifications.addListener('registration', async (token: Token) => {
            console.log('TOKEN PUSH FCM/APNS:', token.value);

            await this.registrarTokenPushEnBackend(token.value);
        });

        PushNotifications.addListener('registrationError', (error: any) => {
            console.log('Error al registrar push:', error);
        });

        PushNotifications.addListener(
            'pushNotificationReceived',
            (notification: PushNotificationSchema) => {
                console.log('Push recibida con app abierta:', notification);
            }
        );

        PushNotifications.addListener(
            'pushNotificationActionPerformed',
            async (notification: ActionPerformed) => {
                console.log('Usuario abrió la push:', notification);
                console.log('Data push:', notification.notification.data);

                await this.navController.navigateRoot('/reloj');
            }
        );
    }

    private async registrarTokenPushEnBackend(tokenPush: string): Promise<void> {
        const info = await Device.getInfo();
        const id = await Device.getId();

        const idEmpleado = Number(localStorage.getItem('empleadoID') ?? 0);

        if (!idEmpleado) {
            console.log('No se registra token push porque no existe empleadoID.');
            return;
        }

        const datos = {
            id_empleado: idEmpleado,
            id_dispositivo: id.identifier,
            token_push: tokenPush,
            plataforma: info.platform,
            modelo_dispositivo: info.model
        };

        console.log('DATOS TOKEN PUSH PARA BACKEND:', datos);

        this.http.post(`${environment.urlMultitenant}/push/registrar-token`, datos).subscribe({
            next: (res) => {
                console.log('Token push registrado correctamente.', res);
            },
            error: (error) => {
                console.log('Error al registrar token push:', error);
            }
        });
    }
}