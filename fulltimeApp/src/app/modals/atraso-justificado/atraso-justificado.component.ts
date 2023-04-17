import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ModalController, IonDatetime } from '@ionic/angular';
import { TimbresService } from '../../services/timbres.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import moment from 'moment';

@Component({
  selector: 'app-atraso-justificado',
  templateUrl: './atraso-justificado.component.html',
  styleUrls: ['./atraso-justificado.component.scss'],
})
export class AtrasoJustificadoComponent  implements OnInit {

  @Input() data: any;
  @ViewChild(IonDatetime) datetimeInicio: IonDatetime;

  descripcion: string = "";
  fec_justifica: string = "";
  time: Date = new Date();

  //Variables para almacenar la fecha de y la hora que se ingresa en el Form
  Fecha: string = '';

  constructor(
    public modalController: ModalController,
    public timbreservice: TimbresService,
    private validacion: ValidacionesService
  ) { }

  ngOnInit(){
    console.log('ATRASO | Data empleado: ', this.data);
  }

  descripcionChange(e) {
    this.descripcion = e.target.value;
  }

  onFocus(){
    document.getElementById('textarea').style.position = "absolute";
  }

  fechaJustificacionChange(e) {
    if(!e.target.value){
      this.fec_justifica = (moment(new Date()).format('YYYY-MM-DD'));
      return this.Fecha = moment(this.fec_justifica).format('YYYY-MM-DD');
    }else{
      this.fec_justifica = e.target.value;
      this.Fecha = moment(this.fec_justifica).format('YYYY-MM-DD');
      this.datetimeInicio.confirm(true);
    }
  }

  enviarJustificacion() {
    
    if (this.descripcion === '') return this.validacion.showToast('Ingresar la Descripcion', 3000, 'danger')
    if (this.fec_justifica === '') return this.validacion.showToast('Ingresar la Fecha', 3000, 'danger')


    let datos = {
      descripcion: this.descripcion,
      fec_justifica: this.fec_justifica,
      codigo: this.data.codigo,
      create_time: this.time,
      codigo_create_user: localStorage.getItem('codigo')
    }

    console.log("Descripción: ",this.descripcion);
    console.log(" fec_justificada: ",this.fec_justifica);
    console.log("Codigo: ",this.data.codigo);
    console.log(" Create_time: ",datos.create_time);
    console.log("Codigo_create_user: ",localStorage.getItem('codigo'));

    this.timbreservice.PostJustificacionAtraso(datos).subscribe(res => {
      
      console.log(res);
      this.validacion.showToast(res.body.mensaje, 2000, 'success')
      this.closeModal(true)

    }, err => {
      console.log(err);
      this.validacion.showToast(err.error.message, 2500, 'danger')
    })
  }

  closeModal(refreshInfo: Boolean) {
    console.log('CERRAR MODAL Atraso Justificado');
    this.modalController.dismiss({
      'refreshInfo': refreshInfo
    });
  }

}
