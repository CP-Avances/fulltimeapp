import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EnviartimbrePageRoutingModule } from './enviartimbre-routing.module';

import { EnviartimbrePage } from './enviartimbre.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EnviartimbrePageRoutingModule
  ],
  declarations: [EnviartimbrePage]
})
export class EnviartimbrePageModule {}
