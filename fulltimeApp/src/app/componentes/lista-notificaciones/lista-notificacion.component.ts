import { Component, OnInit } from '@angular/core';
import { ModalController, PopoverController, NavParams } from '@ionic/angular';
import { Notificacion } from '../../interfaces/Notificaciones';
import { NotificacionTimbre } from '../../interfaces/Notificaciones';
import { SkeletonListNotificacionesArray } from '../../interfaces/Skeleton';
import { Router } from '@angular/router';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { ConnectivityService } from 'src/app/services/conexion-servidor.service'
import { NetworkService } from '../../libs/network.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
@Component({
  selector: 'app-lista-notificacion',
  templateUrl: './lista-notificacion.component.html',
  styleUrls: ['./lista-notificacion.component.scss'],
})
export class ListaNotificacionComponent implements OnInit {
  ips_locales: any = '';

  //INICIO DE VARIABLES
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
  id_noti: any;

  constructor(
    private navParams: NavParams,
    private router: Router,
    public pooverCtrl: PopoverController,
    private vistonotificacion: NotificacionesService,
    public modalController: ModalController,
    private userService: DataUserLoggedService,
    private networkService: NetworkService,
    private connectivityService: ConnectivityService,
    public validar: ValidacionesService,
  ) {
    this.id_noti = this.navParams.get('id')
  }

  // METODO QUE AL INICIARCE MARCA COMO VISTO A TODAS LAS NOTIFICACIONES
  async ngOnInit() {
    this.networkSubscriber();
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    this.serverConnected = await this.connectivityService.checkServerConnection();
    const id_empleado = localStorage.getItem('empleadoID');


  }

  async ionViewWillEnter() {
    this.ngOnInit();
  }

  //METODO DE VERIFICACION DE CONEXION A INTERNET
  isConnected: boolean;
  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
  }

  // METODO PARA ASIGNAR LOS COLORES POR TIPO DE NOTIFICACION
  tiponotificacion(noti: { id: any, id_permiso: string; id_vacaciones: string; id_hora_extra: string; visto: boolean, tipo: number }) {
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

  // METODO PARA ABRIR LA NOTIFICACION EN LA VISTA DEL MODULO AL QUE PERTENECE
  AbrirNoti(noti: { id: number, id_permiso: string; id_vacaciones: string; id_hora_extra: string; estado: string, tipo: number; nempleadoreceives: string; id_receives_empl: number; nempleadosend: string; }) {
    this.cambiovistanoti(noti);
    this.cambiovistanotitimbre(noti);
    this.modalController.dismiss({});
    if (noti.nempleadoreceives === noti.nempleadosend) {
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
    }
    else {
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
    }

  }

  //cambia el estado de la columna visto de la tabla realtime_noti de true a false.
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

  //cambia el estado de la columna visto de la tabla realtime_notitimbre de true a false.
  cambiovistanotitimbre(noti: { id: number }) {
    const vista = true;
    const datos = { id_notificacion: noti.id, vista: vista, user_name: this.userService.username, ip: localStorage.getItem('ip'), ip_local: this.ips_locales }

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
    var datos = { id_notificacion: 0, visto: vista, user_name: this.userService.username, ip: localStorage.getItem('ip'), ip_local: this.ips_locales }
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

  //METODO PARA FORMATEAR LOS DATOS DE LOS AVISOS
  FormatearInformacionAvisos(lista: any[]) {
    const formato_fecha = 'dd/MM/yyyy';
    const formato_hora = 'HH:mm:ss';
    const idioma = 'es';

    lista.forEach((aviso: any) => {
      if (!aviso.create_at) return;

      const partesFecha = aviso.create_at.split(' ');
      const fechaFormateada = this.validar.DarFormatoFecha(partesFecha[0], 'yyyy-MM-dd');

      aviso.fecha = this.validar.FormatearFecha(
        fechaFormateada || '',
        formato_fecha,
        this.validar.dia_completo
      );

      aviso.hora_registro = this.validar.FormatearHora(
        partesFecha[1],
        formato_hora
      );

      if (aviso.tipo === 100) {
        const partes = aviso.mensaje.split('//');
        aviso.notificacion = partes[4];

        const horario = partes[0].split(' ');
        const timbre = partes[1].split(' ');

        aviso.horario_fecha = this.validar.FormatearFecha(
          this.validar.DarFormatoFecha(horario[0], 'yyyy-MM-dd') || '',
          formato_fecha,
          this.validar.dia_completo
        );
        aviso.horario_hora = this.validar.FormatearHora(horario[1], formato_hora);

        aviso.timbre_fecha = this.validar.FormatearFecha(
          this.validar.DarFormatoFecha(timbre[0], 'yyyy-MM-dd') || '',
          formato_fecha,
          this.validar.dia_completo
        );
        aviso.timbre_hora = this.validar.FormatearHora(timbre[1], formato_hora);

        aviso.tolerancia = partes[2];
        aviso.atraso = partes[3];
      }

      else if (aviso.tipo === 101) {
        const partes = aviso.mensaje.split('//');
        aviso.notificacion = partes[1];
        aviso.horario_fecha = this.validar.FormatearFecha(
          this.validar.DarFormatoFecha(partes[0], 'yyyy-MM-dd') || '',
          formato_fecha,
          this.validar.dia_completo
        );
      }

      else if (aviso.tipo === 102) {
        const partes = aviso.mensaje.split('//');
        aviso.notificacion = partes[3];

        const horario = partes[0].split(' ');
        const timbre = partes[1].split(' ');

        aviso.horario_fecha = this.validar.FormatearFecha(
          this.validar.DarFormatoFecha(horario[0], 'yyyy-MM-dd') || '',
          formato_fecha,
          this.validar.dia_completo
        );
        aviso.horario_hora = this.validar.FormatearHora(horario[1], formato_hora);

        aviso.timbre_fecha = this.validar.FormatearFecha(
          this.validar.DarFormatoFecha(timbre[0], 'yyyy-MM-dd') || '',
          formato_fecha,
          this.validar.dia_completo
        );
        aviso.timbre_hora = this.validar.FormatearHora(timbre[1], formato_hora);

        aviso.salida = partes[2];
      }

      else if (aviso.tipo === 6) {
        aviso.notificacion = aviso.mensaje;
      }
    });
  }

  CambiarIcono(tipo: number): string {
    switch (tipo) {
      case 6: return 'mail-unread-outline';        
      case 100: return 'alarm-outline';            
      case 101: return 'remove-circle-outline';    
      case 102: return 'exit-outline';              
      default: return 'help-outline';              
    }
  }

  CambiarEstiloIcono(tipo: number): string {
    switch (tipo) {
      case 6: return 'comunicado-color';        
      case 100: return 'atraso-color';          
      case 101: return 'falta-color';      
      case 102: return 'salida-color';          
      default: return 'default-color';         
    }
  }
}
