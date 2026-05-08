import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { CalcularTiempoPermisoPayload, Permiso, SolicitudPermisoDetalle, TiempoPermisoEmpleado, TipoPermiso, VerificarPermisoVacacionesPayload } from '../interfaces/Permisos';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';


// SERVICIOS
import { StorageService } from './storage.service';
import { SocketService } from 'src/app/services/socket.service';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {

  private apiUrl = environment.urlMultitenant;
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
    this.socket = this.socketService.getSocket();
  }

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
    return this.http.post<any>(`${this.apiUrl}/empleadoPermiso`, datos);
  }

  // METODO PARA EDITAR SOLICITUD DE PERMISO
  putPermiso(id: number, datos: any) {
    return this.http.put<any>(`${this.apiUrl}/empleadoPermiso/${id}/permiso-solicitado`, datos);
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
    return this.http.post<any>(`${this.apiUrl}/empleadoPermiso/permisos-solicitados/movil`, datos);
  }
  // METODO PARA SUBIR ARCHIVOS DE PERMISOS
  SubirArchivoRespaldo(formData: any, id: number, codigo: any, archivo: any) {
    return this.http.put(`${this.apiUrl}/empleadoPermiso/${id}/archivo/${archivo}/validar/${codigo}`, formData)
  }
  // METODO PARA ELIMINAR ARCHIVOS DE PERMISOS
  EliminarArchivo(documento: string, codigo: any) {
    return this.http.delete(`${this.apiUrl}/empleadoPermiso/eliminar-movil/${documento}/validar/${codigo}`);
  }





  /*********************************************************************
  *
  * METODOS USADOS DE SERVIDOR MULTITENANT
  *
  **********************************************************************
  */

    // LISTAR TIPOS DE PERMISO
  listarTiposPermiso() {
    const url = `${this.apiUrl}/permisos`;

    return this.http.get<{ data: TipoPermiso[] }>(url).pipe(
      map(resp => resp.data)
    );
  }

  // VERIFICAR PERMISOS, SOBRE TODO CUANDO DESCUENTAN VACACIONES
  verificarPermisosDescontandoVacaciones(payload: VerificarPermisoVacacionesPayload) {
    const url = `${this.apiUrl}/permisos/verificar`;

    return this.http.post<any[]>(url, payload);
  }

  // CALCULAR TIEMPO DE PERMISO
  calcularTiempoPermiso(payload: CalcularTiempoPermisoPayload) {
    const url = `${this.apiUrl}/permisos/tiempo-permiso`;

    return this.http.post<TiempoPermisoEmpleado[]>(url, payload);
  }

  // REGISTRAR SOLICITUD DE PERMISO
  registrarPermiso(datos: any) {
    const url = `${this.apiUrl}/permisos/registrar`;

    return this.http.post<any>(url, datos);
  }

  // BUSCAR SOLICITUDES DE PERMISOS
  buscarSolicitudesPermisos(payload: any) {
    const url = `${this.apiUrl}/permisos/buscar-solicitudes`;

    return this.http.post<{ ok: boolean; data: any[] }>(url, payload);
  }

  // OBTENER SOLICITUD DE PERMISO POR ID
  obtenerSolicitudPermisoPorId(idSolicitud: number) {
    const url = `${this.apiUrl}/permisos/solicitud/${idSolicitud}`;

    return this.http.get<{ ok: boolean; data: SolicitudPermisoDetalle }>(url).pipe(
      map(resp => resp.data)
    );
  }

  // ACTUALIZAR SOLICITUD DE PERMISO
  actualizarSolicitudPermiso(id: number, datos: any) {
    const url = `${this.apiUrl}/permisos/solicitud/actualizar/${id}`;

    const body = {
      datos
    };

    return this.http.put<{ ok: boolean; data: any }>(url, body).pipe(
      map(resp => resp.data)
    );
  }

  // ELIMINAR SOLICITUD DE PERMISO
  eliminarSolicitudPermiso(id: number) {
    const url = `${this.apiUrl}/permisos/solicitud/eliminar/${id}`;

    return this.http.delete<{ ok: boolean; message: string }>(url);
  }

  // LEGALIZAR SOLICITUDES, POR SI LUEGO SE USA EN MÓVIL
  legalizarSolicitudes(payload: { solicitudes: { id: number; legalizado: boolean }[] }) {
    const url = `${this.apiUrl}/permisos/solicitud/legalizar`;

    return this.http.put<any>(url, payload);
  }


}
