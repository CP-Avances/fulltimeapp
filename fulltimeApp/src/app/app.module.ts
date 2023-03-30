import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { IonicStorageModule } from '@ionic/storage-angular';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AutenticacionGuard } from './guards/autenticacion.guard';
import { TokenInterceptorService } from './services/token-interceptor.service';

import { ComponentesModule } from './componentes/componentes.module';
import { ModalsPageModule } from './modals/modals.module';
import { Drivers } from '@ionic/storage';
import { NgxPaginationModule } from 'ngx-pagination';

// Cambiar el local de la APP
import localEsEC from '@angular/common/locales/es-EC';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localEsEC);

// Configuracion del Socket.io
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const config: SocketIoConfig = { url: "http://186.4.226.49:8010", options: {}};


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    HttpClientModule,
    ComponentesModule,
    ModalsPageModule,
    NgxPaginationModule,
    SocketIoModule.forRoot(config),
    IonicStorageModule.forRoot({
      name: '__fulltime',
      driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
    })
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AutenticacionGuard,{
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    },
    {
      provide: LOCALE_ID, useValue: "es-EC"
    },
    
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
