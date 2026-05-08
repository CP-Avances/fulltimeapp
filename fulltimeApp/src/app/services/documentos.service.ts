import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {

  private readonly apiUrl = `${environment.urlMultitenant}/cargar-documentos`;

  constructor(
    private readonly http: HttpClient,
  ) { }

  /*********************************************************************
   * ARCHIVOS GENERICOS DE MODULOS
   *********************************************************************/

  // SUBIR DOCUMENTO DE UN MODULO (ej: vacaciones)
  SubirDocumento(formData: FormData, idSolicitud: number, idEmpleado: number, tipo: string): Observable<any> {
    const url = `${this.apiUrl}/${tipo}/${idSolicitud}/documento/${idEmpleado}`;
    return this.http.post<any>(url, formData);
  }

  // ELIMINAR DOCUMENTO DE UN MODULO
  EliminarDocumento(idSolicitud: number, idEmpleado: number, tipo: string): Observable<any> {
    const url = `${this.apiUrl}/${tipo}/${idSolicitud}/documento/${idEmpleado}`;
    return this.http.delete<any>(url);
  }

  // VER DOCUMENTO ALMACENADO EN EL SISTEMA
  verDocumento(tipo: string, idEmpleado: number, nombreDocumento: string): Observable<Blob> {
    const url = `${this.apiUrl}/${tipo}/${idEmpleado}/${nombreDocumento}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  /*********************************************************************
   * OPCIONALES
   *********************************************************************/

  // LISTAR ARCHIVOS INDIVIDUALES DE UN EMPLEADO EN UN MODULO
  ListarArchivosIndividuales(nomCarpeta: number, tipo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/listar/documentacion-empleado/${tipo}/${nomCarpeta}`)
      .pipe(
        map(res => res.data)
      );
  }


}