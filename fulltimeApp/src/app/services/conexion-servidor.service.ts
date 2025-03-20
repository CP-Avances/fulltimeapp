import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs/operators';

// SERVICIOS
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {
  private apiUrl = '';


  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {
    this.obtenerUrlEmpresa();
  }

  async obtenerUrlEmpresa() {
    this.apiUrl = await this.storageService.get('urlEmpresa');
  }

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
