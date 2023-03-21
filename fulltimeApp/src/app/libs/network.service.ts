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

export class NetworkService implements OnInit{

  status: boolean = false;

  public networkListener: PluginListenerHandle | undefined;
  private hasConnection = new BehaviorSubject(false);

  constructor(
    private platform: Platform,
    private http: HttpClient,
  )
  {}

  async ngOnInit(){
    if(this.platform.is('capacitor')){
      //on Device
      this.networkListener = await Network.addListener('networkStatusChange', status => {
        console.log('Estado de la conexion: ',status);
      });
      const status = await Network.getStatus();
      console.log('Estado de la conexion: ',status.connected);
      this.getNetworkStatus();
      console.log('Network statud: ',this.status);
    }else{
      //on Browser
      /*this.online = merge(
        of(navigator.onLine),
        fromEvent(window, 'online').pipe(mapTo(true)),
        fromEvent(window, 'offline').pipe(mapTo(false))
      );

      this.online.subscribe((isOnline) =>{
        if (isOnline) {
          this.hasConnection.next(true);
          console.log('network was connected :-)');
        } else {
          console.log('network was disconnected :-(');
          this.hasConnection.next(false);
          console.log(isOnline);
        }
      });*/
    }
  }

  public async getNetworkStatus(){
    const status = await Network.getStatus();
    return status?.connected;
  }

  public async getNetworkType() {
    const status = await Network.getStatus();
    return status.connectionType;
  }

}
