import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataUserLoggedService {

  constructor() { }

  // METODO PARA OBTENER NOMBRE COMPLETO DEL EMPLEADO DEL LOCALSTORAGE
  public get UserFullname(): string {
    const nombre = (localStorage.getItem('nom') === null) ? '' : localStorage.getItem('nom');
    const apellido = (localStorage.getItem('ap') === null) ? '' : localStorage.getItem('ap');
    console.log(nombre, apellido);
    return nombre + ' ' + apellido
  }

  // METODO PARA OBTENER NOMBRE COMPLETO DEL EMPLEADO DEL LOCALSTORAGE 
  public get username(): any {
    const u = (localStorage.getItem('username') === null) ? '' : localStorage.getItem('username');
    return u;
  }

  // METODO PARA OBTENER LA INFORMACION DE LA APLICACION
  public get dataApp(): any {
    const a: any = (localStorage.getItem('app_info') === null) ? '' : localStorage.getItem('app_info');
    if (a === '') return { caducidad_licencia: '', version: '' }
    return JSON.parse(a)
  }

  private _fechainicio: string = '';
  private _fechafinal: string = '';

  // METODO PARA LLAMAR LA FECHA INICIAL DE LOS CALENDARIOS
  public get fechaRangoInicio(): string {
    return this._fechainicio
  }

  // METODO PARA MODIFICAR LA FECHA INICIAL DE LOS CALENDARIOS
  setFechaRangoInicio(f: any) { this._fechainicio = f }
  
  // METODO PARA LLAMAR LA FECHA FINAL DE LOS CALENDARIOS
  public get fechaRangoFinal(): string {
    return this._fechafinal
  }

  // METODO PARA MODIFICAR LA FECHA FINAL DE LOS CALENDARIOS
  setFechaRangoFinal(f: any) { this._fechafinal = f }
}
