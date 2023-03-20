import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastController } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class DeleteService {

    private apiUrl = environment.url

    private handleError(error: any) {
        console.log('ERROR CAPTURADO: ', error);
        return throwError(error);
    }

    constructor(
        private http: HttpClient,
        private toastController: ToastController,
    ) { }

    EliminarRegistro(idreg: string, nametable: string) {
        const params = new HttpParams()
            .set('nametable', nametable)
            .set('idreg', idreg)
        return this.http.delete<any>(`${this.apiUrl}/delete/registro`, { params })
            .pipe(
                tap(console.log),
                catchError(this.handleError)
            )
    }

    async showToast(mensaje: string, duracion: number, color: string) {

        const toast = await this.toastController.create({
            message: mensaje,
            duration: duracion,
            color: color,
            mode: 'ios'
        });
        toast.present();
    }

}
