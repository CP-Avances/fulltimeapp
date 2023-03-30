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

  public networkListener: PluginListenerHandle | undefined;
  private online: Observable<boolean> = null
  private hasConnection = new BehaviorSubject(false);

  constructor(
    private platform: Platform,
    private http: HttpClient,
  )
  {
    this.ngOnInit();
  }

  public async ngOnInit(){
    if(this.platform.is('capacitor')){
      //on Device
      this.networkListener = await Network.addListener('networkStatusChange', status => {
        this.onConectedNetwork();
      });
    }else{
      // on Browser
      this.online = merge(
        of(navigator.onLine),
        fromEvent(window, 'online').pipe(mapTo(true)),
        fromEvent(window, 'offline').pipe(mapTo(false))
        );
        this.online.subscribe((isOnline) =>{
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

  public async onConectedNetwork(){
    const status = await Network.getStatus();
    if(!status?.connected){
      console.log('network is Disconnected');
      this.hasConnection.next(false);
      console.log('tipo de conexion: ',status.connectionType);
      return status?.connected;
    }else{
      console.log('network is Connected');
      this.hasConnection.next(true);
      return status?.connected;
    }
  }

  public async getNetworkType(){
    const status = await Network.getStatus();
    return status.connectionType;
  }

  public getNetworkStatus(): Observable<boolean> {
    return this.hasConnection.asObservable();
  }

  private getNetworkTestRequest(): Observable<any> {
    return this.http.get('https://jsonplaceholder.typicode.com/todos/1');
}

public async testNetworkConnection() {
    try {
        this.getNetworkTestRequest().subscribe(
        success => {
            // console.log('Request to Google Test  success', success);
                this.hasConnection.next(true);
            return;
        }, error => {
            // console.log('Request to Google Test fails', error);
            this.hasConnection.next(false);
            return;
        });
    } catch (err) {
        console.log('err testNetworkConnection', err);
        this.hasConnection.next(false);
        return;
   }
}

}
