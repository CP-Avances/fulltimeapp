import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { NetworkService } from '../../libs/network.service';
import { ConnectivityService } from '../../services/conexion-servidor.service';

@Component({
  selector: 'app-confirmaciontimbre',
  templateUrl: './confirmaciontimbre.page.html',
  styleUrls: ['./confirmaciontimbre.page.scss'],
})
export class ConfirmaciontimbrePage implements OnInit {

  pipe = new DatePipe('en-US');

  horaTransformada = this.pipe.transform(Date.now(), 'HH:mm:ss') ?? '';
  fechaTransformada = this.pipe.transform(Date.now(), 'yyyy-MM-dd') ?? '';

  serverConnected: boolean = true;
  isConnected: boolean = false;

  nombre_usuario: string = '';
  apellido_usuario: string = '';
  ubicacion: string = '';

  data: any = null;
  fecha: string = '';
  hora: string = '';
  tipoTimbre: string = 'No identificado';

  constructor(
    private navCtroller: NavController,
    private route: ActivatedRoute,
    private networkService: NetworkService,
    private connectivityService: ConnectivityService
  ) { }

  async ngOnInit() {
    await this.cargarDatosConfirmacion();
  }

  async ionViewWillEnter() {
    await this.cargarDatosConfirmacion();
  }

  async cargarDatosConfirmacion() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
    this.serverConnected = await this.connectivityService.checkServerConnection();

    this.nombre_usuario = localStorage.getItem('nom') ?? '';
    this.apellido_usuario = localStorage.getItem('ap') ?? '';
    this.ubicacion = localStorage.getItem('storageUbicacion') ?? 'Sin ubicación';

    this.route.queryParams.subscribe(params => {
      const dataParam = params['data'];

      if (dataParam) {
        try {
          this.data = JSON.parse(dataParam);

          this.obtenerFechaHoraDesdeData(this.data);
          this.obtenerTipoTimbreDesdeData(this.data);

          if (this.data?.ubicacion) {
            this.ubicacion = this.data.ubicacion;
          }

        } catch {
          this.data = null;
          this.usarFechaHoraActual(false);
          this.tipoTimbre = 'No identificado';
        }
      } else {
        this.data = null;
        this.usarFechaHoraActual(false);
        this.tipoTimbre = 'No identificado';
      }
    });
  }

  obtenerFechaHoraDesdeData(data: any) {
    /*
      En la app móvil el campo correcto es fec_hora_timbre.
      Dejo fecha_hora_timbre como respaldo por si alguna otra pantalla lo envía así.
    */
    const fechaHora =
      data?.fec_hora_timbre ??
      data?.fecha_hora_timbre ??
      data?.fechaHoraTimbre ??
      null;

    const capturarSegundos = data?.capturar_segundos === true;

    if (!fechaHora) {
      this.usarFechaHoraActual(capturarSegundos);
      return;
    }

    const resultado = this.formatearFechaHoraVisual(fechaHora, capturarSegundos);

    if (!resultado) {
      this.usarFechaHoraActual(capturarSegundos);
      return;
    }

    this.fecha = resultado.fecha;
    this.hora = resultado.hora;
  }

  formatearFechaHoraVisual(fechaHora: any, capturarSegundos: boolean): { fecha: string; hora: string } | null {
    if (!fechaHora) return null;

    const texto = String(fechaHora).trim();

    /*
      Formato esperado desde la app:
      02/07/2026 4:35:00 PM
    */
    const regex12h = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)$/i;
    const match12h = texto.match(regex12h);

    if (match12h) {
      const [, dd, mm, yyyy, hh, min, sec, ampm] = match12h;

      const segundos = capturarSegundos ? sec : '00';

      return {
        fecha: `${yyyy}-${mm}-${dd}`,
        hora: `${hh}:${min}:${segundos} ${ampm.toUpperCase()}`
      };
    }

    /*
      Respaldo para formato:
      2026-07-02 16:27:53
      2026-07-02T16:27:53
    */
    const normalizado = texto.replace('T', ' ');
    const [fechaParte, horaParte] = normalizado.split(' ');

    if (!fechaParte || !horaParte) {
      return null;
    }

    const partesHora = horaParte.split(':');

    const hh = partesHora[0] ?? '00';
    const min = partesHora[1] ?? '00';
    const sec = capturarSegundos ? (partesHora[2] ?? '00') : '00';

    return {
      fecha: fechaParte,
      hora: `${hh}:${min}:${sec}`
    };
  }

  usarFechaHoraActual(capturarSegundos: boolean = false) {
    const ahora = new Date();

    this.fecha = this.pipe.transform(ahora, 'yyyy-MM-dd') ?? this.fechaTransformada;

    const formatoHora = capturarSegundos ? 'HH:mm:ss' : 'HH:mm:00';
    this.hora = this.pipe.transform(ahora, formatoHora) ?? this.horaTransformada;
  }

  obtenerTipoTimbreDesdeData(data: any) {
    const teclaFuncion = String(
      data?.tecl_funcion ??
      data?.tecla_funcion ??
      ''
    );

    const accion = String(data?.accion ?? '');

    this.tipoTimbre = this.obtenerNombreTipoTimbre(teclaFuncion, accion);
  }

  obtenerNombreTipoTimbre(teclaFuncion: string, accion: string): string {
    switch (teclaFuncion) {
      case '0':
        return 'Inicio jornada laboral';

      case '1':
        return 'Fin jornada laboral';

      case '2':
        return 'Inicio alimentación';

      case '3':
        return 'Fin alimentación';

      case '4':
        return 'Inicio permiso';

      case '5':
        return 'Fin permiso';

      case '7':
        return 'Timbre especial';

      default:
        return this.obtenerNombrePorAccion(accion);
    }
  }

  obtenerNombrePorAccion(accion: string): string {
    switch (accion) {
      case 'E':
        return 'Inicio jornada laboral';

      case 'S':
        return 'Fin jornada laboral';

      case 'S/A':
      case 'I/A':
        return 'Inicio alimentación';

      case 'E/A':
      case 'F/A':
        return 'Fin alimentación';

      case 'S/P':
      case 'I/P':
        return 'Inicio permiso';

      case 'E/P':
      case 'F/P':
        return 'Fin permiso';

      case 'HA':
        return 'Timbre especial';

      default:
        return 'No identificado';
    }
  }

  irABienvenido() {
    this.navCtroller.navigateForward(['reloj']);
  }
}