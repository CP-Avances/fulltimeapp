import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ResultVerificacion, SaldoEmpleadoResponse, Vacacion, VerificarSolicitudResponse, VerificarVacacionesRequest } from '../interfaces/Vacacion';
import { HttpClient, HttpErrorResponse,  HttpParams } from '@angular/common/http';
import { catchError, map, retry, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

// SERVICIOS
import { StorageService } from './storage.service';
import { SocketService } from 'src/app/services/socket.service';

@Injectable({
  providedIn: 'root'
})
export class VacacionesService {

  private readonly apiUrl = `${environment.urlMultitenant}/solicitud-vacacion`;
  private socket: any;

  constructor(
    private http: HttpClient,
  ) { }

  private handleError(error: HttpErrorResponse) {
    console.error('ERROR CAPTURADO EN VACACIONES SERVICE:', error);

    let mensaje = 'Error desconocido en vacaciones';

    if (error.error instanceof ErrorEvent) {
      mensaje = error.error.message;
    } else {
      mensaje = error.error?.message || error.message || 'Error del servidor';
    }

    return throwError(() => new Error(mensaje));
  }

  // Noti_realtime
  sendNotiRealTime(data: any) {
    console.log("socket emite notificacion enviada", data);
    this.socket.emit('nueva_notificacion', data);
  }

  /*********************************************************************
  *
  *            Metodos para conexion a la RUTA DE VACACIONES
  *
  **********************************************************************
  */
  // OBTIENE LOS REGISTROS DE SOLICITUDES DE VACACIONES
  getAllVacaciones(): Observable<Vacacion[]> {
    const url = `${this.apiUrl}/vacaciones/all-vacaciones`;
    return this.http.get<Vacacion[]>(url)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // OBTIENE LOS REGISTROS DE SOLICITUDES DE VACACIONES POR FECHAS
  getAllVacacionesByFechas(fec_inicio: string, fec_final: string): Observable<Vacacion[]> {
    const url = `${this.apiUrl}/vacaciones/rangofechas`;
    const params = new HttpParams()
      .set('fec_inicio', fec_inicio)
      .set('fec_final', fec_final)
    return this.http.get<Vacacion[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // OBTIENE LOS REGISTROS DE SOLICITUDES DE VACACIONES POR CODIGO
  getListaVacacionesByCodigo(codigo: any): Observable<Vacacion[]> {
    console.log('codigo: ', codigo);
    const url = `${this.apiUrl}/vacaciones/lista-vacaciones`;
    const params = new HttpParams().set('codigo', codigo)
    return this.http.get<Vacacion[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  getlistarPeriVacacionesByCodigo(codigo: any): Observable<Vacacion[]> {
    console.log('codigo: ', codigo);
    const url = `${this.apiUrl}/vacaciones/listarPeriVacaciones`;
    const params = new HttpParams().set('codigo', codigo)
    return this.http.get<Vacacion[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }


  // OBTIENE LOS REGISTROS DE SOLICITUDES DE VACACIONES POR FECHAS Y CODIGO
  getlistaVacacionesByFechasyCodigo(fec_inicio: string, fec_final: string, codigo: number | string): Observable<Vacacion[]> {
    const url = `${this.apiUrl}/vacaciones/lista-vacacionesfechas/fechas`;
    const params = new HttpParams()
      .set('fec_inicio', fec_inicio)
      .set('fec_final', fec_final)
      .set('codigo', codigo)
    return this.http.get<Vacacion[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  getlistaVacacionesByFechasyCodigoEdit(fec_inicio: string, fec_final: string, codigo: number | string, id: number): Observable<Vacacion[]> {
    const url = `${this.apiUrl}/vacaciones/lista-vacacionesfechasedit`;
    const params = new HttpParams()
      .set('fec_inicio', fec_inicio)
      .set('fec_final', fec_final)
      .set('codigo', codigo)
      .set('id', id)

    console.log("fec_inicio: ", fec_inicio)
    console.log('fec_final: ', fec_final)
    console.log('codigo: ', codigo)
    console.log('id: ', id)

    return this.http.get<Vacacion[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // REGISTRA SOLICITUDES DE VACACION
  postNuevoVacacion(vacacion: Vacacion): Observable<Vacacion> {
    const cdepar: any = localStorage.getItem('cdepar');
    const url = `${this.apiUrl}/vacaciones/insert-vacacion`;
    const params = new HttpParams()
      .set('id_departamento', cdepar)
    return this.http.post<Vacacion>(url, vacacion, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // EDITA SOLICITUDES DE VACACION
  putVacacion(vacacion: Vacacion): Observable<any> {
    const url = `${this.apiUrl}/vacaciones/update-vacacion`;
    return this.http.put<any>(url, vacacion)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
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
    if (!data.id || data.id <= 0) {
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
      documento: data.documento,
      minutos_totales: data.minutos_totales
    };

    return this.http.put<any>(`${this.apiUrl}/editar_solicitud/${data.id}`, datosActualizacion)
      .pipe(
        retry(1),
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




}
