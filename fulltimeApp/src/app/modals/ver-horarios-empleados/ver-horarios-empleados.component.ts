import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { EmpleadosService } from '../../services/empleados.service';

@Component({
  selector: 'app-ver-horarios-empleados',
  templateUrl: './ver-horarios-empleados.component.html',
  styleUrls: ['./ver-horarios-empleados.component.scss'],
})
export class VerHorariosEmpleadosComponent implements OnInit {

  @Input() data: any;

  horarios: any = [];
  pageActual: number = 1;
  mensajeOcultar: boolean = true;
  horariocontent: boolean = false;

  constructor(
    public modalController: ModalController,
    public alertController: AlertController,
    private empleadosService: EmpleadosService,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
  ) { }

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
    this.empleadosService.ObtenerHorariosEmpleado(codigo).subscribe(res => {
      this.horarios = res;

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

      console.log(res);

    }, err => {
      console.log(err);
    })
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
        No tiene detalle de horario
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

  async messageFourItems(dh) {
    const [h1, h2, h3, h4] = dh;
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
          <ion-item lines="none">
            <ion-label class="ion-text-wrap">
              <h3>${h3.hora_} - ${h3.tipo_accion}</h3>
            </ion-label>
          </ion-item>
          <ion-item lines="none">
            <ion-label class="ion-text-wrap">
              <h3>${h4.hora_} - ${h4.tipo_accion}</h3>
            </ion-label>
          </ion-item>
        </ion-list>
      `,
      buttons: ['OK']
    });

    return await alert.present();
  }

  async presentAlert(detallehorario) {

    switch (detallehorario.length) {
      case 2:
        await this.messageTwoItems(detallehorario)
        break;
      case 4:
        await this.messageFourItems(detallehorario)
        break;
      default:
        await this.messageNoneItems();
        break;
    }

  }

}
