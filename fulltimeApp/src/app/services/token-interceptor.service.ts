import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SessionStorageService } from './session-storage.service';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  constructor(
    private sessionStorageService: SessionStorageService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.sessionStorageService.getToken()).pipe(
      switchMap((token) => {
        const codigoEmpresa = localStorage.getItem('codigo_empresa') || '';

        let headers: any = {
          'x-codigo-empresa': codigoEmpresa
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const tokenizeReq = req.clone({
          setHeaders: headers
        });

        return next.handle(tokenizeReq);
      })
    );
  }

}