import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HoraExtra } from '../interfaces/HoraExtra';
import { catchError, tap } from 'rxjs/operators';


// SERVICIOS
import { StorageService } from './storage.service';
import { SocketService } from 'src/app/services/socket.service';

@Injectable({
  providedIn: 'root'
})
export class HorasExtrasService {

  private apiUrl = '';
  private socket: any;

  private handleError(error: any) {
    console.log('ERROR CAPTURADO: ', error);
    return throwError(error);
  }

  constructor(
    private http: HttpClient,
    private socketService: SocketService,
    private storageService: StorageService,
  ) {
    this.obtenerUrlEmpresa();
    this.socket = this.socketService.getSocket();
  }

  async obtenerUrlEmpresa() {
    this.apiUrl = await this.storageService.get('urlEmpresa');
  }

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

  // OBTIENE LOS REGISTROS DE SOLICITUDES DE HORAS EXTRAS
  getAllHorasExtras(): Observable<HoraExtra[]> {
    const url = `${this.apiUrl}/horasextras/all-horas-extras`;
    return this.http.get<HoraExtra[]>(url)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // OBTIENE LOS REGISTROS DE SOLICITUDES DE HORAS EXTRAS POR FECHAS
  getAllHorasExtrasByFechas(fec_inicio: string, fec_final: string): Observable<HoraExtra[]> {
    const url = `${this.apiUrl}/horasextras/rangofechas`;
    const params = new HttpParams()
      .set('fecha_inicio', fec_inicio)
      .set('fecha_final', fec_final)
    return this.http.get<HoraExtra[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // OBTIENE LOS REGISTROS DE SOLICITUDES DE HORAS EXTRAS POR CODIGO
  getListaHorasExtrasByCodigo(codigo: number | string): Observable<HoraExtra[]> {
    const url = `${this.apiUrl}/horas-extras-pedidas/horas-extras/lista-horas-extras`;
    const params = new HttpParams().set('codigo', codigo)
    return this.http.get<HoraExtra[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // OBTIENE LOS REGISTROS DE SOLICITUDES DE HORAS EXTRAS POR FECHAS Y CODIGO
  getlistaHorasExtrasByFechasyCodigo(fec_inicio: string, fec_final: string, codigo: number | string): Observable<HoraExtra[]> {
    const url = `${this.apiUrl}/horas-extras-pedidas/horas-extras/lista-horas-extrasfechas`;
    const params = new HttpParams()
      .set('fecha_inicio', fec_inicio)
      .set('fecha_final', fec_final)
      .set('codigo', codigo)
    return this.http.get<HoraExtra[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  getlistaHorasExtrasByFechasyCodigoEdit(fec_inicio: string, fec_final: string, codigo: number | string, id: number): Observable<HoraExtra[]> {
    const url = `${this.apiUrl}/horasextras/lista-horas-extrasfechasedit`;
    const params = new HttpParams()
      .set('fecha_inicio', fec_inicio)
      .set('fecha_final', fec_final)
      .set('codigo', codigo)
      .set('id', id)
    return this.http.get<HoraExtra[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // REGISTRA SOLICITUD DE HORAS EXTRAS
  postNuevaHorasExtras(datos: any): Observable<HoraExtra> {
    return this.http.post<any>(`${this.apiUrl}/horas-extras-pedidas`, datos);
  }

  // EDITA SOLICITUD DE HORAS EXTRAS
  putHoraExtra(hora_extra: HoraExtra): Observable<any> {
    const url = `${this.apiUrl}/horasextras/update-horas-extras`;
    return this.http.put<any>(url, hora_extra)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // SUBIR RESPALDOS DE HORAS EXTRAS
  SubirArchivoRespaldo(formData: any, id: number, nombre: string, archivo: any) {
    return this.http.put(`${this.apiUrl}/horas-extras-pedidas/${id}/documento-movil/${nombre}/archivo/${archivo}`, formData)
  }

  // ELIMINAR RESPALDOS DE HORAS EXTRAS
  EliminarArchivoRespaldo(documento: string) {
    return this.http.delete(`${this.apiUrl}/horas-extras-pedidas/eliminar-documento-movil/${documento}`,)
  }
}
