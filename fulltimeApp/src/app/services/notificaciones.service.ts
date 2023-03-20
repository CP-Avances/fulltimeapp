import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  private apiUrl = environment.url;

  private recursoURL = 'http://192.168.0.193:3001';
  //private recursoURL = 'http://186.4.226.49:3001';


  constructor(
    private http: HttpClient,
    //public socket: Socket,
  ) 
  {}

  // realtime
  RecibirNuevosAvisos(data: any) {
    //console.log('Socket emite',this.socket.emit('nuevo_aviso', data));
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

  BuscarDatosGenerales() {
    const estado = 1; // 1 = activo 
    return this.http.get<any>(`${this.apiUrl}/notificaciones/datos_generales/${estado}`);
  }

  PutNotificaVisto(datos: any) {
    return this.http.put<any>(`${this.apiUrl}/notificaciones/notifica_visto/`, datos);
  }

  PutNotifiTimbreVisto(datos: any) {
    return this.http.put<any>(`${this.apiUrl}/notificaciones/notifiTimbre_visto/`, datos);
  }

  // ALERTAS DE NOTIFICACIÓN DE SOLICITUD DE SERVICIO DE ALIMENTACIÓN
  EnviarMensajePlanComida(data: any) {
    return this.http.post<any>(`${this.apiUrl}/notificaciones/send/comida/`, data);
  }

  // ALERTAS DE NOTIFICACIÓN DE COMUNICADOS
  EnviarMensajeComunicado(data: any) {
    return this.http.post<any>(`${environment.url}/notificaciones/noti-comunicado-movil/`, data);
  }

}
