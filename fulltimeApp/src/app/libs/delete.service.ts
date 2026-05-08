import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})

export class DeleteService {

    constructor(
        private toastController: ToastController,
    ) { }


    async showToast(mensaje: string, duracion: number, color: string) {

        const toast = await this.toastController.create({
            message: mensaje,
            duration: duracion,
            color: color,
            mode: 'ios',
            cssClass: 'showtoast-custom-class'
        });
        toast.present();
    }

}
