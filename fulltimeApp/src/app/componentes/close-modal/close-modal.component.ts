import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-close-modal',
  templateUrl: './close-modal.component.html',
  styleUrls: ['./close-modal.component.scss'],
})
export class CloseModalComponent {

  @Input() titleModal: string = '';
  @Input() resetF: boolean = false;
  //@Input() formRegistro: NgForm;

  constructor(
    public modalController: ModalController
  ) { }

  closeModal(refreshInfo = true) {
    if (this.resetF) {
      //this.formRegistro.onReset();
    }
    this.modalController.dismiss({
      'refreshInfo': refreshInfo
    });
  }

}
