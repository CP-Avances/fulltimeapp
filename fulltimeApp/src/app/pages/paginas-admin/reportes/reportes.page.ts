import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-reportes',
  template: `
  <br><br><br>
  <ion-content>
    <header style="text-align: center;">
      <h3>Consulta tus reportes</h3>
    </header>

    <ion-grid>

      <ion-row>
        <ion-col size="6">
          <ion-button expand="block" fill="clear" [routerLink]="['/adminpage/reportes/timbres']">
            <div>
              <ion-icon name="alarm-outline"></ion-icon> <br>
              <ion-text>
                Timbres
              </ion-text>
            </div>
          </ion-button>
        </ion-col>
        <ion-col size="6">
          <ion-button expand="block" fill="clear" [routerLink]="['/adminpage/reportes/inasistencia']">
            <div>
              <ion-icon name="timer-outline"></ion-icon> <br>
              <ion-text>
                Inasistencias
              </ion-text>
            </div>
          </ion-button>
        </ion-col>
      </ion-row>

      <ion-row>
        <ion-col size="6">
          <ion-button expand="block" fill="clear" [routerLink]="['/adminpage/reportes/atrasos']">
            <div>
              <ion-icon name="time-outline"></ion-icon> <br>
              <ion-text>
                Atrasos
              </ion-text>
            </div>
          </ion-button>
        </ion-col>
        <ion-col size="6">
          <ion-button expand="block" fill="clear" [routerLink]="['/adminpage/reportes/horas-extras']">
            <div>
              <ion-icon name="hourglass-outline"></ion-icon> <br>
              <ion-text>
                Horas Extras
              </ion-text>
            </div>
          </ion-button>
        </ion-col>
      </ion-row>

      <ion-row>
        <ion-col size="6">
          <ion-button expand="block" fill="clear" [routerLink]="['/adminpage/reportes/vacaciones']">
            <div>
              <ion-icon name="airplane-outline"></ion-icon> <br>
              <ion-text>
                Vacaciones
              </ion-text>
            </div>
          </ion-button>
        </ion-col>
        <ion-col size="6">
          <ion-button expand="block" fill="clear" [routerLink]="['/adminpage/reportes/alimentacion']">
            <div>
              <ion-icon name="fast-food-outline"></ion-icon> <br>
              <ion-text>
                Alimentación
              </ion-text>
            </div>
          </ion-button>
        </ion-col>
      </ion-row>

      <ion-row>
        <ion-col size="6">
          <ion-button expand="block" fill="clear" [routerLink]="['/adminpage/reportes/solicitud']">
            <div>
              <ion-icon name="mail-unread-outline"></ion-icon> <br>
              <ion-text>
                Solicitudes <br> Pendientes
              </ion-text>
            </div>
          </ion-button>
        </ion-col>
        <ion-col size="6">
        <ion-button expand="block" fill="clear" [routerLink]="['/adminpage/reportes/timbresConNovedades']">
          <div>
            <ion-icon name="alarm-outline"></ion-icon> <br>
            <ion-text>
              Timbres <br> con Novedades 
            </ion-text>
          </div>
        </ion-button>
      </ion-col>
      </ion-row>

    </ion-grid>
  </ion-content>
  `,
  styles: [`

    ion-grid{
      margin: 1% 2% 0% 2%
    }

    ion-button {
      margin: 0px;
      height: 105px;
      border-radius: 8%;
      background-color: rgba(5, 52, 85, 0.636);
    }

    ion-icon {
      text-align: center;
      font-size: 22px;
      margin: 6px 0px;
      color: rgb(226, 226, 226 );
    }

    ion-text{
      color: rgb(226, 226, 226);;
      font-size: 80%;
    }
  `],
})
export class ReportesPage implements OnInit {

  constructor( 
    public platform: Platform,
    private router: Router,
    ) {}

  ngOnInit() {
  }

}
