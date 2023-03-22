import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { UpdateAutorizacionMultipleComponent } from '../../modals/update-autorizacion-multiple/update-autorizacion-multiple.component';
import { Permiso } from '../../interfaces/Permisos';
import { ValidacionesService } from '../../libs/validaciones.service';
import { ModalController } from '@ionic/angular';
import { Vacacion } from '../../interfaces/Vacacion';
import { HoraExtra } from '../../interfaces/HoraExtra';

@Component({
  selector: 'app-aprobacion-multiple',
  templateUrl: './aprobacion-multiple.component.html',
  styleUrls: ['./aprobacion-multiple.component.scss'],
})
export class AprobacionMultipleComponent implements OnDestroy {

  @Input() permisos: Permiso[];
  @Input() vacaciones: Vacacion[];
  @Input() horas_extras: HoraExtra[];

  @Output() onArrCheck: EventEmitter<Permiso[] | Vacacion[] | HoraExtra[]> = new EventEmitter
  @Output() onChecked: EventEmitter<boolean> = new EventEmitter
  @Output() onRefreshOnInit: EventEmitter<boolean> = new EventEmitter

  isChecked: boolean = false;
  constructor(
    private validacionService: ValidacionesService,
    public modalController: ModalController
  ) { }

  ngOnDestroy() {
    if (this.permisos) {
      this.onChecked.emit(false);
      this.permisos.forEach(o => { o.isChecked = false })
      this.onArrCheck.emit(this.permisos)
    }
    if (this.vacaciones) {
      this.onChecked.emit(false);
      this.vacaciones.forEach(o => { o.isChecked = false })
      this.onArrCheck.emit(this.vacaciones)
    }
    if (this.horas_extras) {
      this.onChecked.emit(false);
      this.horas_extras.forEach(o => { o.isChecked = false })
      this.onArrCheck.emit(this.horas_extras)
    }
  }

  async presentModalAutorizarMultiple() {
    if (this.permisos) {
      await this.permisosAutorizacion()
    }
    if (this.vacaciones) {
      await this.vacacionesAutorizacion()
    }
    if (this.horas_extras) {
      await this.horasExtrasAutorizacion()
    }
  }

  private async permisosAutorizacion() {
    let permisos = await this.permisos.filter(o => { return o.isChecked === true });

    if (permisos.length === 0) return this.validacionService.showToast('Seleccione solicitudes.', 3000, 'danger');

    const modal = await this.modalController.create({
      component: UpdateAutorizacionMultipleComponent,
      componentProps: {
        permisos,
        labelAutorizacion: 'Permisos'
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

  private async vacacionesAutorizacion() {
    let vacaciones = await this.vacaciones.filter(o => { return o.isChecked === true });

    if (vacaciones.length === 0) return this.validacionService.showToast('Seleccione solicitudes.', 3000, 'danger');

    const modal = await this.modalController.create({
      component: UpdateAutorizacionMultipleComponent,
      componentProps: {
        vacaciones,
        labelAutorizacion: 'Vacaciones'
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

  private async horasExtrasAutorizacion() {
    let horas_extras = await this.horas_extras.filter(o => { return o.isChecked === true });

    if (horas_extras.length === 0) return this.validacionService.showToast('Seleccione solicitudes.', 3000, 'danger');

    const modal = await this.modalController.create({
      component: UpdateAutorizacionMultipleComponent,
      componentProps: {
        horas_extras,
        labelAutorizacion: 'Horas Extras'
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
  checkedAll(isAllChecked: boolean) {
    this.isAllCheck = !isAllChecked;
    if (this.permisos) {
      this.permisos.forEach(o => { o.isChecked = this.isAllCheck })
      this.onArrCheck.emit(this.permisos);
      return;
    }
    if (this.vacaciones) {
      this.vacaciones.forEach(o => { o.isChecked = this.isAllCheck })
      this.onArrCheck.emit(this.vacaciones);
      return;
    }
    if (this.horas_extras) {
      this.horas_extras.forEach(o => { o.isChecked = this.isAllCheck })
      this.onArrCheck.emit(this.horas_extras);
    }
  }

}
