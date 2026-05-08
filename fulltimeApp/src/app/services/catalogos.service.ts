import { Injectable } from '@angular/core';
import { Cg_Feriados, Cg_TipoPermiso,} from '../interfaces/Catalogos';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// SERVICIOS
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {

  private apiUrl = '';

  private handleError(error: any) {
    console.log('ERROR CAPTURADO: ', error);
    return throwError(error);
  }
  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {
    this.obtenerUrlEmpresa();
  }

  async obtenerUrlEmpresa() {
    this.apiUrl = await this.storageService.get('urlEmpresa');
  }

  /*********************************************************************
  *
  *            Informacion de catalogo de tipo de permiso.
  *
  **********************************************************************/

  private lista_tipos_permisos: Cg_TipoPermiso[] = [];

  public get cg_tipo_permisos(): Cg_TipoPermiso[] {
    return [...this.lista_tipos_permisos]
  }

  // fila cg-numMaxPermisos
  getCgNumMaxPermiso(): void {
    const url = `${this.apiUrl}/permisos/all-permisos`;
    this.http.get<Cg_TipoPermiso[]>(url)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      )
  }

  getCgPermisos(): void {
    if (!!sessionStorage.getItem('cg_tipo_permiso')) {
      const lista: any = sessionStorage.getItem('cg_tipo_permiso')
      this.lista_tipos_permisos = JSON.parse(lista)
    } else {
      const url = `${this.apiUrl}/tipoPermisos`;
      this.http.get<Cg_TipoPermiso[]>(url)
        .pipe(
          tap(console.log),
          catchError(this.handleError)
        ).subscribe(cg_permisos => {
          this.lista_tipos_permisos = cg_permisos;
          sessionStorage.setItem('cg_tipo_permiso', JSON.stringify(cg_permisos))
        })
    }

  }

  /*********************************************************************
  *
  *            Informacion de catalogo de feriados.
  *
  **********************************************************************/
  private lista_feriados: Cg_Feriados[] = [];

  public get cg_feriados(): Cg_Feriados[] {
    return [...this.lista_feriados]
  }

  getFeriadosAnual(): void {
    if (!!sessionStorage.getItem('cg_feriado')) {
      const lista: any = sessionStorage.getItem('cg_feriado')
      this.lista_feriados = JSON.parse(lista)
    } else {
      const url = `${this.apiUrl}/feriados/cg-feriados`;
      this.http.get<Cg_Feriados[]>(url)
        .pipe(
          tap(console.log),
          catchError(this.handleError)
        ).subscribe(cg_feriados => {
          this.lista_feriados = cg_feriados;
          sessionStorage.setItem('cg_feriado', JSON.stringify(cg_feriados))
        })
    }

  }

}
