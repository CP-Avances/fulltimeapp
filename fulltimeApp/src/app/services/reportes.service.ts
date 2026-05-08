import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


// SERVICIOS
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private api_url = '';

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {
    this.obtenerUrlEmpresa();
  }

  async obtenerUrlEmpresa() {
    this.api_url = await this.storageService.get('urlEmpresa');
  }

  // METODO PARA CONSULTAR LISTA DE TIMBRES DEL USUARIO
  ReporteTimbresMultiple(data: any, desde: string, hasta: string) {
    return this.http.post<any>(`${this.api_url}/reportes-asistencias/timbres/${desde}/${hasta}`, data);
  }

  // METODO PARA CONSULTAR LISTA DE TIMBRES CON NOVEDAD
  getInfoReporteTimbresNovedad(data: any, desde: string, hasta: string) {
    return this.http.post<any>(`${this.api_url}/reporte/timbresConNovedad/${desde}/${hasta}`, data);
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
