import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

// SERVICIOS
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ParametrosService {

  private readonly apiUrlM = `${environment.urlMultitenant}`;

  constructor(
    private http: HttpClient,
  ) {
  }


  // METODO PARA OBTENER LOS DETALLES DE PARAMETROS POR ID
  ObtenerDetallesParametros(id: any) {
    return this.http.get<any>(this.apiUrlM + '/api/parametrizacion/detalle/' + id)
      .pipe(map(res => Array.isArray(res?.data) ? res.data : []));
  }


  // METODO PARA OBTENER LOS DETALLES DE PARAMETROS POR ID
  ObtenerDetalleParametroUsuario(datos: any) {
    return this.http.post<any>(`${this.apiUrlM}/timbres/listar-opciones-timbre`, datos);
  }

  // METODO PARA OBTENER LOS FORMATOS DE LAS FECHAS
  ObtenerFormatos(ids: number[]) {
    return this.http.post<any>(`${this.apiUrlM}/api/parametrizacion/multiples-detalles`, { ids })
      .pipe(map(res => Array.isArray(res?.data) ? res.data : []));
  }

  // METODO PARA OBTENER LAS COORDENADAS DE UNA UBICACION REGISTRADA
  ObtenerCoordenadas(data: any) {
    return this.http.post<any>(`${this.apiUrlM}/parametrizacion/coordenadas`, data);;
  }

  // METODO PARA OBTENER LA UBICACION REGISTRADA AL EMPLEADO
  ObtenerUbicacionUsuario(id_empl: any) {
    return this.http.get<any>(`${this.apiUrlM}/ubicacion/coordenadas-usuario/${id_empl}`);
  }

}
