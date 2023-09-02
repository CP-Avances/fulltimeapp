import { Component, Input, EventEmitter, Output } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'btn-update',
  templateUrl: './update-register.component.html',
  styles: [`
    ion-icon {
      margin: 0px 5px
    }
  `],
})
export class UpdateRegisterComponent {

  @Input() formRegistro: NgForm;
  @Input() loadingBtn: boolean;
  @Input() isButtom: boolean = true;


  @Input() label: string = 'Actualizar';
  @Output() onUpdate: EventEmitter<any> = new EventEmitter()

  UpdateRegisterBtn() {
    console.log('presiono la actualizacion');

    this.onUpdate.emit()
  }

}
