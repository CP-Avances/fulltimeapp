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
  //obtener ID de celular, para identificar en que celular timbró
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
  accionChange(e) {
    console.log(e.target.value);
    this.accion = e.target.value;
    const [obj1] = this.selectOptions.filter(o => { return o.accion === this.accion }).map(o => { return o.teclaFuncion })
    this.tecla_funcion = obj1
  }


  fechaChange(e) {
    console.log(e.target.value);
    this.fec_timbre = e.target.value
  }


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

  async abrirToas(mensaje: string, color: string, duracion: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color
    });
    toast.present();
  }



  closeModal(refreshInfo: Boolean) {
    console.log('CERRAR MODAL timbre justificado');
    this.modalController.dismiss({
      'refreshInfo': refreshInfo
    });
  }
  fileName: string = '';
  uploadError: string = '';
  base64Image: string | ArrayBuffer | null = null;


  /*
  async  selectImage() {
    console.log("ver imagen")
    
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos // Permite seleccionar una imagen de la galería
    });
  
    if (image.dataUrl) {
      this.base64Image = image.dataUrl;
  
      if (image.webPath) {
        // Extraer el nombre del archivo a partir de webPath
        const filePath = image.webPath;
        const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
        this.fileName = fileName;
        console.log("Nombre del archivo:", this.fileName);
      } else {
        console.log("No se pudo obtener el nombre del archivo.");
      }
    } else {
      this.base64Image = "";
      this.fileName = "";
    }
    
  }
*/


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


  
/*
  fileChange(element) {
    this.archivoSubido = element.target.files;

    console.log(this.archivoSubido);
    const name = this.archivoSubido[0].name;
    if (this.archivoSubido.length != 0) {


      if (this.archivoSubido[0].name.length > 50) {
        this.archivoSubido = null;
        this.fileName = ''
        this.mensajeFile = "El nombre debe tener 50 caracteres como maximo";
        this.validar.showToast('Ups el nombre del archivo es muy largo', 3500, 'warning');

      } else {
        console.log(this.archivoSubido[0].name);
        this.fileName = name;
       // this.validar.showToast('Archivo valido', 3500, 'success');
      }
    }

    // Convert file to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      this.base64Image = reader.result; // Base64 string
      console.log("Imagen en Base64: ", this.base64Image); // Aquí ya está disponible
      //this.showToast("Imagen en Base64 lista", 3000, 'success');
      this.validar.showToast('Imagen en Base64 lista', 3500, 'success');

    };
    reader.onerror = () => {
      this.uploadError = 'Error al leer el archivo.';
     // this.showToast('Error al leer el archivo.', 3000, 'danger');
      this.validar.showToast('Error al leer el archivo.', 3500, 'success');

    };
    reader.readAsDataURL(this.archivoSubido[0]);
  }

  */

  ionChange() {
    this.numeroCaracteres = this.observacion.length;
  }

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
