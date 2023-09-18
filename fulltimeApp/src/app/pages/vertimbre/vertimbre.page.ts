import { LoadingController, ModalController, ToastController, Platform } from '@ionic/angular';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { KeyValue } from '@angular/common';
import moment from 'moment';

import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { RelojServiceService } from 'src/app/services/reloj-service.service';
import { TimbresService } from 'src/app/services/timbres.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { RangoFechasComponent } from 'src/app/componentes/rango-fechas/rango-fechas.component';

@Component({
  selector: 'app-vertimbre',
  templateUrl: './vertimbre.page.html',
  styleUrls: ['./vertimbre.page.scss'],
})

export class VertimbrePage implements OnInit {
  @ViewChild(RangoFechasComponent) rangoFechasComponent: RangoFechasComponent;

  // loading: any;
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

  ) {}

  ngOnInit() {
    //obtener timbres de empleado  
    this.BuscarFormatos();
    this.mostrarTimbres();
  }

  ionViewWillLeave(){
    console.log('Sali de Vertimbre');
    this.limpiarRango_fechas();
    this.mostrarTimbres();
    this.rangoFechasComponent.closeRangoFecha();
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

  }


  limpiarRango_fechas() {
    this.dataUserService.setFechaRangoInicio('');
    this.dataUserService.setFechaRangoFinal('');
  }

  //Pestalas de mensajes
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

  obtenerTimbres(idEmpleado) {
    this.timbres = [];
    this.relojService.obtenerTimbres(idEmpleado).subscribe(
      res => {

        let fechasObjeto = {}
        
        res.forEach(data => {
          data.fecha = this.validar.FormatearFecha(data.fec_hora_timbre, this.formato_fecha, this.validar.dia_completo);
          data.hora = this.validar.FormatearHora(moment(data.fec_hora_timbre).format('HH:mm:ss'), this.formato_hora);
          data.sfecha = '';
          data.shora = '';

          if (data.fec_hora_timbre_servidor != null) {
            data.sfecha = this.validar.FormatearFecha(data.fec_hora_timbre_servidor, this.formato_fecha, this.validar.dia_completo);
            data.shora = this.validar.FormatearHora(moment(data.fec_hora_timbre_servidor).format('HH:mm:ss'), this.formato_hora);
          }else if(data.fecha_subida_servidor != null){
            data.sfecha = this.validar.FormatearFecha(data.fecha_subida_servidor, this.formato_fecha, this.validar.dia_completo);
            data.shora = this.validar.FormatearHora(moment(data.fecha_subida_servidor).format('HH:mm:ss'), this.formato_hora);
          }
        })

        res.forEach(x => {
          if (!fechasObjeto.hasOwnProperty(x.fecha)) {
            fechasObjeto[x.fecha] = []
          }
          fechasObjeto[x.fecha].push(x)
        })

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
        this.presentLoading("Intentando conectar con el servidor");
      }

    );
  }

  filtrarFechas() {
    this.timbres_filtro = [];
    if (this.fechaInicio <= this.fechaFinal) {
      var datos = { fecInicio: this.fechaInicio, fecFinal: this.fechaFinal, codigo: localStorage.getItem('codigo') }
      this.filtimbre.PostFiltrotimbres(datos).subscribe(
        ress => {
          var fechasObjeto_f = {};

          ress.forEach(data => {
            data.fecha = this.validar.FormatearFecha(data.fec_hora_timbre, this.formato_fecha, this.validar.dia_completo);
            data.hora = this.validar.FormatearHora(moment(data.fec_hora_timbre).format('HH:mm:ss'), this.formato_hora);

            data.sfecha = '';
            data.shora = '';

            if (data.fec_hora_timbre_servidor != null) {
              data.sfecha = this.validar.FormatearFecha(data.fec_hora_timbre_servidor, this.formato_fecha, this.validar.dia_completo);
              data.shora = this.validar.FormatearHora(moment(data.fec_hora_timbre_servidor).format('HH:mm:ss'), this.formato_hora);
            }else if(data.fecha_subida_servidor != null){
              data.sfecha = this.validar.FormatearFecha(data.fecha_subida_servidor, this.formato_fecha, this.validar.dia_completo);
              data.shora = this.validar.FormatearHora(moment(data.fecha_subida_servidor).format('HH:mm:ss'), this.formato_hora);
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

          //si el objeto de los timbres esta vacion oculta las ventanas y muestra la ventana - 'mensaje_filtro'.
          if (Object.keys(fechasObjeto_f).length === 0) {
            this.filtro_mensaje = false;
            this.filtro = true;
            this.vacio = true;
          }

        },
        err => {
          this.presentLoading("Intentando conectar con el servidor");
        }
      );
    }
  }

  //cambiar el timbre del celular al del servidor y viceversa
  verTipoTimbre: string = 'timbreCelular';
  cambioHoraSC(event) {
    console.log(event.target.value);
    this.verTipoTimbre = event.target.value;
  }

  //mensaje de cargando
  private async presentLoading(msg: string) {
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
  //fin mensaje cargando

  // ABRIR MAPA
  abrirMapa(latitud, longitud) {
    if(latitud != '' && longitud != ''){
      //codigo ´para abrir el mapa con las coordenadas
      //const rutaMapa = "https://www.google.com/maps/search/+" + latitud + "+" + longitud;
      const rutaMapa = "https://maps.google.com/?q=" + latitud + " , " + longitud
      window.open(rutaMapa);
    }else{
      return this.mostrarToas('Lo sentimos no tiene las coordenadas de Ubicacion registradas', 3000, "danger");
    }
  }
  // FIN ABRIR MAPA 

  async presentAlert(obs: any, hora_timbre_diferente: any, ubicacion: any, novedades_conexion: string, conexion: boolean) {
    let novedad = novedades_conexion;
    if(conexion == true){ 
      novedad = 'Timbre sin novedad';
      if(hora_timbre_diferente == true){
        novedad = 'Hora timbre diferente al del Servidor'
      } 
    }
    const alert = await this.alertController.create({
      header: 'Observación',
      //  message: obs + " <br> Dispositivo desde el que se timbró: "  + tdispsitivo + "<br> Dispositivo registrado para este usuario: " + idcelularUsuario,
      message: obs+` <br><br> <ion-icon name="location-outline"></ion-icon> `+ubicacion+` 
              <br><br> 
              `+ novedad,
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

}

