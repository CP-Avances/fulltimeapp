import { ModalController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Component, OnInit, Input } from '@angular/core';
import { KeyValue } from '@angular/common';
import moment from 'moment';

import { Timbre } from '../../interfaces/Timbre';

import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { TimbresService } from '../../services/timbres.service';


@Component({
  selector: 'app-ver-timbre-empleado',
  templateUrl: './ver-timbre-empleado.component.html',
  styleUrls: ['./ver-timbre-empleado.component.scss'],
})
export class VerTimbreEmpleadoComponent  implements OnInit {

  @Input() data: any;

  timbres: any = [];//esta variable contiene los timbres que se muestran en la lista y se VAN A ENVIAR
  timbres_filtro: any = []; //esta variable contiene los timbres filtrados que se muestran en la lista

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

  idEmpleado: number;

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
    console.log('AQUI EN VER TIMBRES: ', this.data);
    console.log("Ventana todosss", this.todos);
    console.log("Ventana filtro", this.filtro);
    this.BuscarFormatos();
  }

  // BUSQUEDA DE PARAMETROS DE FECHAS Y HORAS
  formato_fecha: string;
  formato_hora: string;
  BuscarFormatos() {
    this.parametro.ObtenerFormatos().subscribe(
      resp => {
        this.formato_fecha = resp.fecha;
        this.formato_hora = resp.hora;
        this.buscarTimbresEmpleado(this.data.codigo);
      }
    )
  }

  mostrarTimbres() {
    this.timbres_filtro = [];
    this.buscarTimbresEmpleado(this.data.codigo);
    this.todos = false;
    this.filtro = true;
    this.filtro_mensaje = true;
    this.pagefiltro = 0;
    this.pageActual = 1;
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



  changeFechaInicio(e) {
    if(!e.target.value){
      this.dataUserService.setFechaRangoInicio(moment(new Date()).format('YYYY-MM-DD'));
      return this.fechaIn = moment(e.target.value).format('YYYY-MM-DD');
    }else{
      this.dataUserService.setFechaRangoInicio(e.target.value);
      if(this.fechaInicio == null || this.fechaInicio == ''){
        this.fechaIn = null;
      }else{
        this.fechaIn = moment(this.fechaInicio).format('YYYY-MM-DD');
      }
    }
  }

  changeFechaFinal(e) {
    if(!e.target.value){
      if(moment(this.fechaInicio).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')){
        this.dataUserService.setFechaRangoFinal(this.fechaInicio)
        return this.fechaFi = moment(e.target.value).format('YYYY-MM-DD');//Ajustamos el formato de la fecha para mostrar en el input
      }else{
        this.dataUserService.setFechaRangoFinal('');
        this.validar.showToast('Seleccione una Fecha Final', 3000, "warning");
        return this.fechaFi = null
      }
    }else{
      this.dataUserService.setFechaRangoFinal(e.target.value);
      const f_inicio = new Date(this.fechaInicio);
      const f_final = new Date(e.target.value);

      if (f_final < f_inicio ) {
        this.limpiarRango_fechas();
        return this.mostrarToas('La fecha de inicio no puede ser mayor a la fecha final de consulta', 3000, "danger");
      }

      if(this.fechaFinal == null || this.fechaFinal == ''){
        this.fechaFi = null;
      }else{
        this.fechaFi = moment(e.target.value).format('YYYY-MM-DD');
      }
    }
  }


  limpiarRango_fechas() {
    this.dataUserService.setFechaRangoInicio('');
    this.dataUserService.setFechaRangoFinal('');
    this.fechaIn = "";
    this.fechaFi = "";
  }

  //Pestalas de mensajes
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

  buscarTimbresEmpleado(codigo) {
    this.timbresService.getTimbresEmpleadoByCodigo(codigo).subscribe((res: Timbre[]) => {

      let fechasObjeto = {}

      res.forEach(data => {
        data.fecha = this.validar.FormatearFecha(data.fec_hora_timbre, this.formato_fecha, this.validar.dia_completo);
        data.hora = this.validar.FormatearHora(moment(data.fec_hora_timbre).format('HH:mm:ss'), this.formato_hora);
      })

      res.forEach(x => {
        if (!fechasObjeto.hasOwnProperty(x.fecha)) {
          fechasObjeto[x.fecha] = []
        }

        fechasObjeto[x.fecha].push(x)

      })



      //console.log('fechas ver ..... ', fechasObjeto);
      this.timbres = fechasObjeto;

      console.log('fechas ver timbres..... ', Object.keys(fechasObjeto).length);

      //si el objeto de los timbres esta vacion oculta las ventanas y muestra la ventana - 'vacio'.
      if (Object.keys(fechasObjeto).length === 0) {
        this.vacio = false;
        this.todos = true;
        this.btn_filtro = true;
        this.btn_todos = true;
      }else if(Object.keys(fechasObjeto).length < 8){
        this.todosPagina = true;
      }else{
        this.todosPagina = false;
      }

      

    }, err => {
      console.log(err);  this.todosPagina = true;
    })
  }

  filtrarFechas(codigo) {
    this.idEmpleado = codigo
    this.timbres_filtro = [];
    if (this.fechaInicio < this.fechaFinal) {
      var datos = { fecInicio: this.fechaInicio, fecFinal: this.fechaFinal, id_empleado: this.idEmpleado }
      this.filtimbre.PostFiltrotimbres(datos).subscribe(
        ress => {
          let fechasObjeto_f = {}

          ress.forEach(data => {
            data.fecha = this.validar.FormatearFecha(data.fec_hora_timbre, this.formato_fecha, this.validar.dia_completo);
            data.hora = this.validar.FormatearHora(moment(data.fec_hora_timbre).format('HH:mm:ss'), this.formato_hora);
          })

          ress.forEach(i => {
            if (!fechasObjeto_f.hasOwnProperty(i.fecha)) {
              fechasObjeto_f[i.fecha] = [];
            }
            fechasObjeto_f[i.fecha].push(i);
          })

          this.timbres_filtro = fechasObjeto_f
          console.log(this.timbres_filtro.length);

          if (Object.keys(fechasObjeto_f).length === 0) {
            this.filtro_mensaje = false;
            this.filtro = true;
            this.vacio = true;
          }else if(Object.keys(fechasObjeto_f).length < 8){
            this.filtroPagina = true;
          }else{
            this.filtroPagina = false;
          }

        },
        err => {
          this.presentLoading("Intentando conectar con el servidor");
        }
      ), err => {
        console.log(err);  this.filtroPagina = true;
      };
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
  //fin mensaje cargando

  closeModal() {
    console.log('CERRAR MODAL TIMBRES');
    this.modalController.dismiss({
      'refreshInfo': true
    });
  }

  abrirMapa(latitud, longitud) {
    //const rutaMapa = "https://www.google.com/maps/search/+" + latitud + "+" + longitud;
    const rutaMapa = "https://maps.google.com/?q=" + latitud + "," + longitud
    window.open(rutaMapa);
    //aqui codigo ´para abrir el mapa con las cooorden

  }

  async presentAlert(obs: any, tdispsitivo: any, idcelularUsuario?: any) {
    const alert = await this.alertController.create({
      header: 'Observación',
      //  message: obs + " <br> Dispositivo desde el que se timbró: "  + tdispsitivo + "<br> Dispositivo registrado para este usuario: " + idcelularUsuario,
      message: obs,

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
  previousLabel: 'ante..',
  nextLabel: 'sigui..',
  screenReaderPaginationLabel: 'Pagination',
  screenReaderPageLabel: 'page',
  screenReaderCurrentLabel: `You're on page`
  };

}
