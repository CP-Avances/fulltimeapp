import { Component, OnInit } from '@angular/core';
import { ModalController, PopoverController, NavParams, ToastController } from '@ionic/angular';
import { AutorizacionesService } from '../../services/autorizaciones.service';
import { Notificacion } from '../../interfaces/Notificaciones';
import { NotificacionTimbre } from '../../interfaces/Notificaciones';
import { SkeletonListNotificacionesArray } from '../../interfaces/Skeleton';
import { Router } from '@angular/router';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { ConnectivityService } from 'src/app/services/conexion-servidor.service'
import { NetworkService } from '../../libs/network.service';

@Component({
  selector: 'app-lista-notificacion',
  templateUrl: './lista-notificacion.component.html',
  styleUrls: ['./lista-notificacion.component.scss'],
})
export class ListaNotificacionComponent implements OnInit {
  serverConnected: boolean = true;

  skeleton = SkeletonListNotificacionesArray;
  loading: boolean = true;
  notificaciones: Notificacion[] = [];
  notificaiontimbre: NotificacionTimbre[] = [];
  notificacionestimbres: any = [];

  notificacionesAll: any = [];

  countNoti: any;

  pageActual: any = 1;
  valorcolor: string = '';
  noticheck: string = '';

  valor: boolean = false;
  paginaccionvista: boolean = false;
  ver: boolean = false;

  id_noti :any;

  constructor(
    private navParams: NavParams,
    private notificacionService: AutorizacionesService,
    private router: Router,
    public pooverCtrl: PopoverController,
    private vistonotificacion: NotificacionesService,
    public modalController: ModalController,
    private userService: DataUserLoggedService,
    private networkService: NetworkService,
    private toastController: ToastController,
    private connectivityService: ConnectivityService

  ) { 
    this.id_noti =this.navParams.get('id')
  }

  async ngOnInit() {
    this.serverConnected = await this.connectivityService.checkServerConnection();
    this.networkSubscriber();
    const id_empleado = localStorage.getItem('empleadoID')
    this.notificacionService.getNotificacionesByIdEmpleado(id_empleado + '').subscribe(
      notificacion => {
        this.notificaciones = notificacion;

        this.notificacionesAll.sort(
          (firstObject: Notificacion, secondObject: Notificacion) =>
            (firstObject.visto === true) ? 1 :
              (firstObject.visto === secondObject.visto) ?
                ((firstObject.fecha_hora < secondObject.fecha_hora) ? 1 : -1)

                : -1
        );

        this.notificacionService.getNotificacionesTimbreByIdEmpleado(id_empleado + '').subscribe(
          notificaiontim => {
            this.notificaiontimbre = notificaiontim;
            this.notificacionestimbres = this.notificaiontimbre;

            this.notificacionesAll = this.notificaciones.concat(this.notificacionestimbres);

            this.notificacionesAll.sort(
              (firstObject: NotificacionTimbre, secondObject: NotificacionTimbre) =>
                (firstObject.visto === true) ? 1 :
                  (firstObject.visto === secondObject.visto) ?
                    ((firstObject.fecha_hora! < secondObject.fecha_hora!) ? 1 : -1)

                    : -1
            );

            //si el objeto de los timbres esta vacion oculta las ventanas y muestra la ventana - 'vacio'.
            if (Object.keys(this.notificacionesAll).length < 21) {
              this.ver = true;
            }

          },
          err => { console.log(err); this.ver = true },
          () => { this.loading = false; }
        )


      },
      err => {

        this.notificacionService.getNotificacionesTimbreByIdEmpleado(id_empleado + '').subscribe(
          notificaiontim => {
            this.notificacionesAll = notificaiontim;
            this.notificacionesAll.sort(
              (firstObject: NotificacionTimbre, secondObject: NotificacionTimbre) =>
                (firstObject.visto === true) ? 1 :
                  (firstObject.visto === secondObject.visto) ?
                    ((firstObject.fecha_hora! < secondObject.fecha_hora!) ? 1 : -1)

                    : -1
            );
          },
          err => { console.log(err); this.ver = true },
          () => { this.loading = false; }
        )

        console.log(err);
      },
      () => { this.loading = false; }
    )

  }
  
  async ionViewWillEnter(){
    this.ngOnInit();
  }


  isConnected: boolean;

  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
    console.log("Esta conectado: ", this.isConnected)
    if (!this.isConnected) {
      this.abrirToas('Por favor verifique su conexión a Internet', "danger", 3000, "middle");

    } else {
  
    }
  }
  async abrirToas(mensaje: string, color: string, duracion: number, position: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      position: position
    });
    toast.present();
  }


  tiponotificacion(noti: {id: any,  id_permiso: string; id_vacaciones: string; id_hora_extra: string; visto: boolean, tipo: number }) {
    if (noti.visto === true) {
      return "reportes";
    }
    else {
      if (noti.id_permiso != null) {
        return "permisos";
      } else if (noti.id_vacaciones != null) {
        return "vacaciones";
      } else if (noti.id_hora_extra != null) {
        return "horas_extras";
      } else if (noti.tipo >= 1 && noti.tipo <= 2) {
        return "alimentacion1";
      } else if (noti.tipo == 2) {
        return "alimentacion2";
      } else if (noti.tipo == 6) {
        return "comunicados6";
      } else if (noti.tipo >= 10 && noti.tipo <= 12) {
        return "planificacionhe10";
      } else if (noti.tipo == 20) {
        return "planificacionalimen";
      } else if (noti.tipo == null) {
        return "danger";
      } else {
        return "reportes";
      }
    }
  }

  AbrirNoti(noti: { id: number, id_permiso: string; id_vacaciones: string; id_hora_extra: string; estado: string, tipo: number; nempleadoreceives: string; id_receives_empl: number; nempleadosend: string; }) {
    this.cambiovistanoti(noti);
    this.cambiovistanotitimbre(noti);
    this.modalController.dismiss({});

    if (noti.nempleadoreceives === noti.nempleadosend) {

      // if (localStorage.getItem("rol") == "1") {
      //Solicitudes Admin envia
      if (noti.id_permiso != null && noti.estado === "Pendiente") {
        return this.router.navigate(['/reloj/solicitudes/permiso-solicitud']);
      } else if (noti.id_hora_extra != null && noti.estado === "Pendiente") {
        return this.router.navigate(['/reloj/solicitudes/hora-extra-solicitud']);
      } else if (noti.id_vacaciones != null && noti.estado === "Pendiente") {
        return this.router.navigate(['/reloj/solicitudes/vacacion-solicitud']);
      }
      if (noti.tipo === 1) {
        return this.router.navigate(['/reloj/solicitudes/alimentacion-solicitud']);
      }

      //} 
      /*
      else {
        //Solicitudes Empleado envia
        if (noti.id_permiso != null) {
          this.router.navigate(['/empleado/solicitar-permisos']);
        } else if (noti.id_vacaciones != null) {
          this.router.navigate(['/empleado/solicitar-vacaciones']);
        } else if (noti.id_hora_extra != null && noti.estado === "Pendiente") {
          this.router.navigate(['/empleado/solicitar-horas-extras']);
        } else if (noti.tipo === 1) {
          console.log("Alimentacion Tipo =", noti.tipo);
          this.router.navigate(['/empleado/solicitar-planificar-alimentacion']);
        }

        //Aprobar las solicitudes Admin envia respuesta
        if (noti.id_permiso != null && noti.estado != "Pendiente") {
          console.log("Aprobar Permiso ", noti.id_permiso, " = ", noti.estado);
          return this.router.navigate(['/reloj/aprobar-permisos']);
        } else if (noti.tipo === 12) {
          console.log("Aprobar Hora Extra ", noti.tipo);
          console.log("Aprobar Hora Extra ", noti.id_hora_extra, " = ", noti.estado)
          return this.router.navigate(['/reloj/aprobar-horas-extras']);
        } else if (noti.id_vacaciones != null && noti.estado != "Pendiente") {
          console.log("Aprobar Vacaciones ", noti.id_vacaciones, " = ", noti.estado)
          return this.router.navigate(['/reloj/aprobar-vacaciones']);
        }

        if (noti.tipo === 2) {
          console.log("Aprobar Alimentacion ", noti.tipo, " = ", noti.estado)
          return this.router.navigate(['/reloj/aprobar-alimentacion']);
        }

        return this.router.navigate(['/reloj/aprobar-alimentacion']);

      }
        */

    }
    else {

      // if (localStorage.getItem("rol") === "1") {
      //Solicitudes Admin Respuesta que recibe
      if (noti.id_permiso != null && noti.estado != "Pendiente") {
        console.log("Aprobar Permiso ", noti.id_permiso, " = ", noti.estado);
        return this.router.navigate(['/reloj/solicitudes/permiso-solicitud']);
      } else if (noti.tipo === 12) {
        console.log("Aprobar Hora Extra ", noti.tipo);
        return this.router.navigate(['/reloj/solicitudes/hora-extra-solicitud']);
      } else if (noti.id_vacaciones != null && noti.estado != "Pendiente") {
        console.log("Aprobar Vacaciones ", noti.id_vacaciones, " = ", noti.estado)
        return this.router.navigate(['/relojo/solicitudes/vacacion-solicitud']);
      }

      if (noti.tipo === 2) {
        console.log("Aprobar Alimentacion ", noti.tipo, " = ", noti.estado)
        return this.router.navigate(['/reloj/solicitudes/alimentacion-solicitud']);
      }

      //Aprobaciones Admin envia
      if (noti.id_permiso != null && noti.estado === "Pendiente") {
        return this.router.navigate(['/reloj/aprobar-permisos']);
      } else if (noti.id_hora_extra != null && noti.estado === "Pendiente") {
        return this.router.navigate(['/reloj/aprobar-horas-extras']);
      } else if (noti.id_vacaciones != null && noti.estado === "Pendiente") {
        return this.router.navigate(['/reloj/aprobar-vacaciones']);
      }

      if (noti.tipo === 1) {
        return this.router.navigate(['/reloj/aprobar-alimentacion']);
      }


      //} 

      /*
      else {
        //Solicitudes Empleado Respuesta que recibe
        if (noti.id_permiso != null) {
          return this.router.navigate(['/empleado/solicitar-permisos']);
        } else if (noti.id_vacaciones != null) {
          return this.router.navigate(['/empleado/solicitar-vacaciones']);
        } else if (noti.tipo === 12) {
          return this.router.navigate(['/empleado/solicitar-horas-extras']);
        } else if (noti.tipo === 2) {
          console.log("Alimentacion Tipo =", noti.tipo);
          return this.router.navigate(['/empleado/solicitar-planificar-alimentacion']);
        }


        //Aprobaciones Admin envia
        if (noti.id_permiso != null && noti.estado === "Pendiente") {
          return this.router.navigate(['/reloj/aprobar-permisos']);
        } else if (noti.id_hora_extra != null && noti.estado === "Pendiente") {
          return this.router.navigate(['/reloj/aprobar-horas-extras']);
        } else if (noti.id_vacaciones != null && noti.estado === "Pendiente") {
          return this.router.navigate(['/reloj/aprobar-vacaciones']);
        }
        if (noti.tipo === 1) {
          return this.router.navigate(['/reloj/aprobar-alimentacion']);
        }

      }
        */
    }

  }

  //cambia el estado de la columna visto de la tabla realtime_noti de true a false.
  cambiovistanoti(noti: { id: number }) {
    const vista = true;
    const datos = { id_notificacion: noti.id, visto: vista, user_name: this.userService.username, ip: localStorage.getItem('ip') }

    this.vistonotificacion.PutNotificaVisto(noti.id, datos).subscribe(
      (res: any) => {
        res.visto = false;
      },
      res => { console.error() },
      () => { this.loading = false }
    )
  }

  //cambia el estado de la columna visto de la tabla realtime_notitimbre de true a false.
  cambiovistanotitimbre(noti: { id: number }) {
    const vista = true;
    const datos = { id_notificacion: noti.id, vista: vista, user_name: this.userService.username, ip: localStorage.getItem('ip') }

    this.vistonotificacion.PutNotifiTimbreVisto(noti.id, datos).subscribe(
      (res: any) => {
        res.visto = false;
      },
      res => { console.error() },
      () => { this.loading = false }
    )
  }

  //Poner todas las notificaciones como vistas
  notificacionesvistanoti(noti: any) {
    const vista = true;
    var datos = { id_notificacion: 0, visto: vista, user_name: this.userService.username, ip: localStorage.getItem('ip') }
    var allNotificaciones = [];
    allNotificaciones = noti;

    noti.forEach((item: any) => {
      if (item.visto != true) {
        datos.id_notificacion = item.id
        this.vistonotificacion.PutNotificaVisto(item.id, datos).subscribe(
          (res: any) => {
            res.forEach((notificacio: any) => {
              notificacio.visto = true;
            });
          },
          res => { console.error() },
          () => { this.loading = false }
        )

        this.vistonotificacion.PutNotifiTimbreVisto(item.id, datos).subscribe(
          (res: any) => {
            res.forEach((notificaciontim: any) => {
              notificaciontim = true;
            });
          },
          res => { console.error() },
          () => { this.loading = false }
        )
      }
    });

    this.modalController.dismiss({});
  }

  //variables de configuracion del componente de paginacion (pagination-controls)
  public maxSize: number = 5;
  public directionLinks: boolean = true;
  public autoHide: boolean = false;
  public responsive: boolean = true;
  public labels: any = {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };

}
