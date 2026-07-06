import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ApiResponse } from './feriados.service';
import { map } from 'rxjs';
import { ITimbreFechaEmpleadoRow } from '../interfaces/Timbre';

@Injectable({
  providedIn: 'root'
})
export class TimbresService {

  private readonly apiUrl = `${environment.urlMultitenant}`;

  constructor(
    private http: HttpClient,
  ) {
  }

  // METODO PARA BUSCAR LOS TIMBRES DE LOS EMPLEADOS POR SU CODIGO
  getTimbresEmpleadoByCodigo(codigo: number | string) {
    return this.http.get<any>(`${this.apiUrl}/timbres/timbreEmpleado/${codigo}`)
  }

  // METODO ENVIAR UN TIMBRE COMO ADMINISTRADOR
  RegistrarTimbreAdmin(formData: FormData) {
    return this.http.post(`${this.apiUrl}/timbres/admin`, formData);
  }

  // METODO PARA BUSCAR LOS TIMBRES FILTRADOS POR FECHA
  PostFiltrotimbres(datos: any) {
    return this.http.post<any>(`${this.apiUrl}/timbres/filtroTimbre`, datos)
  }

  ObtenerUltimoTimbreEmpleado(codigo: string) {
    return this.http.get<any>(
      `${this.apiUrl}/timbres/ultimo-timbre/${codigo}`
    );
  }

  // METODO PARA BUSCAR TIMBRES SEGUN CRITERIOS DE BUSQUEDA   **USADO**
  ObtenerTimbresFechaEmple(datos: any) {
    const params = new HttpParams()
      .set('codigo', datos.codigo)
      .set('identificacion', datos.identificacion)
      .set('fecha', datos.fecha)
    return this.http.get<ApiResponse<ITimbreFechaEmpleadoRow[]>>(`${this.apiUrl}/timbres/timbresfechaempleado`, { params })
      .pipe(map(res => res.data));
  }

  // METODO PARA EDITAR TIMBRES    **USADO**
  EditarTimbreEmpleado(data: any) {
    return this.http.put(`${this.apiUrl}/timbres/timbre/editar`, data);
  }
}
