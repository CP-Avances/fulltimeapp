import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';
import { HorarioE } from '../interfaces/Horarios';

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


  ObtenerHorariosEmpleado(codigo: number | string) {
    const params = new HttpParams()
      .set('codigo', codigo);
    return this.http.get<HorarioE[]>(`${this.apiUrl}/empleado/horarios`, { params })
      .pipe(
        tap(console.log)
      )
  }

  getHorariosEmpleadobyCodigo(datos){
    const params = new HttpParams()
      .set('codigo', datos.codigo)
      .set('fecha_inicio', datos.fecha)
    return this.http.get<HorarioE[]>(`${this.apiUrl}/empleado/horariosEmpleado`, { params })
      .pipe(
        tap(console.log)
      )
  }

  getPlanificacionHorariosEmplbyCodigo(codigo){
    const params = new HttpParams()
      .set('codigo', codigo)
    return this.http.get<HorarioE[]>(`${this.apiUrl}/empleado/planificacionHorarioEmplCodigo`, { params })
      .pipe(
        tap(console.log)
      )
  }

  BuscarPlanificacionHorarioEmple(datos: any){
    const params = new HttpParams()
      .set('fecha_inicio', datos.fecha_inicio)
      .set('fecha_final', datos.fecha_final)
      .set('codigo', datos.codigo);
    return this.http.get<HorarioE[]>(`${this.apiUrl}/empleado/horarioEmplefecha`, { params })
      .pipe(
        tap(console.log)
      )
  }

  ObtenerUnHorarioEmpleado(codigo: number | string, fecha_hoy: any) {
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

  // METODO PARA BUSCAR INFORMACION DEL USUARIO QUE APRUEBA SOLICITUDES
  InformarEmpleadoAutoriza(id_empleado: number) {
    return this.http.get(`${environment.url}/empleado/empleadoAutoriza/${id_empleado}`);
  }

  // METODO PARA BUSCAR HORARIO DEL USUARIO POR HORAS MISMO DIA (MD)
  BuscarComidaHorarioHorasMD(datos: any) {
    return this.http.post<any>(`${environment.url}/empleado/horario-comida-horas-mismo-dia/`, datos);
  }

  // METODO PARA BUSCAR HORARIO DEL USUARIO POR HORAS DIAS DIFERENTES (DD)
  BuscarComidaHorarioHorasDD(datos: any) {
    return this.http.post<any>(`${environment.url}/empleado/horario-comida-horas-dias-diferentes/`, datos);
  }

}
