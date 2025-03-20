import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private serverUrl: string | null = null; // Para almacenar la URL del servidor actual

  constructor(
    private storaService: StorageService,
  ) {
    console.log('SocketService inicializado');
  }

  async obtenerUrlEmpresa() {
    this.serverUrl = await this.storaService.get('urlSocketEmpresa');
    console.log('URL del servidor socket:', this.serverUrl);
  }

  /**
   * Verifica si el socket ya está conectado y lo inicia si no lo está.
   * @param serverUrl URL del servidor socket
   */
  async connectSocket() {
    if (this.socket && this.socket.ioSocket.connected) {
      console.log('El socket ya está conectado.');
      return;
    }

    await this.obtenerUrlEmpresa();

    if (!this.serverUrl) {
      console.error('No se ha especificado la URL del servidor socket.');
      return;
    }

    this.socket = new Socket({ url: this.serverUrl, options: {} });

    this.socket.connect();

    this.socket.fromEvent('connect').subscribe(() => {
      console.log('Conectado al servidor:', this.serverUrl);
    });

    this.socket.fromEvent('disconnect').subscribe(() => {
      console.log('Desconectado del servidor');
    });
  }

  /**
   * Obtiene el socket si está conectado, de lo contrario, lo reconecta.
   */
  getSocket(): Socket | null {
    if (!this.socket || !this.socket.ioSocket.connected) {
      console.warn('El socket no está conectado. Intentando reconectar...');
      this.connectSocket();
    }
    return this.socket;
  }

  /**
   * Desconecta y elimina el socket manualmente.
   */
  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Socket desconectado manualmente.');
    }
    this.socket = null;
  }
}
