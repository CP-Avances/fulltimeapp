import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// SERVICIOS
import { StorageService } from './storage.service';
import { SocketService } from 'src/app/services/socket.service';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  private apiUrl = '';
  private socket: any;

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

  // METODO PARA RECEPCION Y EMISION DE AVISOS
  RecibirNuevosAvisos(data: any) {
    this.socket.emit('nuevo_aviso', data);
  }

  /** ************************************************************************************ **
   ** **                 MÉTODOS DE CONSULTA DE DATOS DE COMUNICADOS                    ** **
   ** ************************************************************************************ **/

  EnviarCorreoComunicado( datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/noti-real-time/mail-comunicado`, datos);
  }

  // METODO PARA BUSCAR LOS EMPLEADOS CON SU INFORMACION GENERAL
  BuscarDatosGenerales() {
    const estado = 1;
    return this.http.get<any>(`${this.apiUrl}/generalidades/datos_generales_comunicados/${estado}`);
  }

  // METODOS PARA MARCAR EN VISTO LA NOTIFICACIONES
  PutNotificaVisto(id_realtime: number, data: any) {
    return this.http.put(`${this.apiUrl}/noti-real-time/vista/${id_realtime}`, data);
  }

  PutNotifiTimbreVisto(id_noti_timbre: number, datos: any) {
    return this.http.put(`${this.apiUrl}/timbres/noti-timbres/vista/${id_noti_timbre}`, datos);
  }

  // ALERTAS DE NOTIFICACIÓN DE SOLICITUD DE SERVICIO DE ALIMENTACIÓN
  EnviarMensajePlanComida(data: any) {
    return this.http.post<any>(`${this.apiUrl}/notificaciones/send/comida/`, data);
  }

  // ALERTAS DE NOTIFICACIÓN DE COMUNICADOS
  EnviarMensajeComunicado(data: any) {
    return this.http.post<any>(`${this.apiUrl}/noti-real-time/noti-comunicado-movil/`, data);
  }
  // ALERTAS DE NOTIFICACIÓN DE COMUNICADOS -MULTIPLES
  EnviarMensajeGeneralMultiple(data: any) {
    return this.http.post<any>(`${this.apiUrl}/noti-real-time/noti-comunicado-multiplador-movil/`, data);
  }

  /** ************************************************************************************ **
   ** **                   MÉTODOS PARA ENVIO DE CORREOS MULTIPLES                      ** **
   ** ************************************************************************************ **/
  // METODO PARA ENVIO DE CORREO MULTIPLE
  EnviarCorreoMultiple(datos: any) {
    console.log('datos  11: ', datos);
    return this.http.post<any>(`${this.apiUrl}/noti-real-time/mail-multiple-movil`, datos)
  }

  // METODO DE BUSQUEDA DE CONFIGURACION DE RECEPCION DE NOTIFICACIONES
  ObtenerConfiguracionEmpleado(id_empleado: number) {
    return this.http.get<any>(`${this.apiUrl}/notificaciones/config/${id_empleado}`);
  }

}
