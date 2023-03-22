import { Injectable } from '@angular/core';
import { Cg_DetalleMenu, Cg_Feriados, Cg_TipoPermiso, Servicios_Comida, Menu_Servicios } from '../interfaces/Catalogos';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {

  private apiUrl = environment.url;

  private handleError(error: any) {
    console.log('ERROR CAPTURADO: ', error);
    return throwError(error);
  }
  constructor(
    private http: HttpClient
  ) { }

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
      const url = `${this.apiUrl}/catalogos/cg-permisos`;
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
      const url = `${this.apiUrl}/catalogos/cg-feriados`;
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

  /*********************************************************************
  * 
  *            INFORMACION DE CATALOGO DE DETALLE COMIDA.
  * 
  **********************************************************************/
  private lista_detalle_menu: Cg_DetalleMenu[] = [];

  public get detalle_menu(): Cg_DetalleMenu[] {
    return [...this.lista_detalle_menu]
  }

  getDetalleMenu(): void {

    if (!!sessionStorage.getItem('cg_detalleMenu')) {
      const lista: any = sessionStorage.getItem('cg_detalleMenu')
      this.lista_detalle_menu = JSON.parse(lista)
    } else {
      const url = `${this.apiUrl}/catalogos/cg-det-menu`;
      this.http.get<Cg_DetalleMenu[]>(url)
        .pipe(
          tap(console.log),
          catchError(this.handleError)
        ).subscribe(cg_detalle_menu => {
          this.lista_detalle_menu = cg_detalle_menu;
          sessionStorage.setItem('cg_detalleMenu', JSON.stringify(cg_detalle_menu))
        })
    }
  }

  private lista_servicios: Servicios_Comida[] = [];

  public get servicios_comida_lista(): Servicios_Comida[] {
    return [...this.lista_servicios]
  }

  getServicioComida() {
    if (!!sessionStorage.getItem('servicios-comida')) {
      const lista: any = sessionStorage.getItem('servicios-comida')
      this.lista_servicios = JSON.parse(lista)
    } else {
      const url = `${this.apiUrl}/catalogos/servicio-comida`;
      this.http.get<Servicios_Comida[]>(url)
        .pipe(
          tap(console.log),
          catchError(this.handleError)
        ).subscribe(servicios => {
          this.lista_servicios = servicios;
          sessionStorage.setItem('servicios-comida', JSON.stringify(servicios))
        })
    }
  }

  private lista_menus_servicios: Menu_Servicios[] = [];

  public get lista_menu(): Menu_Servicios[] {
    return [...this.lista_menus_servicios]
  }

  getMenuServicios() {
    if (!!sessionStorage.getItem('menu-servicio')) {
      const lista: any = sessionStorage.getItem('menu-servicio')
      this.lista_menus_servicios = JSON.parse(lista)
    } else {
      const url = `${this.apiUrl}/catalogos/servicio-menu`;
      this.http.get<Menu_Servicios[]>(url)
        .pipe(
          tap(console.log),
          catchError(this.handleError)
        ).subscribe(menu => {
          this.lista_menus_servicios = menu;
          sessionStorage.setItem('menu-servicio', JSON.stringify(menu))
        })
    }
  }


}
