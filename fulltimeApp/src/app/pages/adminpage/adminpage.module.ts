import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminpagePageRoutingModule } from './adminpage-routing.module';
import { AdminpagePage } from './adminpage.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    CommonModule,
    AdminpagePageRoutingModule
  ],
  declarations: [AdminpagePage]
})
export class AdminpagePageModule {}
