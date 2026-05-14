import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { DataLocalService } from '../../libs/data-local.service';
import { Timbre } from '../../interfaces/Timbre';
import { RelojServiceService } from '../../services/reloj-service.service';
import { Router } from '@angular/router';
import { ParametrosService } from 'src/app/services/parametros.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { timeout } from 'rxjs/operators';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { ParametrosSistema } from 'src/app/libs/parametros.emun';
@Component({
  template: `
  <app-close-modal titleModal="Timbres no enviados"></app-close-modal>

  <ion-content>

  <div style="margin: 2%; padding: 2%; text-align: center; border-radius: 2%;">
    <ion-text color='medium' style="font-family: Arial, Helvetica, sans-serif; font-size: 90%;">
        En esta lista encontrará los timbres que no se enviaron debido a un problema con el servidor
    </ion-text>
    <br>
    <br>
    <ion-text color='medium' style="font-family: Arial, Helvetica, sans-serif; font-size: 80%;">
        Se irán registrando aquí los timbres cuando no tenga conexión a internet
    </ion-text>
  </div>

    <ion-list style="background-color: transparent;">
      <ion-item style="margin: 2.5%; padding: -2%; border-radius: 3%;" *ngFor="let t of timbres">
        <ion-label>
          <h2> <ion-icon color="dark" name="calendar-outline"></ion-icon> &nbsp;{{ t.fecha_hora_timbre }} </h2>
          <h4 *ngIf="t.latitud !== null && t.latitud !== '0' && t.latitud !== undefined"> 
            <ion-icon color="dark" name="location-outline"></ion-icon> 
            &nbsp;{{ t.latitud }} / {{ t.longitud }} 
          </h4>
          <h4 *ngIf="t.longitud == null || t.longitud == '0' || t.longitud == ''  "> <ion-icon name="location-outline"></ion-icon> Sin Coordenadas </h4>
        </ion-label>
      </ion-item>
    </ion-list>

    <div class="Imagen" *ngIf="this.timbres.length == 0">
      <span class="center">
        <img src="../../../assets/images/C_FTLOGORV.png">
        <ion-label style="text-align:center" mode="md" color="medium">  
          <h1 style="font-size: 3vw"><b>Reloj Virtual</b></h1>
        </ion-label>
      </span>
      <img src="../../../assets/images/lost_timee.svg"/>
    </div>

    <div *ngIf="this.timbres.length == 0" style="margin: 4%; padding: 4%; text-align: center; border-radius: 2%;" >
      <ion-text color='dark' style="font-family: Arial, Helvetica, sans-serif;">
        No tiene almacenado timbres aquí
      </ion-text>
    </div>



  <div style="margin: 2%; padding: 4%; text-align: center;" [hidden] = 'btn_Enviar'>

    <ion-icon color="success" name="checkmark-done-outline"></ion-icon>
    <ion-text color='medium' style="font-family: Arial, Helvetica, sans-serif; font-size: 75%;">
      Conetado con el servidor &nbsp;&nbsp; "Puede enviar los timbres"
    </ion-text>
    <ion-button color="secondary" shape="round" expand="block" (click)="Btn_enviar()">
      <ng-container *ngIf="!loadingBtn; then sendReg; else spiner"></ng-container>
      <ng-template #sendReg>
        <ion-icon slot="end" name="send-outline"></ion-icon>
        Enviar
      </ng-template>
      <ng-template #spiner>
        <ion-spinner name="circles"></ion-spinner>
      </ng-template>
    </ion-button>

  </div>

  </ion-content>

    
  `,
  styles: [`
    .Imagen{
      position: relative;
      overflow: visible!important;
      padding:3%;
      margin: 5%;
      border-radius: 2%;
    }

    .center {
      display: block;
      position: absolute;
      margin-left: auto;
      margin-right: auto;
      width: 35%;
    }

    #notification-button {            
      position: relative;
      width: 70%;
      overflow: visible!important;
  }

  `],

})
export class TimbresPerdidosComponent implements OnInit {
  ips_locales: any = '';

  // METODO PARA LEER LOS timbresPerdidosStorage
  public get timbres(): Timbre[] {
    return [
      ...this.dataLocalService.timbresPerdidosStorage,
      ...this.dataLocalService.timbresStorage
    ];
  }


  loadingBtn: boolean = false;
  btn_Enviar: boolean = true;
  mensage: string = '';
  iduser: any;
  valor: any;
  ubicacion: string = '';
  latitud: any;
  longitud: any;


  constructor(
    public modalController: ModalController,
    private dataLocalService: DataLocalService,
    private relojService: RelojServiceService,
    public alertController: AlertController,
    private toastController: ToastController,
    private restP: ParametrosService,
    private restE: EmpleadosService,
    private dataUserServices: DataUserLoggedService,
    private router: Router,
    public validar: ValidacionesService,
  ) { }

  ngOnInit() {
    this.iduser = parseInt(localStorage.getItem('empleadoID'))
    this.ComprobarConexionServidor();
    this.BuscarParametroTimbreUbicacionDesconocida();
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
  }

  BuscarParametroTimbreUbicacionDesconocida() {
    const empleadoID = parseInt(localStorage.getItem("empleadoID") ?? "0", 10);

    const buscar = {
      ids_empleados: [empleadoID],
    };

    this.restP.ObtenerDetalleParametroUsuario(buscar)
      .pipe(timeout(3000))
      .subscribe(
        {
          next: res => {

            const parametro = res.data?.[0];

            if (!parametro) {
              localStorage.setItem('timbrarUbicacionDesconocida', 'No');
              return;
            }

            const timbreUbicacionDesconocida = parametro.timbre_ubicacion_desconocida;

            const resultado = timbreUbicacionDesconocida ? 'Si' : 'No';
            localStorage.setItem('timbrarUbicacionDesconocida', resultado);
          },
          error: () => {
            localStorage.setItem('timbrarUbicacionDesconocida', 'No');
          }
        }
      );
  }


  ComprobarConexionServidor(): void {
    const timbres = [...this.dataLocalService.timbresPerdidosStorage];

    if (timbres.length === 0) {
      this.btn_Enviar = true;
      return;
    }

    this.relojService.obtenerUsuario(this.iduser)
      .pipe(timeout(3000))
      .subscribe({
        next: () => {

          this.BuscarParametro();

          this.btn_Enviar = false;
        },
        error: () => {
          this.mensage = `
          <div class="card-alert">
            <img src="../../../assets/images/LOGOBLFT.png" class="img-alert">
            <br>
            <p>Ups! Falló la conexión con el servidor, no se podrán enviar los timbres.</p>
            <p>Por favor inténtelo más tarde.</p>
          </div>
        `;

          this.presentAlert(this.mensage);

          this.btn_Enviar = true;
        }
      });
  }


  rango: any;
  //PARAMETROS
  // METODO QUE VALIDA LA TOLERANCIA DE LA UBICACION
  BuscarParametro() {
    this.rango = 0.00;
    this.restP.ObtenerDetallesParametros(ParametrosSistema.TOLERANCIA_UBICACION).pipe(timeout(3000)).subscribe(
      {
        next: res => {
          res.forEach(p => {
            this.rango = Number(p.descripcion);
          });
        }
      }
    );
  }

  contar: number = 0;
  sin_ubicacion: number = 0;
  // MÉTODO QUE VERIFICAR SI EL TIMBRE FUE REALIZADO EN UN PERíMETRO DEFINIDO
  CompararCoordenadas(informacion: any, timbre: any, descripcion: any, data: any) {
    this.restP.ObtenerCoordenadas(informacion).pipe(timeout(3000)).subscribe(
      {
        next: res => {
          if (res.data[0].verificar === 'ok') {
            this.contar = this.contar + 1;
            this.ubicacion = descripcion;
            if (this.contar === 1) {
              timbre.ubicacion = this.ubicacion;
              this.abrirToas('Timbre realizado dentro del perímetro definido como ' + this.ubicacion + '.', "primary", 3000, "top");
              this.EnviarTimbres(this.latitud, this.longitud, timbre);
            }
          }
          else {
            this.sin_ubicacion = this.sin_ubicacion + 1;
            if (this.sin_ubicacion === data.length) {
              this.ValidarDomicilio(informacion, timbre);
            }
          }
        },
        error: () => {
          this.dataLocalService.guardarTimbresPerdidos(timbre);
        }
      }
    );
  }

  id_usuario: any = parseInt(localStorage.getItem('empleadoID'));
  // MÉTODO QUE PERMITE VALIDACIONES DE UBICACIÓN
  BuscarUbicacion(latitud: any, longitud: any, rango: any, timbre: any) {
    var datosUbicacion: any = [];
    this.contar = 0;
    let informacion = {
      lat1: String(latitud),
      lng1: String(longitud),
      lat2: '',
      lng2: '',
      valor: rango
    }

    //Usa el servicio de buscar coordenadas del usuario
    this.restP.ObtenerUbicacionUsuario(this.id_usuario).pipe(timeout(3000)).subscribe(
      {
        next: res => {
          if (res.length != 0) {
            datosUbicacion = res.data;
            datosUbicacion.forEach((obj: any) => {
              informacion.lat2 = obj.latitud;
              informacion.lng2 = obj.longitud;
              this.CompararCoordenadas(informacion, timbre, obj.descripcion, datosUbicacion);
            })
          }
          else {
            this.ValidarDomicilio(informacion, timbre);
          }
        }, error: () => {
          if (localStorage.getItem('timbrarUbicacionDesconocida') === 'Si') {
            timbre.ubicacion = 'DESCONOCIDO';
            this.EnviarTimbres(latitud, longitud, timbre);
          } else {
            this.abrirToas('Timbre con ubicación Desconocida. No Permitido', "danger", 5000, "bottom");
            return this.router.navigate(['/login']);
          }
        }
      }
    );
  }

  // METODO PARA VALIDAR LAS COORDENADAD DEL DOMICILIO QUE ESTEN REGISTRADAS EN LA TABLA EMPLEADOS
  ValidarDomicilio(informacion: any, timbre: any) {
    this.restE.ObtenerUbicacion(this.id_usuario).subscribe(res => {
      if (res.data[0].longitud != null || res.data[0].latitud != null) {
        informacion.lat2 = res[0].latitud;
        informacion.lng2 = res[0].longitud;
        this.restP.ObtenerCoordenadas(informacion).subscribe(resu => {
          if (resu.data[0].verificar === 'ok') {
            timbre.ubicacion = "DOMICILIO";
            this.EnviarTimbres(this.latitud, this.longitud, timbre);
          }
          else {
            timbre.ubicacion = "DESCONOCIDO";
            this.EnviarTimbres(this.latitud, this.longitud, timbre);
          }
        })
      }
      else {
        timbre.ubicacion = "DESCONOCIDO";
        this.EnviarTimbres(this.latitud, this.longitud, timbre);
      }
    })
  }

  // METODO PARA ENVIAR EL TIMBRE ALMACENADO EN STORAGE
  Btn_enviar() {
    const timbres = [...this.dataLocalService.timbresPerdidosStorage];
    if (timbres.length > 0) {
      //obtener datos de usuario para ver si no hay problemas con el servidor
      this.relojService.obtenerUsuario(this.iduser).pipe(timeout(3000)).subscribe(
        {
          next: () => {
            timbres.forEach(t => {
              this.longitud = t.longitud;
              this.latitud = t.latitud;
              this.BuscarUbicacion(this.latitud, this.longitud, this.rango, t);
            });

            this.closeModal();
            setTimeout(() => {
              this.dataLocalService.eliminarInfo('timbresPerdidos');
              if (timbres.length > 1) {
                this.mensage = 'Los ' + timbres.length + ' timbres se han enviado.';
              } else {
                this.mensage = 'El timbre ha sido enviado exitosamente.';
              }
              this.presentAlert(this.mensage);
            }, 1000);

          },
          error: () => {
            this.mensage = `<div class="card-alert">
                            <img src="../../../assets/images/LOGOBLFT.png" class="img-alert">
                            <br>
                            <p> Ups!!! Falló la conexión con el servidor, no se podrán enviar los timbres </p>
                            <p> Por favor intentelo más tarde </p>
                          </div>`;
            this.presentAlert(this.mensage);
            return this.btn_Enviar = true;
          }
        }
      );
    }
  }

  //METODO PARA ENVIAR EL TIMBRE
  EnviarTimbres(latitud: any, longitud: any, timbre: any): void {
    timbre.fecha_hora_timbre_servidor = null;
    timbre.latitud = latitud + "";
    timbre.longitud = longitud + "";
    timbre.novedades_conexion = "Falló conexión al servidor";

    this.relojService.enviarTimbre(timbre).pipe(timeout(3000)).subscribe(
      {
        next: () => { },
        error: () => {
          this.dataLocalService.guardarTimbresPerdidos(timbre);
        }
      }
    );
  }

  // METODO PARA CONFIGURAR LAS ALERTAS
  async presentAlert(mensaje: string) {
    const toast = await this.alertController.create({
      cssClass: 'my-custom-class',
      message: mensaje,
      mode: 'ios',
      buttons: ['OK']
    });
    toast.present();
  }

  // METODO PARA CONFIGURAR LAS ALERTAS
  async abrirToas(mensaje: string, color: string, duracion: number, position: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      mode: 'ios',
      position: position
    });
    toast.present();
  }

  closeModal() {
    this.modalController.dismiss({
      'refreshInfo': true
    });
  }
}
