import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DatosGeneralesService {

  private readonly apiUrl = `${environment.urlMultitenant}/generalidades`;

  constructor(
    private http: HttpClient
  ) { }

  ObtenerInformacionGeneral(estado: any) {
    return this.http
      .get<{ ok: boolean; data: any[] }>(
        `${this.apiUrl}/informacion-data-general/${estado}`
      )
      .pipe(
        map(res => Array.isArray(res.data) ? res.data : [])
      );
  }

  ObtenerInformacionGeneralDep(estado: any) {
    return this.http
      .get<{ ok: boolean; data: any[] }>(
        `${this.apiUrl}/informacion-data-general-rol/${estado}`
      )
      .pipe(
        map(res => Array.isArray(res.data) ? res.data : [])
      );
  }

  ObtenerInformacionComunicados(estado: any) {
    return this.http
      .get<{ ok: boolean; data: any[] }>(
        `${this.apiUrl}/datos_generales_comunicados/${estado}`
      )
      .pipe(
        map(res => Array.isArray(res.data) ? res.data : [])
      );
  }

  ObtenerInformacionModulos(estado: any) {
    return this.http
      .get<{ ok: boolean; data: any[] }>(
        `${this.apiUrl}/datos_generales_modulos/${estado}`
      )
      .pipe(
        map(res => Array.isArray(res.data) ? res.data : [])
      );
  }

  ObtenerDatosActuales(idEmpleado: number) {
    return this.http
      .get<{ ok: boolean; data: any[] }>(
        `${this.apiUrl}/datos-actuales/${idEmpleado}`
      )
      .pipe(
        map(res => Array.isArray(res.data) ? res.data : [])
      );
  }

  ObtenerInformacionUbicacion(estado: any, ubicacion: any) {
    return this.http
      .post<{ ok: boolean; data: any[] }>(
        `${this.apiUrl}/informacion-general-ubicacion/${estado}`,
        ubicacion
      )
      .pipe(
        map(res => Array.isArray(res.data) ? res.data : [])
      );
  }

  ListarIdInformacionActual() {
    return this.http
      .get<{ ok: boolean; data: any[] }>(
        `${this.apiUrl}/info_actual_id`
      )
      .pipe(
        map(res => Array.isArray(res.data) ? res.data : [])
      );
  }

  ObtenerInformacionGeneralRegimen(estado: any) {
    return this.http
      .get<{ ok: boolean; data: any[] }>(
        `${this.apiUrl}/informacion-data-regimen/${estado}`
      )
      .pipe(
        map(res => Array.isArray(res.data) ? res.data : [])
      );
  }

}