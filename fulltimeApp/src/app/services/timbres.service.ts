import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TimbresService {

  private api_url = environment.url;

  constructor(
    private http: HttpClient
  ) { }

  getTimbresEmpleadoByCodigo(codigo: number | string) {
    return this.http.get<any>(`${this.api_url}/ring/timbreEmpleado/${codigo}`)
  }

  PostTimbreWebAdmin(datos: any) {
    return this.http.post<any>(`${this.api_url}/ring/timbre/admin`, datos);
  }

  PostFiltrotimbres(datos: any){
    return this.http.post<any>(`${this.api_url}/ring/filtroTimbre`, datos)
  }

  PostJustificacionAtraso(datos: any) {
    return this.http.post<any>(`${this.api_url}/ring/atraso`, datos)
  }


}
