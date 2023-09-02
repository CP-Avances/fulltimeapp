import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ParametrosService {

  private apiUrl = environment.url

  constructor(
    private http: HttpClient
  ) { }


  ObtenerDetallesParametros(id: any) {
    return this.http.get<any>(this.apiUrl + '/parametros/detalles/' + id);
  }

  ObtenerCoordenadas(data: any) {
    return this.http.post<any>(`${this.apiUrl}/parametros/coordenadas`, data);;
  }

  ObtenerUbicacionUsuario(codigo: any) {
    return this.http.get<any>(this.apiUrl + '/parametros/ubicacion-usuario/' + codigo);
  }

  ObtenerFunciones() {
    return this.http.get<any>(this.apiUrl + '/parametros/funciones');
  }

  ObtenerFormatos() {
    return this.http.get<any>(this.apiUrl + '/parametros/buscar-formatos');
  }
}
