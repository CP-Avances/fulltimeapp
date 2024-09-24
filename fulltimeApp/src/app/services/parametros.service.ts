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
    return this.http.get<any>(this.apiUrl + '/parametrizacion/' + id);
  }

  ObtenerFormatos() {
    return this.http.get<any>(this.apiUrl + '/parametrizacion/buscar-formato/fecha_horas');
  }

  ObtenerCoordenadas(data: any) {
    return this.http.post<any>(`${this.apiUrl}/parametrizacion/coordenadas`, data);;
  }

  ObtenerUbicacionUsuario(id_empl: any) {
    return this.http.get<any>(`${this.apiUrl}/ubicacion/coordenadas-usuario/${id_empl}`);
  }

  ObtenerFunciones() {
    return this.http.get<any>(this.apiUrl + '/administracion/funcionalidad');
  }

 
}
