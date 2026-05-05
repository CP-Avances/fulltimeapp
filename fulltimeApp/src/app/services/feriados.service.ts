import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface IFeriado {
  id?: number;
  fecha: string;
  [key: string]: any;
}

export interface ApiResponse<T> {
  ok?: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FeriadosService {

  private readonly apiUrl = `${environment.urlMultitenant}/api/feriados`;

  constructor(
    private readonly http: HttpClient,
  ) { }

  // CONSULTAR LISTA DE FERIADOS
  ConsultarFeriado(): Observable<IFeriado[]> {
    return this.http.get<ApiResponse<IFeriado[]>>(`${this.apiUrl}`)
      .pipe(
        map(response => response.data || [])
      );
  }

  // CONSULTAR UN FERIADO ESPECIFICO
  ConsultarUnFeriado(id: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  // LISTAR FERIADOS POR CIUDAD Y RANGO DE FECHAS
  ListarFeriadosCiudad(datos: any): Observable<any[]> {
    return this.http.post<ApiResponse<any[]>>(`${this.apiUrl}/listar-feriados/ciudad`, datos)
      .pipe(
        map(response => response.data || [])
      );
  }

  // LISTAR FERIADOS POR CIUDAD Y RANGO DE FECHAS PARA MULTIPLES EMPLEADOS
  ListarFeriadosCiudadMultiplesEmpleados(datos: any): Observable<any[]> {
    return this.http.post<ApiResponse<any[]>>(`${this.apiUrl}/listar-feriados/ciudad-multiples`, datos)
      .pipe(
        map(response => response.data || [])
      );
  }
}