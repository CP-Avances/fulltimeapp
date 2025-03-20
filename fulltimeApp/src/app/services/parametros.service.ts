import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// SERVICIOS
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ParametrosService {

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

  // METODO PARA OBTENER LOS DETALLES DE PARAMETROS POR ID
  ObtenerDetallesParametros(id: any) {
    return this.http.get<any>(this.apiUrl + '/parametrizacion/' + id);
  }

  // METODO PARA OBTENER LOS DETALLES DE PARAMETROS POR ID
  ObtenerDetalleParametroUsuario(datos: any) {
    return this.http.post<any>(`${this.apiUrl}/timbres/listar-opciones-timbre`, datos);
  }

  // METODO PARA OBTENER LOS FORMATOS DE LAS FECHAS
  ObtenerFormatos() {
    return this.http.get<any>(this.apiUrl + '/parametrizacion/buscar-formato/fecha_horas');
  }

  // METODO PARA OBTENER LAS COORDENADAS DE UNA UBICACION REGISTRADA
  ObtenerCoordenadas(data: any) {
    return this.http.post<any>(`${this.apiUrl}/parametrizacion/coordenadas`, data);;
  }

  // METODO PARA OBTENER LA UBICACION REGISTRADA AL EMPLEADO
  ObtenerUbicacionUsuario(id_empl: any) {
    return this.http.get<any>(`${this.apiUrl}/ubicacion/coordenadas-usuario/${id_empl}`);
  }

  // METODO PARA BUSCAR LAS FUNCIONES
  ObtenerFunciones() {
    return this.http.get<any>(this.apiUrl + '/administracion/funcionalidad');
  }


}
