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
import { SafeUrl } from '@angular/platform-browser';
import { DateTime } from 'luxon';
import { ParametrosSistema } from 'src/app/libs/parametros.emun';

@Component({
  selector: 'app-ver-timbre-empleado',
  templateUrl: './ver-timbre-empleado.component.html',
  styleUrls: ['./ver-timbre-empleado.component.scss'],
})
export class VerTimbreEmpleadoComponent implements OnInit, OnDestroy {

  imagenUrl: SafeUrl;

  @Input() data: any;

  @ViewChild('datetimeInicio') datetimeInicio: IonDatetime;
  @ViewChild('datetimeFinal') datetimeFinal: IonDatetime;

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

  get fechaInicio(): string {
    return this.dataUserService.fechaRangoInicio;
  }

  get fechaFinal(): string {
    return this.dataUserService.fechaRangoFinal;
  }

  constructor(
    private dataUserService: DataUserLoggedService,
    private timbresService: TimbresService,
    public modalController: ModalController,
    public alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private filtimbre: TimbresService,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
  ) { }

  ngOnInit() {
    this.BuscarFormatos();
  }

  ngOnDestroy() {
    this.limpiarImagenesAnteriores();
  }

  // ============================================================
  // FORMATOS
  // ============================================================

  BuscarFormatos() {
    const detalles = [
      ParametrosSistema.FORMATO_FECHA,
      ParametrosSistema.FORMATO_HORA
    ];

    this.parametro.ObtenerFormatos(detalles).subscribe({
      next: (resp: any[]) => {
        resp.forEach(p => {
          if (p.id_parametro === ParametrosSistema.FORMATO_FECHA) {
            this.formato_fecha = p.descripcion;
          }

          if (p.id_parametro === ParametrosSistema.FORMATO_HORA) {
            this.formato_hora = p.descripcion;
          }
        });

        this.mostrarTimbres();
      },
      error: () => {
        this.formato_fecha = 'YYYY-MM-DD';
        this.formato_hora = 'HH:mm:ss';
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
      return this.mostrarToas('Ingrese el rango de fechas', 3000, 'warning');
    }

    if (this.fechaFinal < this.fechaInicio) {
      this.limpiarRango_fechas();
      return this.mostrarToas(
        'La fecha de inicio no puede ser mayor a la fecha final de consulta',
        3000,
        'danger'
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

    this.timbresService.getTimbresEmpleadoByCodigo(codigo).subscribe({
      next: (res: any[]) => {
        console.log('TIMBRES TODOS:', res);
        this.timbresLista = this.prepararListaTimbres(res);

        const cantidadTimbres = this.timbresLista.length;

        if (cantidadTimbres === 0) {
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
        this.cargando = false;
      }
    });
  }

  filtrarFechas(codigo: any) {
    this.codigo = codigo;

    this.limpiarImagenesAnteriores();

    if (this.fechaInicio > this.fechaFinal) {
      return;
    }

    const datos = {
      fecInicio: this.fechaInicio,
      fecFinal: this.fechaFinal,
      codigo: this.codigo
    };

    this.cargando = true;
    this.timbresLista = [];

    this.filtimbre.PostFiltrotimbres(datos).subscribe({
      next: (ress: any[]) => {
        console.log('TIMBRES FILTRADOS:', ress);

        this.timbresLista = this.prepararListaTimbres(ress);

        const cantidadTimbresFiltro = this.timbresLista.length;

        if (cantidadTimbresFiltro === 0) {
          this.filtro_mensaje = false;
          this.vacio = true;
        } else {
          this.filtro_mensaje = true;
          this.vacio = true;
        }

        this.cargando = false;
      },
      error: () => {
        this.presentLoading('Intentando conectar con el servidor');
        this.timbresLista = [];
        this.cargando = false;
      }
    });
  }

  prepararListaTimbres(lista: any[]): any[] {
    if (!Array.isArray(lista)) {
      return [];
    }

    return lista.map((timbre: any) => {
      const copia = { ...timbre };
      this.prepararTimbre(copia);
      return copia;
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
    data.fecha = this.validar.FormatearFechaZonaHoraria(
      data.fecha_hora_timbre,
      this.formato_fecha,
      this.validar.dia_completo,
      data.zona_horaria_servidor
    );

    data.hora = this.validar.FormatearHoraZonaHoraria(
      data.fecha_hora_timbre,
      this.formato_hora,
      data.zona_horaria_servidor
    );

    data.sfecha = '';
    data.shora = '';

    if (data.fecha_hora_timbre_servidor) {
      data.sfecha = this.validar.FormatearFechaZonaHoraria(
        data.fecha_hora_timbre_servidor,
        this.formato_fecha,
        this.validar.dia_completo,
        data.zona_horaria_servidor
      );

      data.shora = this.validar.FormatearHoraZonaHoraria(
        data.fecha_hora_timbre_servidor,
        this.formato_hora,
        data.zona_horaria_servidor
      );
    } else if (data.fecha_subida_servidor != null) {
      data.sfecha = this.validar.FormatearFechaZonaHoraria(
        data.fecha_subida_servidor,
        this.formato_fecha,
        this.validar.dia_completo,
        data.zona_horaria_servidor
      );

      data.shora = this.validar.FormatearHoraZonaHoraria(
        data.fecha_subida_servidor,
        this.formato_hora,
        data.zona_horaria_servidor
      );
    }

    data.imagen = this.convertirArchivoAUrl(data.imagen);
    data.documento = this.convertirArchivoAUrl(data.documento);
  }

  convertirArchivoAUrl(archivo: any): string {
    if (!archivo) {
      return '';
    }

    if (typeof archivo === 'string') {
      return archivo;
    }

    if (archivo.data) {
      const tipo = archivo.type || archivo.mime_type || archivo.mimetype || 'image/webp';
      const blob = new Blob([new Uint8Array(archivo.data)], { type: tipo });
      const url = URL.createObjectURL(blob);
      this.imageUrls.push(url);
      return url;
    }

    if (Array.isArray(archivo)) {
      const blob = new Blob([new Uint8Array(archivo)], { type: 'image/webp' });
      const url = URL.createObjectURL(blob);
      this.imageUrls.push(url);
      return url;
    }

    return '';
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
      color
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
    this.loadingController.create({
      message: msg,
      duration: 6500,
    }).then((response) => {
      response.present();
      response.onDidDismiss().then(() => {
        return this.mostrarToas(
          'Lo sentimos no fue posible conectar con la red',
          3000,
          'danger'
        );
      });
    });
  }

  closeModal() {
    this.modalController.dismiss({
      refreshInfo: true
    });
  }

  abrirMapa(latitud: any, longitud: any) {
    if (!latitud || !longitud || latitud === '0' || longitud === '0') {
      return;
    }

    const rutaMapa = 'https://maps.google.com/?q=' + latitud + ',' + longitud;
    window.open(rutaMapa);
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