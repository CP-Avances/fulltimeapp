import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AlimentacionAdminModule } from './componentes/alimentacion-admin.module';
import { AprobarAlimentacionPageRoutingModule } from './aprobar-alimentacion-routing.module';
import { AprobarAlimentacionPage } from './aprobar-alimentacion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AprobarAlimentacionPageRoutingModule,
    AlimentacionAdminModule
  ],
  declarations: [AprobarAlimentacionPage]
})
export class AprobarAlimentacionPageModule { }
