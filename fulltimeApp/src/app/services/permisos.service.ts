import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Permiso } from '../interfaces/Permisos';
import { environment } from '../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { Socket } from 'ngx-socket-io';


@Injectable({
  providedIn: 'root'
})
export class PermisosService {

  private apiUrl = environment.url;
  private recursoURL = 'http://186.4.226.49:3001';

  private handleError(error: any) {
    console.log('ERROR CAPTURADO: ', error);
    return throwError(error);
  }
  constructor(
    private http: HttpClient,
    private socket: Socket
  ) { }

  // METODO PARA ENVIAR NOTIFICACIONES MEDIANTE SOCKET 
  sendNotiRealTime(data: any) {
    this.socket.emit('nueva_notificacion', data);
  }

  /*********************************************************************
   * 
   *            Metodos para conexion a la RUTA DE PERMISOS
   * 
   **********************************************************************  
   */

  // OBTIENE LOS REGISTROS DE SOLICITUDES DE PERMISOS POR ID Y CODIGO

  getPermisoIdyCodigo(codigo: any, id: any): Observable<Permiso[]> {
    const url = `${this.apiUrl}/empleadoPermiso/obtener-permiso`;
    const params = new HttpParams()
      .set('codigo', codigo)
      .set('id', id)
    return this.http.get<Permiso[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // OBTIENE LOS REGISTROS DE SOLICITUDES

  getAllPermisos(): Observable<Permiso[]> {
    const url = `${this.apiUrl}/permisos/all-permisos`;
    return this.http.get<Permiso[]>(url)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // OBTIENE LOS REGISTROS DE SOLICITUDES DE PERMISOS POR FECHAS

  getAllPermisosByFechas(fec_inicio: string, fec_final: string): Observable<Permiso[]> {
    const url = `${this.apiUrl}/permisos/rangofechas`;
    const params = new HttpParams()
      .set('fec_inicio', fec_inicio)
      .set('fec_final', fec_final)
    return this.http.get<Permiso[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // OBTIENE LOS REGISTROS DE SOLICITUDES DE PERMISOS POR CODIGO

  getListaPermisosByCodigo(codigo: string): Observable<Permiso[]> {
    const url = `${this.apiUrl}/empleadoPermiso/lista-permisos`;
    const params = new HttpParams().set('codigo', codigo)
    return this.http.get<Permiso[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // OBTIENE LOS REGISTROS DE SOLICITUDES DE PERMISOS POR CODIGO Y FECHAS
  getlistaPermisosByFechasyCodigo(fec_inicio: string, fec_final: string, codigo: number | string): Observable<Permiso[]> {
    const url = `${this.apiUrl}/empleadoPermiso/lista-permisosfechas`;
    const params = new HttpParams()
      .set('fec_inicio', fec_inicio)
      .set('fec_final', fec_final)
      .set('codigo', codigo)
    return this.http.get<Permiso[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // OBTIENE LOS REGISTROS DE SOLICITUDES DE PERMISOS POR CODIGO Y FECHAS
  getlistaPermisosByFechasyCodigoEdit(fec_inicio: string, fec_final: string, codigo: number | string, id: number): Observable<Permiso[]> {
    const url = `${this.apiUrl}/permisos/lista-permisosfechasedit`;
    const params = new HttpParams()
      .set('fec_inicio', fec_inicio)
      .set('fec_final', fec_final)
      .set('codigo', codigo)
      .set('id', id)
    return this.http.get<Permiso[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // OBTIENE LOS REGISTROS DE SOLICITUDES DE PERMISOS POR HORAS Y CODIGO

  getlistaPermisosByHorasyCodigo(fec_inicio: string, fec_final: string, hora_inicio: string, hora_final: string, codigo: number | string): Observable<Permiso[]> {
    const url = `${this.apiUrl}/empleadoPermiso/lista-permisoshoras`;
    const params = new HttpParams()
      .set('fec_inicio', fec_inicio)
      .set('fec_final', fec_final)
      .set('hora_inicio', hora_inicio)
      .set('hora_final', hora_final)
      .set('codigo', codigo)

    return this.http.get<Permiso[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  getlistaPermisosByHorasyCodigoEdit(fec_inicio: string, fec_final: string, hora_inicio: string, hora_final: string, codigo: number | string, id: number): Observable<Permiso[]> {
    const url = `${this.apiUrl}/permisos/lista-permisoshorasedit`;
    const params = new HttpParams()
      .set('fec_inicio', fec_inicio)
      .set('fec_final', fec_final)
      .set('hora_inicio', hora_inicio)
      .set('hora_final', hora_final)
      .set('codigo', codigo)
      .set('id', id)

    return this.http.get<Permiso[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // METODO PARA REGISTRAR SOLICITUD DE PERMISO
  postNuevoPermiso(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoPermiso`, datos);
  }

  // METODO PARA EDITAR SOLICITUD DE PERMISO
  putPermiso(id: number, datos: any) {
    return this.http.put<any>(`${environment.url}/empleadoPermiso/${id}/permiso-solicitado`, datos);
  }

  pruebaConsulta(): Observable<any> {
    const url = `${this.apiUrl}/permisos/consulta`;
    return this.http.get<any>(url)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  BuscarPermisosSolicitados(datos: any) {
    return this.http.post<any>(`${this.recursoURL}/empleadoPermiso/permisos-solicitados/movil`, datos);
  }
  // METODO PARA SUBIR ARCHIVOS DE PERMISOS
  SubirArchivoRespaldo(formData: any, id: number, codigo: any, archivo: any) {
    return this.http.put(`${this.recursoURL}/empleadoPermiso/${id}/archivo/${archivo}/validar/${codigo}`, formData)
  }
  // METODO PARA ELIMINAR ARCHIVOS DE PERMISOS
  EliminarArchivo(documento: string, codigo: any) {
    return this.http.delete(`${this.recursoURL}/empleadoPermiso/eliminar-movil/${documento}/validar/${codigo}`);
  }

}
