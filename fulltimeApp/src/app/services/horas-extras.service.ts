import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HoraExtra } from '../interfaces/HoraExtra';
import { catchError, tap } from 'rxjs/operators';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class HorasExtrasService {

  private apiUrl = environment.url;
  private recursoURL = 'http://192.168.0.193:3001';
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

  // Noti_realtime aprobar
  sendNotiRealTimeAprobar(data: any) {
    this.socket.emit('nuevo_aviso', data);
  }

  /*********************************************************************
 * 
 *            Metodos para conexion a la RUTA DE Horas Extras
 * 
 **********************************************************************  
 */

  getAllHorasExtras(): Observable<HoraExtra[]> {
    const url = `${this.apiUrl}/horasextras/all-horas-extras`;
    return this.http.get<HoraExtra[]>(url)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  getAllHorasExtrasByFechas(fec_inicio: string, fec_final: string): Observable<HoraExtra[]> {
    const url = `${this.apiUrl}/horasextras/rangofechas`;
    const params = new HttpParams()
      .set('fec_inicio', fec_inicio)
      .set('fec_final', fec_final)
    return this.http.get<HoraExtra[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  getListaHorasExtrasByCodigo(codigo: number | string): Observable<HoraExtra[]> {
    const url = `${this.apiUrl}/horasextras/lista-horas-extras`;
    const params = new HttpParams().set('codigo', codigo)
    return this.http.get<HoraExtra[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  getlistaHorasExtrasByFechasyCodigo(fec_inicio: string, fec_final: string, codigo: number | string): Observable <HoraExtra[]>{
    const url = `${this.apiUrl}/horasextras/lista-horas-extrasfechas`;
    const params = new HttpParams()
      .set('fec_inicio', fec_inicio)
      .set('fec_final', fec_final)
      .set('codigo', codigo)
    return this.http.get<HoraExtra[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  postNuevaHorasExtras(hora_extra: HoraExtra): Observable<HoraExtra> {

    const cdepar: any = localStorage.getItem('cdepar');
    const url = `${this.apiUrl}/horasextras/insert-horas-extras`;
    const params = new HttpParams()
      .set('id_departamento', cdepar)
    return this.http.post<HoraExtra>(url, hora_extra, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  putHoraExtra(hora_extra: HoraExtra): Observable<any> {

    const url = `${this.apiUrl}/horasextras/update-horas-extras`;
    return this.http.put<any>(url, hora_extra)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // SUBIR RESPALDOS DE HORAS EXTRAS
  SubirArchivoRespaldo(formData: any, id: number, nombre: string) {
    return this.http.put(`${this.recursoURL}/horas-extras-pedidas/${id}/documento-movil/${nombre}`, formData)
  }

  // ELIMINAR RESPALDOS DE HORAS EXTRAS
  EliminarArchivoRespaldo(documento: string) {
    return this.http.delete(`${this.recursoURL}/horas-extras-pedidas/eliminar-documento-movil/${documento}`,)
  }
}
