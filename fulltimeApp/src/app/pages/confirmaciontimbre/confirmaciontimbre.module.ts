import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfirmaciontimbrePageRoutingModule } from './confirmaciontimbre-routing.module';

import { ConfirmaciontimbrePage } from './confirmaciontimbre.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfirmaciontimbrePageRoutingModule
  ],
  declarations: [ConfirmaciontimbrePage]
})
export class ConfirmaciontimbrePageModule {}
