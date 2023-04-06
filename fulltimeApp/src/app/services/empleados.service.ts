import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';
import { HorarioE } from '../interfaces/Horarios';
import moment from 'moment';
moment.locale('es');

@Injectable({
  providedIn: 'root'
})
export class EmpleadosService {

  private apiUrl = environment.url

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Obtiene lista de empleados activos e inactivos.
   * Campos q trae { id, fullname, codigo, cedula}
   */
  ObtenerListaEmpleados() {
    return this.http.get<any>(`${this.apiUrl}/empleado/lista`)
  }


  ObtenerHorariosEmpleado(codigo: number) {
    const params = new HttpParams()
      .set('codigo', codigo);
    return this.http.get<HorarioE[]>(`${this.apiUrl}/empleado/horarios`, { params })
      .pipe(
        tap(console.log)
      )
  }

  ObtenerUnHorarioEmpleado(codigo: number, fecha_hoy: any) {
    const params = new HttpParams()
      .set('codigo', codigo)
      .set('fecha_hoy', fecha_hoy.split(' ')[0]);
    return this.http.get<HorarioE>(`${this.apiUrl}/empleado/un-horario`, { params })
      .pipe(
        tap(console.log)
      )
  }

  ObtenerUbicacion(codigo: number) {
    return this.http.get<any>(this.apiUrl + '/empleado/ubicacion/' + codigo);
  }

}
