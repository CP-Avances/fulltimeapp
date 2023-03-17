import { Injectable } from '@angular/core';
import { RelojServiceService } from "./reloj-service.service";

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService {

  constructor(private relojServiceService: RelojServiceService) { }

  intercept(req: any, next: any) {
    if (this.relojServiceService.estaLogueado()) {
      let tokenizeReq = req.clone({
        setHeaders: {
          autorizacion: this.relojServiceService.getToken()
        }
      });
      return next.handle(tokenizeReq);
    } else {
      let tokenizeReq = req.clone({
        setHeaders: {
          autorizacion: "sin token"
        }
      });
      return next.handle(tokenizeReq);
    }
  }

}
