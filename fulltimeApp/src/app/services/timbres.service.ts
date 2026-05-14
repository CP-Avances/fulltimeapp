import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TimbresService {

  private readonly apiUrl = `${environment.urlMultitenant}`;

  constructor(
    private http: HttpClient,
  ) {
  }

  // METODO PARA BUSCAR LOS TIMBRES DE LOS EMPLEADOS POR SU CODIGO
  getTimbresEmpleadoByCodigo(codigo: number | string) {
    return this.http.get<any>(`${this.apiUrl}/timbres/timbreEmpleado/${codigo}`)
  }

  // METODO ENVIAR UN TIMBRE COMO ADMINISTRADOR
  RegistrarTimbreAdmin(formData: FormData) {
    return this.http.post(`${this.apiUrl}/timbres/admin`, formData);
  }

  // METODO PARA BUSCAR LOS TIMBRES FILTRADOS POR FECHA
  PostFiltrotimbres(datos: any) {
    return this.http.post<any>(`${this.apiUrl}/timbres/filtroTimbre`, datos)
  }

}
