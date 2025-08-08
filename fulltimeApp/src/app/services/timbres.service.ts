import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// SERVICIOS
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TimbresService {

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

  // METODO PARA BUSCAR LOS TIMBRES DE LOS EMPLEADOS POR SU CODIGO
  getTimbresEmpleadoByCodigo(codigo: number | string) {
    return this.http.get<any>(`${this.api_url}/timbres/timbreEmpleado/${codigo}`)
  }

  // METODO ENVIAR UN TIMBRE COMO ADMINISTRADOR
  PostTimbreWebAdmin(datos: any) {

    const formData = new FormData();

    const timbre = {
      ...datos,
      documento: null
    }

    if (datos.documento) {
      const arr = datos.documento.split(",");
      const mime = arr[0].match(/:(.*?);/)?.[1] ?? "image/webp";
      const blob = this.base64ABlob(arr[1], mime);
      formData.append("documento", blob, "timbre.webp");
    }

    formData.append('timbre', JSON.stringify(timbre));

    return this.http.post<any>(`${this.api_url}/timbres/timbre/admin`, formData);
  }

  // METODO PARA BUSCAR LOS TIMBRES FILTRADOS POR FECHA
  PostFiltrotimbres(datos: any){
    return this.http.post<any>(`${this.api_url}/timbres/filtroTimbre`, datos)
  }

  private base64ABlob(base64: string, mime: string): Blob {
    const bstr = atob(base64);
    const u8arr = new Uint8Array(bstr.length);

    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }

    return new Blob([u8arr], { type: mime });
  }
}
