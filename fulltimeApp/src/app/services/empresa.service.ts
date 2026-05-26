import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  private readonly apiUrl = `${environment.urlMultitenant}/api/empresa`;

  constructor(
    private http: HttpClient
  ) { }

  ConsultarDatosEmpresa() {
    return this.http.get<{ ok: boolean; data: any }>(`${this.apiUrl}/buscar/datos`)
      .pipe(
        map(res => res.data)
      );
  }

  ObtenerEmpresaImagen(campo: string) {
    return this.http.get<{ ok: boolean; data: string }>(`${this.apiUrl}/buscar/imagen/${campo}`)
      .pipe(
        map(res => res.data)
      );
  }
}