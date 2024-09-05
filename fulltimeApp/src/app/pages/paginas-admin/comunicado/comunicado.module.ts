import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ComunicadoPageRoutingModule } from './comunicado-routing.module';
import { ComunicadoPage } from './comunicado.page';
import { ComponentesModule } from 'src/app/componentes/componentes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComunicadoPageRoutingModule,
    ComponentesModule
  ],
  declarations: [ComunicadoPage]
})
export class ComunicadoPageModule {}
