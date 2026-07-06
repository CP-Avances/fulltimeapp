import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToastController, ModalController, AlertController } from '@ionic/angular';
import { TimbresPerdidosComponent } from './showTimbresGuardados.component';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RelojServiceService } from 'src/app/services/reloj-service.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NetworkService } from '../../libs/network.service';
import { NavegadorAdminComponent } from 'src/app/componentes/navegador-admin/navegador-admin.component';
import { Geolocation } from '@capacitor/geolocation';
import { timeout } from 'rxjs/operators';
import { TimbresPendientesSyncService } from 'src/app/services/timbres-pendientes-sync.service';
import { TimbresService } from 'src/app/services/timbres.service';

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

  horarioAbierto = false;
  valorsol = 'none';
  valorluna = 'none';

  intervalo: any;
  relojIntervalo: any;
  sessionSubscription?: Subscription;

  funciones: any = [];
  apro_permisos: any;

  colorIp: any;
  colorFp: any;

  isConnected = false;
  sincronizandoPendientes = false;

  ultimoTimbre: any = null;
  cargandoUltimoTimbre = false;
  sinConexionUltimoTimbre = false;

  constructor(
    public toastController: ToastController,
    public modalController: ModalController,
    public alertCrtl: AlertController,
    public parametros: ParametrosService,
    public router: Router,
    private route: ActivatedRoute,
    public relojService: RelojServiceService,
    public empleadoService: EmpleadosService,
    private networkService: NetworkService,
    private timbresPendientesSync: TimbresPendientesSyncService,
    public timbreService: TimbresService,
  ) { }

  ngOnInit() {
    this.startClock();
    this.cambioimagen();

    this.sessionSubscription = interval(3600000)
      .pipe(
        switchMap(() => this.checkSession(localStorage.getItem('empleadoID')))
      )
      .subscribe({
        next: () => { },
        error: error => console.error('Error fetching data:', error)
      });

    this.networkSubscriber();
    this.refreshNavegadorAdmin();
    this.ObtenerUltimoTimbreEmpleado();

    this.route.queryParams.subscribe(params => {
      if (params['refreshUltimoTimbre']) {
        setTimeout(() => {
          this.ObtenerUltimoTimbreEmpleado();
        }, 300);
      }
    });
  }

  ionViewWillEnter() {
    this.startClock();
    this.networkSubscriber();
    this.refreshNavegadorAdmin();
  }

  ionViewDidEnter() {
    const refrescar = localStorage.getItem('refrescarUltimoTimbre');

    if (refrescar === 'true') {
      localStorage.removeItem('refrescarUltimoTimbre');

      setTimeout(() => {
        this.ObtenerUltimoTimbreEmpleado();
      }, 300);

      return;
    }

    this.ObtenerUltimoTimbreEmpleado();
  }

  cargarUltimoTimbreLocal() {
    const ultimoGuardado = localStorage.getItem('ultimoTimbreEmpleado');

    if (!ultimoGuardado) {
      return;
    }

    try {
      this.ultimoTimbre = JSON.parse(ultimoGuardado);
    } catch {
      this.ultimoTimbre = null;
      localStorage.removeItem('ultimoTimbreEmpleado');
    }
  }

  ObtenerUltimoTimbreEmpleado() {

    const codigo = localStorage.getItem('codigo');

    if (!codigo) {
      this.ultimoTimbre = null;
      this.cargandoUltimoTimbre = false;
      this.sinConexionUltimoTimbre = false;
      return;
    }

    const conectado = this.networkService.getNetworkStatusDispositivo();

    if (!conectado) {
      this.cargandoUltimoTimbre = false;
      this.sinConexionUltimoTimbre = true;
      this.cargarUltimoTimbreLocal();
      return;
    }

    this.cargandoUltimoTimbre = true;
    this.sinConexionUltimoTimbre = false;

    this.timbreService.ObtenerUltimoTimbreEmpleado(codigo)
      .pipe(timeout(5000))
      .subscribe({
        next: (resp: any) => {
          const ultimoBackend = resp?.data ?? null;

          if (ultimoBackend) {
            this.ultimoTimbre = ultimoBackend;

            localStorage.setItem(
              'ultimoTimbreEmpleado',
              JSON.stringify(ultimoBackend)
            );
          } else {
            /*
              Si el backend no devuelve dato, no borro directamente.
              Mantengo el último local para evitar que la card quede vacía.
            */
            this.cargarUltimoTimbreLocal();
          }

          this.cargandoUltimoTimbre = false;
        },
        error: (error) => {
          this.cargandoUltimoTimbre = false;

          if (error?.status === 0) {
            this.sinConexionUltimoTimbre = true;
            this.cargarUltimoTimbreLocal();
            return;
          }

          if (error?.status === 404) {
            /*
              Solo aquí sí se puede limpiar, porque el backend dice
              que no existe ningún timbre.
            */
            this.ultimoTimbre = null;
            localStorage.removeItem('ultimoTimbreEmpleado');
            return;
          }

          /*
            Para cualquier otro error, mantengo lo local.
          */
          this.cargarUltimoTimbreLocal();
        }
      });
  }

  obtenerNombreTimbre(accion: string, teclaFuncion: any): string {
    const tecla = String(teclaFuncion ?? '').trim();
    const acc = String(accion ?? '').trim();

    switch (tecla) {
      case '0':
        return 'Entrada jornada';
      case '1':
        return 'Salida jornada';
      case '2':
        return 'Inicio alimentación';
      case '3':
        return 'Fin alimentación';
      case '4':
        return 'Inicio permiso';
      case '5':
        return 'Fin permiso';
      case '7':
        return 'Timbre especial';
    }

    switch (acc) {
      case 'E':
        return 'Entrada jornada';
      case 'S':
        return 'Salida jornada';
      case 'I/A':
      case 'S/A':
        return 'Inicio alimentación';
      case 'F/A':
      case 'E/A':
        return 'Fin alimentación';
      case 'I/P':
      case 'S/P':
        return 'Inicio permiso';
      case 'F/P':
      case 'E/P':
        return 'Fin permiso';
      case 'HA':
        return 'Timbre especial';
      default:
        return 'Timbre registrado';
    }
  }

  // ============================================================
  // REFRESCAR NAVEGADOR
  // ============================================================

  refreshNavegadorAdmin() {
    if (this.navegadorAdmin) {
      this.navegadorAdmin.ngOnInit();
    }
  }

  // ============================================================
  // RELOJ / IMAGEN
  // ============================================================

  startClock() {
    if (this.relojIntervalo) {
      clearInterval(this.relojIntervalo);
    }

    this.relojIntervalo = setInterval(() => {
      this.time = new Date();
      this.horaTransformada = this.pipe.transform(Date.now(), 'hh:mm:ss a');
      this.fechaTransformada = this.pipe.transform(Date.now(), 'fullDate');
    }, 1000);
  }

  cambioimagen() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }

    this.intervalo = setInterval(() => {
      this.time = new Date();

      const sol = document.getElementById('Sol');
      const luna = document.getElementById('Luna');

      if (!sol || !luna) {
        return;
      }

      if (this.time.getHours() >= 6 && this.time.getHours() <= 18) {
        sol.style.display = 'block';
        luna.style.display = 'none';
      } else {
        sol.style.display = 'none';
        luna.style.display = 'block';
      }
    }, 1000);
  }

  // ============================================================
  // MODAL TIMBRES PENDIENTES
  // ============================================================

  async presentModalTimbresPerdidos() {
    const modal = await this.modalController.create({
      component: TimbresPerdidosComponent,
      cssClass: 'my-custom-class'
    });

    return await modal.present();
  }

  // ============================================================
  // CONEXIÓN / SINCRONIZACIÓN AUTOMÁTICA
  // ============================================================

  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();

    console.log('Esta conectado: ', this.isConnected);

    if (!this.isConnected) {
      this.abrirToas(
        'Por favor verifique su conexión a Internet',
        'danger',
        3000,
        'middle'
      );

      console.log('Desconectado');

      this.colorIp = localStorage.getItem('colorIp');
      this.colorFp = localStorage.getItem('colorFp');

      return;
    }

    console.log('conectado');

    this.BuscarParametroTimbreInternetRequerido();
    this.BuscarParametroTimbreConFoto();
    this.BuscarParametroTimbreUbicacionDesconocida();
    this.VerificarFunciones();
    this.BuscarParametroTimbreEspecial();

    this.SincronizarTimbresPendientesAutomatico();
  }

  private async SincronizarTimbresPendientesAutomatico() {
    if (this.sincronizandoPendientes) {
      return;
    }

    const idEmpleado = parseInt(localStorage.getItem('empleadoID') ?? '0', 10);

    if (!idEmpleado || idEmpleado <= 0) {
      return;
    }

    if (!this.timbresPendientesSync.tieneTimbresPendientes()) {
      return;
    }

    this.sincronizandoPendientes = true;

    try {
      const resultado = await this.timbresPendientesSync.sincronizarPendientes(idEmpleado);

      if (!resultado.huboPendientes) {
        return;
      }

      if (resultado.enviados > 0 && resultado.fallidos === 0) {
        await this.abrirToas(resultado.mensaje, 'success', 3500, 'middle');

        /*
          IMPORTANTE:
          Cuando los timbres pendientes se sincronizan correctamente,
          volvemos a consultar el último timbre desde el backend.
        */
        setTimeout(() => {
          this.ObtenerUltimoTimbreEmpleado();
        }, 800);

        return;
      }

      if (resultado.enviados > 0 && resultado.fallidos > 0) {
        await this.abrirToas(resultado.mensaje, 'warning', 4500, 'middle');

        /*
          Aunque algunos fallen, si al menos uno se envió,
          refrescamos la card del último timbre.
        */
        setTimeout(() => {
          this.ObtenerUltimoTimbreEmpleado();
        }, 800);

        return;
      }

      if (resultado.enviados === 0 && resultado.fallidos > 0) {
        await this.abrirToas(resultado.mensaje, 'warning', 4500, 'middle');
      }

    } catch {
      await this.abrirToas(
        'No se pudieron sincronizar los timbres pendientes. Intente nuevamente más tarde.',
        'warning',
        4500,
        'middle'
      );

    } finally {
      this.sincronizandoPendientes = false;
    }
  }

  // ============================================================
  // PARÁMETROS TIMBRE
  // ============================================================

  BuscarParametroTimbreConFoto() {
    const empleadoID = parseInt(localStorage.getItem('empleadoID') ?? '0', 10);

    const buscar = {
      ids_empleados: [empleadoID],
    };

    this.parametros.ObtenerDetalleParametroUsuario(buscar).subscribe({
      next: (res: any) => {
        const parametro = res.data?.[0] ?? res.respuesta?.[0];

        if (!parametro) {
          localStorage.setItem('timbrarConFoto', 'No');
          localStorage.setItem('opcional_obligatorio', 'No');
          return;
        }

        const resultado = parametro.timbre_foto ? 'Si' : 'No';
        localStorage.setItem('timbrarConFoto', resultado);

        const resultadoOpcional = parametro.opcional_obligatorio ? 'Si' : 'No';
        localStorage.setItem('opcional_obligatorio', resultadoOpcional);
      },
      error: () => {
        localStorage.setItem('timbrarConFoto', 'No');
        localStorage.setItem('opcional_obligatorio', 'No');
      }
    });
  }

  BuscarParametroTimbreEspecial() {
    const empleadoID = parseInt(localStorage.getItem('empleadoID') ?? '0', 10);

    const buscar = {
      ids_empleados: [empleadoID],
    };

    this.parametros.ObtenerDetalleParametroUsuario(buscar).subscribe({
      next: (res: any) => {
        const parametro = res.data?.[0] ?? res.respuesta?.[0];

        if (!parametro) {
          localStorage.setItem('timbrarEspecial', 'No');
          return;
        }

        const resultado = parametro.timbre_especial ? 'Si' : 'No';
        localStorage.setItem('timbrarEspecial', resultado);
      },
      error: () => {
        localStorage.setItem('timbrarEspecial', 'No');
      }
    });
  }

  BuscarParametroTimbreUbicacionDesconocida() {
    const empleadoID = parseInt(localStorage.getItem('empleadoID') ?? '0', 10);

    const buscar = {
      ids_empleados: [empleadoID],
    };

    this.parametros.ObtenerDetalleParametroUsuario(buscar).subscribe({
      next: (res: any) => {
        const parametro = res.data?.[0] ?? res.respuesta?.[0];

        if (!parametro) {
          localStorage.setItem('timbrarUbicacionDesconocida', 'No');
          return;
        }

        const resultado = parametro.timbre_ubicacion_desconocida ? 'Si' : 'No';
        localStorage.setItem('timbrarUbicacionDesconocida', resultado);
      },
      error: () => {
        localStorage.setItem('timbrarUbicacionDesconocida', 'No');
      }
    });
  }

  BuscarParametroTimbreInternetRequerido() {
    const empleadoID = parseInt(localStorage.getItem('empleadoID') ?? '0', 10);

    const buscar = {
      ids_empleados: [empleadoID],
    };

    this.parametros.ObtenerDetalleParametroUsuario(buscar).subscribe({
      next: (res: any) => {
        const parametro = res.data?.[0] ?? res.respuesta?.[0];

        if (!parametro) {
          localStorage.setItem('timbrarSinInternet', 'No');
          return;
        }

        const resultado = parametro.timbre_internet ? 'Si' : 'No';
        localStorage.setItem('timbrarSinInternet', resultado);
      },
      error: () => {
        localStorage.setItem('timbrarSinInternet', 'No');
      }
    });
  }

  // ============================================================
  // VALIDAR TIMBRE NORMAL / ESPECIAL
  // ============================================================

  async VerificarTimbresSinInternet(accion: string) {
    await Geolocation.checkPermissions()
      .then(() => {
        if (this.networkService.getNetworkStatusDispositivo() === true) {
          const empleadoID = parseInt(localStorage.getItem('empleadoID') ?? '0', 10);

          const buscar = {
            ids_empleados: [empleadoID],
          };

          this.parametros.ObtenerDetalleParametroUsuario(buscar)
            .pipe(timeout(2000))
            .subscribe({
              next: (res: any) => {
                const parametro = res.data?.[0] ?? res.respuesta?.[0];

                if (!parametro) {
                  localStorage.setItem('timbrarSinInternet', 'No');
                  this.router.navigate(['/enviartimbre', accion]);
                  return;
                }

                const resultado = parametro.timbre_internet ? 'Si' : 'No';
                localStorage.setItem('timbrarSinInternet', resultado);

                this.router.navigate(['/enviartimbre', accion]);
              },
              error: () => {
                localStorage.setItem('timbrarSinInternet', 'No');
                this.router.navigate(['/enviartimbre', accion]);
              }
            });

          return;
        }

        if (localStorage.getItem('timbrarSinInternet') === 'Si') {
          this.abrirToas(
            'No puede realizar timbres sin conexión a Internet',
            'danger',
            3000,
            'middle'
          );
          return;
        }

        this.router.navigate(['/enviartimbre', accion]);
      })
      .catch(() => {
        this.abrirToas(
          'Ups!!!, al parecer no tiene activada la localización. Por favor, active el GPS.',
          'warning',
          3000,
          'middle'
        );
      });
  }

  async VerificarTimbreEspecial(accion: string) {
    const empleadoID = parseInt(localStorage.getItem('empleadoID') ?? '0', 10);

    const buscar = {
      ids_empleados: [empleadoID],
    };

    this.parametros.ObtenerDetalleParametroUsuario(buscar)
      .pipe(timeout(2000))
      .subscribe({
        next: (res: any) => {
          const parametro = res.data?.[0] ?? res.respuesta?.[0];

          if (!parametro) {
            localStorage.setItem('timbrarEspecial', 'No');
            this.abrirToas(
              'Ups!!!, al parecer no tiene activado el timbre especial',
              'warning',
              3000,
              'middle'
            );
            return;
          }

          const resultado = parametro.timbre_especial ? 'Si' : 'No';
          localStorage.setItem('timbrarEspecial', resultado);

          if (resultado === 'Si') {
            this.VerificarTimbresSinInternet(accion);
            return;
          }

          this.abrirToas(
            'Ups!!!, al parecer no tiene activado el timbre especial',
            'warning',
            3000,
            'middle'
          );
        },
        error: () => {
          if (localStorage.getItem('timbrarEspecial') === 'Si') {
            this.VerificarTimbresSinInternet(accion);
            return;
          }

          this.abrirToas(
            'Ups!!!, al parecer no tiene activado el timbre especial',
            'warning',
            3000,
            'middle'
          );
        }
      });
  }

  // ============================================================
  // MÓDULO PERMISOS
  // ============================================================

  VerificarFunciones() {
    const raw = localStorage.getItem('modulos');

    if (!raw) {
      this.apro_permisos = false;
      localStorage.setItem('apro_permisos', 'false');
      this.colorIp = 'deshabilitado';
      this.colorFp = 'deshabilitado';
      localStorage.setItem('colorIp', 'deshabilitado');
      localStorage.setItem('colorFp', 'deshabilitado');
      return;
    }

    try {
      const modulos = JSON.parse(raw);
      const { permisos } = modulos;

      this.apro_permisos = !!permisos;
      localStorage.setItem('apro_permisos', String(this.apro_permisos));

      if (this.apro_permisos === true) {
        this.colorIp = 'primary';
        this.colorFp = 'dark';
        localStorage.setItem('colorIp', 'primary');
        localStorage.setItem('colorFp', 'dark');
      } else {
        this.colorIp = 'deshabilitado';
        this.colorFp = 'deshabilitado';
        localStorage.setItem('colorIp', 'deshabilitado');
        localStorage.setItem('colorFp', 'deshabilitado');
      }

    } catch {
      this.apro_permisos = false;
      localStorage.setItem('apro_permisos', 'false');
      this.colorIp = 'deshabilitado';
      this.colorFp = 'deshabilitado';
      localStorage.setItem('colorIp', 'deshabilitado');
      localStorage.setItem('colorFp', 'deshabilitado');
    }
  }

  async btn_InicioPermisosClick() {
    await this.ValidarPermisoAntesDeTimbrar('Inicio de permiso');
  }

  async btn_FinPermisosClick() {
    await this.ValidarPermisoAntesDeTimbrar('Fin de permiso');
  }

  private async ValidarPermisoAntesDeTimbrar(accion: string) {
    await Geolocation.checkPermissions()
      .then(() => {
        if (localStorage.getItem('apro_permisos') !== 'true') {
          this.mostrarToas(' Ups!!! al parecer no tienes activado en tu plan el Módulo de Permisos.');
          return;
        }

        if (this.networkService.getNetworkStatusDispositivo() === false) {
          if (localStorage.getItem('timbrarSinInternet') === 'Si') {
            this.abrirToas(
              'No puede realizar timbres sin conexión a Internet',
              'danger',
              3000,
              'middle'
            );
            return;
          }

          this.router.navigate(['/enviartimbre', accion]);
          return;
        }

        const buscar = {
          ids_empleados: [parseInt(localStorage.getItem('empleadoID') ?? '0', 10)],
        };

        this.parametros.ObtenerDetalleParametroUsuario(buscar)
          .pipe(timeout(2000))
          .subscribe({
            next: (res: any) => {
              const parametro = res.data?.[0] ?? res.respuesta?.[0];

              if (!parametro) {
                localStorage.setItem('timbrarSinInternet', 'No');
                this.router.navigate(['/enviartimbre', accion]);
                return;
              }

              const resultado = parametro.timbre_internet ? 'Si' : 'No';
              localStorage.setItem('timbrarSinInternet', resultado);

              this.router.navigate(['/enviartimbre', accion]);
            },
            error: () => {
              this.router.navigate(['/enviartimbre', accion]);
            }
          });
      })
      .catch(() => {
        this.abrirToas(
          'Ups!!!, al parecer no tiene activada la localización. Por favor, active el GPS.',
          'warning',
          3000,
          'middle'
        );
      });
  }

  // ============================================================
  // TOAST / ALERTAS
  // ============================================================

  async abrirToas(mensaje: string, color: string, duracion: number, position: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color,
      position,
    });

    await toast.present();
  }

  async usuarioIncorrectoToas(mensaje: string, duracion: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: 'warning'
    });

    await toast.present();
  }

  async mostrarToas(mensaje: string) {
    const toast = await this.toastController.create({
      message: `<ion-icon name="information-circle-outline"></ion-icon>`
        + mensaje
        + `Te gustaría activarlo? <br> Comunícate con nosotros: www.casapazmino.com.ec`,
      duration: 4500,
      position: 'top',
      color: 'notificacicon',
      mode: 'ios',
      cssClass: 'toast-custom-class',
    });

    await toast.present();
  }

  // ============================================================
  // SESIÓN
  // ============================================================

  async checkSession(id_empleado: any) {
    return this.empleadoService.accesoMovil(id_empleado);
  }

  async cerrarSesion() {
    await this.relojService.cerrarSesion();
  }

  ngOnDestroy() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }

    if (this.relojIntervalo) {
      clearInterval(this.relojIntervalo);
    }

    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }
  }
}