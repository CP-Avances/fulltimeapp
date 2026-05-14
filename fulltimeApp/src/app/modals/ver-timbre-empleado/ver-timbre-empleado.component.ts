import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { KeyValue } from '@angular/common';
import { ModalController, AlertController, LoadingController, ToastController, IonDatetime } from '@ionic/angular';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { TimbresService } from '../../services/timbres.service';
import { VerImagenModalPage } from './ver-imagen/ver-imagen.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DateTime } from 'luxon';
import { ParametrosSistema } from 'src/app/libs/parametros.emun';

@Component({
  selector: 'app-ver-timbre-empleado',
  templateUrl: './ver-timbre-empleado.component.html',
  styleUrls: ['./ver-timbre-empleado.component.scss'],
})
export class VerTimbreEmpleadoComponent implements OnInit {

  //IMAGEN
  imagenUrl: SafeUrl;
  @Input() data: any;
  @ViewChild(IonDatetime) datetimeInicio: IonDatetime;
  @ViewChild(IonDatetime) datetimeFinal: IonDatetime;
  timbres: any = [];//esta variable contiene los timbres que se muestran en la lista y se VAN A ENVIAR
  timbres_filtro: any = []; //esta variable contiene los timbres filtrados que se muestran en la lista
  imageUrls: string[] = [];
  pageActual: number;
  pagefiltro: number;
  filtro_mensaje: boolean = true;
  todos: boolean = false;
  todosPagina: boolean = true;
  filtro: boolean = true;
  filtroPagina: boolean = true;
  vacio: boolean = true;
  btn_filtro: boolean = false;
  btn_todos: boolean = false;
  get fechaInicio(): string { return this.dataUserService.fechaRangoInicio }
  get fechaFinal(): string { return this.dataUserService.fechaRangoFinal }
  fechaIn: string = "";
  fechaFi: string = "";
  codigo: number | string;

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
    this.mostrarTimbres();
  }

  ngOnDestroy() {
    this.limpiarImagenesAnteriores();
  }

  // BUSQUEDA DE PARAMETROS DE FECHAS Y HORAS
  formato_fecha: string;
  formato_hora: string;
  BuscarFormatos() {
    const detalles = [
      ParametrosSistema.FORMATO_FECHA,
      ParametrosSistema.FORMATO_HORA
    ];
    this.parametro.ObtenerFormatos(detalles).subscribe(
      resp => {
        resp.forEach(p => {
          if (p.id_parametro === ParametrosSistema.FORMATO_FECHA) {
            this.formato_fecha = p.descripcion;
          } else if (p.id_parametro === ParametrosSistema.FORMATO_HORA) {
            this.formato_hora = p.descripcion;
          }
        });
        this.buscarTimbresEmpleado(this.data.codigo);
      }
    );
  }

  verTipoTimbre: string = '';

  // LA VISUALIZACION DE LA FECHA HORA DE LA LISTA DE TIMBRES POR DISPOSITIVO O POR SERVIDOR
  cambioHoraSC(event) {

    this.verTipoTimbre = event.target.value;
  }

  // METODO PARA LEER LOS TIMBRES DEL EMPLEADO SELECCIONADO
  mostrarTimbres() {
    this.timbres_filtro = [];
    this.buscarTimbresEmpleado(this.data.codigo);
    this.pagefiltro = 0;
    this.pageActual = 1;
    this.todos = false;
    this.filtro = true;
    this.filtro_mensaje = true;
    this.limpiarRango_fechas();
  }

  // METODO PARA LEER LOS TIMBRES FILTRADOS POR FECHAS DEL EMPLEADO SELECCIONADO
  mostrarfiltro() {
    if (this.fechaInicio === "" || this.fechaFinal === "") {
      return this.mostrarToas('Ingrese el rango de fechas', 3000, "warning");
    }
    else if (this.fechaFinal < this.fechaInicio) {
      this.limpiarRango_fechas();
      return this.mostrarToas('La fecha de inicio no puede ser mayor a la fecha final de consulta', 3000, "danger");
    }
    else {
      this.timbres = [];
      this.filtrarFechas(this.data.codigo);
      this.pagefiltro = 1;
      this.pageActual = 0;
      this.filtro = false;
      this.todos = true;
      this.filtro_mensaje = true;
      this.limpiarRango_fechas();
    }

  }


  // METODO PARA MODIFICAR LA FECHA DE INICIO
  changeFechaInicio(e) {
    this.dataUserService.setFechaRangoInicio(e.target.value);
    this.datetimeInicio.confirm(true);

    if (this.fechaInicio == null || this.fechaInicio == '') {
      this.fechaIn = null;
    } else {

      this.fechaIn = DateTime.fromISO(this.fechaInicio).toFormat('yyyy-MM-dd');
    }
  }

  // METODO PARA MODIFICAR LA FECHA FINAL
  changeFechaFinal(e) {

    this.dataUserService.setFechaRangoFinal(e.target.value);
    const f_inicio = new Date(this.fechaInicio);
    const f_final = new Date(e.target.value);
    this.datetimeFinal.confirm(true);

    if (f_final < f_inicio) {
      this.limpiarRango_fechas();
      return this.mostrarToas('La fecha de inicio no puede ser mayor a la fecha final de consulta', 3000, "danger");
    }

    if (this.fechaFinal == null || this.fechaFinal == '') {
      this.fechaFi = null;
      return this.dataUserService.setFechaRangoFinal('');

    } else {
      this.fechaFi = DateTime.fromISO(this.fechaFinal).toFormat('yyyy-MM-dd');
    }

  }

  // METODO PARA LIMPIAR LAS FECHAS ELEGIDAS
  limpiarRango_fechas() {
    this.dataUserService.setFechaRangoInicio('');
    this.dataUserService.setFechaRangoFinal('');
    this.fechaIn = "";
    this.fechaFi = "";
  }

  //METODO PARA CONFIGURAR LOS PARAMETROS DE LOS MENSAJES
  async mostrarToas(mensaje: string, duracion: number, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color
    });
    toast.present();
    this.dismissLoading();
  }
  async dismissLoading() {
    while (await this.loadingController.getTop() !== undefined) {
      await this.loadingController.dismiss();
    }
  }

  // Preservar el orden original de la propiedad
  ordenOriginal = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return 0;
  }

  // METODO QUE CONSUME EL SERVICIO PARA BUSCAR LOS TIMBRES DEL EMPLEADO POR SU CODIGO
  buscarTimbresEmpleado(codigo: any) {
    this.limpiarImagenesAnteriores();
    this.timbresService.getTimbresEmpleadoByCodigo(codigo).subscribe({
      next: (res: any[]) => {
        let fechasObjeto = {};
        this.imageUrls = []; // Limpiar antes de llenar

        res.forEach(data => {
          // Formatear fecha y hora
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

          // Conversión de imagen
          if (data.imagen && data.imagen.data) {
            const blob = new Blob([new Uint8Array(data.imagen.data)], { type: "image/webp" });
            const imageUrl = URL.createObjectURL(blob);
            this.imageUrls.push(imageUrl);
            data.imagen = imageUrl;
          }

          if (data.documento && data.documento.data) {
            const blob = new Blob([new Uint8Array(data.documento.data)], { type: "image/webp" });
            const imageUrl = URL.createObjectURL(blob);
            this.imageUrls.push(imageUrl);
            data.documento = imageUrl;
          }

          // Agrupación por fecha
          if (!fechasObjeto.hasOwnProperty(data.fecha)) {
            fechasObjeto[data.fecha] = [];
          }
          fechasObjeto[data.fecha].push(data);
        });

        this.timbres = fechasObjeto;

        const cantidadFechas = Object.keys(fechasObjeto).length;

        // Lógica de visibilidad de UI según cantidad de fechas
        if (cantidadFechas === 0) {
          this.vacio = false;
          this.todos = true;
          this.btn_filtro = true;
          this.btn_todos = true;
        } else if (cantidadFechas < 8) {
          this.todosPagina = true;
        } else {
          this.todosPagina = false;
          this.filtroPagina = true;
        }
      },

      error: () => {
        this.todosPagina = true;
      }
    });

  }


  // METODO QUE LEER LOS TIMBRES DEL EMPLEADO FILTRADO POR FECHA
  filtrarFechas(codigo: any) {
    this.codigo = codigo;
    this.timbres_filtro = [];
    this.limpiarImagenesAnteriores();

    if (this.fechaInicio <= this.fechaFinal) {
      const datos = {
        fecInicio: this.fechaInicio,
        fecFinal: this.fechaFinal,
        codigo: this.codigo
      };

      this.filtimbre.PostFiltrotimbres(datos).subscribe({
        next: (ress: any[]) => {

          const fechasObjeto_f = {};
          this.imageUrls = [];

          ress.forEach(data => {
            // Formatear fecha y hora
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

            // Convertir imagen
            if (data.imagen && data.imagen.data) {
              const blob = new Blob([new Uint8Array(data.imagen.data)], { type: "image/webp" });
              const imageUrl = URL.createObjectURL(blob);
              this.imageUrls.push(imageUrl);
              data.imagen = imageUrl;
            }

            if (data.documento && data.documento.data) {
              const blob = new Blob([new Uint8Array(data.documento.data)], { type: "image/webp" });
              const imageUrl = URL.createObjectURL(blob);
              this.imageUrls.push(imageUrl);
              data.documento = imageUrl;
            }

            // Agrupar por fecha
            if (!fechasObjeto_f.hasOwnProperty(data.fecha)) {
              fechasObjeto_f[data.fecha] = [];
            }
            fechasObjeto_f[data.fecha].push(data);
          });

          this.timbres_filtro = fechasObjeto_f;

          const cantidadFechas = Object.keys(fechasObjeto_f).length;

          if (cantidadFechas === 0) {
            this.filtro_mensaje = false;
            this.filtro = true;
            this.vacio = true;
          } else if (cantidadFechas < 8) {
            this.filtroPagina = true;
          } else {
            this.filtroPagina = false;
            this.todosPagina = true;
          }
        },

        error: () => {
          this.presentLoading("Intentando conectar con el servidor");
          this.filtroPagina = true;
        }
      });
    }
  }

  //mensaje de cargando
  async presentLoading(msg: string) {
    this.loadingController.create({
      message: msg,
      duration: 6500,
    }).then((response) => {
      response.present();
      response.onDidDismiss().then((response) => {
        return this.mostrarToas('Lo sentimos no fue posible conectar con la red', 3000, "danger");
      });
    });
  }

  closeModal() {
    this.modalController.dismiss({
      'refreshInfo': true
    });
  }

  // METODO PARA ABRIR GOOGLE MAPS SEGUN LAS COORDENADAS DEL TIMBRE
  abrirMapa(latitud, longitud) {
    const rutaMapa = "https://maps.google.com/?q=" + latitud + "," + longitud
    window.open(rutaMapa);
  }

  // METODO PARA VISUALIZAR LA IMAGEN DEL TIMBRE
  async mostrarImagenModal(imagenDataUrl: string) {
    const modal = await this.modalController.create({
      component: VerImagenModalPage, // Nombre de la página modal que mostrará la imagen
      componentProps: {
        imagen: imagenDataUrl // Pasar el DataUrl como propiedad a la modal
      }
    });
    return await modal.present();
  }

  // METODO PARA DEFINIR EL MENSAJE DE LAS NOVEDADES
  async presentAlert(obs: any, hora_timbre_diferente: any, ubicacion: any, novedades_conexion: any, conexion: any) {
    let novedad = novedades_conexion;
    if (conexion == true) {
      novedad = 'Timbre sin novedad';
      if (hora_timbre_diferente == true) {
        novedad = 'Hora del timbre diferente a la hora del servidor'
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
      header: obs,
      //  message: obs + " <br> Dispositivo desde el que se timbró: "  + tdispsitivo + "<br> Dispositivo registrado para este usuario: " + idcelularUsuario,
      message: mensaje,
      cssClass: 'my-custom-class',
      mode: 'ios',
      buttons: ['OK']
    });
    await alert.present();
  }

  //variables de configuracion del componente de paginacion (pagination-controls)
  public maxSize: number = 5;
  public directionLinks: boolean = true;
  public autoHide: boolean = false;
  public responsive: boolean = true;
  public labels: any = {
    previousLabel: 'anterior',
    nextLabel: 'siguiente',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };

  limpiarImagenesAnteriores() {
    this.imageUrls.forEach(url => {
      URL.revokeObjectURL(url);
    });
    this.imageUrls = [];
  }

}
