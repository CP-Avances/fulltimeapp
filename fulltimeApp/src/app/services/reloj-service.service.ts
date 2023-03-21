import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { NavController } from "@ionic/angular";
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RelojServiceService {
  private URL = environment.url


  constructor(
    private http: HttpClient, 
    private navCtroller: NavController,
  ) {
  }

  //USUARIO
  registrarUsuario(usuario: any) {
    return this.http.post<any>(this.URL + '/user/usuario', usuario);
  }

  existeUsuario(username: any) {
    return this.http.post<any>(this.URL + '/user/existeUsuario', { user_name: username });
  }
  obtenerUsuarioEmpresa() {
    return this.http.get<any>(this.URL + '/user/usuarioEmpresa');
  }

  obtenerUsuario(idUser: any) {
    return this.http.get<any>(this.URL + '/user/usuario/' + idUser);
  }

  iniciarSesion(user: any) {
    console.log('Datos Usuario: ',user);
    return this.http.post<any>(this.URL + '/user/loginUsuario', user);
  }

  cambiarPassword(username:any, user_password: any) {
    return this.http.put<any>(this.URL + '/user/actualizarPass/' + username, { user_password: user_password });
  }

  actualizarCelularUsuario(id_usuario: string, id_celular: boolean) {
    return this.http.put<any>(this.URL + '/user/actualizarIDcelular/' + id_usuario, { id_celular });
  }

  registrarCelularUsuario(id_empleado: any, id_celular: any, modelo_dispositivo: any) {
    return this.http.post<any>(this.URL + '/user/ingresarIDdispositivo', { id_empleado, id_celular, modelo_dispositivo });
  }

  obtenerIdDispositivosUsuario(id_empleado: number) {
    return this.http.get<any>(this.URL + '/user/IDdispositivos/' + id_empleado);
  }

  //FIN USUARIO

  estaLogueado() {
    return !!localStorage.getItem('token');
  }

  existeRol() {
    return !!localStorage.getItem('rol');
  }


  public get rol(): number {
    const r = (localStorage.getItem('rol') === null
      || localStorage.getItem('rol') === undefined
      || localStorage.getItem('rol') === 'undefined') ? 0 : parseInt(String(localStorage.getItem('rol')));
    return r
  }

  getToken() {
    return localStorage.getItem('token');
  }



  cerrarSesion() {
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
    return !!localStorage.getItem('primeraVez');
  }
  esAdministrador() {
    return localStorage.getItem('rol') === "1";
  }

  esEmpleado() {
    return localStorage.getItem('rol') === "2" || localStorage.getItem('rol') === "3";
  }
  //fin de sliders


  // EMPRESA
  obtenerIdEmpresa(ruc: any) {
    return this.http.get<any>(this.URL + '/enterprise/empresa/' + ruc);
  }
  crearEmpresa(empresa: any) {
    return this.http.post<any>(this.URL + '/enterprise/empresa', empresa);
  }
  obtenerDatosEmpresa(id: any) {
    return this.http.get<any>(this.URL + '/enterprise/empresaId/' + id);
  }
  //fin empresa

  // TIMBRE
  enviarTimbre(timbre: any) {
    return this.http.post<any>(this.URL + '/ring/timbre', timbre);
  }

  enviarTimbreSinConexion(timbre: any) {
    return this.http.post<any>(this.URL + '/ring/timbreSinConexion', timbre);
  }

  obtenerTimbres(codigo: any) {
    return this.http.get<any>(this.URL + '/ring/timbreEmpleado/' + codigo);
  }
  //fin timbre

}
