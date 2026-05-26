import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

// SERVICIOS
import { environment } from 'src/environments/environment';

export interface IDetalleParametroExtendido {
  id_tipo: number;
  tipo: string;
  id_detalle: number;
  descripcion: string;
  observacion: string;
  id_parametro: number;
}

@Injectable({
  providedIn: 'root'
})

export class ParametrosService {

  private readonly apiUrlM = `${environment.urlMultitenant}`;

  constructor(
    private http: HttpClient,
  ) {
  }

  // METODO PARA LISTAR DETALLES DE PARAMETRO POR ID
  // Se agrega para compatibilidad con el flujo de aprobaciones de vacaciones
  ListarDetalleParametro(id: number) {
    return this.http
      .get<{ ok: boolean; data: IDetalleParametroExtendido[] }>(
        `${this.apiUrlM}/api/parametrizacion/detalle/${id}`
      )
      .pipe(
        map(res => Array.isArray(res?.data) ? res.data : [])
      );
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

  // METODO PARA OBTENER LA COORDENADAS DE UNA UBICACION REGISTRADA
  ObtenerCoordenadas(data: any) {
    return this.http.post<any>(`${this.apiUrlM}/api/parametrizacion/coordenadas`, data);
  }

  // METODO PARA OBTENER LA UBICACION REGISTRADA AL EMPLEADO
  ObtenerUbicacionUsuario(id_empl: any) {
    return this.http.get<any>(`${this.apiUrlM}/ubicacion/coordenadas-usuario/${id_empl}`);
  }

  ObtenerPermisosRoles(datos: any) {
    return this.http
      .post<any>(`${this.apiUrlM}/api/rol-permisos/validar-funciones-rol`, datos)
      .pipe(
        map(res => Array.isArray(res?.data) ? res.data : [])
      );
  }

  ObtenerAccionesRoles(datos: any) {
    return this.http
      .post<any>(`${this.apiUrlM}/api/rol-permisos/validar-acciones-rol`, datos)
      .pipe(
        map(res => Array.isArray(res?.data) ? res.data : [])
      );
  }

}