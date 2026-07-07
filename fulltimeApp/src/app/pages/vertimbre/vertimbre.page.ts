import { LoadingController, ModalController, ToastController, Platform } from '@ionic/angular';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { KeyValue } from '@angular/common';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { RelojServiceService } from 'src/app/services/reloj-service.service';
import { TimbresService } from 'src/app/services/timbres.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { RangoFechasComponent } from 'src/app/componentes/rango-fechas/rango-fechas.component';
import { VerImagenModalPage } from 'src/app/modals/ver-timbre-empleado/ver-imagen/ver-imagen.component';
import { NetworkService } from '../../libs/network.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ConnectivityService } from '../../services/conexion-servidor.service';
import { ParametrosSistema } from 'src/app/libs/parametros.emun';

@Component({
  selector: 'app-vertimbre',
  templateUrl: './vertimbre.page.html',
  styleUrls: ['./vertimbre.page.scss'],
})
export class VertimbrePage implements OnInit, OnDestroy {

  @ViewChild(RangoFechasComponent) rangoFechasComponent: RangoFechasComponent;

  private unsubscribe$ = new Subject<void>();

  timbres: any[] = [];
  timbres_filtro: any[] = [];
  timbresLista: any[] = [];

  imageUrls: string[] = [];

  pageTodos: number = 1;
  paginafiltro: number = 0;

  showBtnPdf: boolean = false;
  loading: boolean = false;
  filtro: boolean = true;
  todos: boolean = false;
  filtro_mensaje: boolean = true;
  vacio: boolean = true;
  btn_filtro: boolean = false;
  btn_todos: boolean = false;
  serverConnected: boolean = true;
  isConnected: boolean = true;
  cargando: boolean = false;

  pageActual: number = 1;
  itemsPorPagina: number = 7;

  formato_fecha: string;
  formato_hora: string;

  private formatosCargados: boolean = false;
  private pantallaInicializada: boolean = false;

  get fechaInicio(): string {
    return this.dataUserService.fechaRangoInicio;
  }

  get fechaFinal(): string {
    return this.dataUserService.fechaRangoFinal;
  }

  public get rol_empleado(): number {
    return this.relojService.rol;
  }

  constructor(
    private dataUserService: DataUserLoggedService,
    private toastController: ToastController,
    private relojService: RelojServiceService,
    private filtimbre: TimbresService,
    public loadingController: LoadingController,
    public modalController: ModalController,
    public alertController: AlertController,
    public parametro: ParametrosService,
    public platform: Platform,
    public validar: ValidacionesService,
    private networkService: NetworkService,
    private connectivityService: ConnectivityService
  ) { }

  async ngOnInit() {
    await this.inicializarPantalla();
  }

  async ionViewWillEnter() {
    /**
     * Evita que Ionic cargue todo dos veces.
     * ngOnInit ya inicializa la pantalla la primera vez.
     */
    if (!this.pantallaInicializada) {
      await this.inicializarPantalla();
    }
  }

  ionViewWillLeave() {
    this.limpiarRango_fechas();

    if (this.rangoFechasComponent) {
      this.rangoFechasComponent.closeRangoFecha();
    }

    this.limpiarImagenesAnteriores();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.limpiarImagenesAnteriores();
  }

  async inicializarPantalla() {
    this.pantallaInicializada = true;

    this.isConnected = this.networkService.getNetworkStatusDispositivo();

    if (!this.isConnected) {
      console.log('Desconectado');
      return;
    }

    this.serverConnected = await this.connectivityService.checkServerConnection();

    if (!this.serverConnected) {
      this.mostrarToas('No fue posible conectar con el servidor', 3000, 'danger');
      return;
    }

    await this.cargarFormatosYMostrarTimbres();
  }

  cargarFormatosYMostrarTimbres(): Promise<void> {
    return new Promise((resolve) => {
      if (this.formatosCargados) {
        this.mostrarTimbres();
        resolve();
        return;
      }

      const detalles = [
        ParametrosSistema.FORMATO_FECHA,
        ParametrosSistema.FORMATO_HORA
      ];

      this.parametro.ObtenerFormatos(detalles)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (resp: any[]) => {
            resp.forEach(p => {
              if (p.id_parametro === ParametrosSistema.FORMATO_FECHA) {
                this.formato_fecha = p.descripcion;
              } else if (p.id_parametro === ParametrosSistema.FORMATO_HORA) {
                this.formato_hora = p.descripcion;
              }
            });

            this.formatosCargados = true;
            this.mostrarTimbres();
            resolve();
          },
          error: () => {
            this.mostrarToas('No fue posible obtener los formatos del sistema', 3000, 'danger');
            resolve();
          }
        });
    });
  }

  async abrirToas(mensaje: string, color: string, duracion: number, position: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      position: position
    });

    toast.present();
  }

  mostrarTimbres() {
    const codigo = localStorage.getItem('codigo');

    if (!codigo) {
      this.mostrarToas('No se encontró el código del usuario', 3000, 'warning');
      return;
    }

    this.timbres_filtro = [];
    this.paginafiltro = 0;
    this.pageTodos = 1;
    this.todos = false;
    this.filtro = true;
    this.filtro_mensaje = true;
    this.pageActual = 1;

    this.limpiarRango_fechas();
    this.obtenerTimbres(codigo);
  }

  mostrarfiltro() {
    if (this.fechaInicio === '' || this.fechaFinal === '') {
      return this.mostrarToas('Ingrese el rango de fechas', 3000, 'warning');
    }

    if (this.fechaFinal < this.fechaInicio) {
      this.limpiarRango_fechas();
      return this.mostrarToas('La fecha de inicio no puede ser mayor a la fecha final de consulta', 3000, 'danger');
    }

    this.mostrarToas('Fechas válidas', 2500, 'success');

    this.timbres = [];
    this.timbresLista = [];
    this.pageActual = 1;

    this.filtrarFechas();

    this.paginafiltro = 1;
    this.pageTodos = 0;
    this.filtro = false;
    this.todos = true;
    this.filtro_mensaje = true;

    if (this.rangoFechasComponent) {
      this.rangoFechasComponent.resetFechaInicio();
      this.rangoFechasComponent.resetFechaFinal();
    }
  }

  limpiarRango_fechas() {
    this.dataUserService.setFechaRangoInicio('');
    this.dataUserService.setFechaRangoFinal('');
  }

  async mostrarToas(mensaje: string, duracion: number, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      mode: 'ios'
    });

    toast.present();
    this.dismissLoading();
  }

  async dismissLoading() {
    while (await this.loadingController.getTop() !== undefined) {
      await this.loadingController.dismiss();
    }
  }

  ordenOriginal = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return 0;
  };

  obtenerTimbres(codigo: any) {
    this.limpiarImagenesAnteriores();

    this.timbres = [];
    this.timbresLista = [];
    this.cargando = true;

    this.relojService.obtenerTimbresOptimizado(codigo)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res: any[]) => {
          console.log('ver timbres ', res)
          this.timbresLista = this.prepararListaTimbres(res);

          if (this.timbresLista.length === 0) {
            this.vacio = false;
            this.todos = true;
            this.btn_filtro = true;
            this.btn_todos = true;
          } else {
            this.vacio = true;
            this.filtro_mensaje = true;
            this.todos = false;
            this.filtro = true;
            this.btn_filtro = false;
            this.btn_todos = false;
          }

          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
          this.vacio = false;
          this.mostrarToas('No fue posible cargar los timbres', 3000, 'danger');
        }
      });
  }

  filtrarFechas() {
    this.limpiarImagenesAnteriores();

    this.timbres = [];
    this.timbres_filtro = [];
    this.timbresLista = [];
    this.cargando = true;

    if (this.fechaInicio > this.fechaFinal) {
      this.cargando = false;
      return;
    }

    const datos = {
      fecInicio: this.fechaInicio,
      fecFinal: this.fechaFinal,
      codigo: localStorage.getItem('codigo')
    };

    this.filtimbre.PostFiltrotimbres(datos)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res: any[]) => {
          this.timbresLista = this.prepararListaTimbres(res);

          if (this.timbresLista.length === 0) {
            this.filtro_mensaje = false;
            this.filtro = true;
            this.vacio = true;
          } else {
            this.filtro_mensaje = true;
            this.vacio = true;
            this.filtro = false;
            this.todos = true;
          }

          this.cargando = false;
          this.limpiarRango_fechas();
        },
        error: () => {
          this.cargando = false;
          return this.mostrarToas(
            'Lo sentimos, no fue posible conectar con el servidor',
            3000,
            'danger'
          );
        }
      });
  }

  prepararListaTimbres(lista: any[]): any[] {
    if (!Array.isArray(lista)) {
      return [];
    }

    return lista.map((data: any) => {
      const timbre = { ...data };
      this.prepararTimbre(timbre);
      return timbre;
    });
  }

  prepararTimbre(data: any) {
    data.fecha = this.formatearFecha(data.fecha_hora_timbre);
    data.hora = this.formatearHora(data.fecha_hora_timbre);

    data.sfecha = '';
    data.shora = '';

    const fechaServidor = data.fecha_hora_timbre_servidor ?? data.fecha_subida_servidor;

    if (fechaServidor != null) {
      data.sfecha = this.formatearFecha(fechaServidor);
      data.shora = this.formatearHora(fechaServidor);
    }

    /**
     * Importante:
     * Ya no convertimos imagen/documento aquí.
     * La lista debe quedar liviana.
     * La imagen/documento se carga solo cuando el usuario presiona ver.
     */
    data.imagen = '';
    data.documento = '';

    /**
     * Estos valores vienen de la nueva consulta SQL optimizada:
     * tiene_imagen y tiene_documento.
     */
    data.tiene_imagen = !!data.tiene_imagen;
    data.tiene_documento = !!data.tiene_documento;
  }

  formatearFecha(fecha: any): string {
    if (!fecha) {
      return '';
    }

    return this.validar.FormatearFechaZonaHoraria(
      fecha,
      this.formato_fecha,
      this.validar.dia_completo,
      null
    );
  }

  formatearHora(fecha: any): string {
    if (!fecha) {
      return '';
    }

    return this.validar.FormatearHoraZonaHoraria(
      fecha,
      this.formato_hora,
      null
    );
  }

  convertirArchivoAUrl(archivo: any, tipo: string = 'image/webp'): string {
    if (!archivo) {
      return '';
    }

    if (typeof archivo === 'string') {
      return archivo;
    }

    if (archivo.data) {
      const blob = new Blob([new Uint8Array(archivo.data)], { type: tipo });
      const fileUrl = URL.createObjectURL(blob);
      this.imageUrls.push(fileUrl);
      return fileUrl;
    }

    return '';
  }

  async abrirImagenTimbre(timbre: any) {
    if (!timbre?.id) {
      return this.mostrarToas('No se encontró el identificador del timbre', 3000, 'warning');
    }

    if (!timbre.tiene_imagen) {
      return this.mostrarToas('Este timbre no tiene imagen registrada', 3000, 'warning');
    }

    this.cargando = true;

    this.relojService.verArchivoTimbre(timbre.id, 'imagen', 'ver')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: async (blob: Blob) => {
          this.cargando = false;

          if (!blob || blob.size === 0) {
            return this.mostrarToas('No fue posible cargar la imagen', 3000, 'danger');
          }

          const imagenUrl = URL.createObjectURL(blob);
          this.imageUrls.push(imagenUrl);

          await this.mostrarImagenModal(imagenUrl);
        },
        error: () => {
          this.cargando = false;
          return this.mostrarToas('No fue posible cargar la imagen', 3000, 'danger');
        }
      });
  }

  async abrirDocumentoTimbre(timbre: any) {
    if (!timbre?.id) {
      return this.mostrarToas('No se encontró el identificador del timbre', 3000, 'warning');
    }

    if (!timbre.tiene_documento) {
      return this.mostrarToas('Este timbre no tiene documento registrado', 3000, 'warning');
    }

    this.cargando = true;

    this.relojService.verArchivoTimbre(timbre.id, 'documento', 'ver')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (blob: Blob) => {
          this.cargando = false;

          if (!blob || blob.size === 0) {
            return this.mostrarToas('No fue posible cargar el documento', 3000, 'danger');
          }

          const documentoUrl = URL.createObjectURL(blob);
          this.imageUrls.push(documentoUrl);

          window.open(documentoUrl, '_blank');
        },
        error: () => {
          this.cargando = false;
          return this.mostrarToas('No fue posible cargar el documento', 3000, 'danger');
        }
      });
  }

  mostrarPaginacion(): boolean {
    return this.timbresLista.length > this.itemsPorPagina;
  }

  abrirMapa(latitud: any, longitud: any) {
    if (latitud !== '' && longitud !== '' && latitud != null && longitud != null) {
      const rutaMapa = 'https://maps.google.com/?q=' + latitud + ',' + longitud;
      window.open(rutaMapa, '_blank');
    } else {
      return this.mostrarToas('Lo sentimos, no tiene las coordenadas de ubicación registradas', 3000, 'danger');
    }
  }

  async presentAlert(
    obs: any,
    hora_timbre_diferente: any,
    ubicacion: any,
    novedades_conexion: string,
    conexion: boolean
  ) {
    let novedad = novedades_conexion;

    if (conexion === true) {
      novedad = 'Timbre sin novedad';

      if (hora_timbre_diferente === true) {
        novedad = 'Hora del timbre diferente a la hora del servidor';
      }
    }

    let mensaje = `<b>${obs}</b>`;

    if (ubicacion) {
      mensaje += `<br><br><ion-icon name="location-outline"></ion-icon> ${ubicacion}`;
    }

    if (novedad) {
      mensaje += `<br><br>${novedad}`;
    }

    const alert = await this.alertController.create({
      message: mensaje,
      cssClass: 'my-custom-class',
      mode: 'ios',
      buttons: ['OK']
    });

    await alert.present();
  }

  public maxSize: number = 5;
  public directionLinks: boolean = true;
  public autoHide: boolean = false;
  public responsive: boolean = true;

  public labels: any = {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };

  async mostrarImagenModal(imagenDataUrl: string) {
    const modal = await this.modalController.create({
      component: VerImagenModalPage,
      componentProps: {
        imagen: imagenDataUrl
      }
    });

    return await modal.present();
  }

  limpiarImagenesAnteriores() {
    this.imageUrls.forEach(url => {
      URL.revokeObjectURL(url);
    });

    this.imageUrls = [];
  }
}