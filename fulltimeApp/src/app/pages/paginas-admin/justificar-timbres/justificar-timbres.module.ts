import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { JustificarTimbresPageRoutingModule } from './justificar-timbres-routing.module';
import { JustificarTimbresPage } from './justificar-timbres.page';
import { ComponentesModule } from 'src/app/componentes/componentes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JustificarTimbresPageRoutingModule,
    ComponentesModule
  ],
  declarations: [JustificarTimbresPage]
})
export class JustificarTimbresPageModule { }
