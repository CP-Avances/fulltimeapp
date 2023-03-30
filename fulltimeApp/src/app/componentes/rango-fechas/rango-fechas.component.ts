import { Component, ViewChild } from '@angular/core';
import { DataUserLoggedService } from '../../services/data-user-logged.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import moment from 'moment';
import { ValidacionesService } from 'src/app/libs/validaciones.service';

@Component({
  selector: 'app-rango-fechas',
  templateUrl: './rango-fechas.component.html',
  styleUrls: ['./rango-fechas.component.scss'],
})
export class RangoFechasComponent {
  @ViewChild('formRegistro', { static: true }) ngForm: NgForm;
  
  get fechaInicio(): string { return this.dataUserService.fechaRangoInicio }
  get fechaFinal(): string { return this.dataUserService.fechaRangoFinal }

  fechaIn: string = "";
  fechaFi: string = "";

  constructor(
    private dataUserService: DataUserLoggedService,
    private toastController: ToastController,
    public loadingController: LoadingController,
    public validar: ValidacionesService,
  ) {}

  changeFechaInicio(event: any) {
    if(!event.target.value){
      this.dataUserService.setFechaRangoInicio(moment(new Date()).format('YYYY-MM-DD'));
      return this.fechaIn = moment(event.target.value).format('YYYY-MM-DD');
    }else{
      this.dataUserService.setFechaRangoFinal('');
      this.fechaFi = '';
      this.dataUserService.setFechaRangoInicio(event.target.value);
      this.fechaIn = moment(this.fechaInicio).format('YYYY-MM-DD');
    }
    
  }

  changeFechaFinal(e: any) {
    if(!e.target.value){
      this.dataUserService.setFechaRangoFinal('');
      this.validar.showToast('Seleccione una Fecha Final', 3000, "warning");
      return this.fechaFi = null
    }else{
      console.log(e.target.value);
      this.dataUserService.setFechaRangoFinal(e.target.value);

      const f_inicio = new Date(this.fechaInicio);
      const f_final = new Date(e.target.value);

      if (f_final < f_inicio ) {
        this.dataUserService.setFechaRangoFinal('');
        this.fechaFi = '';
        return this.mostrarToas('La fecha de inicio no puede ser mayor a la fecha final de consulta', 3000, "danger");
      }

      if(this.fechaFinal == null || this.fechaFinal == ''){
        this.fechaFi = '';
        return this.dataUserService.setFechaRangoFinal('');
      }else{
        this.fechaFi = moment(e.target.value).format('YYYY-MM-DD');
      }
      
      if (f_final.toJSON() === f_inicio.toJSON()) {
        this.dataUserService.setFechaRangoFinal('');
        this.fechaFi = '';
        return this.mostrarToas('Las fechas no pueden ser iguales', 3000, "danger");
      }
    }
  }

  closeRangoFecha() {
    console.log('Destroy Fecha rango');
    this.dataUserService.setFechaRangoInicio('');
    this.dataUserService.setFechaRangoFinal('');
    this.fechaIn = "";
    this.fechaFi = "";
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
