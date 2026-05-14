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

        } catch {
          this.data = null;
          this.usarFechaHoraActual();
        }
      } else {
        this.data = null;
        this.usarFechaHoraActual();
      }
    });
  }

  obtenerFechaHoraDesdeData(data: any) {
    const fechaHora = data?.fecha_hora_timbre;

    if (!fechaHora) {
      this.usarFechaHoraActual();
      return;
    }

    const fechaHoraNormalizada = String(fechaHora).replace('T', ' ');
    const [fecha, hora] = fechaHoraNormalizada.split(' ');

    this.fecha = fecha || this.fechaTransformada;
    this.hora = hora || this.horaTransformada;
  }

  usarFechaHoraActual() {
    this.fecha = this.fechaTransformada;
    this.hora = this.horaTransformada;
  }

  // METODO PARA DIRIGIRSE A LA PAGINA DE BIENVENIDA
  irABienvenido() {
    this.navCtroller.navigateForward(['reloj']);
  }
}