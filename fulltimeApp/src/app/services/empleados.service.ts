import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { HorarioE } from '../interfaces/Horarios';
import { Observable } from 'rxjs';

// SERVICIOS
import { StorageService } from './storage.service';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})
export class EmpleadosService {

  private apiUrl = '';

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private urlService: UrlService,
  ) {
    this.urlService.getUrl().subscribe(url => {
      if (url) this.apiUrl = url; // Se actualiza automáticamente cuando cambia la URL
    });
    this.obtenerUrlEmpresa();
  }

  async obtenerUrlEmpresa() {
    this.apiUrl = await this.storageService.get('urlEmpresa');
    console.log('URL Empresa service empleados: ', this.apiUrl);
  }

  // METODO PARA LEER LA LISTA DE EMPLEADOS
  ObtenerListaEmpleados() {
    return this.http.get<any>(`${this.apiUrl}/empleado/todosempleados/lista`)
  }

  // BUSCAR UN REGISTRO DE USUARIO  --**VERIFICADO
  BuscarUnEmpleado(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/empleado/${id}`);
  }

  // METODO PARA OBTENER EL HORARIO DE EMPLEADO SEGUN SU CODIGO
  getHorariosEmpleadobyCodigo(datos) {
    const params = new HttpParams()
      .set('codigo', datos.codigo)
      .set('fecha_inicio', datos.fecha)
    return this.http.get<HorarioE[]>(`${this.apiUrl}/empleado/horarios/horariosEmpleado`, { params })
      .pipe(
        tap(console.log)
      )
  }

  // METODO PARA OBTENER LA PLANIFICACION HORARIA DEL EMPLEADO POR CODIGO
  getPlanificacionHorariosEmplbyCodigo(codigo) {
    const params = new HttpParams()
      .set('codigo', codigo)
    return this.http.get<HorarioE[]>(`${this.apiUrl}/empleado/horariosempleado/planificacionHorarioEmplCodigo`, { params })
      .pipe(
        tap(console.log)
      )
  }
  // METODO PARA OBTENER LA PLANIFICACION HORARIA
  BuscarPlanificacionHorarioEmple(datos: any) {
    return this.http.post<any>(`${this.apiUrl}/planificacion_general/horario-general-planificacion`, datos);
  }
  // METODO PARA OBTENER EL HORARIO DEL EMPLEADO
  ObtenerUnHorarioEmpleado(codigo: number | string, fecha_hoy: any) {
    const params = new HttpParams()
      .set('codigo', codigo)
      .set('fecha_hoy', fecha_hoy.split(' ')[0]);
    return this.http.get<HorarioE>(`${this.apiUrl}/empleado/un-horario`, { params })
      .pipe(
        tap(console.log)
      )
  }

  // METODO PARA OBTENER LA UBICACION REGISTRADA DEL EMPLEADO
  ObtenerUbicacion(id: any) {
    return this.http.get<any>(`${this.apiUrl}/empleado/ubicacion/${id}`);
  }

  // METODO PARA BUSCAR INFORMACION DEL USUARIO QUE APRUEBA SOLICITUDES
  InformarEmpleadoAutoriza(id_empleado: number) {
    return this.http.get(`${this.apiUrl}/empleado/empleadoAutoriza/${id_empleado}`);
  }

  // METODO PARA BUSCAR HORARIO DEL USUARIO POR HORAS MISMO DIA (MD)
  BuscarComidaHorarioHorasMD(datos: any) {
    return this.http.post<any>(`${this.apiUrl}/empleado/horario-comida-horas-mismo-dia/`, datos);
  }

  // METODO PARA BUSCAR HORARIO DEL USUARIO POR HORAS DIAS DIFERENTES (DD)
  BuscarComidaHorarioHorasDD(datos: any) {
    return this.http.post<any>(`${this.apiUrl}/empleado/horario-comida-horas-dias-diferentes/`, datos);
  }

  // METODO PARA MOSTRAR IMAGEN DEL EMPLEADO
  ObtenerImagen(id: any, imagen: any) {
    return this.http.get<any>(`${this.apiUrl}/empleado/img/codificado/${id}/${imagen}`)
  }

  // BUSCAR DATOS DE UN HORARIO    **USADO
  BuscarUnHorario(id: number) {
    return this.http.get(`${this.apiUrl}/horario/${id}`);
  }

  // METODO PARA VERIFICAR SI EL USUARIO TIENE HABILIOTADA LA APLICACION MOVIL
  accesoMovil(id_epleado: any) {
    return this.http.get<any>(`${this.apiUrl}/usuarios/movil/acceso/activo/${id_epleado}`);
  }
}
