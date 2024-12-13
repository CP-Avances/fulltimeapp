import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {
  private apiUrl = environment.url;


  constructor(private http: HttpClient) { }

  // METODO PARA VERIFICAR LA CONEXION AL SERVIDOR
  async checkServerConnection(): Promise<boolean> {
    try {
      const response = await this.http.get(this.apiUrl, { observe: 'response' }).pipe(timeout(1000)).toPromise();
      return response.status === 200;
    } catch (error) {
      // Siempre devolverá false si hay un error
      return false;
    }
  }
  
}
