import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export type ModuloAprobacion = 'PERMISO' | 'VACACION';
export type DecisionAprobacion = 'APRUEBA' | 'RECHAZA';

export interface ValidarAccionesSolicitudRequest {
  modulo: ModuloAprobacion;
  id_solicitud_modulo: number;
}

export interface ValidarAccionesSolicitudResponse {
  modulo?: ModuloAprobacion;
  id_solicitud_modulo?: number;
  id_empleado_logueado?: number;
  id_flujo?: number;
  paso_actual?: any;
  acciones: {
    puede_preautorizar: boolean;
    puede_autorizar: boolean;
    puede_negar: boolean;
    puede_editar?: boolean;
    puede_eliminar?: boolean;
  };
  mensaje?: string;
}

export interface EjecutarAccionSolicitudRequest {
  modulo: ModuloAprobacion;
  id_solicitud_modulo: number;
  decision: DecisionAprobacion;
  observacion?: string;
  verificarProgramacion?: boolean;
}

export interface EjecutarAccionSolicitudResponse {
  estado_final?: string;
  mensaje?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AprobacionesService {

  private readonly apiUrl = `${environment.urlMultitenant}/aprobaciones-flujos`;

  constructor(
    private http: HttpClient
  ) { }

  ObtenerScopeFiltrosPermisos() {
    return this.http
      .get<{ ok: boolean; data: { idsDepartamentoAprobables: number[] } }>(
        `${this.apiUrl}/scope-filtros-permisos`
      )
      .pipe(
        map(res => res?.data ?? { idsDepartamentoAprobables: [] })
      );
  }

  ObtenerScopeFiltrosVacaciones() {
    return this.http
      .get<{ ok: boolean; data: { idsDepartamentoAprobables: number[] } }>(
        `${this.apiUrl}/scope-filtros-vacaciones`
      )
      .pipe(
        map(res => res?.data ?? { idsDepartamentoAprobables: [] })
      );
  }

  ValidarAccionesSolicitud(payload: ValidarAccionesSolicitudRequest) {
    return this.http
      .post<{ ok: boolean; data: ValidarAccionesSolicitudResponse }>(
        `${this.apiUrl}/validar-acciones`,
        payload
      )
      .pipe(
        map(res => res?.data ?? {
          acciones: {
            puede_preautorizar: false,
            puede_autorizar: false,
            puede_negar: false,
            puede_editar: false,
            puede_eliminar: false
          }
        })
      );
  }

  EjecutarAccionSolicitud(payload: EjecutarAccionSolicitudRequest) {
    return this.http
      .post<{ ok: boolean; data: EjecutarAccionSolicitudResponse }>(
        `${this.apiUrl}/ejecutar-accion`,
        payload
      )
      .pipe(
        map(res => res?.data ?? {})
      );
  }

  ListarHistorialSolicitud(modulo: ModuloAprobacion, idSolicitudModulo: number) {
    const params: any = {
      modulo,
      id_solicitud_modulo: idSolicitudModulo
    };

    return this.http
      .get<{ ok: boolean; data: any[] }>(
        `${this.apiUrl}/historial`,
        { params }
      )
      .pipe(
        map(res => Array.isArray(res?.data) ? res.data : [])
      );
  }

  ListarFlujosDepartamento(idDepartamentoOrigen: number) {
    return this.http
      .get<{ ok: boolean; data: any[] }>(
        `${this.apiUrl}/flujos/departamento/${idDepartamentoOrigen}`
      )
      .pipe(
        map(res => Array.isArray(res?.data) ? res.data : [])
      );
  }

  ObtenerDetalleFlujo(idFlujo: number) {
    return this.http
      .get<{ ok: boolean; data: any }>(
        `${this.apiUrl}/flujos/${idFlujo}`
      )
      .pipe(
        map(res => res?.data ?? null)
      );
  }

}