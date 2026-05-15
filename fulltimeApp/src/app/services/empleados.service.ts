import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { HorarioE } from '../interfaces/Horarios';

// SERVICIOS
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class EmpleadosService {

  private readonly apiUrlM = `${environment.urlMultitenant}`;

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA LEER LA LISTA DE EMPLEADOS
  ObtenerListaEmpleados(estado: number) {
    return this.http.get<any>(`${this.apiUrlM}/generalidades/todosempleados/lista/${estado}`)
  }

  // METODO PARA OBTENER EL HORARIO DE EMPLEADO SEGUN SU CODIGO
  getHorariosEmpleadobyCodigo(datos) {
    const params = new HttpParams()
      .set('codigo', datos.codigo)
      .set('fecha_inicio', datos.fecha)
    return this.http.get<HorarioE[]>(`${this.apiUrlM}/planificacion_general/horarios/horariosEmpleado`, { params })
      .pipe(
        tap(console.log)
      )
  }

  // METODO PARA OBTENER LA PLANIFICACION HORARIA DEL EMPLEADO POR CODIGO
  getPlanificacionHorariosEmplbyCodigo(codigo) {
    const params = new HttpParams()
      .set('codigo', codigo)
    return this.http.get<HorarioE[]>(`${this.apiUrlM}/planificacion_general/horariosempleado/planificacionHorarioEmplCodigo`, { params })
      .pipe(
        tap(console.log)
      )
  }

  // METODO PARA OBTENER LA UBICACION REGISTRADA DEL EMPLEADO
  ObtenerUbicacion(id: any) {
    return this.http.get<any>(`${this.apiUrlM}/empleado/ubicacion/${id}`);
  }

  // METODO PARA MOSTRAR IMAGEN DEL EMPLEADO
  ObtenerImagen(id: any) {
    return this.http.get<any>(`${this.apiUrlM}/empleado/img/codificado/${id}`)
      .pipe(map(res => res.data));
  }

  // BUSCAR DATOS DE UN HORARIO    **USADO
  BuscarUnHorario(id: number) {
    return this.http.get<any>(`${this.apiUrlM}/horario/${id}`);
  }

  // METODO PARA VERIFICAR SI EL USUARIO TIENE HABILIOTADA LA APLICACION MOVIL
  accesoMovil(id_epleado: any) {
    return this.http.get<any>(`${this.apiUrlM}/usuarios/datos/${id_epleado}`);
  }

  // METODO DE BUSQUEDA DE DATOS DE USUARIO - DEPARTAMENTOS - ASIGNACION DE INFORMACION **USADO**
  BuscarUsuarioDepartamento(id_empleado: { id_empleado: number }) {
    return this.http.post<any>(`${this.apiUrlM}/api/usuario-departamento/buscar-usuario-departamento`, id_empleado)
      .pipe(map(datos => datos.data));
  }

  // METODO PARA OBTENER IDS USUARIOS MEDIANTE DEPARTAMENTO VIGENTE **USADO**
  ObtenerIdUsuariosDepartamento(data: { id_departamento: number }) {
    return this.http
      .post<{ ok: boolean; data: { id: number }[] }>(
        `${this.apiUrlM}/usuarios/buscar-ids-usuarios-departamento`,
        data
      )
      .pipe(map(res => res.data ?? []));
  }
}
