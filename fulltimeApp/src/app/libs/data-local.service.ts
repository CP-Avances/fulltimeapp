import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Timbre } from '../interfaces/Timbre';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  mensaje: string;

  private _storage: Storage | null = null;

  private timbres: Timbre[] = [];

  public get timbresStorage(): Timbre[] {
    return [...this.timbres]
  }

  private timbresPerdidos: Timbre[] = [];

  public get timbresPerdidosStorage(): Timbre[] {
    return [...this.timbresPerdidos]
  }

  constructor(
    private storage: Storage,
    private toastController: ToastController,
    public alertCrtl: AlertController,
  ) {
    this.init();
  }

  private async init() {
    const storage = await this.storage.create();
    this._storage = storage;
    await this.cargarTimbres()
    await this.cargarTimbresPerdidos()
  }

  // Diseno de Mensaje de notificacion con logo 
  async showAlert(mensaje: string) {
    let alert = await this.alertCrtl.create({
      message: mensaje,
      buttons: [
        {
          text: 'OK',
          cssClass: 'alert-button-confirm'
        }],
      mode: "ios",
    }); await alert.present();
  }

  // METODO PARA ALMACENAR LOS TIMBRES SIN INTERNET EN EL STORAGE 
  guardarTimbre(timbre: Timbre) {
    const existe = this.timbres.find(tim => tim.fecha_hora_timbre === timbre.fecha_hora_timbre)
    if (!existe) {
      this.mensaje = `<div class="card-alert">
                            <img src="../../../assets/images/LOGOBLFT.png" class="img-alert">
                            <br>
                            <p> Timbre guardado en la memoria del teléfono. Se enviarán cuando tenga conexión a internet 😅 </p>
                          </div>`;
      this.showAlert(this.mensaje);
      this.timbres.push(timbre);
      this._storage.set('timbres', this.timbres);
    }
  }

  //METODO PARA LEER LOS TIMBRES GUARDADOS SIN INTERNET
  async cargarTimbres() {
    const timbres = await this._storage.get('timbres');
    if (timbres) {
      this.timbres = timbres;
    }
  }

  // METODO PARA ALMACENAR LOS TIMBRES SIN SERVIDOR EN EL STORAGE 
  guardarTimbresPerdidos(timbre: Timbre) {
    const existe = this.timbresPerdidos.find(tim => tim.fecha_hora_timbre === timbre.fecha_hora_timbre)
    if (!existe) {
      this.mensaje = `<div class="card-alert">
                            <img src="../../../assets/images/LOGOBLFT.png" class="img-alert">
                            <br>
                            <p> Timbre guardado en la memoria del teléfono. Revisar en el listado de "Timbres no enviados" </p>
                          </div>`;
      this.showAlert(this.mensaje);
      this.timbresPerdidos.push(timbre);
      this._storage.set('timbresPerdidos', this.timbresPerdidos);
    }
  }

  //METODO PARA LEER LOS TIMBRES GUARDADOS POR FALLO EN LA CONEXION CON EL SERVIDOR
  async cargarTimbresPerdidos() {
    const timbres = await this._storage.get('timbresPerdidos');
    if (timbres) {
      this.timbresPerdidos = timbres;
    }
  }

  // METODO PARA ELIMINAR DEL STORAGE LOS TIMBRES
  public async eliminarInfo(key: string) {
    await this._storage.remove(key);
    switch (key) {

      case 'timbresPerdidos':
        this.timbresPerdidos = [];
        break;

      case 'timbres':
        this.timbres = [];
        break;

      default:
        break;
    }
  }

}
