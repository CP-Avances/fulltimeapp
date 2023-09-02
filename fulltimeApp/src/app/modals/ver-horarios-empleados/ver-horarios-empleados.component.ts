import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, AlertController, IonModal } from '@ionic/angular';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { EmpleadosService } from '../../services/empleados.service';
import moment from 'moment';

@Component({
  selector: 'app-ver-horarios-empleados',
  templateUrl: './ver-horarios-empleados.component.html',
  styleUrls: ['./ver-horarios-empleados.component.scss'],
})
export class VerHorariosEmpleadosComponent  implements OnInit {

  @Input() data: any;
  @ViewChild(IonModal) modal: IonModal;

  horarios: any = [];
  pageActual: number = 1;
  mensajeOcultar: boolean = true;
  horariocontent: boolean = false;

  week: any = [
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sabado',
    'Domingo'
  ]

  listaMeses: any = [
    {id: 1, mes: 'Enero'},
    {id: 2, mes: 'febrero'},
    {id: 3, mes: 'Marzo'},
    {id: 4, mes: 'Abril'},
    {id: 5, mes: 'Mayo'},
    {id: 6, mes: 'Junio'},
    {id: 7, mes: 'Julio'},
    {id: 8, mes: 'Agosto'},
    {id: 9, mes: 'Septiembre'},
    {id: 10, mes: 'Octubre'},
    {id: 11, mes: 'Noviembre'},
    {id: 12, mes: 'Diciembre'},
  ]
  mes : any;
  anio: any;

  ver: boolean = true;
  listaAnios: any = [];
  tablaPlanificacion: boolean = true;
  dateSelect: any;
  monthSelect: any [] = [];

  isModalOpen = false;

  constructor(
    public modalController: ModalController,
    public alertController: AlertController,
    private empleadosService: EmpleadosService,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    private empleadoService: EmpleadosService,
  ) {}

  ngOnInit() {
    console.log('CODIGO DEL EMPLEADO: ', this.data);
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
        this.obtenerHorariosEmpleado(this.data.codigo)
      }
    )
  }

  obtenerHorariosEmpleado(codigo) {
    var i = 0;
    this.horariocontent = false;
    this.empleadosService.getPlanificacionHorariosEmplbyCodigo(codigo).subscribe(res => {
      this.horarios = res;
      
      //Listado para poner en una lista los anios que esten planificado con horarios
      var listaAnios = [];
      this.horarios.forEach(function(elemento) {
        if(listaAnios.find(p=>p.anio == elemento.anio) == undefined)
        {
          listaAnios.push(elemento);
        }
      });

      this.listaAnios = listaAnios;
      if(this.listaAnios.length < 2){
        this.mensajeOcultar = true;
        this.tablaPlanificacion = true;
        this.filtrarMese(this.horarios);
        this.anio = this.listaAnios[0].anio;
      }else{
        this.mensajeOcultar = true;
        this.tablaPlanificacion = true;
      }

    },error => {
      this.mensajeOcultar = false;
      this.horariocontent = true;
      console.log('no hay planificacion')
    });

    /*this.empleadosService.ObtenerHorariosEmpleado(codigo).subscribe(res => {
      this.horarios = res;
      console.log('horarios: ',this.horarios);

      this.horarios.forEach(data => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, this.formato_fecha, this.validar.dia_completo);
        data.fec_final_ = this.validar.FormatearFecha(data.fec_final, this.formato_fecha, this.validar.dia_completo);
      })

      this.horarios.forEach(h => {
        h.detalle_horario.forEach(data => {
          data.hora_ = this.validar.FormatearHora(data.hora, this.formato_hora);
        })
      })

      console.log('horarios: ',this.horarios.length)
      if (Object.keys(this.horarios).length == 0) {
        this.mensajeOcultar = false;
        this.horariocontent = true;
      }

      if(this.horarios.length < 11){
        this.ver = true;
      }else{
        this.ver = false;
      }

      console.log(res);

    }, err => {
      console.log(err); this.ver = true

    })*/
  }
  meseFiltradosPorAnio: any = [];
  filtrarMese(horarios: any){
    horarios.forEach(elemento => {
      this.listaMeses.forEach(item => {
        if(elemento.mes == item.id){
          this.meseFiltradosPorAnio.push(item);
        }
      })
    });
  }

  listafiltada: any = [];
  ChangeAnio(e: any){
    this.listafiltada = [];
    this.meseFiltradosPorAnio = [];
    this.tablaPlanificacion = true;
    this.mes = undefined;
    this.horarios.forEach(item => {
      if(e.target.value == item.anio){
        this.listafiltada.push(item);
      }
    })

    this.filtrarMese(this.listafiltada);
    this.anio = e.target.value;
    console.log('this.tablaPlanificacion: ',this.tablaPlanificacion);
  }

  horarioMes: any = [];
  ChangeMes(e: any){
    if(e.target.value){
      this.horarioMes = [];
      this.tablaPlanificacion = false;
      if(this.listaAnios.length < 2){
        this.listafiltada = this.horarios;
      }
      this.listafiltada.forEach(item => {
        if(e.target.value == parseInt(item.mes)){
          this.horarioMes = item;
        }
      })
      this.getDaysFromDate(this.anio, e.target.value);
    }
  }

  getDaysFromDate(year: any, month:any){

    console.log('horario: ',this.horarioMes);

    const startDay = moment.utc(`${year}/${month}/01`);
    const endDay = startDay.clone().endOf('month')
    this.dateSelect = startDay; 

    const diffDay = endDay.diff(startDay, 'days', true);
    const numberDays = Math.round(diffDay);

    const arrayDays = Object.keys([...Array(numberDays)]).map((a: any) => {
      a = parseInt(a) + 1;
      const dayObject = moment(`${year}-${month}-${a}`);
      return {
        name: dayObject.format("dddd"),
        value: a,
        labora: this.validar.ObtenerPlanHorarioPorDia(this.horarioMes, a.toString(), true),
        indexWeek: dayObject.isoWeekday()
      }
    });

    this.monthSelect = arrayDays;
    console.log('this.monthSelect: ',this.monthSelect);

  }

  closeModal() {
    console.log('CERRAR MODAL HORARIOS');
    this.modalController.dismiss({
      'refreshInfo': true
    });
  }

  async messageNoneItems() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Detalle Horario',
      message: `
      <div style="text-align: center; padding-top: 2%;" >
        <br><br>
        <img class="tamanoImagen" src="../../../assets/images/horario.svg">
        <br>
        <ion-label style="font-size: 80%;">
          No tiene detalle de horario
        </ion-label>
      </div>
      `,
      buttons: ['OK']
    });

    return await alert.present();
  }
  async messageTwoItems(dh) {
    const [h1, h2] = dh;
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Detalle Horario',
      message: `
        <ion-list>
          <ion-item lines="none">
            <ion-label class="ion-text-wrap">
              <h3>${h1.hora_} - ${h1.tipo_accion}</h3>
            </ion-label>
          </ion-item>
          <ion-item lines="none">
            <ion-label class="ion-text-wrap">
              <h3>${h2.hora_} - ${h2.tipo_accion}</h3>
            </ion-label>
          </ion-item>
        </ion-list>
      `,
      buttons: ['OK']
    });

    return await alert.present();
  }

  async messageFourItems(plan_horario) {
    //const [h1, h2, h3, h4] = dh;
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Detalle Horario',
      message: `
      <ion-card style="margin: 2.5%; border-radius: 2%;">
                    <ion-item style="width: 95%; margin: auto;" *ngFor="let ph of plan_horario">
                      <ion-avatar slot="start">
                        <ion-icon *ngIf="ph.entrada != '' && ph.entrada != undefined" name="time-outline" color="theme" style="font-size: 35px;"></ion-icon>
                        <ion-icon *ngIf="ph.inicio_comida != '' && ph.inicio_comida != undefined" name="restaurant-outline" color="theme" style="font-size: 35px;"></ion-icon>
                        <ion-icon *ngIf="ph.fin_comida != '' && ph.fin_comida != undefined" name="restaurant-outline" color="theme" style="font-size: 35px;"></ion-icon>
                        <ion-icon *ngIf="ph.salida != '' && ph.salida != undefined" name="time-outline" color="theme" style="font-size: 35px;"></ion-icon>
                      </ion-avatar>
                     <ion-label>
                      <h2 *ngIf="ph.entrada != '' && ph.entrada != undefined"> {{ ph.entrada}}</h2>
                      <h2 *ngIf="ph.inicio_comida != '' && ph.inicio_comida != undefined"> {{ ph.salida_comida}}</h2>
                      <h2 *ngIf="ph.fin_comida != '' && ph.fin_comida != undefined"> {{ ph.fin_comida}}</h2>
                      <h2 *ngIf="ph.salida != '' && ph.salida != undefined"> {{ ph.salida}}</h2>
                      </ion-label>
                    </ion-item>
                  </ion-card>
      `,
      buttons: ['OK']
    });

    return await alert.present();
  }

  plan_horario: any = [];
  i: number = 0;
  presentAlert(day) {
    this.plan_horario = [];
    this.i = 0;
    const monthYear = this.dateSelect.format('YYYY-MM');
    const dia = `${monthYear}-${day.value}`

    console.log('dia: ',dia);
    
    var busqueda = {
      fecha: moment(dia).format('YYYY-MM-D'), 
      codigo: this.data.codigo
    }

    this.empleadoService.getHorariosEmpleadobyCodigo(busqueda).subscribe(datos => { 
      this.plan_horario = this.validar.ObtenerDetallesPlanificacion(datos);
      this.isModalOpen = true;
    });
  }

  confirm() {
    this.isModalOpen = false;
    this.plan_horario = [];
  }

  ngOnDestroy() {
    this.plan_horario = [];
    this.horarioMes = [];
    this.listafiltada = [];
    this.meseFiltradosPorAnio = [];
    this.data = [];
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
