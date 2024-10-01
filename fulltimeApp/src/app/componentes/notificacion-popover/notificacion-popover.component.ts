import { Component, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { AutorizacionesService } from '../../services/autorizaciones.service';
import { Notificacion } from '../../interfaces/Notificaciones';
import { NotificacionTimbre } from '../../interfaces/Notificaciones';
import { SkeletonListNotificacionesArray } from '../../interfaces/Skeleton';
import { Router } from '@angular/router';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { ListaNotificacionComponent } from '../lista-notificaciones/lista-notificacion.component';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';


@Component({
  selector: 'app-notificacion-popover',
  templateUrl: './notificacion-popover.component.html',
  styleUrls: ['./notificacion-popover.component.scss'],
})
export class NotificacionPopoverComponent implements OnInit {

  skeleton = SkeletonListNotificacionesArray;
  loading: boolean = true;
  notificaciones: Notificacion[] = [];
  notificaiontimbre: NotificacionTimbre[] = [];
  notificacionestimbres: any = [];

  notificacionesAll: any = [];

  countNoti: number = 0;

  pageActual: number = 1;
  valorcolor: string = '';
  noticheck: string = '';

  valor: boolean = false;

  constructor(
    private notificacionService: AutorizacionesService,
    private router: Router,
    public pooverCtrl: PopoverController,
    private vistonotificacion: NotificacionesService,
    public modalController: ModalController,
    private userService: DataUserLoggedService,
  ) { }

  ngOnInit() {
    const id_empleado = localStorage.getItem('empleadoID');

    this.notificacionService.getNotificacionesByIdEmpleado(id_empleado + '').subscribe(
      notificacion => {
        this.notificaciones = notificacion;
        this.notificaciones.sort(
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
            //cuenta las notificaciones que estan sin ver
            this.notificacionesAll.forEach((item: any) => {
              if (item.visto === false) {
                this.countNoti++;
              }
            });
          },
          err => { console.log(err) },
          () => { this.loading = false }
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
            //cuenta las notificaciones que estan sin ver
            this.notificacionesAll.forEach((item: any) => {
              if (item.visto === false) {
                this.countNoti++;
              }
            });
          },
          err => { console.log(err) },
          () => { this.loading = false }
        )
        console.log(err)
      },
      () => { this.loading = false }
    )

  }

  // METODO PARA ASIGNAR EL COLOR DE LA NOTIFICACION
  tiponotificacion(noti: { id_permiso: string; id_vacaciones: string; id_hora_extra: string; visto: boolean; tipo: number; }) {
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

  // METODO PARA ABRIR LA NOTIFICACION MARCADA EN LA LISTA DE NOTIFICACIONES
  async AbrirNoti(noti: { id: number, id_permiso: string; id_vacaciones: string; id_hora_extra: string; estado: string; tipo: number; nempleadoreceives: string; id_receives_empl: number; nempleadosend: string; }) {
    this.cambiovistanoti(noti);
    this.cambiovistanotitimbre(noti);

    this.pooverCtrl.dismiss({});
    this.valor = false;
    const modal = await this.modalController.create({
      component: ListaNotificacionComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        id: noti.id // Pasar el DataUrl como propiedad a la modal
      }
    });
    return await modal.present();
  }

  // METODO PARA CAMBIAR EL ESTADO DE VISTO 
  cambiovistanoti(noti: { id: number }) {
    const vista = true;
    const datos = { id_notificacion: noti.id, visible: vista, user_name: this.userService.username, ip: localStorage.getItem('ip') }
    this.vistonotificacion.PutNotificaVisto(noti.id, datos).subscribe(
      (res: any) => {
        res.visto = false;
      },
      res => { console.error() },
      () => { this.loading = false }
    )
  }

  // METODO PARA CAMBIAR EL ESTADO DE VISTO DE LA NTIFICAION TIMBRE
  cambiovistanotitimbre(noti: { id: number }) {
    const vista = true;
    const datos = { id_notificacion: noti.id, visto: vista, user_name: this.userService.username, ip: localStorage.getItem('ip') }
    this.vistonotificacion.PutNotifiTimbreVisto(noti.id, datos).subscribe(
      (res: any) => {
        res.visto = false;
      },
      res => { console.error() },
      () => { this.loading = false }
    )
  }

  // METODO PARA ABRIR EL MODAL DE LISTA DE NOTICACIONES
  async abrirNotificaciones() {
    this.pooverCtrl.dismiss({});
    this.valor = false;
    const modal = await this.modalController.create({
      component: ListaNotificacionComponent,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }
}
