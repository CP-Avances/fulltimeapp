import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicStorageModule } from '@ionic/storage-angular';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AutenticacionGuard } from './guards/autenticacion.guard';
import { TokenInterceptorService } from './services/token-interceptor.service';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComponentesModule } from './componentes/componentes.module';
import { Drivers } from '@ionic/storage';

import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    HttpClientModule,
    ComponentesModule,
    NgxPaginationModule,
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
      provide: LOCALE_ID, useValue: 'es-EC'
    },
    
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
