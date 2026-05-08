import { Component, OnInit, Input } from '@angular/core';
import { Empresa } from 'src/app/interfaces/Empresa';
import { Usuario } from 'src/app/interfaces/Usuario';
import { DatePipe } from '@angular/common';
import { AlertController, Platform, ModalController } from '@ionic/angular';
import { DataUserLoggedService } from '../../services/data-user-logged.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { NetworkService } from '../../libs/network.service';
import { ConnectivityService } from '../../services/conexion-servidor.service'


@Component({
  selector: 'app-informacion-empleado',
  templateUrl: './informacion-empleado.page.html',
  styleUrls: ['./informacion-empleado.page.scss'],
})
export class InformacionEmpleadoPage implements OnInit {

  @Input() data: any;
  serverConnected: boolean = true;
  pipe = new DatePipe('en-US');
  fecha: any;
  isConnected: boolean;

  empresa: Empresa = {
    nombre: '',
    ruc: '',
    direccion: '',
    telefono: '',
    correo: '',
    representante: '',
  };

  usuario: Usuario = {
    nombre: "",
    apellido: "",
    identificacion: "",
    usuario: "",
    correo: "",
    id_rol: 0,
    codigo: "",
    telefono: "",
    genero: "",
    ciudad: "",
    domicilio: "",
    name_suc: "",
    name_dep: "",
    name_rol: "",
    name_regimen: "",
    nombre_nacionalidad:"",
  }

  public get app_info(): any {
    return this.dataUser.dataApp
  }

  constructor(
    public alertController: AlertController,
    private dataUser: DataUserLoggedService,
    public platform: Platform,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    public modalController: ModalController,
    private networkService: NetworkService,
    private connectivityService: ConnectivityService

  ) { }

  async ngOnInit() {
    this.networkSubscriber()
    console.log('data ', this.data)
    this.serverConnected = await this.connectivityService.checkServerConnection();
    this.usuario.correo = this.data.correo;
    this.usuario.apellido = this.data.apellido;
    this.usuario.nombre = this.data.nombre;
    this.usuario.identificacion = this.data.identificacion;
    this.usuario.usuario = this.data.usuario;
    this.usuario.telefono = this.data.telefono;
    this.usuario.genero=this.data.nombre_genero;
    this.usuario.domicilio=this.data.domicilio;
    this.usuario.ciudad=this.data.ciudad;
    this.usuario.name_suc=this.data.name_suc;
    this.usuario.name_dep=this.data.name_dep;
    this.usuario.name_rol=this.data.name_rol;
    this.usuario.name_regimen=this.data.name_regimen;
    this.usuario.nombre_nacionalidad=this.data.nombre_nacionalidad;

    console.log(this.usuario)
    this.BuscarFormatos();
  }

  async ionViewWillEnter() {
    this.networkSubscriber();
    this.serverConnected = await this.connectivityService.checkServerConnection();
  }

  // METODO PARA LA VERIFICACION DE CONEXIONA INTERNET
  networkSubscriber() {
    this.isConnected = this.networkService.getNetworkStatusDispositivo();
    console.log("Esta conectado: ", this.isConnected)
    if (!this.isConnected) {
    } else {
      console.log('conectado');
    }
  }

  // METODO PARA CERRAR EL MODAL
  closeModal() {
    console.log('CERRAR MODAL USUARIOS');
    this.modalController.dismiss({
      'refreshInfo': true
    });
  }

  fecha_: string = '';
  caduca_: string = '';

  // BUSQUEDA DE PARAMETROS DE FECHAS Y HORAS
  formato_fecha: string;
  formato_hora: string;
  BuscarFormatos() {
    this.parametro.ObtenerFormatos().subscribe(
      resp => {
        this.formato_fecha = resp.fecha;
        this.formato_hora = resp.hora;
        this.caduca_ = this.validar.FormatearFecha(this.dataUser.dataApp.caducidad_licencia, this.formato_fecha, this.validar.dia_completo);
      }
    )
  }
}
