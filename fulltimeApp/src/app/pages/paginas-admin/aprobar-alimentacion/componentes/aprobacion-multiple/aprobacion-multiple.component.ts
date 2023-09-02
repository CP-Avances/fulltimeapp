import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { Alimentacion } from 'src/app/interfaces/Alimentacion';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { ModalController } from '@ionic/angular';
import { UpdateAutorizacionMultipleComponent } from '../update-autorizacion-multiple/update-autorizacion-multiple.component';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';

@Component({
  selector: 'app-aprobacion-alimento-multiple',
  templateUrl: './aprobacion-multiple.component.html',
  styleUrls: ['./aprobacion-multiple.component.scss'],
})
export class AprobacionMultipleComponent implements OnDestroy {

  @Input() alimentacion: Alimentacion[];

  @Output() onArrCheck: EventEmitter<Alimentacion[]> = new EventEmitter
  @Output() onChecked: EventEmitter<boolean> = new EventEmitter
  @Output() onRefreshOnInit: EventEmitter<boolean> = new EventEmitter

  username: any;
  isChecked: boolean = false;
  constructor(
    private validacionService: ValidacionesService,
    public modalController: ModalController,
    private userService: DataUserLoggedService,
  ) { }

  ngOnDestroy() {
    if (this.alimentacion) {
      this.onChecked.emit(false);
      this.alimentacion.forEach(o => { o.isChecked = false });
      this.username = this.userService.UserFullname;
    }
  }

  async presentModalAutorizarMultiple() {
    if (this.alimentacion) {
      await this.alimentacionAutorizacion();
    }
  }

  private async alimentacionAutorizacion() {
    let alimentacion = await this.alimentacion.filter(o => { // condicion para no mostrar las solicitudes del mismo admin
      if(o.nempleado !== this.username){
        return o.isChecked === true 
      }
    });

    if (alimentacion.length === 0) return this.validacionService.showToast('Seleccione solicitudes.', 3000, 'danger');

    const modal = await this.modalController.create({
      component: UpdateAutorizacionMultipleComponent,
      componentProps: {
        alimentacion,
        labelAutorizacion: 'Alimentación'
      },
      cssClass: 'my-custom-class'
    });

    await modal.present();

    const { data: { refreshInfo } } = await modal.onDidDismiss()

    if (refreshInfo) {
      this.refeshSolicitudes(true)
    }
    return;
  }

  refeshSolicitudes(refreshInfo: boolean) {
    this.onRefreshOnInit.emit(refreshInfo)
  }

  ChangeAprobacionMultiple(isChecked: boolean) {
    this.isChecked = !isChecked;
    this.onChecked.emit(this.isChecked)
  }

  isAllCheck: boolean = false;
  checkedAll(isAllChecked) {
    this.isAllCheck = !isAllChecked;
    if (this.alimentacion) {
      this.alimentacion.forEach(o => { 
        if(o.nempleado !== this.username){
          o.isChecked = this.isAllCheck 
        }
      })
      this.onArrCheck.emit(this.alimentacion);
      return;
    }
  }
}
