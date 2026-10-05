import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { NavController, ToastController } from '@ionic/angular';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { SessionStorageService } from './session-storage.service';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  private cerrandoSesion = false;

  constructor(
    private sessionStorageService: SessionStorageService,
    private navController: NavController,
    private toastController: ToastController
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.sessionStorageService.getToken()).pipe(
      switchMap((token) => {
        const codigoEmpresa = localStorage.getItem('codigo_empresa') || '';

        const headers: any = {
          'x-codigo-empresa': codigoEmpresa
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const tokenizeReq = req.clone({
          setHeaders: headers
        });

        return next.handle(tokenizeReq).pipe(
          catchError((error: HttpErrorResponse) => {
            const dispositivoRevocado =
              error.status === 401 &&
              error.error?.code === 'dispositivo_revocado';

            const usuarioAppInactivo =
              error.status === 401 &&
              error.error?.code === 'usuario_app_inactivo';

            if (dispositivoRevocado || usuarioAppInactivo) {
              if (!this.cerrandoSesion) {
                this.cerrandoSesion = true;

                const mensaje = dispositivoRevocado
                  ? 'El dispositivo ya no está autorizado.'
                  : 'El usuario no tiene acceso a la aplicación móvil.';

                this.cerrarSesionForzada(mensaje);
              }

              return throwError(() => error);
            }

            return throwError(() => error);
          })
        );
      })
    );
  }

  private async cerrarSesionForzada(mensaje?: string): Promise<void> {
    try {
      const uidDispositivo = localStorage.getItem('UidDispositivo');
      const codigoEmpresa = localStorage.getItem('codigo_empresa');

      await this.sessionStorageService.removeToken();

      localStorage.clear();
      sessionStorage.clear();

      if (uidDispositivo) {
        localStorage.setItem('UidDispositivo', uidDispositivo);
      }

      if (codigoEmpresa) {
        localStorage.setItem('codigo_empresa', codigoEmpresa);
      }

      localStorage.setItem('primeraVez', 'true');

      await this.navController.navigateRoot('login');

      const toast = await this.toastController.create({
        message: mensaje,
        duration: 3000,
        color: 'danger',
        mode: 'ios'
      });

      await toast.present();

    } finally {
      this.cerrandoSesion = false;
    }
  }
}
