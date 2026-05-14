import { Component, ViewChild } from '@angular/core';
import { DataUserLoggedService } from '../../services/data-user-logged.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { IonDatetime } from '@ionic/angular';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-rango-fechas',
  templateUrl: './rango-fechas.component.html',
  styleUrls: ['./rango-fechas.component.scss'],
})
export class RangoFechasComponent {

  @ViewChild('formRegistro', { static: true }) ngForm: NgForm;
  @ViewChild(IonDatetime) datetimeInicio: IonDatetime;
  @ViewChild(IonDatetime) datetimeFinal: IonDatetime;

  get fechaInicio(): string { return this.dataUserService.fechaRangoInicio }
  get fechaFinal(): string { return this.dataUserService.fechaRangoFinal }

  fechaIn: string = "";
  fechaFi: string = "";

  constructor(
    private dataUserService: DataUserLoggedService,
    private toastController: ToastController,
    public loadingController: LoadingController,
    public validar: ValidacionesService,
  ) { }

  changeFechaInicio(event: any) {
    this.dataUserService.setFechaRangoFinal('');
    this.fechaFi = '';
    this.dataUserService.setFechaRangoInicio(event.target.value);
    this.fechaIn = DateTime.fromISO(this.fechaInicio).toFormat('yyyy-MM-dd');
    this.datetimeInicio.confirm(true);
  }

  changeFechaFinal(e: any) {
    this.dataUserService.setFechaRangoFinal(e.target.value);
    const f_inicio = new Date(this.fechaInicio);
    const f_final = new Date(e.target.value);
    this.datetimeFinal.confirm(true);
    if (f_final < f_inicio) {
      this.dataUserService.setFechaRangoFinal('');
      this.fechaFi = '';
      return this.mostrarToas('La fecha de inicio no puede ser mayor a la fecha final de consulta', 3000, "danger");
    }
    if (this.fechaFinal == null || this.fechaFinal == '') {
      this.fechaFi = '';
      return this.dataUserService.setFechaRangoFinal('');
    } else {
      this.fechaFi = DateTime.fromISO(this.fechaFinal).toFormat('yyyy-MM-dd');
    }
  }

  closeRangoFecha() {

    this.dataUserService.setFechaRangoInicio('');
    this.dataUserService.setFechaRangoFinal('');
    this.fechaIn = "";
    this.fechaFi = "";
  }

  resetFechaInicio() {
    this.fechaIn = ''; // Resetea el valor del modelo
    // this.datetimeInicio.reset(); // Resetea el componente ion-datetime
  }

  resetFechaFinal() {
    this.fechaFi = ''; // Resetea el valor del modelo
    //this.datetimeFinal.reset(); // Resetea el componente ion-datetime

  }

  async mostrarToas(mensaje: string, duracion: number, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      mode: "ios"
    });
    toast.present();
    this.dismissLoading();
  }

  async dismissLoading() {
    while (await this.loadingController.getTop() !== undefined) {
      await this.loadingController.dismiss();
    }
  }

}
