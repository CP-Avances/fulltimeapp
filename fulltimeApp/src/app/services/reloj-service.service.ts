import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { NavController } from "@ionic/angular";
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

// SERVICIOS
import { StorageService } from './storage.service';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})
export class RelojServiceService {
  private URL = '';

  private readonly apiUrl = `${environment.urlMultitenant}`;

  constructor(
    private http: HttpClient,
    private navCtroller: NavController,
    private storageService: StorageService,
    private urlService: UrlService,
  ) {
    this.urlService.getUrl().subscribe(url => {
      if (url) this.URL = url; // Se actualiza automáticamente cuando cambia la URL
      console.log('url cambiada')
    });
    this.obtenerUrlEmpresa();
  }

  async obtenerUrlEmpresa() {
    this.URL = await this.storageService.get('urlEmpresa');
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
  async iniciarSesion(user: any) {
    const response = await firstValueFrom(this.http.post<any>(`${this.URL}/login`, user))
    return response;
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
    this.storageService.clear();
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
  enviarTimbre(timbre: any) {

    const formData = new FormData();

    const datosTimbre = {
      ...timbre,
      imagen: null,
    }

    if (timbre.imagen) {
      const arr = timbre.imagen.split(",");
      const mime = arr[0].match(/:(.*?);/)?.[1] ?? "image/webp";
      const blob = this.base64ABlob(arr[1], mime);
      formData.append("imagen", blob, "timbre.webp");
    }

    formData.append('timbre', JSON.stringify(datosTimbre));

    console.log('dato de timbre a guardar en la base de datos: ', timbre.conexion)
    return this.http.post<any>(this.URL + '/timbres/timbre', formData);
  }
  // METODO PARA CREAR UN TIMBRE SIN CONEXION
  enviarTimbreSinConexion(timbre: any) {

    const formData = new FormData();

    const datosTimbre = {
      ...timbre,
      imagen: null,
    }

    if (timbre.imagen) {
      const arr = timbre.imagen.split(",");
      const mime = arr[0].match(/:(.*?);/)?.[1] ?? "image/webp";
      const blob = this.base64ABlob(arr[1], mime);
      formData.append("imagen", blob, "timbre.webp");
    }

    formData.append('timbre', JSON.stringify(datosTimbre));

    console.log('dato de timbre a guardar en la base de datos pero con novedades: ', timbre)
    return this.http.post<any>(this.URL + '/timbres/timbreSinConexion', formData);
  }

  // METODO PARA BUSCAR POR WEL CODIGO DEL EMPLEADO LOS TIMBRES
  obtenerTimbres(codigo: any) {
    return this.http.get<any>(this.URL + '/timbres/timbreEmpleado/' + codigo);
  }

  //SELECTOR DE EMPRESAS
  validarEmpresa(codigoEmpresa: string) {
    const empresa = {
      codigo_empresa: codigoEmpresa,
    }
    return this.http.post<any>(`${environment.url}/fulltime`, empresa);
  }

  private base64ABlob(base64: string, mime: string): Blob {
    const bstr = atob(base64);
    const u8arr = new Uint8Array(bstr.length);

    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }

    return new Blob([u8arr], { type: mime });
  }


}
