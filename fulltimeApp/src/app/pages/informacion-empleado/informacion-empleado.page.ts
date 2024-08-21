import { Component, OnInit, Input } from '@angular/core';
import { RelojServiceService } from 'src/app/services/reloj-service.service';
import { Empresa } from 'src/app/interfaces/Empresa';
import { Usuario } from 'src/app/interfaces/Usuario';
import { DatePipe } from '@angular/common';
import { AlertController, Platform, ToastController, ModalController } from '@ionic/angular';
import { DataUserLoggedService } from '../../services/data-user-logged.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';


@Component({
  selector: 'app-informacion-empleado',
  templateUrl: './informacion-empleado.page.html',
  styleUrls: ['./informacion-empleado.page.scss'],
})
export class InformacionEmpleadoPage implements OnInit {

  @Input() data: any;


  pipe = new DatePipe('en-US');
  fecha: any;

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
    cedula: "",
    usuario: "",
    correo: "",
    id_rol: 0,
    codigo: "",
  }

  public get app_info(): any {
    return this.dataUser.dataApp
  }

  public get app_vacuna(): any {
    return this.dataUser.dataVacuna
  }

  constructor(
    private relojService: RelojServiceService,
    public alertController: AlertController,
    private toastController: ToastController,
    private dataUser: DataUserLoggedService,
    public platform: Platform,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    public modalController: ModalController,

  ) { }

  ngOnInit() {
    this.usuario.correo = this.data.correo;
    this.usuario.apellido = this.data.apellido;
    this.usuario.nombre = this.data.nombre;
    this.usuario.cedula = this.data.cedula;
    this.usuario.usuario = this.data.usuario;

    console.log('data vacuna empleado ... ', this.dataUser.dataVacuna)
    this.BuscarFormatos();
  }

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
        this.fecha_ = this.validar.FormatearFecha(this.dataUser.dataVacuna.fecha, this.formato_fecha, this.validar.dia_completo);
        this.caduca_ = this.validar.FormatearFecha(this.dataUser.dataApp.caducidad_licencia, this.formato_fecha, this.validar.dia_completo);
      }
    )
  }

  /*asinación de ID de celular a usuario
  async registrarCelular() {
    const alert = await this.alertController.create({
      subHeader: 'Registrar celular',
      message: 'Se va a registrar este celular como principal para timbrar',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        }, {
          text: 'Listo',
          handler: () => {
            this.actualizarEnBDD();
          }
        }
      ]
    });

    await alert.present();
  }
  actualizarEnBDD() {
    let id_celular = ""
    if (this.device.uuid) {
      id_celular = this.device.uuid;
    } else {
      id_celular = "PC"
    }
    const id_usuario = localStorage.getItem('Uid');
    this.relojService.registrarCelularUsuario(id_usuario, id_celular).subscribe(
      res => {
        localStorage.setItem('UCedula', id_celular);
        this.usuario.cedula = id_celular;
      },
      err => {
        this.abrirToas("No se pudo actualizar, intente más tarde", "danger", 2000)
      }
    )
  }
  */ //fin asinación de ID de celular a usuario


  async abrirToas(mensaje: string, color: string, duracion: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color
    });
    toast.present();
  }

}
