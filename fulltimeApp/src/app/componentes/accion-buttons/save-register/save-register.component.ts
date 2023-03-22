import { Component, Output, EventEmitter, Input } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'btn-save',
  templateUrl: './save-register.component.html',
  styleUrls: [],
})
export class SaveRegisterComponent {

  @Input() formRegistro: NgForm;
  @Input() loadingBtn: boolean;

  @Input() label: string = 'Guardar';
  @Output() onSave: EventEmitter<any> = new EventEmitter()

  constructor() { }

  SaveRegisterBtn() {
    this.onSave.emit()
  }

}
