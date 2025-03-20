import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { Notificacion, NotificacionTimbre, SettingsInfoEmpleado } from '../interfaces/Notificaciones';
import { Autorizacion } from '../interfaces/Autorizaciones';

// SERVICIOS
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})

export class AutorizacionesService {

  private apiUrl = '';

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
    this.apiUrl = await this.storageService.get('urlEmpresa');
  }

  private subscription: Subscription | null = null;
  // METODO PARA REALIZAR LA SUBSCRIPCION DE UN METODO
  setSubscription(subscription: Subscription) {
    this.subscription = subscription;
  }

  // METODO PARA REALIZAR LA DESUBSCRIBIR UN METODO
  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  /******************************************************
    *
    *        Notificaciones
    *
    *******************************************************
    */

  // METODO PARA OBTENER LAS NOTIFICACIONES
  getNotificacionesByIdEmpleado(id_empleado: string | number): Observable<Notificacion[]> {
    const url = `${this.apiUrl}/noti-real-time/all-noti`;
    const params = new HttpParams()
      .set('id_empleado', id_empleado)
    return this.http.get<Notificacion[]>(url, { params })
      .pipe(
        tap(console.log)
      )
  }

  // METODO PARA CREAR NOTIFICACIONES
  postNotificacion(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/noti-real-time`, datos);
  }

  /******************************************************
   *
   *        Notificaciones Timbres
   *
   *******************************************************
   */
  // METODO PARA OBTENER LAS NOTIFICACIONES TIMBRES
  getNotificacionesTimbreByIdEmpleado(id_empleado: string | number): Observable<NotificacionTimbre[]> {
    const url = `${this.apiUrl}/noti-real-time/noti-tim/all-noti`;
    const params = new HttpParams()
      .set('id_empleado', id_empleado)
    return this.http.get<Notificacion[]>(url, { params })
      .pipe(
        tap(console.log)
      )
  }


  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // METODOS QUE NO ESTAN EN FUNCIONAMIENTO, PERO ESTAN LLAMADOS EN EL CODIGO DE SOLICITUDES Y APROBACIONES //
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // METODO PARA OBTENER LAS NOTIFICACIONES TIMBRES
  postAvisosGenerales(notificacion: NotificacionTimbre): Observable<any> {
    const url = `${this.apiUrl}/notificaciones/noti-tim`;
    return this.http.post<any>(url, notificacion)
      .pipe(
        tap(console.log)
      )
  }

  getAutorizacionPermiso(id_permiso: number): Observable<Autorizacion> {
    const url = `${this.apiUrl}/autorizaciones/`;
    const params = new HttpParams()
      .set('id_auto', id_permiso)
      .set('campo', 'id_permiso')
    return this.http.get<Autorizacion>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  getAutorizacionVacacion(id_vacacion: number): Observable<Autorizacion> {
    const url = `${this.apiUrl}/autorizaciones/`;
    const params = new HttpParams()
      .set('id_auto', id_vacacion)
      .set('campo', 'id_vacacion')
    return this.http.get<Autorizacion>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  getAutorizacionHoraExtra(id_hora_extra: number): Observable<Autorizacion> {
    const url = `${this.apiUrl}/autorizaciones/`;
    const params = new HttpParams()
      .set('id_auto', id_hora_extra)
      .set('campo', 'id_hora_extra')
    return this.http.get<Autorizacion>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  putAutorizacionHoraExtra(id_hora_extra: number, data: any): Observable<Autorizacion> {
    const url = `${this.apiUrl}/autorizaciones/estado`;
    const params = new HttpParams()
      .set('id_auto', id_hora_extra)
      .set('campo', 'id_hora_extra')
    return this.http.put<Autorizacion>(url, data, { params })
      .pipe(
        tap(console.log),
      )
  }

  putAutorizacionVacacion(id_vacacion: number, data: any): Observable<Autorizacion> {
    const url = `${this.apiUrl}/autorizaciones/estado`;
    const params = new HttpParams()
      .set('id_auto', id_vacacion)
      .set('campo', 'id_vacacion')
    return this.http.put<Autorizacion>(url, data, { params })
      .pipe(
        tap(console.log),
      )
  }

  putAutorizacionPermiso(id_permiso: number, data: any): Observable<Autorizacion> {
    const url = `${this.apiUrl}/autorizaciones/estado`;
    const params = new HttpParams()
      .set('id_auto', id_permiso)
      .set('campo', 'id_permiso')
    return this.http.put<Autorizacion>(url, data, { params })
      .pipe(
        tap(console.log),
      )
  }

  postNuevaAutorizacion(data: Autorizacion): Observable<any> {
    return this.http.post(`${this.apiUrl}/autorizaciones`, data);
  }

  // METODO PARA BUSCAR USUARIO AUTORIZA
  BuscarAutoridadUsuarioDepa(id: any): Observable<Autorizacion> {
    const url = `${this.apiUrl}/autorizaciones/autorizaUsuarioDepa/${id}`;
    const params = new HttpParams()
      .set('id_empleado', id)
      .set('campo', 'id')
    return this.http.get<Autorizacion>(url, { params })
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  BuscarListaAutorizaDepa(id_depar: any) {
    return this.http.get(`${this.apiUrl}/autorizaciones/listaDepaAutoriza/${id_depar}`);
  }

  /******************************************************
   *
   *        BUSQUEDA DE JEFES DE DEPARTAMENTOS
   *
   *******************************************************
   */

  BuscarJefes(datos: any): Observable<any> {
    const url = `${this.apiUrl}/autorizaciones/buscar-jefes`;
    return this.http.post<any>(url, datos)
      .pipe(
        tap(console.log),
      )
  }


  /******************************************************
   *
   *        ENDPOINT PARA ENVIAR CORREOS ELECTRONICOS
   *
   *******************************************************
   */

  sendEmailsEmpleados(data: any): Observable<any> {
    const url = `${this.apiUrl}/notificaciones/send-email`;
    return this.http.post<any>(url, data)
      .pipe(
        tap(console.log)
      )
  }

  EnviarCorreoPermiso(id_empresa: number, data: any): Observable<any> {
    const url = `${this.apiUrl}/empleadoPermiso/mail-noti-permiso-movil/${id_empresa}`;
    return this.http.post<any>(url, data)
      .pipe(
        tap(console.log)
      )
  }

  EnviarCorreoVacacion(id_empresa: number, data: any): Observable<any> {
    const url = `${this.apiUrl}/vacaciones/mail-noti-vacacion-movil/${id_empresa}`;
    return this.http.post<any>(url, data)
      .pipe(
        tap(console.log)
      )
  }

  EnviarCorreoHoraExtra(id_empresa: number, data: any): Observable<any> {
    const url = `${this.apiUrl}/horas-extras-pedidas/mail-noti-horas-extras-movil/${id_empresa}`;
    return this.http.post<any>(url, data)
      .pipe(
        tap(console.log)
      )
  }

  EnviarCorreoSolAlimentacion(id_empresa: number, data: any): Observable<any> {
    const url = `${this.apiUrl}/planComidas/mail-noti-solicitud-comida-movil/${id_empresa}`;
    return this.http.post<any>(url, data)
      .pipe(
        tap(console.log)
      )
  }

  /******************************************************
   *
   *        Endpoint para CAMBIAR ESTADOS DE SOLICITUDES
   *
   *******************************************************
   */

  updateEstadoSolicitudes(data: any, nameTable: string): Observable<any> {
    const url = `${this.apiUrl}/autorizaciones/solicitud`;
    const params = new HttpParams()
      .set('nameTable', nameTable)
    return this.http.put<any>(url, data, { params })
      .pipe(
        tap(console.log)
      )
  }

  /******************************************************
   *
   *        Informacion extra para las notificaciones
   *
   *******************************************************
   */

  // METODO PARA OBTENER LA INFORMACION GENERAL DEL EMPLEADO POR SU CODIGO
  getInfoEmpleadoByCodigo(codigo: string | number): Observable<SettingsInfoEmpleado> {
    const url = `${this.apiUrl}/noti-real-time/info-empl-recieve`;
    const params = new HttpParams()
      .set('codigo', codigo)
    return this.http.get<SettingsInfoEmpleado>(url, { params })
      .pipe(
        tap(console.log)
      )
  }

  getInfoEmpleadoByIdEmpleado(id_empleado: string | number): Observable<SettingsInfoEmpleado> {
    const url = `${this.apiUrl}/notificaciones/id-info-empl`;
    const params = new HttpParams()
      .set('id_empleado', id_empleado)
    return this.http.get<SettingsInfoEmpleado>(url, { params })
      .pipe(
        tap(console.log)
      )
  }



}
