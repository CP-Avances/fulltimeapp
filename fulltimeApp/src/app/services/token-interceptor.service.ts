import { Injectable } from '@angular/core';
import { RelojServiceService } from "./reloj-service.service";

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService {

  constructor(
    private relojServiceService: RelojServiceService
  ) { }

  intercept(req: any, next: any) {
    const tokenizeReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${this.relojServiceService.getToken()}`
      }
    });
    return next.handle(tokenizeReq);
  }

}
