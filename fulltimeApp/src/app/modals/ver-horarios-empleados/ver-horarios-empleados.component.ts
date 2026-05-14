import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, AlertController, IonModal } from '@ionic/angular';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { EmpleadosService } from '../../services/empleados.service';
import { DateTime } from 'luxon';
import { ParametrosSistema } from 'src/app/libs/parametros.emun';

@Component({
  selector: 'app-ver-horarios-empleados',
  templateUrl: './ver-horarios-empleados.component.html',
  styleUrls: ['./ver-horarios-empleados.component.scss'],
})
export class VerHorariosEmpleadosComponent implements OnInit {

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
    { id: 1, mes: 'Enero' },
    { id: 2, mes: 'febrero' },
    { id: 3, mes: 'Marzo' },
    { id: 4, mes: 'Abril' },
    { id: 5, mes: 'Mayo' },
    { id: 6, mes: 'Junio' },
    { id: 7, mes: 'Julio' },
    { id: 8, mes: 'Agosto' },
    { id: 9, mes: 'Septiembre' },
    { id: 10, mes: 'Octubre' },
    { id: 11, mes: 'Noviembre' },
    { id: 12, mes: 'Diciembre' },
  ]
  mes: any;
  anio: any;

  ver: boolean = true;
  listaAnios: any = [];
  tablaPlanificacion: boolean = true;
  dateSelect: any;
  monthSelect: any[] = [];
  isModalOpen = false;

  constructor(
    public modalController: ModalController,
    public alertController: AlertController,
    private empleadosService: EmpleadosService,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    private empleadoService: EmpleadosService,
  ) { }

  ngOnInit() {
    this.BuscarFormatos();
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
        this.obtenerHorariosEmpleado(this.data.id)
      }
    );
  }

  // METODO PARA CONSULTAR LOS HORARIOS DE LOS EMPLEADOS 
  obtenerHorariosEmpleado(codigo) {
    this.horariocontent = false;
    this.empleadosService.getPlanificacionHorariosEmplbyCodigo(codigo).subscribe({
      next: (res) => {
        this.horarios = res;
        var listaAnios = [];
        this.horarios.forEach(function (elemento) {
          if (listaAnios.find(p => p.anio == elemento.anio) == undefined) {
            listaAnios.push(elemento);
          }
        });

        this.listaAnios = listaAnios;
        if (this.listaAnios.length < 2) {
          this.mensajeOcultar = true;
          this.tablaPlanificacion = true;
          this.filtrarMese(this.horarios);
          this.anio = this.listaAnios[0].anio;
        } else {
          this.mensajeOcultar = true;
          this.tablaPlanificacion = true;
        }

      }, error: () => {
        this.mensajeOcultar = false;
        this.horariocontent = true;

      }
    });
  }
  meseFiltradosPorAnio: any = [];
  filtrarMese(horarios: any) {
    horarios.forEach(elemento => {
      this.listaMeses.forEach(item => {
        if (elemento.mes == item.id) {
          this.meseFiltradosPorAnio.push(item);
        }
      })
    });
  }

  // METODO PARA CAMBIAR EL AÑO
  listafiltada: any = [];
  ChangeAnio(e: any) {
    this.listafiltada = [];
    this.meseFiltradosPorAnio = [];
    this.tablaPlanificacion = true;
    this.mes = undefined;
    this.horarios.forEach(item => {
      if (e.target.value == item.anio) {
        this.listafiltada.push(item);
      }
    })

    this.filtrarMese(this.listafiltada);
    this.anio = e.target.value;

  }

  // METODO PARA CAMBIAR EL MES
  horarioMes: any = [];
  ChangeMes(e: any) {
    if (e.target.value) {
      this.horarioMes = [];
      this.tablaPlanificacion = false;
      if (this.listaAnios.length < 2) {
        this.listafiltada = this.horarios;
      }
      this.listafiltada.forEach(item => {
        if (e.target.value == parseInt(item.mes)) {
          this.horarioMes = item;
        }
      })
      this.getDaysFromDate(this.anio, e.target.value);
    }
  }

  // METODOS PARA OBTENER LOS DIAS DEL MES SEECCIONADO
  getDaysFromDate(year: any, month: any) {
    const startDay = DateTime.fromObject({
      year: parseInt(year),
      month: parseInt(month),
      day: 1
    });
    // Obtener el último día del mes
    const endDay = startDay.endOf('month');

    this.dateSelect = startDay;
    const numberDays = endDay.day - startDay.day + 1; // +1 para incluir el primer día

    const arrayDays = Object.keys([...Array(numberDays)]).map((a: any) => {
      a = parseInt(a) + 1;

      const dayObject = DateTime.fromObject({
        year: parseInt(year),
        month: parseInt(month),
        day: 1
      });
      return {
        name: dayObject.toFormat("ccc"),
        value: a,
        labora: this.validar.ObtenerPlanHorarioPorDia(this.horarioMes, a.toString(), true),
        indexWeek: dayObject.weekday
      }
    });
    this.monthSelect = arrayDays;

  }

  // METODO PARA CERRAR EL MODAL DE HORARIOS 
  closeModal() {

    this.modalController.dismiss({
      'refreshInfo': true
    });
  }

  // METODO PARA MOSTRAR EL MENSAJE DE NO EXISTENCIA DE DETALLE DE HORARIOS
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

  // METODO PARA VISUALIZAR LA INFORMACION DE DETALLES DE HORARIO
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

  // METODO PARA VISUALIZAR LA INFORMACION DE DETALLES DE HORARIO
  plan_horario: any = [];
  i: number = 0;
  presentAlert(day) {
    this.plan_horario = [];
    this.i = 0;
    const monthYear = this.dateSelect.toFormat('yyyy-MM');
    const dia = `${monthYear}-${day.value}`
    var busqueda = {
      fecha: DateTime.fromFormat(dia, 'yyyy-MM-d').toFormat('yyyy-MM-d'),
      codigo: this.data.id
    }
    this.empleadoService.getHorariosEmpleadobyCodigo(busqueda).subscribe(datos => {
      this.plan_horario = this.validar.ObtenerDetallesPlanificacion(datos);

      this.plan_horario.forEach((x) => {
        this.empleadoService.BuscarUnHorario(x.horario).subscribe(y => {
          x.horario_codigo = y.data[0].codigo;
        })
      })
      this.isModalOpen = true;
    });
  }

  confirm() {
    this.isModalOpen = false;
    this.plan_horario = [];
  }

  // METODO PARA LIMPIAR LOS ARREGLOS
  ngOnDestroy() {
    this.plan_horario = [];
    this.horarioMes = [];
    this.listafiltada = [];
    this.meseFiltradosPorAnio = [];
    this.data = [];
  }

  onClickDay(day: any) {
    if (day?.labora === 0 || day?.labora === 2) {
      this.presentAlert(day);
    }
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
