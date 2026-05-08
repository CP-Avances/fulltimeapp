import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToastController, ModalController, AlertController } from '@ionic/angular';
import { TimbresPerdidosComponent } from './showTimbresGuardados.component';
import { ParametrosService } from 'src/app/services/parametros.service';
import { Router } from '@angular/router';
import { RelojServiceService } from 'src/app/services/reloj-service.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AutorizacionesService } from 'src/app/services/autorizaciones.service';
import { NetworkService } from '../../libs/network.service';
import { NavegadorAdminComponent } from 'src/app/componentes/navegador-admin/navegador-admin.component';
import { Geolocation } from '@capacitor/geolocation';
import { timeout } from 'rxjs/operators';


@Component({
  selector: 'app-bienvenido',
  templateUrl: './bienvenido.page.html',
  styleUrls: ['./bienvenido.page.scss']
})
export class BienvenidoPage implements OnInit, OnDestroy {

  @ViewChild(NavegadorAdminComponent) navegadorAdmin: NavegadorAdminComponent;
  pipe: DatePipe = new DatePipe('es-EC', null);
  time: Date = new Date();
  horaTransformada = this.pipe.transform(Date.now(), 'hh:mm a');
  fechaTransformada = this.pipe.transform(Date.now(), 'fullDate');
  horarioAbierto: boolean = false;
  valorsol: string = "none";
  valorluna: string = "none";
  intervalo: any;
  funciones: any = [];
  apro_permisos: any;
  colorIp: any;
  colorFp: any;

  constructor(
    public toastController: ToastController,
    public modalController: ModalController,
    public alertCrtl: AlertController,
    public parametros: ParametrosService,
    public router: Router,
    public relojService: RelojServiceService,
    public empleadoService: EmpleadosService,
    public autorizacionesServices: AutorizacionesService,
    private networkService: NetworkService,

  ) {
    this.cambioimagen();
  }


  ngOnInit() {
    this.startClock();
    const subscription = interval(3600000) // Intervalo de 1 hora en milisegundos
      .pipe(
        switchMap(() => this.checkSession(localStorage.getItem("empleadoID")))
      )
      .subscribe(
        () => {
        },
        error => console.error('Error fetching data:', error)
      );
    this.autorizacionesServices.setSubscription(subscription); // Guardar la suscripción en el servicio
    this.networkSubscriber();
    this.refreshNavegadorAdmin();
  }

  ionViewWillEnter() {
    this.startClock();
    this.networkSubscriber();
    this.refreshNavegadorAdmin();
  }

  // METODO PARA REFRESCAR LA PAGINA
  refreshNavegadorAdmin() {
    if (this.navegadorAdmin) {
      this.navegadorAdmin.ngOnInit(); // O cualquier otro método que necesites ejecutar para refrescar
    }
  }

  // METODO PARA MOSTRAR EL RELOJ
  startClock() {
    setInterval(() => {
      this.horaTransformada = this.pipe.transform(Date.now(), 'hh:mm:ss a');
      this.fechaTransformada = this.pipe.transform(Date.now(), 'fullDate');
    }, 1000);
  }

  // METODO DE CONGIGURACION DE TOAST
  async usuarioIncorrectoToas(mensaje: string, duracion: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: "warning"
    });
    toast.present();
  }

  // METODO PARA ENTRAL AL MODAL
  async presentModalTimbresPerdidos() {
    const modal = await this.modalController.create({
      component: TimbresPerdidosComponent,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  //Funcion para el cambio del sol y la luna en la imagen svg//
  cambioimagen() {
    this.intervalo = setInterval(() => {
      if (this.time.getHours() >= 6 && this.time.getHours() <= 18) {
        document.getElementById('Sol').style.display = "block";
        document.getElementById('Luna').style.display = "none";

      } else if (this.time.getHours() > 18 && this.time.getHours() <= 24) {
        document.getElementById('Sol').style.display = "none";
        document.getElementById('Luna').style.display = "block"
      } else {
        document.getElementById('Sol').style.display = "none";
        document.getElementById('Luna').style.display = "block"
      }
    }, 1000);
  }

  // METODO PARA VERIFICAR LA CONEXION A INTERNET
  isConnected: boolean;
  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
    console.log("Esta conectado: ", this.isConnected)
    if (!this.isConnected) {
      this.abrirToas('Por favor verifique su conexión a Internet', "danger", 3000, "middle");
      console.log('Desconectado');
      this.colorIp = localStorage.getItem("colorIp")
      this.colorFp = localStorage.getItem("colorFp")
    } else {
      console.log('conectado');
      this.BuscarParametroTimbreInternetRequerido();
      this.BuscarParametroTimbreConFoto();
      this.BuscarParametroTimbreUbicacionDesconocida();
      this.VerificarFunciones();
      this.BuscarParametroTimbreEspecial();
    }
  }

  // METODO PARA BUSCAR EL PARAMETRO DEL EMPLEADO DE TIMBRE CON FOTO
  BuscarParametroTimbreConFoto() {
    const empleadoID = parseInt(localStorage.getItem("empleadoID") ?? "0", 10);

    const buscar = {
      ids_empleados: [empleadoID],
    };

    this.parametros.ObtenerDetalleParametroUsuario(buscar).subscribe({
      next: (res) => {
        console.log('res bienvenida ', res);

        const parametro = res.data?.[0];

        if (!parametro) {
          console.warn('No existen parámetros de timbre para el empleado:', empleadoID);

          localStorage.setItem('timbrarConFoto', 'No');
          localStorage.setItem('opcional_obligatorio', 'No');

          return;
        }

        const resultado = parametro.timbre_foto ? 'Si' : 'No';
        localStorage.setItem('timbrarConFoto', resultado);

        const resultadoOpcional = parametro.opcional_obligatorio ? 'Si' : 'No';
        localStorage.setItem('opcional_obligatorio', resultadoOpcional);

        console.log("ver parametro de foto", parametro.timbre_foto);
      },
      error: (error) => {
        console.log('Error al obtener parámetros de timbre', error);
      }
    });
  }

  // METODO PARA BUSCAR EL PARAMETRO DEL EMPLEADO DE TIMBRE ESPECIAL
  BuscarParametroTimbreEspecial() {
    const empleadoID = parseInt(localStorage.getItem("empleadoID") ?? "0", 10);

    const buscar = {
      ids_empleados: [empleadoID],
    };

    this.parametros.ObtenerDetalleParametroUsuario(buscar).subscribe(
      res => {
        console.log('res timbre especial', res);

        const parametro = res.data?.[0];

        if (!parametro) {
          console.warn('No existen parámetros de timbre especial para el empleado:', empleadoID);

          localStorage.setItem('timbrarEspecial', 'No');
          return;
        }

        const timbreEspecial = parametro.timbre_especial;
        console.log("ver parametro de timbre especial", timbreEspecial);

        const resultado = timbreEspecial ? 'Si' : 'No';
        localStorage.setItem('timbrarEspecial', resultado);
      },
      error => {
        console.log('Error al obtener parámetro de timbre especial', error);
        localStorage.setItem('timbrarEspecial', 'No');
      }
    );
  }

  // METODO PARA BUSCAR EL PARAMETRO DE UBICACION DESCONOCIDA
  BuscarParametroTimbreUbicacionDesconocida() {
    const empleadoID = parseInt(localStorage.getItem("empleadoID") ?? "0", 10);

    const buscar = {
      ids_empleados: [empleadoID],
    };

    this.parametros.ObtenerDetalleParametroUsuario(buscar).subscribe(
      res => {
        console.log('res ubicación desconocida', res);

        const parametro = res.data?.[0];

        if (!parametro) {
          console.warn(
            'No existen parámetros de ubicación desconocida para el empleado:',
            empleadoID
          );

          localStorage.setItem('timbrarUbicacionDesconocida', 'No');
          return;
        }

        const timbreUbicacionDesconocida = parametro.timbre_ubicacion_desconocida;

        console.log(
          "ver parametro de ubicación desconocida",
          timbreUbicacionDesconocida
        );

        const resultado = timbreUbicacionDesconocida ? 'Si' : 'No';

        localStorage.setItem('timbrarUbicacionDesconocida', resultado);
      },
      error => {
        console.log('Error al obtener parámetro de ubicación desconocida', error);
        localStorage.setItem('timbrarUbicacionDesconocida', 'No');
      }
    );
  }

  // METODO QUE REALIZA VALIDACIONES Y DAN PASO A ENVIAR TIMIBRE
  async VerificarTimbresSinInternet(accion: string) {
    console.log('Estado de la red: ', this.networkService.getNetworkStatusDispositivo());

    await Geolocation.checkPermissions().then(() => {
      if (this.networkService.getNetworkStatusDispositivo() == true) {
        const empleadoID = parseInt(localStorage.getItem("empleadoID") ?? "0", 10);

        const buscar = {
          ids_empleados: [empleadoID],
        };

        this.parametros.ObtenerDetalleParametroUsuario(buscar)
          .pipe(timeout(2000))
          .subscribe(
            res => {
              console.log('res timbre sin internet', res);

              const parametro = res.data?.[0];

              if (!parametro) {
                console.warn('No existen parámetros de timbre sin internet para el empleado:', empleadoID);

                localStorage.setItem('timbrarSinInternet', 'No');
                this.router.navigate(['/enviartimbre', accion]);
                return;
              }

              const timbreInternet = parametro.timbre_internet;
              const resultado = timbreInternet ? 'Si' : 'No';

              localStorage.setItem('timbrarSinInternet', resultado);
              this.router.navigate(['/enviartimbre', accion]);
            },
            error => {
              console.log('Código de error:', error.status);

              localStorage.setItem('timbrarSinInternet', 'No');
              this.router.navigate(['/enviartimbre', accion]);
            }
          );
      } else {
        if (localStorage.getItem("timbrarSinInternet") == "Si") {
          this.abrirToas('No puede realizar timbres sin conexión a Internet', "danger", 3000, "middle");
        } else {
          this.router.navigate(['/enviartimbre', accion]);
        }
      };
    }).catch((error) => {
      this.abrirToas('Ups!!!, al parecer no tiene activada la localización. Por favor, active el GPS.', "warning", 3000, "middle");
    });
  }

  // METODO QUE REALIZA VALIDACIONES Y DAN PASO A ENVIAR TIMBRE ESPECIAL
  async VerificarTimbreEspecial(accion: string) {
    const empleadoID = parseInt(localStorage.getItem("empleadoID") ?? "0", 10);

    const buscar = {
      ids_empleados: [empleadoID],
    };

    this.parametros.ObtenerDetalleParametroUsuario(buscar)
      .pipe(timeout(2000))
      .subscribe(
        async res => {
          console.log('res timbre especial', res);

          const parametro = res.data?.[0];

          if (!parametro) {
            console.warn('No existen parámetros de timbre especial para el empleado:', empleadoID);

            localStorage.setItem('timbrarEspecial', 'No');
            this.abrirToas(
              'Ups!!!, al parecer no tiene activado el timbre especial',
              "warning",
              3000,
              "middle"
            );

            return;
          }

          const timbreEspecial = parametro.timbre_especial;
          console.log("ver parametro de timbre especial", timbreEspecial);

          const resultado = timbreEspecial ? 'Si' : 'No';
          localStorage.setItem('timbrarEspecial', resultado);

          if (resultado === 'Si') {
            this.VerificarTimbresSinInternet(accion);
          } else {
            this.abrirToas(
              'Ups!!!, al parecer no tiene activado el timbre especial',
              "warning",
              3000,
              "middle"
            );
          }
        },
        error => {
          console.log('Error al verificar timbre especial', error);

          if (localStorage.getItem("timbrarEspecial") === 'Si') {
            this.VerificarTimbresSinInternet(accion);
          } else {
            this.abrirToas(
              'Ups!!!, al parecer no tiene activado el timbre especial',
              "warning",
              3000,
              "middle"
            );
          }
        }
      );
  }

  BuscarParametroTimbreInternetRequerido() {
    const empleadoID = parseInt(localStorage.getItem("empleadoID") ?? "0", 10);

    const buscar = {
      ids_empleados: [empleadoID],
    };

    this.parametros.ObtenerDetalleParametroUsuario(buscar).subscribe(
      res => {
        console.log("ver si hay respuesta de parametros de usuario", res);

        const parametro = res.data?.[0];

        if (!parametro) {
          console.warn(
            'No existen parámetros de internet requerido para el empleado:',
            empleadoID
          );

          localStorage.setItem('timbrarSinInternet', 'No');
          return;
        }

        const timbreInternet = parametro.timbre_internet;

        console.log("ver parametro de internet", timbreInternet);

        const resultado = timbreInternet ? 'Si' : 'No';
        localStorage.setItem('timbrarSinInternet', resultado);
      },
      error => {
        console.log('Error al obtener parámetro de internet requerido', error);

        localStorage.setItem('timbrarSinInternet', 'No');
      }
    );
  }

  // METODO PARA LA CONFIGURACION DEL TOAST
  async abrirToas(mensaje: string, color: string, duracion: number, position: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      position: position,
    });
    toast.present();
  }

  // METODO PARA VERIFICAR LAS FUNCIONES
  VerificarFunciones() {
    this.parametros.ObtenerFunciones().pipe(timeout(2000)).subscribe(res => {
      this.funciones = res[0];
      this.apro_permisos = this.funciones.permisos;
      localStorage.setItem("apro_permisos", JSON.stringify(this.funciones.permisos));

      if (this.apro_permisos == true) {
        this.colorIp = "primary"
        this.colorFp = "dark"
        localStorage.setItem("colorIp", "primary")
        localStorage.setItem("colorFp", "dark")
      } else {
        this.colorIp = "deshabilitado"
        this.colorFp = "deshabilitado"
        localStorage.setItem("colorIp", "deshabilitado")
        localStorage.setItem("colorFp", "deshabilitado")
      }
    }, error => {

      if (error.status === 0) {
        // Error de red, servidor no disponible
        this.colorIp = localStorage.getItem("colorIp")
        this.colorFp = localStorage.getItem("colorFp")

      } else if (error.status === 503) {
        // Error 503: Servicio no disponible
        this.colorIp = localStorage.getItem("colorIp")
        this.colorFp = localStorage.getItem("colorFp")
      } else if (error.status === 404) {
        // Error 404: Recurso no encontrado
        this.colorIp = localStorage.getItem("colorIp")
        this.colorFp = localStorage.getItem("colorFp")
      } else {
        // Manejo de otros errores
        this.colorIp = localStorage.getItem("colorIp")
        this.colorFp = localStorage.getItem("colorFp")
      }


    }
    );
  }
  // METODO PARA VERIFICAR LAS FUNCIONES, VALIDAR PARAMETROS Y DAR PASO A ENVIAR TIMBRE DE INICIO DE PERMISO
  async btn_InicioPermisosClick() {
    await Geolocation.checkPermissions().then(() => {
      if (localStorage.getItem("apro_permisos") == "true") {

        if (this.networkService.getNetworkStatusDispositivo() == false) {
          this.abrirToas('No puede realizar timbres sin conexión a Internet', "danger", 3000, "middle");
          if (localStorage.getItem('timbrarSinInternet') == "Si") {
            this.abrirToas('No puede realizar timbres sin conexión a Internet', "danger", 3000, "middle");
          } else {
            this.router.navigate(['/enviartimbre', 'Inicio de permiso']);
          }
        } else {
          let buscar = {
            ids_empleados: [parseInt(localStorage.getItem("empleadoID"), 10)],
          };
          this.parametros.ObtenerDetalleParametroUsuario(buscar).pipe(timeout(2000)).subscribe(
            res => {
              const timbreFoto = res.data[0].timbre_internet;
              const resultado = timbreFoto ? 'Si' : 'No';
              localStorage.setItem('timbrarSinInternet', resultado);
              this.router.navigate(['/enviartimbre', 'Inicio de permiso']);
            }, error => {
              this.router.navigate(['/enviartimbre', 'Inicio de permiso']);
            }
          );
        }
      } else {
        this.mostrarToas(" Ups!!! al parecer no tienes activado en tu plan el Módulo de Permisos.");
      }
    })
      .catch((error) => {
        this.abrirToas('Ups!!!, al parecer no tiene activada la localización. Por favor, active el GPS.', "warning", 3000, "middle");
      })
  }

  // METODO PARA VERIFICAR LAS FUNCIONES, VALIDAR PARAMETROS Y DAR PASO A ENVIAR TIMBRE DE FIN DE PERMISO
  async btn_FinPermisosClick() {
    await Geolocation.checkPermissions().then(() => {
      if (localStorage.getItem("apro_permisos") == "true") {

        if (this.networkService.getNetworkStatusDispositivo() == false) {
          this.abrirToas('No puede realizar timbres sin conexión a Internet', "danger", 3000, "middle");
          if (localStorage.getItem('timbrarSinInternet') == "Si") {
            this.abrirToas('No puede realizar timbres sin conexión a Internet', "danger", 3000, "middle");
          } else {
            this.router.navigate(['/enviartimbre', 'Fin de permiso']);
          }
        } else {
          let buscar = {
            ids_empleados: [parseInt(localStorage.getItem("empleadoID"), 10)],
          };
          this.parametros.ObtenerDetalleParametroUsuario(buscar).pipe(timeout(2000)).subscribe(
            res => {
              const timbreFoto = res.data[0].timbre_internet;
              const resultado = timbreFoto ? 'Si' : 'No';
              localStorage.setItem('timbrarSinInternet', resultado);
              this.router.navigate(['/enviartimbre', 'Fin de permiso']);
            }, error => {
              this.router.navigate(['/enviartimbre', 'Fin de permiso']);
            }
          );
        }
      } else {
        this.mostrarToas(" Ups!!! al parecer no tienes activado en tu plan el Módulo de Permisos.");
      }
    })
      .catch((error) => {
        this.abrirToas('Ups!!!, al parecer no tiene activada la localización. Por favor, active el GPS.', "warning", 3000, "middle");
      })
  }

  // METODO DE CONFIGURACION DE TOAST DE PERMISOS
  async mostrarToas(mensaje: string) {
    const toast = await this.toastController.create({
      message: `<ion-icon name="information-circle-outline"></ion-icon>`
        + mensaje
        + `Te gustaría activarlo? <br> Comunícate con nosotros: www.casapazmino.com.ec`,
      duration: 4500,
      position: "top",
      color: "notificacicon",
      mode: "ios",
      cssClass: 'toast-custom-class',
    });
    await toast.present();
  }

  // METODO DE VALIDACION DE APLICACION MOVIL HABILITADA
  async checkSession(id_empleado) {
    this.empleadoService.accesoMovil(id_empleado).subscribe((x: any) => {
      if (x[0].app_habilita == false) {
        console.log('Session invalid. Closing session...');
        this.cerrarSesion();
      } else {
        console.log('Session valid');
      }
    })
  }

  // METODO PARA CERRAR SESION
  cerrarSesion() {
    this.relojService.cerrarSesion();
    this.autorizacionesServices.unsubscribe(); // Desuscribirse usando el servicio

  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
  }

}
