import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Timbre } from '../interfaces/Timbre';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  mensaje: string;

  private _storage: Storage | null = null;

  private inicializacionPromise: Promise<void>;

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
    public alertCrtl: AlertController,
  ) {
    this.inicializacionPromise = this.init();
  }

  private async init() {
    const storage = await this.storage.create();
    this._storage = storage;
    await this.cargarTimbres()
    await this.cargarTimbresPerdidos()
  }

  public async ready(): Promise<void> {
    await this.inicializacionPromise;
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
  async guardarTimbre(timbre: Timbre): Promise<void> {
    await this.ready();

    const existe = this.existeTimbre(this.timbres, timbre);

    if (existe) {
      return;
    }

    this.timbres.push(timbre);

    await this._storage!.set(
      'timbres',
      [...this.timbres]
    );
  }

  //METODO PARA LEER LOS TIMBRES GUARDADOS SIN INTERNET
  async cargarTimbres() {
    const timbres = await this._storage.get('timbres');
    if (timbres) {
      this.timbres = timbres;
    }
  }

  // METODO PARA ALMACENAR LOS TIMBRES SIN SERVIDOR EN EL STORAGE 
  async guardarTimbresPerdidos(timbre: Timbre): Promise<void> {
    await this.ready();

    const existe = this.existeTimbre(
      this.timbresPerdidos,
      timbre
    );

    if (existe) {
      return;
    }

    this.timbresPerdidos.push(timbre);

    await this._storage!.set(
      'timbresPerdidos',
      [...this.timbresPerdidos]
    );
  }

  //METODO PARA LEER LOS TIMBRES GUARDADOS POR FALLO EN LA CONEXION CON EL SERVIDOR
  async cargarTimbresPerdidos() {
    const timbres = await this._storage.get('timbresPerdidos');
    if (timbres) {
      this.timbresPerdidos = timbres;
    }
  }

  // METODO PARA ELIMINAR DEL STORAGE LOS TIMBRES
  public async eliminarInfo(key: string): Promise<void> {
    await this.ready();

    await this._storage!.remove(key);

    switch (key) {
      case 'timbresPerdidos':
        this.timbresPerdidos = [];
        break;
      case 'timbres':
        this.timbres = [];
        break;
    }
  }


  private obtenerClaveTimbre(timbre: any): string | null {
      const fecha = String(
          timbre?.fec_hora_timbre ??
          timbre?.fecha_hora_timbre ??
          timbre?.fecha_hora_timbre_servidor ??
          ''
      ).trim();

      if (!fecha) {
          return null;
      }

      const teclaFuncion = String(
          timbre?.tecl_funcion ??
          timbre?.tecla_funcion ??
          timbre?.teclaFuncion ??
          ''
      ).trim();

      const accion = String(timbre?.accion ?? '').trim();

      return `${fecha}|${teclaFuncion}|${accion}`;
  }

  private existeTimbre(lista: Timbre[], timbre: Timbre): boolean {
      const claveNueva = this.obtenerClaveTimbre(timbre);

      if (!claveNueva) {
          return false;
      }

      return lista.some(item =>
          this.obtenerClaveTimbre(item) === claveNueva
      );
  }

  public async reemplazarTimbresPendientes(timbresFallidos: Timbre[]): Promise<void> {
    await this.ready();

    if (timbresFallidos.length > 0) {
      this.timbresPerdidos = [...timbresFallidos];

      await this._storage!.set(
        'timbresPerdidos',
        [...this.timbresPerdidos]
      );
    } else {
      this.timbresPerdidos = [];
      await this._storage!.remove('timbresPerdidos');
    }

    this.timbres = [];
    await this._storage!.remove('timbres');
  }


}
