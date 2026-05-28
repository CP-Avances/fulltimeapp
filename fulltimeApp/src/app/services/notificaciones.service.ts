import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

// SERVICIOS
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class NotificacionesService {

  private readonly apiUrlM = `${environment.urlMultitenant}`;

  constructor(
    private http: HttpClient,
  ) {
  }



  /** ************************************************************************************ **
   ** **                 MÉTODOS DE CONSULTA DE DATOS DE COMUNICADOS                    ** **
   ** ************************************************************************************ **/

  EnviarCorreoComunicado(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrlM}/api/notificacion-general/mail-comunicado`, datos);
  }

  // METODO PARA BUSCAR LOS EMPLEADOS CON SU INFORMACION GENERAL
  BuscarDatosGeneralesComunicados() {
    const estado = 1;
    return this.http.get<any>(`${this.apiUrlM}/generalidades/datos_generales_comunicados/${estado}`)
      .pipe(map(res => res.data));
  }

  // METODO PARA BUSCAR LOS EMPLEADOS CON SU INFORMACION GENERAL
  BuscarDatosGeneralesInfo() {
    const estado = 1;
    return this.http.get<any>(`${this.apiUrlM}/generalidades/informacion-data-general/${estado}`)
      .pipe(map(res => res.data));
  }

  // METODOS PARA MARCAR EN VISTO LA NOTIFICACIONES
  PutNotificaVisto(data: any) {
    return this.http.put(`${this.apiUrlM}/api/avisos-generales/actualizar-notificacion-vista`, data);
  }

  PutNotifiTimbreVisto(datos: any) {
    return this.http.put(`${this.apiUrlM}/api/avisos-generales/actualizar-vista`, datos);
  }

  // ALERTAS DE NOTIFICACIÓN DE COMUNICADOS -MULTIPLES
  EnviarMensajeGeneralMultiple(data: any) {
    return this.http.post<any>(`${this.apiUrlM}/api/avisos-generales/aviso-comunicado-multiple`, data);
  }


  // METODO DE CONSULTA DE AVISOS GENERALES   **USADO**
  BuscarAvisosGenerales(id_empleado: number) {
    return this.http.get<any>(`${this.apiUrlM}/api/avisos-generales/colaborador/${id_empleado}`)
      .pipe(map(res => res.data));
  }

  // METODO PARA BUSCAR NOTIFICACIONES - MODULOS RECIBIDAS POR UN USUARIO    **USADO**
  ObtenerNotasUsuario(id_empleado: number) {
    return this.http.get<any>(`${this.apiUrlM}/api/avisos-generales/listar-limite-notificaciones/${id_empleado}`)
      .pipe(map(res => res.data));
  }

  // CORREO - PERMISO LEGALIZACION MULTIPLE
  EnviarCorreoPermisoLegalizacionMultiple(datos: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlM}/api/notificacion-general/mail-permiso-legalizacion-multiple`,
      datos
    );
  }

  // NOTIFICACION INTERNA - PERMISO LEGALIZACION MULTIPLE
  EnviarNotificacionPermisoLegalizacionMultiple(data: any) {
    return this.http.post<any>(
      `${this.apiUrlM}/api/avisos-generales/aviso-permiso-legalizacion-multiple`,
      data
    ).pipe(map(res => res.data));
  }

}
