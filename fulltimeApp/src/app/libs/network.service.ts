import { Injectable, OnInit } from '@angular/core';
import { Network } from '@capacitor/network';
import { Platform } from '@ionic/angular';
import { mapTo } from 'rxjs/operators';
import { Observable, fromEvent, merge, of, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PluginListenerHandle } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})

export class NetworkService implements OnInit {

  public networkListener: PluginListenerHandle | undefined;
  private online: Observable<boolean> = null
  private hasConnection = new BehaviorSubject(false);

  constructor(
    private platform: Platform,
    private http: HttpClient,
  ) {
    this.ngOnInit();
  }
  networkStatus: boolean;

  public async ngOnInit() {
    
    this.checkNetworkStatus();
    
    Network.addListener('networkStatusChange', status => {
      console.log('Estado de red cambiado:', status);
      this.networkStatus = status.connected ? true : false;
    });

    if (this.platform.is('capacitor')) {
      this.networkListener = await Network.addListener('networkStatusChange', status => {
        this.onConectedNetwork();
      });
    } else {
      this.online = merge(
        of(navigator.onLine),
        fromEvent(window, 'online').pipe(mapTo(true)),
        fromEvent(window, 'offline').pipe(mapTo(false))
      );
      this.online.subscribe((isOnline) => {
        if (isOnline) {
          this.hasConnection.next(true);
          console.log('network is Connected');
        } else {
          console.log('network is Disconnected');;
          this.hasConnection.next(false);
          console.log(isOnline);
        }
      }
      );
    }
  }

  // METODO PARA VERIFICAR EL ESTADO DE CONEXIÓN
  public async onConectedNetwork() {
    const status = await Network.getStatus();
    if (!status?.connected) {
      console.log('network is Disconnected');
      this.hasConnection.next(false);
      console.log('tipo de conexion: ', status.connectionType);
      return status?.connected;
    } else {
      console.log('network is Connected');
      this.hasConnection.next(true);
      return status?.connected;
    }
  }

  // METODO PARA VERIFICAR ITERATIVAMENTE SI EXISTE CONEXION A INTERNET
  public getNetworkStatus(): Observable<boolean> {
    return this.hasConnection.asObservable();
  }

  // METODO PARA OBTENER INFORMACION DE CONEXION A INTERNET
  public getNetworkStatusDispositivo(): boolean {
    return this.networkStatus;
  }

  // VERIFICA SI EXISTE O NO CONEXION A INTERNET
  async checkNetworkStatus() {
    const status = await Network.getStatus();
    this.networkStatus = status.connected ? true : false;
  }

}
