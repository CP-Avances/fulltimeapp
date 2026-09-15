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

            if (dispositivoRevocado) {
              if (!this.cerrandoSesion) {
                this.cerrandoSesion = true;
                this.cerrarSesionDispositivoRevocado(error.error?.message);
              }

              return throwError(() => error);
            }

            return throwError(() => error);
          })
        );
      })
    );
  }

  private async cerrarSesionDispositivoRevocado(mensaje?: string): Promise<void> {
    try {
      await this.sessionStorageService.removeToken();

      localStorage.clear();
      sessionStorage.clear();

      localStorage.setItem('primeraVez', 'true');

      await this.navController.navigateRoot('login');

      const toast = await this.toastController.create({
        message: mensaje || 'Este dispositivo ya no está autorizado para utilizar la aplicación.',
        duration: 3500,
        color: 'danger',
        mode: 'ios'
      });

      await toast.present();
    } finally {
      this.cerrandoSesion = false;
    }
  }
}