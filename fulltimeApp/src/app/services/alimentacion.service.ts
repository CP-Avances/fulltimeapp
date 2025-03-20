import { Injectable } from '@angular/core';
import { throwError, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Alimentacion } from '../interfaces/Alimentacion';
import { tap, catchError } from 'rxjs/operators';

// SERVICIOS
import { StorageService } from './storage.service';
import { SocketService } from 'src/app/services/socket.service';

@Injectable({
  providedIn: 'root'
})
export class AlimentacionService {

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

  // METODO PARA ENVIAR NOTIFICACIONES MEDIANTE SOCKET
  sendNotiRealTime(data: any) {
    this.socket.emit('nuevo_aviso', data);
  }

  /*********************************************************************
   *
   *            Metodos para conexion a la RUTA DE ALIMENTACION
   *
   **********************************************************************
   */

  // OBTIENE LOS REGISTROS DE SOLICITUDES DE ALIMENTACION
  getAllAlimentacion(): Observable<Alimentacion[]> {
    const url = `${this.apiUrl}/alimentacion/all-alimento`;
    return this.http.get<Alimentacion[]>(url)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // OBTIENE LOS REGISTROS DE SOLICITUDES DE ALIMENTACION POR FECHAS
  getAllAlimentacionByFechas(fec_inicio: string, fec_final: string): Observable<Alimentacion[]> {
    console.log("rango fechas: ", fec_inicio, " --- ", fec_final);
    const url = `${this.apiUrl}/alimentacion/rangofechas`;
    const params = new HttpParams()
      .set('fec_inicio', fec_inicio)
      .set('fec_final', fec_final)
    return this.http.get<Alimentacion[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // OBTIENE LOS REGISTROS DE SOLICITUDES DE ALIMENTACION POR EL ID DEL EMPLEADO
  getListaAlimentacionByIdEmpleado(idEmpleado: number | string): Observable<Alimentacion[]> {
    const url = `${this.apiUrl}/alimentacion/lista-alimento`;
    const params = new HttpParams().set('idEmpleado', idEmpleado)
    return this.http.get<Alimentacion[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // OBTIENE LOS REGISTROS DE SOLICITUDES DE ALIMENTACION POR EL ID DEL EMPLEADO Y POR FECHAS
  getlistaAlimentacionByFechasyCodigo(fec_comida: string, idEmpleado: number | string): Observable<Alimentacion[]> {
    const url = `${this.apiUrl}/alimentacion/lista-alimentacionfechas`;
    const params = new HttpParams()
      .set('fec_comida', fec_comida)
      .set('id_empleado', idEmpleado)
    return this.http.get<Alimentacion[]>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // REGISTRA UNA NUEVA SOLICITUD DE ALIMENTACION
  postNuevoAlimentacion(alimentacion: Alimentacion): Observable<Alimentacion> {

    const cdepar: any = localStorage.getItem('cdepar');
    const url = `${this.apiUrl}/alimentacion/insert-alimento`;
    const params = new HttpParams()
      .set('id_departamento', cdepar)
    return this.http.post<Alimentacion>(url, alimentacion, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  // EDITA UNA SOLICITUD DE ALIMENTACION
  putAlimentacion(alimentacion: Alimentacion): Observable<Alimentacion> {
    const url = `${this.apiUrl}/alimentacion/update-alimento`;
    return this.http.put<Alimentacion>(url, alimentacion)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

    // EDITA EL ESTADO DE LA SOLICITUD DE ALIMENTACION
  putEstadoAlimentacion(alimentacion: Alimentacion): Observable<Alimentacion> {
    const data = {
      id: alimentacion.id,
      id_empleado: alimentacion.id_empleado,
      aprobada: alimentacion.aprobada
    }
    const url = `${this.apiUrl}/alimentacion/update-estado-alimento`;
    return this.http.put<Alimentacion>(url, data)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

}
