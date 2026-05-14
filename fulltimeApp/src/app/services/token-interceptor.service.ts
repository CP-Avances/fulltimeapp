import { Injectable } from '@angular/core';
import { RelojServiceService } from "./reloj-service.service";

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService {

  constructor(
    private relojServiceService: RelojServiceService
  ) { }

  // INTERCEPTOR HTTP
  intercept(req: any, next: any) {
    const codigoEmpresa = localStorage.getItem('codigo_empresa') || '';
    const tokenizeReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${this.relojServiceService.getToken()}`,
        'x-codigo-empresa': codigoEmpresa
      }
    });
    return next.handle(tokenizeReq);
  }

}
