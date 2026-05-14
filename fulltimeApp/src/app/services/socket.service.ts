import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: Socket | null = null;
  private codigoEmpresa: string | null = null;

  private avisoListeners = new Set<(data: any) => void>();
  private notificacionListeners = new Set<(data: any) => void>();

  setEmpresa(codigoEmpresa: string) {
    const nuevo = String(codigoEmpresa || '').trim();
    const actual = String(this.codigoEmpresa || '').trim();

    if (nuevo && nuevo === actual && this.socket?.connected) return;

    this.desconectar(false);
    this.conectar(nuevo);
  }

  conectar(codigoEmpresa: string) {
    this.codigoEmpresa = String(codigoEmpresa || '').trim();
    if (!this.codigoEmpresa) return;

    if (this.socket?.connected) return;

    this.socket = io(environment.socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 500,
    });

    this.socket.on('connect', () => {
      console.log('Socket conectado:', this.socket?.id);

      this.socket?.emit('registrar_empresa', this.codigoEmpresa);

      this.configurarListenersSocket();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket desconectado:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.log('connect_error:', err.message);
    });
  }

  private configurarListenersSocket() {
    if (!this.socket) return;

    this.socket.off('aviso:nuevo');
    this.socket.on('aviso:nuevo', (data: any) => {
      this.avisoListeners.forEach(cb => cb(data));
    });

    this.socket.off('notificacion:nueva');
    this.socket.on('notificacion:nueva', (data: any) => {
      this.notificacionListeners.forEach(cb => cb(data));
    });
  }

  onAviso(cb: (data: any) => void): () => void {
    this.avisoListeners.add(cb);

    if (this.socket) {
      this.configurarListenersSocket();
    }

    return () => {
      this.avisoListeners.delete(cb);
    };
  }

  onNotificacion(cb: (data: any) => void): () => void {
    this.notificacionListeners.add(cb);

    if (this.socket) {
      this.configurarListenersSocket();
    }

    return () => {
      this.notificacionListeners.delete(cb);
    };
  }

  desconectar(limpiarListeners: boolean = true) {
    this.socket?.off();
    this.socket?.disconnect();
    this.socket = null;
    this.codigoEmpresa = null;

    if (limpiarListeners) {
      this.avisoListeners.clear();
      this.notificacionListeners.clear();
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}