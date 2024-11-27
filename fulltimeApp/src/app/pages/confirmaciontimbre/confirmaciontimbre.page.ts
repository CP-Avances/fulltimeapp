import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { NetworkService } from '../../libs/network.service';
import { ConnectivityService } from '../../services/conexion-servidor.service'

@Component({
  selector: 'app-confirmaciontimbre',
  templateUrl: './confirmaciontimbre.page.html',
  styleUrls: ['./confirmaciontimbre.page.scss'],
})
export class ConfirmaciontimbrePage implements OnInit {

  pipe = new DatePipe('en-US');

  horaTransformada = this.pipe.transform(Date.now(), 'HH:mm:ss');
  fechaTransformada = this.pipe.transform(Date.now(), 'yyyy-MM-dd');
  serverConnected: boolean = true;

  nombre_usuario = "";
  apellido_usuario = "";
  ubicacion: any = "";
  data: any;
  fecha: any;
  hora: any

  constructor(
    private navCtroller: NavController,
    private route: ActivatedRoute,
    private networkService: NetworkService,
    private connectivityService: ConnectivityService
  ) { }

  isConnected: boolean;

  async ngOnInit() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();

    this.serverConnected = await this.connectivityService.checkServerConnection();


    this.nombre_usuario = localStorage.getItem('nom');
    this.apellido_usuario = localStorage.getItem('ap');
    this.ubicacion = localStorage.getItem('storageUbicacion');

    await this.route.queryParams.subscribe(params => {
      this.data = JSON.parse(params['data']);
      console.log('Datos recibidos:', this.data);
    });
    const [fecha, hora] = this.data.fecha_hora_timbre.split(' ');
    this.fecha = fecha;
    this.hora = hora;

  }

  async ionViewWillEnter() {
    this.ngOnInit();
  }

  // METODO PARA DIRIGIRSE A LA PAGINA DE BIENVENIDA
  irABienvenido() {
    this.navCtroller.navigateForward(['reloj'])
  }
}
