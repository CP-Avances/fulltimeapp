import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// SERVICIOS
import { StorageService } from './storage.service';
import { UrlService } from './url.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParametrosService {

  private apiUrl = '';
  private readonly apiUrlM = `${environment.urlMultitenant}`;

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
  }

  // METODO PARA OBTENER LOS DETALLES DE PARAMETROS POR ID
  ObtenerDetallesParametros(id: any) {
    return this.http.get<any>(this.apiUrl + '/parametrizacion/' + id);
  }

  // METODO PARA OBTENER EL PARAMETRO DE DISPOSITIVOS
  async ObtenerParametroDispositivos(id: any) {
    const response = await firstValueFrom(this.http.get<any>(this.apiUrl + '/parametrizacion/' + id));
    return response;
  }

  // METODO PARA OBTENER LOS DETALLES DE PARAMETROS POR ID
  ObtenerDetalleParametroUsuario(datos: any) {
    return this.http.post<any>(`${this.apiUrlM}/timbres/listar-opciones-timbre`, datos);
  }

  // METODO PARA OBTENER LOS FORMATOS DE LAS FECHAS
  ObtenerFormatos() {
    return this.http.get<any>(this.apiUrl + '/parametrizacion/buscar-formato/fecha_horas');
  }

  // METODO PARA OBTENER LAS COORDENADAS DE UNA UBICACION REGISTRADA
  ObtenerCoordenadas(data: any) {
    return this.http.post<any>(`${this.apiUrlM}/parametrizacion/coordenadas`, data);;
  }

  // METODO PARA OBTENER LA UBICACION REGISTRADA AL EMPLEADO
  ObtenerUbicacionUsuario(id_empl: any) {
    return this.http.get<any>(`${this.apiUrl}/ubicacion/coordenadas-usuario/${id_empl}`);
  }

  // METODO PARA BUSCAR LAS FUNCIONES
  ObtenerFunciones() {
    return this.http.get<any>(this.apiUrl + '/administracion/funcionalidad');
  }


}
