import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { TimbresService } from '../../services/timbres.service';
import { DataUserLoggedService } from '../../services/data-user-logged.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { Device } from '@capacitor/device';
import { Camera, CameraDirection, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Component({
  selector: 'app-timbre-justificado',
  templateUrl: './timbre-justificado.component.html',
  styleUrls: ['./timbre-justificado.component.scss'],
})
export class TimbreJustificadoComponent implements OnInit {
  @ViewChild('fileInput') fileInput: any; // Accede al input de archivo
  selectedSecond: string = '00'; // Segundos iniciales como cadena con dos cifras
  seconds: string[] = Array.from({ length: 60 }, (_, i) => ('0' + i).slice(-2)); // Segundos de "00" a "59"
  numeroCaracteres = 0;
  mensajeFile: string | null;
  archivoSubido: Array<File> | null;
  @Input() data: any;
  selectOptions: any = [
    { accion: 'Ninguno', view: 'Ninguno', teclaFuncion: -1 },
    { accion: 'E', view: 'Inicio de jornada laboral', teclaFuncion: 0 },
    { accion: 'S', view: 'Fin de jornada laboral', teclaFuncion: 1 },
    { accion: 'S/A', view: 'Inicio de almuerzo', teclaFuncion: 2 },
    { accion: 'E/A', view: 'Fin de almuerzo', teclaFuncion: 3 },
    { accion: 'E/P', view: 'Inicio de permiso', teclaFuncion: 5 },
    { accion: 'S/P', view: 'Fin de permiso', teclaFuncion: 4 },
  ]
  accion: string = '';
  tecla_funcion: number = -1;
  fec_timbre: string = '';
  observacion: string = '';

  private get fullnameAdmin(): string {
    return this.dataUserService.UserFullname
  }

  constructor(
    public validar: ValidacionesService,
    public modalController: ModalController,
    private timbresService: TimbresService,
    private dataUserService: DataUserLoggedService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    console.log('Timbre CODIGO DEL EMPLEADO: ', this.data);
    this.obtenerIdCelular();
  }
  modelo_dispositivo: string = "";
  dispositivo_timbre: string = "";

  // METODO PARA OBTENER LA INFORMACION DE DISPOSITIVO
  obtenerIdCelular() {
    Device.getInfo().then((info) => {
      return this.modelo_dispositivo = info.model;
    }).catch((e) => {
      return this.modelo_dispositivo = "Desconocido";
    });
    Device.getId().then((id) => {
      return this.dispositivo_timbre = id.identifier + '';
    }).catch((e) => {
      return this.dispositivo_timbre = "Desconocido";
    });
  }

  // METODO PARA SELECCIONAR LA ACCION DEL TIMBRE 
  accionChange(e) {
    console.log(e.target.value);
    this.accion = e.target.value;
    const [obj1] = this.selectOptions.filter(o => { return o.accion === this.accion }).map(o => { return o.teclaFuncion })
    this.tecla_funcion = obj1
  }

  initialDate: string; // Almacena la fecha y hora inicial sin segundos sumados
  versegundos: boolean = false;
  // MÉTODO PARA ALMACENAR LA FECHA 
  fechaChange(e) {
    this.initialDate = e.target.value;
    this.fec_timbre = this.initialDate; // Guarda la fecha y hora inicial sin segundos
    this.versegundos = true;
    console.log("ver fecha timbre ", this.fec_timbre)
  }

  // METODO PARA SUMAR LA FECAH CON LOS SEGUNDOS SELECCIONADOS
  updateFechaConSegundos() {
    if (this.initialDate && this.selectedSecond !== undefined) {
      const fechaSeleccionada = new Date(this.fec_timbre); // Usamos la fecha y hora guardada
      const segundosSeleccionados = Number(this.selectedSecond); // Convertimos los segundos seleccionados a número

      // Sumamos los segundos seleccionados a la fecha
      fechaSeleccionada.setSeconds(fechaSeleccionada.getSeconds() + segundosSeleccionados);

      // Convertimos la fecha modificada a cadena o la dejamos como Date, dependiendo de tu lógica
      this.fec_timbre = fechaSeleccionada.toISOString(); // Formato ISO string
      this.fec_timbre = this.formatDateLocal(fechaSeleccionada); // Formateamos la fecha como una cadena local

      console.log('Fecha con segundos sumados:', this.fec_timbre);
    }
  }

  // METODO PARA FOMATEAR LA FECHA EN FORMATO LOCAL
  formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Mes en formato de 2 dígitos
    const day = ('0' + date.getDate()).slice(-2); // Día en formato de 2 dígitos
    const hours = ('0' + date.getHours()).slice(-2); // Hora en formato de 2 dígitos
    const minutes = ('0' + date.getMinutes()).slice(-2); // Minutos en formato de 2 dígitos
    const seconds = ('0' + date.getSeconds()).slice(-2); // Segundos en formato de 2 dígitos
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // Formato: YYYY-MM-DD HH:MM:SS
  }

  // METODO PARA ENVIAR EL TIMBRE
  enviarTimbre() {
    console.log('timbre enviar...');
    if (this.accion === '' || this.tecla_funcion === -1 || this.fec_timbre === '') return this.abrirToas('Falta llenar todos los campos', "warning", 3000)
    let dataTimbre = {
      fec_hora_timbre: this.fec_timbre,
      accion: this.accion,
      tecl_funcion: this.tecla_funcion,
      observacion: 'Timbre realizado por ' + this.fullnameAdmin + ', ' + this.observacion,
      latitud: null,
      longitud: null,
      codigo: this.data.codigo,
      id_reloj: 97,
      id: this.data.id,
      ip: localStorage.getItem('ip'),
      documento: this.base64Image,
      dispositivo_timbre: this.dispositivo_timbre,
      conexion: true,
      hora_timbre_diferente: false

    }
    this.timbresService.PostTimbreWebAdmin(dataTimbre).subscribe(res => {
      console.log(res);
      this.closeModal(true);
      this.abrirToas(res.message, "success", 3000)
    }, err => {
      console.log(err);
    })
  }

  // METODO PARA CONFIGURAR LOS PARAMETROS DEL TOAST
  async abrirToas(mensaje: string, color: string, duracion: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      position: "middle"
    });
    toast.present();
  }

  // METODO PARA ELIMINAR EL MODAL
  closeModal(refreshInfo: Boolean) {
    console.log('CERRAR MODAL timbre justificado');
    this.modalController.dismiss({
      'refreshInfo': refreshInfo
    });
  }
  fileName: string = '';
  uploadError: string = '';
  base64Image: string | ArrayBuffer | null = null;

  // METODO PARA ABRIR LA GALERIA Y SELECCIONAR UNA IMAGEN
  async selectImage() {
    console.log("ver imagen");

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos
    });

    if (image.dataUrl) {
      this.base64Image = image.dataUrl;

    } else {
      this.base64Image = "";
      this.fileName = "";
    }
  }

  // METODO QUE VERIFICA EL NUMERO DE CARACTERES
  ionChange() {
    this.numeroCaracteres = this.observacion.length;
  }

  // METODO PARA ELIMINAR LA IMAGEN SELECCIONADA
  deleteImagen() {
    console.log('El archivo ', this.fileName, ' Se quito Correctamente');
    this.validar.showToast('El archivo se quito correctamente', 3500, 'acua');
    // Resetea el input de archivo
    if (this.fileInput) {
      this.fileInput.value = '';
    }

    this.fileName = null;
    this.mensajeFile = null;
    this.base64Image = null;
  }

} 
