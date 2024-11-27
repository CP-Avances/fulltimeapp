import { LoadingController, ModalController, ToastController, Platform } from '@ionic/angular';
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { ConnectivityService } from '../../services/conexion-servidor.service'

@Component({
  selector: 'app-vertimbre',
  templateUrl: './vertimbre.page.html',
  styleUrls: ['./vertimbre.page.scss'],
})

export class VertimbrePage implements OnInit {

  // INICIALIZACION DE VARIABLES
  @ViewChild(RangoFechasComponent) rangoFechasComponent: RangoFechasComponent;
  private unsubscribe$ = new Subject<void>();
  timbres: any = []; //esta variable contiene los timbres que se muestran en la lista y se VAN A ENVIAR AL 
  timbres_filtro: any = []; //esta variable contiene los timbres filtrados que se muestran en la lista
  pageTodos: number;
  paginafiltro: number;
  showBtnPdf: boolean = false;
  loading: boolean = false;
  filtro: boolean = true;
  todos: boolean = false;
  filtro_mensaje: boolean = true;
  vacio: boolean = true;
  btn_filtro: boolean = false;
  btn_todos: boolean = false;
  serverConnected: boolean = true;
  get fechaInicio(): string { return this.dataUserService.fechaRangoInicio }
  get fechaFinal(): string { return this.dataUserService.fechaRangoFinal }
  public get rol_empleado(): number {
    return this.relojService.rol
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
    this.networkSubscriber();

    this.serverConnected = await this.connectivityService.checkServerConnection();
  }

  async ionViewWillEnter() {
    this.networkSubscriber();

    this.serverConnected = await this.connectivityService.checkServerConnection();
  }

  ionViewWillLeave() {
    this.limpiarRango_fechas();
    this.rangoFechasComponent.closeRangoFecha();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // METODO PARA VERIFICAR LA CONEXION A INTERNET
  isConnected: boolean;
  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
    console.log("Esta conectado: ", this.isConnected)
    if (!this.isConnected) {
      console.log('Desconectado');
    } else {
      this.BuscarFormatos();
      this.mostrarTimbres();
      console.log('conectado');
    }
  }

  // METODO PARA MODIFICAR EL TOAST
  async abrirToas(mensaje: string, color: string, duracion: number, position: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      position: position
    });
    toast.present();
  }

  // BUSQUEDA DE PARAMETROS DE FECHAS Y HORAS
  formato_fecha: string;
  formato_hora: string;
  BuscarFormatos() {
    this.parametro.ObtenerFormatos().subscribe(
      resp => {
        this.formato_fecha = resp.fecha;
        this.formato_hora = resp.hora;
        this.obtenerTimbres(localStorage.getItem('codigo'));
      }
    )
  }

  // METODO PAR LEER LOS TIMBRES DEL USUARIO
  mostrarTimbres() {
    this.timbres_filtro = [];
    this.obtenerTimbres(localStorage.getItem('codigo'));
    this.paginafiltro = 0;
    this.pageTodos = 1;
    this.todos = false;
    this.filtro = true;
    this.filtro_mensaje = true;
    this.limpiarRango_fechas();
  }

  // METODO PAR LEER LOS TIMBRES FILTRADOS POR FECHAS
  mostrarfiltro() {
    if (this.fechaInicio === "" || this.fechaFinal === "") {
      return this.mostrarToas('Ingrese el rango de fechas', 3000, "warning");
    }
    else if (this.fechaFinal < this.fechaInicio) {
      this.limpiarRango_fechas();

      return this.mostrarToas('La fecha de inicio no puede ser mayor a la fecha final de consulta', 3000, "danger");
    }
    else {
      this.mostrarToas('Fechas validas', 2500, "success");
      this.timbres = [];
      this.filtrarFechas();
      this.paginafiltro = 1;
      this.pageTodos = 0;
      this.filtro = false;
      this.todos = true;
      this.filtro_mensaje = true;
      this.limpiarRango_fechas();
    }
    this.rangoFechasComponent.resetFechaInicio();
    this.rangoFechasComponent.resetFechaFinal();
  }

  // METODO PARA LIMPIAR LOS RANGOS DE FECHAS
  limpiarRango_fechas() {
    this.dataUserService.setFechaRangoInicio('');
    this.dataUserService.setFechaRangoFinal('');
  }

  // METODO PARA MODIFICACR LOS MENSAJES DE PANTALLA
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

  // Preservar el orden original de la propiedad
  ordenOriginal = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return 0;
  }

  // METODO PARA OBTENER LOS TIMBRES Y FORMATEAR FECHAS
  obtenerTimbres(codigo) {
    this.timbres = [];
    this.relojService.obtenerTimbres(codigo).pipe(takeUntil(this.unsubscribe$)).subscribe(
      res => {
        console.log("ver timbres ", res)

        let fechasObjeto = {}

        res.forEach(data => {
          data.fecha = this.validar.FormatearFechaZonaHoraria(data.fecha_hora_timbre, this.formato_fecha, this.validar.dia_completo, data.zona_horaria_servidor);
          console.log("ver data.fecha ", data.fecha)

          data.hora = this.validar.FormatearHoraZonaHoraria(data.fecha_hora_timbre, this.formato_hora, data.zona_horaria_servidor);
          data.sfecha = '';
          data.shora = '';

          if (data.fecha_hora_timbre_servidor != null) {
            console.log("ver fecha registrada en el servidor", data.fecha_hora_timbre_servidor);
            data.sfecha = this.validar.FormatearFechaZonaHoraria(data.fecha_hora_timbre_servidor, this.formato_fecha, this.validar.dia_completo, data.zona_horaria_servidor);
            data.shora = this.validar.FormatearHoraZonaHoraria(data.fecha_hora_timbre_servidor, this.formato_hora, data.zona_horaria_servidor);
          } else if (data.fecha_subida_servidor != null) {
            data.sfecha = this.validar.FormatearFechaZonaHoraria(data.fecha_subida_servidor, this.formato_fecha, this.validar.dia_completo, data.zona_horaria_servidor);
            data.shora = this.validar.FormatearHoraZonaHoraria(data.fecha_subida_servidor, this.formato_hora, data.zona_horaria_servidor);
          }
        })

        res.forEach(x => {
          if (!fechasObjeto.hasOwnProperty(x.fecha)) {
            fechasObjeto[x.fecha] = []
          }
          fechasObjeto[x.fecha].push(x)
        })
        console.log('timbres en el objeto', fechasObjeto);

        this.timbres = fechasObjeto
        //si el objeto de los timbres esta vacion oculta las ventanas y muestra la ventana - 'vacio'.
        if (Object.keys(fechasObjeto).length === 0) {
          this.vacio = false;
          this.todos = true;
          this.btn_filtro = true;
          this.btn_todos = true;
        }
      },
      err => {
      }
    );
  }

  // METODO PARA OBTENER LOS TIMBRES FILTRADOS Y FORMATEAR LAS FECHAS
  filtrarFechas() {
    console.log("Entra al filtro fechas")
    this.timbres_filtro = [];
    if (this.fechaInicio <= this.fechaFinal) {
      var datos = { fecInicio: this.fechaInicio, fecFinal: this.fechaFinal, codigo: localStorage.getItem('codigo') }
      this.filtimbre.PostFiltrotimbres(datos).subscribe(
        ress => {
          console.log("ver timbres filtrados", ress)
          var fechasObjeto_f = {};
          ress.forEach(data => {

            data.fecha = this.validar.FormatearFechaZonaHoraria(data.fecha_hora_timbre_servidor, this.formato_fecha, this.validar.dia_completo, data.zona_horaria_servidor);
            data.hora = this.validar.FormatearHoraZonaHoraria(data.fecha_hora_timbre_servidor, this.formato_hora, data.zona_horaria_servidor);
            data.sfecha = '';
            data.shora = '';
            if (data.fecha_hora_timbre_servidor != null) {
              data.sfecha = this.validar.FormatearFechaZonaHoraria(data.fecha_hora_timbre_servidor, this.formato_fecha, this.validar.dia_completo, data.zona_horaria_servidor);
              data.shora = this.validar.FormatearHoraZonaHoraria(data.fecha_hora_timbre_servidor, this.formato_hora, data.zona_horaria_servidor);
            } else if (data.fecha_subida_servidor != null) {
              data.sfecha = this.validar.FormatearFechaZonaHoraria(data.fecha_subida_servidor, this.formato_fecha, this.validar.dia_completo, data.zona_horaria_servidor);
              data.shora = this.validar.FormatearHoraZonaHoraria(data.fecha_subida_servidor, this.formato_hora, data.zona_horaria_servidor);
            }
          })

          ress.forEach(i => {
            if (!fechasObjeto_f.hasOwnProperty(i.fecha)) {
              fechasObjeto_f[i.fecha] = [];
            }
            fechasObjeto_f[i.fecha].push(i);
          })
          this.timbres_filtro = fechasObjeto_f;
          console.log('timbres filtrados: ', fechasObjeto_f);
          if (Object.keys(fechasObjeto_f).length === 0) {
            this.filtro_mensaje = false;
            this.filtro = true;
            this.vacio = true;
          }
        },
        err => {
          return this.mostrarToas('Lo sentimos no fue posible conectar con el servidor', 3000, "danger");
        }
      );
    }
  }

  // ABRIR MAPA
  abrirMapa(latitud, longitud) {
    if (latitud != '' && longitud != '') {
      const rutaMapa = "https://maps.google.com/?q=" + latitud + " , " + longitud
      window.open(rutaMapa);
    } else {
      return this.mostrarToas('Lo sentimos no tiene las coordenadas de Ubicación registradas', 3000, "danger");
    }
  }

  // METODO PARA MODIFICAR LA NOVEDAD DE CADA TIMBRE
  async presentAlert(obs: any, hora_timbre_diferente: any, ubicacion: any, novedades_conexion: string, conexion: boolean) {
    let novedad = novedades_conexion;
    if (conexion == true) {
      novedad = 'Timbre sin novedad';
      if (hora_timbre_diferente == true) {
        novedad = 'Hora del timbre diferente a la hora del servidor'
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

  //variables de configuracion del componente de paginacion (pagination-controls)
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

  // METODO PARA MOSTRAR LA IMAGEN DEL TIMBRE EN UN MODAL
  async mostrarImagenModal(imagenDataUrl: string) {
    const modal = await this.modalController.create({
      component: VerImagenModalPage, // Nombre de la página modal que mostrará la imagen
      componentProps: {
        imagen: imagenDataUrl // Pasar el DataUrl como propiedad a la modal
      }
    });
    return await modal.present();
  }

}

