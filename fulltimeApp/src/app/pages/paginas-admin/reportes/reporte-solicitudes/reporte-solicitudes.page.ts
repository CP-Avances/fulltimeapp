import { Component, ViewChild } from '@angular/core';
import { LoadingController, ModalController, ToastController, IonDatetime } from '@ionic/angular';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { ReporteSolicitudComponent } from '../../../../modals/reporte-solicitud/reporte-solicitud.component';
import moment, { min } from 'moment';
moment.locale('es');


@Component({
  selector: 'app-reporte-solicitudes',
  templateUrl: './reporte-solicitudes.page.html',
  styleUrls: ['./reporte-solicitudes.page.scss'],
})
export class ReporteSolicitudesPage {

  get fechaInicio(): string { return this.dataUserService.fechaRangoInicio }
  get fechaFinal(): string { return this.dataUserService.fechaRangoFinal }

  @ViewChild (IonDatetime) datetimeInicio: IonDatetime;
  @ViewChild (IonDatetime) datetimeFinal: IonDatetime;

  fechaIn: string = "";
  fechaFi: string = "";

  constructor(
    public modalController: ModalController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private dataUserService: DataUserLoggedService,
  ) { }

  changeFechaInicio(e) {
    this.dataUserService.setFechaRangoFinal(null);
    this.fechaFi = null
    if(!e.target.value){
      this.dataUserService.setFechaRangoInicio((moment(new Date()).format('YYYY-MM-DD')));
      return this.fechaIn = moment(e.target.value).format('YYYY-MM-DD');
    }else{
      this.dataUserService.setFechaRangoInicio(e.target.value);
      this.datetimeInicio.confirm(true);
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
        this.dataUserService.setFechaRangoFinal(this.fechaInicio);
        this.fechaFi = moment(e.target.value).format('YYYY-MM-DD');//Ajustamos el formato de la fecha para mostrar en el input
      }else{
        this.dataUserService.setFechaRangoFinal(null);
        this.fechaFi = null
        this.mostrarToas('Seleccione una Fecha Final', 3000, "warning");
      }
    }else{
      this.dataUserService.setFechaRangoFinal(e.target.value);
      this.datetimeInicio.confirm(true);
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
      color: color,
      mode: "ios",
    });
    toast.present();
    this.dismissLoading();
  }

  async dismissLoading() {
    while (await this.loadingController.getTop() !== undefined) {
      await this.loadingController.dismiss();
    }
  }

  async presentModal(objeto: any) {
    console.log('entro a modal...');

    const modal = await this.modalController.create({
      component: ReporteSolicitudComponent,
      componentProps: {
        'data': objeto,
      },
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  ionViewWillLeave(){
    console.log('Salo de reporte de Solicitudes');
    this.limpiarRango_fechas();
  }
}
