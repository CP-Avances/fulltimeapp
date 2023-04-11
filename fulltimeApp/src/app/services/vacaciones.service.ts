import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Vacacion } from '../interfaces/Vacacion';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';

import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class VacacionesService {

  private apiUrl = environment.url;

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
    console.log("socket emite notificacion enviada", data);
    this.socket.emit( 'nueva_notificacion', data);
  }

  /*********************************************************************
  * 
  *            Metodos para conexion a la RUTA DE VACACIONES
  * 
  **********************************************************************  
  */

  getAllVacaciones(): Observable<Vacacion[]> {
    const url = `${this.apiUrl}/vacaciones/all-vacaciones`;
    return this.http.get<Vacacion[]>(url)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

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

  getListaVacacionesByCodigo(codigo: number | string): Observable<Vacacion[]> {
    const url = `${this.apiUrl}/vacaciones/lista-vacaciones`;
    const params = new HttpParams().set('codigo', codigo)
    return this.http.get<Vacacion[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  getlistaVacacionesByFechasyCodigo(fec_inicio: string, fec_final: string, codigo: number | string): Observable <Vacacion[]>{
    const url = `${this.apiUrl}/vacaciones/lista-vacacionesfechas`;
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

  getlistaVacacionesByFechasyCodigoEdit(fec_inicio: string, fec_final: string, codigo: number | string, id: number): Observable <Vacacion[]>{
    const url = `${this.apiUrl}/vacaciones/lista-vacacionesfechasedit`;
    const params = new HttpParams()
      .set('fec_inicio', fec_inicio)
      .set('fec_final', fec_final)
      .set('codigo', codigo)
      .set('id', id)
    return this.http.get<Vacacion[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

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

  putVacacion(vacacion: Vacacion): Observable<any> {

    const url = `${this.apiUrl}/vacaciones/update-vacacion`;
    return this.http.put<any>(url, vacacion)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

}
