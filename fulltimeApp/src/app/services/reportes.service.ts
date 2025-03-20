import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

// SERVICIOS
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private api_url = '';

  private handleError(error: any) {
    console.log('ERROR CAPTURADO: ', error);
    return throwError(error);
  }

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {
    this.obtenerUrlEmpresa();
  }

  async obtenerUrlEmpresa() {
    this.api_url = await this.storageService.get('urlEmpresa');
  }

  // METODO PARA CONSULTAR LISTA DE TIMBRES DEL USUARIO
  ReporteTimbresMultiple(data: any, desde: string, hasta: string) {
    return this.http.post<any>(`${this.api_url}/reportes-asistencias/timbres/${desde}/${hasta}`, data);
  }

  // METODO PARA CONSULTAR LISTA DE TIMBRES CON NOVEDAD
  getInfoReporteTimbresNovedad(data: any, desde: string, hasta: string) {
    return this.http.post<any>(`${this.api_url}/reporte/timbresConNovedad/${desde}/${hasta}`, data);
  }

  // METODO PARA OBTENER LOS REGISTROS DE FALTAS
  BuscarFaltas(data: any, inicio: string, fin: string) {
    return this.http.post<any>(`${this.api_url}/reporte-faltas/faltas/${inicio}/${fin}`, data);
  }

  // METODO PARA OBTENER LOS REGISTROS DE ATRASOS
  BuscarAtrasos(data: any, desde: string, hasta: string) {
    return this.http.post<any>(`${this.api_url}/reporte-atrasos/atrasos-empleados/${desde}/${hasta}`, data);
  }

  // METODO PARA OBTENER EL TOTAL DE REGISTROS
  SumarRegistros(array: any[]) {
    let valor = 0;
    for (let i = 0; i < array.length; i++) {
      valor = valor + array[i];
    }
    return valor;
  }


  // METODO PARA OBTENER LOS REGISTROS DE HORAS EXTRAS
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

  // METODO PARA OBTENER LOS REGISTROS DE SOLICICTUDES PENDIENTES
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

  // METODO PARA OBTENER LOS REGISTROS DE VACACIONES
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

  // METODO PARA OBTENER LOS REGISTROS DE ALIMENTACION
  getInfoReporteAlimentacion(codigo: number, fec_inicio: any, fec_final: any): Observable<any> {
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



  private _valueTimbreDispositivo: Boolean = false;

  get mostrarTimbreDispositivo() { return this._valueTimbreDispositivo }

}
