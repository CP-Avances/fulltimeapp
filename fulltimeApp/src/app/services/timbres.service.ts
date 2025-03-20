import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// SERVICIOS
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TimbresService {

  private api_url = '';

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {
    this.obtenerUrlEmpresa();
  }

  async obtenerUrlEmpresa() {
    this.api_url = await this.storageService.get('urlEmpresa');
  }

  // METODO PARA BUSCAR LOS TIMBRES DE LOS EMPLEADOS POR SU CODIGO
  getTimbresEmpleadoByCodigo(codigo: number | string) {
    return this.http.get<any>(`${this.api_url}/timbres/timbreEmpleado/${codigo}`)
  }

  // METODO ENVIAR UN TIMBRE COMO ADMINISTRADOR
  PostTimbreWebAdmin(datos: any) {
    return this.http.post<any>(`${this.api_url}/timbres/timbre/admin`, datos);
  }

  // METODO PARA BUSCAR LOS TIMBRES FILTRADOS POR FECHA
  PostFiltrotimbres(datos: any){
    return this.http.post<any>(`${this.api_url}/timbres/filtroTimbre`, datos)
  }
}
