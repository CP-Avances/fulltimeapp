import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataUserLoggedService {

  constructor() { }


  public get UserFullname(): string {
    const nombre = (localStorage.getItem('nom') === null) ? '' : localStorage.getItem('nom');
    const apellido = (localStorage.getItem('ap') === null) ? '' : localStorage.getItem('ap');
    console.log(nombre, apellido);
    return nombre + ' ' + apellido
  }


  public get username(): any {
    const u = (localStorage.getItem('username') === null) ? '' : localStorage.getItem('username');
    return u;
  }


  public get dataUser(): any {
    return {
      Udepartamento: localStorage.getItem('ndepartamento'),
      Ucedula: localStorage.getItem('UCedula'),
      Ufullname: this.UserFullname
    }
  }

  public get dataApp(): any {
    const a: any = (localStorage.getItem('app_info') === null) ? '' : localStorage.getItem('app_info');
    if (a === '') return { caducidad_licencia: '', version: '' }

    return JSON.parse(a)
  }

  public get dataVacuna(): any {
    const v: any = (localStorage.getItem('vacuna_info') === null) ? '' : localStorage.getItem('vacuna_info');
    if (v === '' || v === 'undefined') return { id_tipo_vacuna: '' }

    return JSON.parse(v)
  }


  /**
   * 
   */

  private _fechainicio: string = '';
  private _fechafinal: string = '';

  public get fechaRangoInicio(): string {
    return this._fechainicio
  }

  setFechaRangoInicio(f: any) { this._fechainicio = f }

  public get fechaRangoFinal(): string {
    return this._fechafinal
  }

  setFechaRangoFinal(f:any) { this._fechafinal = f }


}
