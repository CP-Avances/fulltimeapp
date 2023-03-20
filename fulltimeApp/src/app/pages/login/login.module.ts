import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ComponentesModule } from 'src/app/componentes/componentes.module';

import { LoginPageRoutingModule } from './login-routing.module';
import { LoginPage } from './login.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentesModule,
    LoginPageRoutingModule
  ],
  declarations: [LoginPage]
})
export class LoginPageModule {}
