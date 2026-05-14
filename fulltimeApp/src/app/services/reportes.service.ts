import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// SERVICIOS
import { environment } from 'src/environments/environment';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private readonly apiUrl = `${environment.urlMultitenant}`;

  constructor(
    private http: HttpClient,
  ) {
  }


  // METODO PARA CONSULTAR LISTA DE TIMBRES DEL USUARIO
  ReporteTimbresMultiple(data: any, desde: string, hasta: string) {
    return this.http.post<any>(`${this.apiUrl}/reportes-asistencias/timbres/${desde}/${hasta}`, data)
      .pipe(map(res => res.data));
  }


  // METODO PARA OBTENER EL TOTAL DE REGISTROS
  SumarRegistros(array: any[]) {
    let valor = 0;
    for (let i = 0; i < array.length; i++) {
      valor = valor + array[i];
    }
    return valor;
  }

  private _valueTimbreDispositivo: Boolean = false;

  get mostrarTimbreDispositivo() { return this._valueTimbreDispositivo }

}
