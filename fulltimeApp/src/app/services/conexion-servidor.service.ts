import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {
    private apiUrl = environment.url;


  constructor(private http: HttpClient) { }

  async checkServerConnection(): Promise<boolean> {
    try {
      const response = await this.http.get(this.apiUrl, { observe: 'response' }).toPromise();
      return response.status === 200;
    } catch (error) {
      // Si el error tiene un status (problema del servidor)
      if (error.status) {
        return false; // Servidor no disponible o error del servidor
      } else {
        return true;
      }
    }
  }
}
