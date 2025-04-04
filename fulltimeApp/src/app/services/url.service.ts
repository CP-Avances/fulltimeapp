import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UrlService {
  // Usamos un BehaviorSubject para almacenar la URL
  private urlSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private urlSocketSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor() { }

  // MÉTODO PARA ACTUALIZAR LA URL
  updateUrl(url: string) {
    this.urlSubject.next(url);
  }

  // MÉTODO PARA OBTENER LA URL COMO UN OBSERVABLE
  getUrl(): Observable<string | null> {
    return this.urlSubject.asObservable();
  }

  // MÉTODO PARA ACTUALIZAR LA URL DEL SOCKET
  updateSocketUrl(url: string) {
    this.urlSocketSubject.next(url);
  }

  // MÉTODO PARA OBTENER LA URL DEL SOCKET COMO UN OBSERVABLE
  getSocketUrl(): Observable<string | null> {
    return this.urlSocketSubject.asObservable();
  }
}
