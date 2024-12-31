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

  //  METODO PARA OBTENER LOS USUARIOS DE LA EMPRESA
  obtenerUsuarioEmpresa() {
    return this.http.get<any>(this.URL + '/usuarios/usuarioEmpresa');
  }
  // METODO PARA OBTENER LA INFORMACION DEL USUARIO 
  obtenerUsuario(idUser: any) {
    return this.http.get<any>(this.URL + '/usuarios/usuario/' + idUser);
  }

  // METODO PARA INICIAR SESION
  iniciarSesion(user: any) {
    return this.http.post<any>(`${this.URL}/login`, user);
  }

  // METODO PARA REGISTRAR EL DISPOSITIVO
  registrarCelularUsuario(id_empleado: any, id_celular: any, modelo_dispositivo: any, user_name: any, ip: any, terminos_condiciones: boolean, ip_local: any) {
    return this.http.post<any>(this.URL + '/usuarios/ingresarIDdispositivo', { id_empleado, id_celular, modelo_dispositivo, user_name, ip, terminos_condiciones, ip_local });
  }

  // BUSCAR EL DISPOSITIVO POR ID DEL EMPLEADO
  obtenerIdDispositivosUsuario(id_empleado: number | string) {
    return this.http.get<any>(this.URL + '/usuarios/IDdispositivos/' + id_empleado);
  }

  // BUSCAR EL DISPOSITIVO POR ID DEL DISPOSITIVO
  obtenerDispositivoPorID(id_dispositivo: number | string) {
    return this.http.post<any>(this.URL + '/usuarios/dispositivo/idDispositivo', { id_dispositivo });
  }

  // METODO PARA OBTENER EL DEPARTAMENTO DEL EMPLEADO POR SU ID
  ObtenerDepartamentoUsuarios(id_empleado: number) {
    return this.http.get(this.URL + '/user/dato/' + id_empleado);
  }

  // VERIFICAR EXISTENCIA DE INICIO DE SESION
  estaLogueado() {
    return !!localStorage.getItem('token');
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
  getToken() {
    return localStorage.getItem('token');
  }

  // METODO PARA CERRAR SESION
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
    console.log("esPrimeraVez()", !!localStorage.getItem('primeraVez'))
    return !!localStorage.getItem('primeraVez');
  }

  // METODO PARA OBTENER LOS DATOS DE LA EMPRESA
  obtenerDatosEmpresa(id: any) {
    return this.http.get(`${this.URL}/empresas/buscar/datos/${id}`);
  }

  // TIMBRE
  // METODO PARA CREAR UN TIMBRE
  enviarTimbre(timbre) {
    console.log('dato de timbre a guardar en la base de datos: ', timbre.conexion)
    return this.http.post<any>(this.URL + '/timbres/timbre', timbre);
  }
  // METODO PARA CREAR UN TIMBRE SIN CONEXION
  enviarTimbreSinConexion(timbre: any) {
    console.log('dato de timbre a guardar en la base de datos pero con novedades: ', timbre)
    return this.http.post<any>(this.URL + '/timbres/timbreSinConexion', timbre);
  }
  // METODO PARA BUSCAR POR WEL CODIGO DEL EMPLEADO LOS TIMBRES
  obtenerTimbres(codigo: any) {
    return this.http.get<any>(this.URL + '/timbres/timbreEmpleado/' + codigo);
  }

}
