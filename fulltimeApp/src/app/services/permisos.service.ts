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
  private recursoURL = 'http://192.168.0.145:3001';
  //private recursoURL = 'http://186.4.226.49:3001';


  private handleError(error: any) {
    console.log('ERROR CAPTURADO: ', error);
    return throwError(error);
  }
  constructor(
    private http: HttpClient,
    private socket: Socket
  ) { }

  // Noti_realtime
  sendNotiRealTime(data: any) {
    this.socket.emit('nueva_notificacion', data);
  }

  /*********************************************************************
   * 
   *            Metodos para conexion a la RUTA DE PERMISOS
   * 
   **********************************************************************  
   */

  getAllPermisos(): Observable<Permiso[]> {
    const url = `${this.apiUrl}/permisos/all-permisos`;
    return this.http.get<Permiso[]>(url)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

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

  getListaPermisosByCodigo(codigo: number | string): Observable<Permiso[]> {
    const url = `${this.apiUrl}/permisos/lista-permisos`;
    const params = new HttpParams().set('codigo', codigo)
    return this.http.get<Permiso[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  getlistaPermisosByFechasyCodigo(fec_inicio: string, fec_final: string, codigo: number | string): Observable <Permiso[]>{
    const url = `${this.apiUrl}/permisos/lista-permisosfechas`;
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

  getlistaPermisosByFechasyCodigoEdit(fec_inicio: string, fec_final: string, codigo: number | string, id: number): Observable <Permiso[]>{
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

  getlistaPermisosByHorasyCodigo(fec_inicio: string, fec_final: string, hora_inicio: string, hora_final: string, codigo: number | string ): Observable <Permiso[]>{
    const url = `${this.apiUrl}/permisos/lista-permisoshoras`;
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

  getlistaPermisosByHorasyCodigoEdit(fec_inicio: string, fec_final: string, hora_inicio: string, hora_final: string, codigo: number | string, id: number): Observable <Permiso[]>{
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

  postNuevoPermiso(permiso: Permiso): Observable<Permiso> {
    const cdepar: any = localStorage.getItem('cdepar');
    const url = `${this.apiUrl}/permisos/insert-permiso`;
    const params = new HttpParams()
      .set('id_departamento', cdepar)
    return this.http.post<Permiso>(url, permiso, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  putPermiso(permiso: Permiso): Observable<any> {
    const url = `${this.apiUrl}/permisos/update-permiso`;
    return this.http.put<any>(url, permiso)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  pruebaConsulta(): Observable<any>{
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
