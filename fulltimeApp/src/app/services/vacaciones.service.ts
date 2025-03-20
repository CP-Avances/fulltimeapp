import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Vacacion } from '../interfaces/Vacacion';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';

// SERVICIOS
import { StorageService } from './storage.service';
import { SocketService } from 'src/app/services/socket.service';

@Injectable({
  providedIn: 'root'
})
export class VacacionesService {

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
  }

  async obtenerUrlEmpresa() {
    this.apiUrl = await this.storageService.get('urlEmpresa');
    this.socket = this.socketService.getSocket();
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

}
