import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ToastController, NavController } from '@ionic/angular';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  private cerrandoSesion = false;

  constructor(
    private navController: NavController,
    private toastController: ToastController
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {

        const status = error.status;
        const code = error.error?.code;
        const message = error.error?.message || 'Su sesión ha expirado.';

        if (status === 401 && code === 'token_invalido') {
          return from(this.cerrarSesionPorTokenInvalido(message)).pipe(
            switchMap(() => throwError(() => error))
          );
        }

        return throwError(() => error);
      })
    );
  }

  private async cerrarSesionPorTokenInvalido(message: string): Promise<void> {
    if (this.cerrandoSesion) return;

    this.cerrandoSesion = true;

    await this.mostrarMensaje(message);

    localStorage.clear();
    sessionStorage.clear();

    localStorage.setItem('primeraVez', 'true');

    this.navController.navigateRoot('/login');
  }

  private async mostrarMensaje(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message: message || 'Su sesión ha expirado. Inicie sesión nuevamente.',
      duration: 3500,
      color: 'warning',
      position: 'middle',
      mode: 'ios'
    });

    await toast.present();
  }
}