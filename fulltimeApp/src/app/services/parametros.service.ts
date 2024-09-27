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


  // METODO PARA OBTENER LOS DETALLES DE PARAMETROS POR ID
  ObtenerDetallesParametros(id: any) {
    return this.http.get<any>(this.apiUrl + '/parametrizacion/' + id);
  }
    
  // METODO PARA OBTENER LOS DETALLES DE PARAMETROS POR ID
  ObtenerDetalleParametroUsuario(id_empleado: any) {
    return this.http.get<any>(this.apiUrl + '/parametrizacion/opciones-marcacion/' + id_empleado);
  }

  // METODO PARA OBTENER LOS FORMATOS DE LAS FECHAS
  ObtenerFormatos() {
    return this.http.get<any>(this.apiUrl + '/parametrizacion/buscar-formato/fecha_horas');
  }

  // METODO PARA OBTENER LAS COORDENADAS DE UNA UBICACION REGISTRADA
  ObtenerCoordenadas(data: any) {
    return this.http.post<any>(`${this.apiUrl}/parametrizacion/coordenadas`, data);;
  }

  ObtenerUbicacionUsuario(id_empl: any) {
    return this.http.get<any>(`${this.apiUrl}/ubicacion/coordenadas-usuario/${id_empl}`);
  }

  // METODO PARA BUSCAR LAS FUNCIONES
  ObtenerFunciones() {
    return this.http.get<any>(this.apiUrl + '/administracion/funcionalidad');
  }

 
}
