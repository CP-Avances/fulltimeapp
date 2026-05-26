import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ResultVerificacion, SaldoEmpleadoResponse, VerificarSolicitudResponse, VerificarVacacionesRequest } from '../interfaces/Vacacion';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, map, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})

export class VacacionesService {

  private readonly apiUrl = `${environment.urlMultitenant}/solicitud-vacacion`;

  constructor(
    private http: HttpClient,
  ) { }

  private handleError(error: HttpErrorResponse) {

    let mensaje = 'Error desconocido en vacaciones';

    if (error.error instanceof ErrorEvent) {
      mensaje = error.error.message;
    } else {
      mensaje = error.error?.message || error.message || 'Error del servidor';
    }

    return throwError(() => new Error(mensaje));
  }


  /*********************************************************************
  *
  * METODOS USADOS DE SERVIDOR MULTITENANT
  *
  **********************************************************************
  */
  // LISTAR TIPOS / CONFIGURACIONES DE VACACIONES
  ListarTodasConfiguraciones(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/vacaciones/lista-todas-configuraciones`)
      .pipe(
        map(response => response.data || []),
        catchError(this.handleError)
      );
  }

  // OBTENER SALDO DEL EMPLEADO
  ObtenerSaldoEmpleados(id_empleado: number): Observable<SaldoEmpleadoResponse> {
    if (!id_empleado || id_empleado < 0) {
      return throwError(() => new Error('ID de empleado no válido'));
    }

    return this.http.get<SaldoEmpleadoResponse>(`${this.apiUrl}/saldo/${id_empleado}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // VERIFICAR VACACIONES (aunque el nombre diga multiples, sirve también para uno)
  VerificarVacacionesMultiples(datosVerificacion: VerificarVacacionesRequest): Observable<ResultVerificacion[]> {
    const url = `${this.apiUrl}/vacaciones/verificar-empleados`;

    return this.http.post<{ ok: boolean; data: ResultVerificacion[] }>(url, datosVerificacion)
      .pipe(
        map(response => {
          if (!response.ok) {
            throw new Error('Error al verificar vacaciones');
          }
          return response.data || [];
        }),
        catchError(this.handleError)
      );
  }

  // VERIFICAR SI YA EXISTE SOLICITUD EN ESE RANGO
  BuscarSolicitudExistente(verificacion: {
    id_empleado: number;
    fecha_inicio: string;
    fecha_final: string;
    excluir_solicitud_actual?: number | string | null;
  }): Observable<VerificarSolicitudResponse> {
    const excluir = verificacion.excluir_solicitud_actual ?? 'null';

    const url = `${this.apiUrl}/vacaciones/verificar-solicitud/${verificacion.id_empleado}/${verificacion.fecha_inicio}/${verificacion.fecha_final}/${excluir}`;

    return this.http.get<VerificarSolicitudResponse>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  // REGISTRAR SOLICITUD NUEVA
  RegistrarVacaciones(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crear_solicitud`, datos)
      .pipe(
        catchError(this.handleError)
      );
  }

  // EDITAR SOLICITUD
  EditarSolicitudesVacaciones(data: any): Observable<any> {
    const idSolicitud = Number(data.id_solicitud_vacacion || data.id || 0);

    if (!idSolicitud || idSolicitud <= 0) {
      return throwError(() => new Error('ID de solicitud no válido'));
    }

    const datosActualizacion = {
      id_configuracion: data.id_configuracion,
      fecha_inicio: data.fecha_inicio,
      fecha_final: data.fecha_final,
      numero_dias_lunes: data.numero_dias_lunes,
      numero_dias_martes: data.numero_dias_martes,
      numero_dias_miercoles: data.numero_dias_miercoles,
      numero_dias_jueves: data.numero_dias_jueves,
      numero_dias_viernes: data.numero_dias_viernes,
      numero_dias_sabado: data.numero_dias_sabado,
      numero_dias_domingo: data.numero_dias_domingo,
      numero_dias_totales: data.numero_dias_totales,
      incluir_feriados: data.incluir_feriados,
      documento: data.documento ?? null,
      minutos_totales: data.minutos_totales ?? 0
    };

    return this.http.put<any>(`${this.apiUrl}/editar_solicitud/${idSolicitud}`, datosActualizacion)
      .pipe(
        retry(1),
        map(response => response?.data || response),
        catchError(this.handleError)
      );
  }

  // ELIMINAR SOLICITUD
  EliminarSolicitudesVacaciones(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/eliminar_solicitud/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // OBTENER SOLICITUDES POR EMPLEADO
  ObtenerSolicitudesPorEmpleado(idEmpleado: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/empleado/${idEmpleado}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ELIMINAR DOCUMENTO DE UNA SOLICITUD
  EliminarDocumentoSolicitud(idSolicitud: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/vacaciones/${idSolicitud}/documento`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // CONSULTAR MIS SOLICITUDES DE VACACIONES CON FILTROS
  ObtenerMisSolicitudesVacacion(
    limite: number = 10,
    desde: number = 0,
    filtros?: {
      empleados?: number[] | 'all';
      estado?: number | 'all';
      fechaDesde?: string;
      fechaHasta?: string;
    }
  ): Observable<any> {

    let params = new HttpParams()
      .set('limite', limite.toString())
      .set('desde', desde.toString());

    if (filtros?.empleados && filtros.empleados !== 'all') {
      params = params.set('empleados', filtros.empleados.join(','));
    }

    if (filtros?.estado !== undefined && filtros.estado !== 'all') {
      params = params.set('estado', filtros.estado.toString());
    }

    if (filtros?.fechaDesde) {
      params = params.set('fechaDesde', filtros.fechaDesde);
    }

    if (filtros?.fechaHasta) {
      params = params.set('fechaHasta', filtros.fechaHasta);
    }

    return this.http.get<any>(`${this.apiUrl}/lista`, { params })
      .pipe(
        retry(1),
        map(response => {
          return {
            data: response.data || [],
            pagination: response.pagination || {
              total: 0,
              limite,
              desde,
              pagina_actual: 1,
              total_paginas: 0
            },
            filtros: response.filtros || {}
          };
        }),
        catchError(this.handleError)
      );
  }

  // CONSULTAR SOLICITUDES DE VACACIONES PARA APROBACIÓN
  ObtenerSolicitudesVacacion(
    limite: number = 5,
    desde: number = 0,
    filtros?: {
      departamentos?: number[] | 'all';
      empleados?: number[] | 'all';
      estado?: number | 'all';
      fechaDesde?: string;
      fechaHasta?: string;
    }
  ): Observable<any> {

    let params = new HttpParams()
      .set('limite', limite.toString())
      .set('desde', desde.toString());

    if (filtros?.departamentos && filtros.departamentos !== 'all') {
      params = params.set('departamentos', filtros.departamentos.join(','));
    }

    if (filtros?.empleados && filtros.empleados !== 'all') {
      params = params.set('empleados', filtros.empleados.join(','));
    }

    if (filtros?.estado !== undefined && filtros.estado !== 'all') {
      params = params.set('estado', filtros.estado.toString());
    }

    if (filtros?.fechaDesde) {
      params = params.set('fechaDesde', filtros.fechaDesde);
    }

    if (filtros?.fechaHasta) {
      params = params.set('fechaHasta', filtros.fechaHasta);
    }

    console.log('URL vacaciones móvil:', `${this.apiUrl}/lista`);
    console.log('Params vacaciones móvil:', params.toString());

    return this.http.get<any>(`${this.apiUrl}/lista`, { params })
      .pipe(
        retry(1),
        map(response => {
          return {
            data: response.data || [],
            pagination: response.pagination || {
              total: 0,
              limite: 10,
              desde: 0,
              pagina_actual: 1,
              total_paginas: 0
            },
            filtros: response.filtros || { filtros: false }
          };
        }),
        catchError(this.handleError)
      );
  }



}