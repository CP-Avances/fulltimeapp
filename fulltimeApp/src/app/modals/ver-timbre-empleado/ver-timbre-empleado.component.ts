import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import {
  ModalController,
  AlertController,
  LoadingController,
  ToastController,
  IonDatetime
} from '@ionic/angular';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { TimbresService } from '../../services/timbres.service';
import { VerImagenModalPage } from './ver-imagen/ver-imagen.component';
import { DateTime } from 'luxon';
import { ParametrosSistema } from 'src/app/libs/parametros.emun';
import { RelojServiceService } from 'src/app/services/reloj-service.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-ver-timbre-empleado',
  templateUrl: './ver-timbre-empleado.component.html',
  styleUrls: ['./ver-timbre-empleado.component.scss'],
})
export class VerTimbreEmpleadoComponent implements OnInit, OnDestroy {

  @Input() data: any;

  @ViewChild('datetimeInicio') datetimeInicio: IonDatetime;
  @ViewChild('datetimeFinal') datetimeFinal: IonDatetime;

  private unsubscribe$ = new Subject<void>();

  timbresLista: any[] = [];
  imageUrls: string[] = [];

  pageActual: number = 1;
  itemsPorPagina: number = 8;

  cargando: boolean = false;

  vacio: boolean = true;
  filtro_mensaje: boolean = true;

  btn_filtro: boolean = false;
  btn_todos: boolean = false;

  formato_fecha: string = '';
  formato_hora: string = '';

  verTipoTimbre: string = '';

  fechaIn: string = '';
  fechaFi: string = '';
  codigo: number | string;

  esFiltroActivo: boolean = false;
  formatosCargados: boolean = false;

  get fechaInicio(): string {
    return this.dataUserService.fechaRangoInicio;
  }

  get fechaFinal(): string {
    return this.dataUserService.fechaRangoFinal;
  }

  constructor(
    private dataUserService: DataUserLoggedService,
    private relojService: RelojServiceService,
    private filtimbre: TimbresService,
    public modalController: ModalController,
    public alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
  ) { }

  ngOnInit() {
    this.cargarFormatosYMostrarTimbres();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    this.limpiarImagenesAnteriores();
    this.limpiarRango_fechas();
  }

  // ============================================================
  // FORMATOS
  // ============================================================

  cargarFormatosYMostrarTimbres() {
    if (this.formatosCargados) {
      this.mostrarTimbres();
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
            }

            if (p.id_parametro === ParametrosSistema.FORMATO_HORA) {
              this.formato_hora = p.descripcion;
            }
          });

          this.formatosCargados = true;
          this.mostrarTimbres();
        },
        error: () => {
          this.formato_fecha = 'YYYY-MM-DD';
          this.formato_hora = 'HH:mm:ss';

          this.formatosCargados = true;
          this.mostrarTimbres();
        }
      });
  }

  cambioHoraSC(event: any) {
    this.verTipoTimbre = event.detail?.value ?? event.target?.value ?? '';
  }

  // ============================================================
  // CONSULTAS
  // ============================================================

  mostrarTimbres() {
    if (!this.data?.codigo) {
      this.timbresLista = [];
      this.vacio = false;

      return this.mostrarToas(
        'No se encontró el código del empleado',
        3000,
        'warning'
      );
    }

    this.esFiltroActivo = false;
    this.pageActual = 1;

    this.vacio = true;
    this.filtro_mensaje = true;

    this.btn_filtro = false;
    this.btn_todos = false;

    this.limpiarRango_fechas();

    this.buscarTimbresEmpleado(this.data.codigo);
  }

  mostrarfiltro() {
    if (this.fechaInicio === '' || this.fechaFinal === '') {
      return this.mostrarToas(
        'Ingrese el rango de fechas',
        3000,
        'warning'
      );
    }

    if (this.fechaFinal < this.fechaInicio) {
      this.limpiarRango_fechas();

      return this.mostrarToas(
        'La fecha de inicio no puede ser mayor a la fecha final de consulta',
        3000,
        'danger'
      );
    }

    if (!this.data?.codigo) {
      return this.mostrarToas(
        'No se encontró el código del empleado',
        3000,
        'warning'
      );
    }

    this.esFiltroActivo = true;
    this.pageActual = 1;

    this.vacio = true;
    this.filtro_mensaje = true;

    this.filtrarFechas(this.data.codigo);
  }

  buscarTimbresEmpleado(codigo: any) {
    this.limpiarImagenesAnteriores();

    this.cargando = true;
    this.timbresLista = [];

    this.relojService.obtenerTimbresOptimizado(codigo)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res: any[]) => {
          this.timbresLista = this.prepararListaTimbres(res);

          if (this.timbresLista.length === 0) {
            this.vacio = false;
            this.filtro_mensaje = true;
            this.btn_filtro = true;
            this.btn_todos = true;
          } else {
            this.vacio = true;
            this.filtro_mensaje = true;
            this.btn_filtro = false;
            this.btn_todos = false;
          }

          this.cargando = false;
        },
        error: () => {
          this.timbresLista = [];
          this.vacio = false;
          this.filtro_mensaje = true;
          this.cargando = false;

          return this.mostrarToas(
            'No fue posible cargar los timbres',
            3000,
            'danger'
          );
        }
      });
  }

  filtrarFechas(codigo: any) {
    this.codigo = codigo;

    this.limpiarImagenesAnteriores();

    if (this.fechaInicio > this.fechaFinal) {
      this.cargando = false;
      return;
    }

    const datos = {
      fecInicio: this.fechaInicio,
      fecFinal: this.fechaFinal,
      codigo: this.codigo
    };

    this.cargando = true;
    this.timbresLista = [];

    this.filtimbre.PostFiltrotimbres(datos)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res: any[]) => {
          this.timbresLista = this.prepararListaTimbres(res);

          if (this.timbresLista.length === 0) {
            this.filtro_mensaje = false;
            this.vacio = true;
          } else {
            this.filtro_mensaje = true;
            this.vacio = true;
          }

          this.cargando = false;
          this.limpiarRango_fechas();
        },
        error: () => {
          this.timbresLista = [];
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

  // ============================================================
  // FECHAS
  // ============================================================

  changeFechaInicio(e: any) {
    const value = e.detail?.value ?? e.target?.value ?? '';

    this.dataUserService.setFechaRangoInicio(value);
    this.datetimeInicio?.confirm(true);

    if (!this.fechaInicio) {
      this.fechaIn = '';
      return;
    }

    this.fechaIn = DateTime.fromISO(this.fechaInicio).toFormat('yyyy-MM-dd');
  }

  changeFechaFinal(e: any) {
    const value = e.detail?.value ?? e.target?.value ?? '';

    this.dataUserService.setFechaRangoFinal(value);

    const f_inicio = new Date(this.fechaInicio);
    const f_final = new Date(value);

    this.datetimeFinal?.confirm(true);

    if (f_final < f_inicio) {
      this.limpiarRango_fechas();

      return this.mostrarToas(
        'La fecha de inicio no puede ser mayor a la fecha final de consulta',
        3000,
        'danger'
      );
    }

    if (!this.fechaFinal) {
      this.fechaFi = '';
      this.dataUserService.setFechaRangoFinal('');
      return;
    }

    this.fechaFi = DateTime.fromISO(this.fechaFinal).toFormat('yyyy-MM-dd');
  }

  limpiarRango_fechas() {
    this.dataUserService.setFechaRangoInicio('');
    this.dataUserService.setFechaRangoFinal('');
    this.fechaIn = '';
    this.fechaFi = '';
  }

  // ============================================================
  // PREPARAR TIMBRE
  // ============================================================

  prepararTimbre(data: any) {
    /*
      El HTML usa t.accion en el ngSwitch.
      Por eso dejamos normalizado este campo antes de mostrar la lista.
    */
    data.accion = this.normalizarAccionTimbre(data);

    data.fecha = this.formatearFecha(data.fecha_hora_timbre);
    data.hora = this.formatearHora(data.fecha_hora_timbre);

    data.sfecha = '';
    data.shora = '';

    const fechaServidor = data.fecha_hora_timbre_servidor ?? data.fecha_subida_servidor;

    if (fechaServidor != null) {
      data.sfecha = this.formatearFecha(fechaServidor);
      data.shora = this.formatearHora(fechaServidor);
    }

    /*
      La lista queda liviana.
      No cargamos imagen/documento aquí.
      Se cargan solo al presionar los botones.
    */
    data.imagen = '';
    data.documento = '';

    data.tiene_imagen = !!data.tiene_imagen;
    data.tiene_documento = !!data.tiene_documento;
  }

  normalizarAccionTimbre(data: any): string {
    const accion = data.accion
      ?? data.tipo_timbre
      ?? data.tipo_accion
      ?? data.accion_timbre
      ?? data.codigo_accion
      ?? data.tipo
      ?? '';

    return String(accion).trim();
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

  // ============================================================
  // ARCHIVOS
  // ============================================================

  async abrirImagenTimbre(timbre: any) {
    if (!timbre?.id) {
      return this.mostrarToas(
        'No se encontró el identificador del timbre',
        3000,
        'warning'
      );
    }

    if (!timbre.tiene_imagen) {
      return this.mostrarToas(
        'Este timbre no tiene imagen registrada',
        3000,
        'warning'
      );
    }

    this.cargando = true;

    this.relojService.verArchivoTimbre(timbre.id, 'imagen', 'ver')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: async (blob: Blob) => {
          this.cargando = false;

          if (!blob || blob.size === 0) {
            return this.mostrarToas(
              'No fue posible cargar la imagen',
              3000,
              'danger'
            );
          }

          const imagenUrl = URL.createObjectURL(blob);
          this.imageUrls.push(imagenUrl);

          await this.mostrarImagenModal(imagenUrl);
        },
        error: () => {
          this.cargando = false;

          return this.mostrarToas(
            'No fue posible cargar la imagen',
            3000,
            'danger'
          );
        }
      });
  }

  async abrirDocumentoTimbre(timbre: any) {
    if (!timbre?.id) {
      return this.mostrarToas(
        'No se encontró el identificador del timbre',
        3000,
        'warning'
      );
    }

    if (!timbre.tiene_documento) {
      return this.mostrarToas(
        'Este timbre no tiene documento registrado',
        3000,
        'warning'
      );
    }

    this.cargando = true;

    this.relojService.verArchivoTimbre(timbre.id, 'documento', 'ver')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (blob: Blob) => {
          this.cargando = false;

          if (!blob || blob.size === 0) {
            return this.mostrarToas(
              'No fue posible cargar el documento',
              3000,
              'danger'
            );
          }

          const documentoUrl = URL.createObjectURL(blob);
          this.imageUrls.push(documentoUrl);

          window.open(documentoUrl, '_blank');
        },
        error: () => {
          this.cargando = false;

          return this.mostrarToas(
            'No fue posible cargar el documento',
            3000,
            'danger'
          );
        }
      });
  }

  // ============================================================
  // PAGINACIÓN
  // ============================================================

  mostrarPaginacion(): boolean {
    return this.timbresLista.length > this.itemsPorPagina;
  }

  public maxSize: number = 5;
  public directionLinks: boolean = true;
  public autoHide: boolean = true;
  public responsive: boolean = true;

  public labels: any = {
    previousLabel: 'anterior',
    nextLabel: 'siguiente',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };

  // ============================================================
  // UI
  // ============================================================

  async mostrarToas(mensaje: string, duracion: number, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color,
      mode: 'ios'
    });

    await toast.present();
    this.dismissLoading();
  }

  async dismissLoading() {
    while (await this.loadingController.getTop() !== undefined) {
      await this.loadingController.dismiss();
    }
  }

  async presentLoading(msg: string) {
    const loading = await this.loadingController.create({
      message: msg,
      duration: 6500,
    });

    await loading.present();

    await loading.onDidDismiss();

    return this.mostrarToas(
      'Lo sentimos, no fue posible conectar con la red',
      3000,
      'danger'
    );
  }

  closeModal() {
    this.modalController.dismiss({
      refreshInfo: true
    });
  }

  abrirMapa(latitud: any, longitud: any) {
    if (!latitud || !longitud || latitud === '0' || longitud === '0') {
      return this.mostrarToas(
        'Lo sentimos, no tiene las coordenadas de ubicación registradas',
        3000,
        'warning'
      );
    }

    const rutaMapa = 'https://maps.google.com/?q=' + latitud + ',' + longitud;
    window.open(rutaMapa, '_blank');
  }

  async mostrarImagenModal(imagenDataUrl: string) {
    if (!imagenDataUrl) {
      return;
    }

    const modal = await this.modalController.create({
      component: VerImagenModalPage,
      componentProps: {
        imagen: imagenDataUrl
      }
    });

    return await modal.present();
  }

  async presentAlert(
    obs: any,
    hora_timbre_diferente: any,
    ubicacion: any,
    novedades_conexion: any,
    conexion: any
  ) {
    let novedad = novedades_conexion;

    if (conexion === true) {
      novedad = 'Timbre sin novedad';

      if (hora_timbre_diferente === true) {
        novedad = 'Hora del timbre diferente a la hora del servidor';
      }
    }

    let mensaje = '';

    if (ubicacion) {
      mensaje += `<br><br><ion-icon name="location-outline"></ion-icon> ${ubicacion}`;
    }

    if (novedad) {
      mensaje += `<br><br>${novedad}`;
    }

    const alert = await this.alertController.create({
      header: obs || 'Detalle del timbre',
      message: mensaje,
      cssClass: 'my-custom-class',
      mode: 'ios',
      buttons: ['OK']
    });

    await alert.present();
  }

  limpiarImagenesAnteriores() {
    this.imageUrls.forEach(url => {
      URL.revokeObjectURL(url);
    });

    this.imageUrls = [];
  }
}