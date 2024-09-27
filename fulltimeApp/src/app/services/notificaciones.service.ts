import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Socket } from 'ngx-socket-io';


@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  private apiUrl = environment.url;
  private recursoURL = 'http://192.168.0.127:3001';
  constructor(
    private http: HttpClient,
    public socket: Socket,
  ) { }

  // METODO PARA RECEPCION Y EMISION DE AVISOS
  RecibirNuevosAvisos(data: any) {
    console.log('Socket emite', this.socket.emit('nuevo_aviso', data));
    this.socket.emit('nuevo_aviso', data);
  }

  /** ************************************************************************************ **
   ** **                 MÉTODOS DE CONSULTA DE DATOS DE COMUNICADOS                    ** ** 
   ** ************************************************************************************ **/

  EnviarCorreoComunicado(id_empresa: number, datos: any): Observable<any> {
    const path = `${this.recursoURL}/noti-real-time/mail-comunicado-movil/${id_empresa}`;
    return this.http.post<any>(path, datos)
      .pipe(
        tap(console.log)
      );
  }

  // METODO PARA BUSCAR LOS EMPLEADOS CON SU INFORMACION GENERAL
  BuscarDatosGenerales() {
    const estado = 1; 
    return this.http.get<any>(`${this.apiUrl}/generalidades/informacion-data-general/${estado}`);
  }

  // METODOS PARA MARCAR EN VISTO LA NOTIFICACIONES
  PutNotificaVisto(id_realtime: number, data: any) {
    return this.http.put(`${environment.url}/noti-real-time/vista/${id_realtime}`, data);
  }

  PutNotifiTimbreVisto(id_noti_timbre: number, datos: any) {
    return this.http.put(`${environment.url}/timbres/noti-timbres/vista/${id_noti_timbre}`, datos);
  }

  // ALERTAS DE NOTIFICACIÓN DE SOLICITUD DE SERVICIO DE ALIMENTACIÓN
  EnviarMensajePlanComida(data: any) {
    return this.http.post<any>(`${this.apiUrl}/notificaciones/send/comida/`, data);
  }

  // ALERTAS DE NOTIFICACIÓN DE COMUNICADOS
  EnviarMensajeComunicado(data: any) {
    return this.http.post<any>(`${this.apiUrl}/noti-real-time/noti-comunicado-movil/`, data);
  }

  /** ************************************************************************************ **
   ** **                   MÉTODOS PARA ENVIO DE CORREOS MULTIPLES                      ** ** 
   ** ************************************************************************************ **/
  // METODO PARA ENVIO DE CORREO MULTIPLE
  EnviarCorreoMultiple(datos: any) {
    console.log('datos  11: ', datos);
    return this.http.post<any>(`${this.recursoURL}/noti-real-time/mail-multiple-movil`, datos)
  }

  // METODO DE BUSQUEDA DE CONFIGURACION DE RECEPCION DE NOTIFICACIONES
  ObtenerConfiguracionEmpleado(id_empleado: number) {
    return this.http.get<any>(`${environment.url}/notificaciones/config/${id_empleado}`);
  }

}
