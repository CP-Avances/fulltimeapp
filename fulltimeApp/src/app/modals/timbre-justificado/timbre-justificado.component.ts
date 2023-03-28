import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { TimbresService } from '../../services/timbres.service';
import { DataUserLoggedService } from '../../services/data-user-logged.service';

@Component({
  selector: 'app-timbre-justificado',
  templateUrl: './timbre-justificado.component.html',
  styleUrls: ['./timbre-justificado.component.scss'],
})
export class TimbreJustificadoComponent  implements OnInit {

  @Input() data: any;

  selectOptions: any = [
    { accion: 'Ninguno', view: 'Ninguno', teclaFuncion: -1 },
    { accion: 'E', view: 'Inicio de jornada laboral', teclaFuncion: 0 },
    { accion: 'S/A', view: 'Inicio de almuerzo', teclaFuncion: 2 },
    { accion: 'E/A', view: 'Fin de almuerzo', teclaFuncion: 3 },
    { accion: 'S', view: 'Fin de jornada laboral', teclaFuncion: 1 },
    { accion: 'S/P', view: 'Fin de permiso', teclaFuncion: 4 },
    { accion: 'E/P', view: 'Inicio de permiso', teclaFuncion: 5 },
  ]

  accion: string = '';
  tecla_funcion: number = -1;
  fec_timbre: string = '';

  private get fullnameAdmin(): string {
    return this.dataUserService.UserFullname
  }

  constructor(
    public modalController: ModalController,
    private timbresService: TimbresService,
    private dataUserService: DataUserLoggedService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    console.log('Timbre CODIGO DEL EMPLEADO: ', this.data);
  }

  accionChange(e) {
    console.log(e.target.value);
    this.accion = e.target.value;
    const [obj1] = this.selectOptions.filter(o => { return o.accion === this.accion }).map(o => { return o.teclaFuncion })
    this.tecla_funcion = obj1
  }

  fechaChange(e) {
    console.log(e.target.value);
    this.fec_timbre = e.target.value
  }

  enviarTimbre() {
    console.log('timbre enviar...');
    if (this.accion === '' || this.tecla_funcion === -1 || this.fec_timbre === '') return this.abrirToas('Falta llenar todos los campos', "warning", 3000)


    let dataTimbre = {
      fec_hora_timbre: this.fec_timbre,
      accion: this.accion,
      tecl_funcion: this.tecla_funcion,
      observacion: 'Timbre creado por Administrador ' + this.fullnameAdmin,
      latitud: null,
      longitud: null,
      id_empleado: this.data.codigo,
      id_reloj: 97,
    }

    this.timbresService.PostTimbreWebAdmin(dataTimbre).subscribe(res => {
      console.log(res);
      this.closeModal(true);
      this.abrirToas(res.message, "success", 3000)
    }, err => {
      console.log(err);
    })
  }

  async abrirToas(mensaje: string, color: string, duracion: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color
    });
    toast.present();
  }

  closeModal(refreshInfo: Boolean) {
    console.log('CERRAR MODAL timbre justificado');
    this.modalController.dismiss({
      'refreshInfo': refreshInfo
    });
  }

}
