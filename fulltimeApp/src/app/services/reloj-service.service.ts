import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { NavController } from "@ionic/angular";
import { environment } from '../../environments/environment';
import { firstValueFrom, map } from 'rxjs';
import { SessionStorageService } from './session-storage.service';

@Injectable({
  providedIn: 'root'
})
export class RelojServiceService {

  private readonly apiUrl = `${environment.urlMultitenant}`;

  constructor(
    private http: HttpClient,
    private navCtroller: NavController,
    public sessionStorageService: SessionStorageService,
  ) {
  }


  //  METODO PARA OBTENER LOS USUARIOS DE LA EMPRESA
  obtenerUsuarioEmpresa() {
    return this.http.get<any>(this.apiUrl + '/usuarios/usuarioEmpresa');
  }

  // METODO PARA OBTENER LA INFORMACION DEL USUARIO
  obtenerUsuario(idUser: any) {
    return this.http.get<any>(this.apiUrl + '/usuarios/usuario/' + idUser);
  }

  // METODO PARA INICIAR SESION
  async ValidarCredencialesMT(data: any) {
    return await firstValueFrom(
      this.http.post<any>(`${this.apiUrl}/login`, data));
  }

  // METODO PARA REGISTRAR EL DISPOSITIVO
  registrarCelularUsuario(id_empleado: any, id_celular: any, modelo_dispositivo: any, terminos_condiciones: boolean) {
    return this.http.post<any>(this.apiUrl + '/api/movil-dispositivos/ingresarIDdispositivo', { id_empleado, id_celular, modelo_dispositivo, terminos_condiciones });
  }

  // BUSCAR EL DISPOSITIVO POR ID DEL EMPLEADO
  obtenerIdDispositivosUsuario(id_empleado: number | string) {
    return this.http.get<any>(this.apiUrl + '/api/movil-dispositivos/IDdispositivos/' + id_empleado);
  }

  // BUSCAR EL DISPOSITIVO POR ID DEL DISPOSITIVO
  obtenerDispositivoPorID(id_dispositivo: number | string) {
    return this.http.post<any>(this.apiUrl + '/api/movil-dispositivos/dispositivo/idDispositivo', { id_dispositivo });
  }


  // VERIFICAR EXISTENCIA DE INICIO DE SESION
async estaLogueado(): Promise<boolean> {
  const token = await this.sessionStorageService.getToken();

  if (!token || token === 'null' || token === 'undefined') {
    return false;
  }

  return true;
}
  
  // VERIFICAR EXISTENCIA DE ROL
  existeRol() {
    return !!localStorage.getItem('rol');
  }

  public get rol(): number {
    const r = (localStorage.getItem('rol') === null
      || localStorage.getItem('rol') === undefined
      || localStorage.getItem('rol') === 'undefined') ? 0 : parseInt(String(localStorage.getItem('rol')));
    return r
  }

  // OBTENER TOKEN
async getToken() {
  const token = await this.sessionStorageService.getToken();

  if (!token || token === 'null' || token === 'undefined') {
    return null;
  }

  return token;
}

  // METODO PARA CERRAR SESION
  async cerrarSesion() {
    await this.sessionStorageService.removeToken();

    localStorage.clear();
    sessionStorage.clear();

    localStorage.setItem('primeraVez', 'true');

    this.navCtroller.pop();
    this.navCtroller.navigateRoot('login');
  }

  //comprobar si es primera vez que abre la app para mostrar sliders y si es administrador
  yaNoEsPrimeraVez() {
    localStorage.setItem('primeraVez', "true");
  }
  esPrimeraVez() {
    console.log("esPrimeraVez()", !!localStorage.getItem('primeraVez'))
    return !!localStorage.getItem('primeraVez');
  }

  // METODO PARA OBTENER LOS DATOS DE LA EMPRESA
  obtenerDatosEmpresa() {
    return this.http.get<any>(`${this.apiUrl}/api/empresa/buscar/datos`);
  }

  // TIMBRE
  // METODO PARA CREAR UN TIMBRE
  enviarTimbre(datos: any) {
    return this.http.post<any>(`${this.apiUrl}/timbres`, datos)
      .pipe(map(res => res.data));
  }

  // METODO PARA BUSCAR POR WEL CODIGO DEL EMPLEADO LOS TIMBRES
  obtenerTimbres(codigo: any) {
    return this.http.get<any>(this.apiUrl + '/timbres/timbreEmpleado/' + codigo);
  }

}
