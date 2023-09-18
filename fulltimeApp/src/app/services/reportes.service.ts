import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Timbre } from '../interfaces/Timbre';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private api_url = environment.url;

  private handleError(error: any) {
    console.log('ERROR CAPTURADO: ', error);
    return throwError(error);
  }

  constructor(
    private http: HttpClient
  ) { }

  getInfoReporteTimbres(codigo: number | string, fec_inicio: any, fec_final: any): Observable<Timbre[]> {
    const params = new HttpParams()
      .set('codigo', codigo)
      .set('fec_inicio', fec_inicio)
      .set('fec_final', fec_final)
    return this.http.get<Timbre[]>(`${this.api_url}/reportes/timbres`, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  getInfoReporteTimbresNovedad(codigo: number | string, fec_inicio: any, fec_final: any, conexion: boolean): Observable<Timbre[]> {
    const params = new HttpParams()
      .set('codigo', codigo)
      .set('fec_inicio', fec_inicio)
      .set('fec_final', fec_final)
      .set('conexion', conexion)
    return this.http.get<Timbre[]>(`${this.api_url}/reportes/timbresConNovedad`, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  getInfoReporteInasistencia(codigo: number, fec_inicio: any, fec_final: any): Observable<any> {
    const params = new HttpParams()
      .set('codigo', codigo)
      .set('fec_inicio', fec_inicio)
      .set('fec_final', fec_final)
    return this.http.get<any>(`${this.api_url}/reportes/inasistencia`, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  getInfoReporteAtrasos(codigo: number, fec_inicio: string, fec_final: string): Observable<any> {
    const params = new HttpParams()
      .set('codigo', codigo)
      .set('fec_inicio', fec_inicio.split('T')[0])
      .set('fec_final', fec_final.split('T')[0])
    return this.http.get<any>(`${this.api_url}/reportes/atrasos`, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  getInfoReporteHorasExtras(id_empleado: number, codigo: number, fec_inicio: any, fec_final: any): Observable<any> {
    const params = new HttpParams()
      .set('id_empleado', id_empleado)
      .set('codigo', codigo)
      .set('fec_inicio', fec_inicio.split('T')[0])
      .set('fec_final', fec_final.split('T')[0])
    return this.http.get<any>(`${this.api_url}/reportes/horas-extras`, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  getInfoReporteSolicitudesPendientes(codigo: number, fec_inicio: any, fec_final: any): Observable<any> {
    const params = new HttpParams()
      .set('codigo', codigo)
      .set('fec_inicio', fec_inicio)
      .set('fec_final', fec_final)
    return this.http.get<any>(`${this.api_url}/reportes/solicitud`, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  getInfoReporteVacaciones(codigo: number, fec_inicio: any, fec_final: any): Observable<any> {
    const params = new HttpParams()
      .set('codigo', codigo)
      .set('fec_inicio', fec_inicio)
      .set('fec_final', fec_final)
    return this.http.get<any>(`${this.api_url}/reportes/vacaciones`, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  getInfoReporteAlimentacion(codigo: number, fec_inicio : any, fec_final: any): Observable<any> {
    const params = new HttpParams()
      .set('codigo', codigo)
      .set('fec_inicio', fec_inicio)
      .set('fec_final', fec_final)
    return this.http.get<any>(`${this.api_url}/reportes/alimentacion`, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }


}
