import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CalcularTiempoPermisoPayload, SolicitudPermisoDetalle, TiempoPermisoEmpleado, TipoPermiso, VerificarPermisoVacacionesPayload } from '../interfaces/Permisos';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';



@Injectable({
  providedIn: 'root'
})
export class PermisosService {

  private apiUrl = environment.urlMultitenant;

  constructor(
    private http: HttpClient,
  ) {
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
