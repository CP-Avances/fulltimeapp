import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class ErrorTimeoutInterceptor implements HttpInterceptor {
  private readonly ERROR_TIMEOUT = 3000; // 3 segundos

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        console.error('Error detectado:', error);
        // Solo aplicamos timeout si hay un error
        return of(null).pipe(timeout(this.ERROR_TIMEOUT));
      }),
      catchError((finalError) => {
        console.error('Timeout o error final:', finalError);
        return throwError(finalError);
      })
    );
  }
}
