import { Component, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { Notificacion } from '../../interfaces/Notificaciones';
import { NotificacionTimbre } from '../../interfaces/Notificaciones';
import { SkeletonListNotificacionesArray } from '../../interfaces/Skeleton';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { ListaNotificacionComponent } from '../lista-notificaciones/lista-notificacion.component';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';

@Component({
  selector: 'app-notificacion-popover',
  templateUrl: './notificacion-popover.component.html',
  styleUrls: ['./notificacion-popover.component.scss'],
})
export class NotificacionPopoverComponent implements OnInit {
  ips_locales: any = '';

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
  formato_fecha: string = 'dd/MM/yyyy';
  formato_hora: string = 'HH:mm:ss';

  constructor(
    public pooverCtrl: PopoverController,
    private vistonotificacion: NotificacionesService,
    public modalController: ModalController,
    private userService: DataUserLoggedService,
    public validar: ValidacionesService,

  ) { }

  ngOnInit() {
    const id_empleado = localStorage.getItem('empleadoID');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });
    this.loading = true;
    this.countNoti = 0;

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
    const datos = { id_notificacion: noti.id, visto: vista, user_name: this.userService.username, ip: localStorage.getItem('ip'), ip_local: this.ips_locales }
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
    const datos = { id_notificacion: noti.id, visto: vista, user_name: this.userService.username, ip: localStorage.getItem('ip'), ip_local: this.ips_locales }
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

  //METODO PARA FORMATEAR NOTIFICACIONES
  formatearNotificaciones(lista: any[], formato_fecha: string, formato_hora: string): any[] {
    return lista.map((aviso: any) => {
      const [fechaStr, horaStr] = aviso.create_at.split(' ');
      const fecha_registro = this.validar.DarFormatoFecha(fechaStr, 'yyyy-MM-dd');
      aviso.fecha_ = this.validar.FormatearFecha(fecha_registro || '', formato_fecha, this.validar.dia_abreviado);
      aviso.hora_ = this.validar.FormatearHora(horaStr, formato_hora);

      if (aviso.tipo === 100) {
        const partes = aviso.mensaje.split('//');
        aviso.notificacion = partes[4];
        aviso.horario_fecha = this.validar.FormatearFecha(partes[0].split(' ')[0], formato_fecha, this.validar.dia_completo);
        aviso.horario_hora = this.validar.FormatearHora(partes[0].split(' ')[1], formato_hora);
        aviso.timbre_fecha = this.validar.FormatearFecha(partes[1].split(' ')[0], formato_fecha, this.validar.dia_completo);
        aviso.timbre_hora = this.validar.FormatearHora(partes[1].split(' ')[1], formato_hora);
        aviso.tolerancia = partes[2];
        aviso.atraso = partes[3];
      } else if (aviso.tipo === 101) {
        const partes = aviso.mensaje.split('//');
        aviso.notificacion = partes[1];
        aviso.horario_fecha = this.validar.FormatearFecha(partes[0], formato_fecha, this.validar.dia_completo);
      } else if (aviso.tipo === 102) {
        const partes = aviso.mensaje.split('//');
        aviso.notificacion = partes[3];
        aviso.horario_fecha = this.validar.FormatearFecha(partes[0].split(' ')[0], formato_fecha, this.validar.dia_completo);
        aviso.horario_hora = this.validar.FormatearHora(partes[0].split(' ')[1], formato_hora);
        aviso.timbre_fecha = this.validar.FormatearFecha(partes[1].split(' ')[0], formato_fecha, this.validar.dia_completo);
        aviso.timbre_hora = this.validar.FormatearHora(partes[1].split(' ')[1], formato_hora);
        aviso.salida = partes[2];
      } else if (aviso.tipo === 6) {
        aviso.notificacion = aviso.mensaje;
      } else {
        if (aviso.descripcion?.includes('para') && aviso.descripcion?.includes('desde')) {
          aviso.aviso = aviso.descripcion.split('para')[0];
          aviso.usuario = 'del usuario ' + aviso.descripcion.split('para')[1].split('desde')[0];
        } else if (aviso.descripcion?.includes('desde')) {
          aviso.aviso = aviso.descripcion.split('desde')[0];
          aviso.usuario = '';
        }
      }

      return aviso;
    });
  }

  //METODO PARA CAMBIAR ESTILOS
  CambiarEstiloNotificacion = {
    100: { color: '#fff9c4', icon: 'time-outline', iconColor: '#260DE6' },
    101: { color: '#f8d7da', icon: 'person-remove-outline', iconColor: '#260DE6' },
    102: { color: '#bbdefb', icon: 'log-out-outline', iconColor: '#260DE6' },
    6:   { color: '#f5cafc', icon: 'mail-outline', iconColor: '#260DE6' },
  };
}
