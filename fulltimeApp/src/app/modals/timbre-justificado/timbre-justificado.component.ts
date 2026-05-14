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
  ips_locales: any = '';

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

  fileName: string = '';
  uploadError: string = '';
  documento: string;

  private get fullnameAdmin(): string {
    return this.dataUserService.UserFullname
  }

  constructor(
    public validar: ValidacionesService,
    public modalController: ModalController,
    private timbresService: TimbresService,
    private dataUserService: DataUserLoggedService,
    private toastController: ToastController,

  ) { }

  ngOnInit() {
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

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
    const fechaSeleccionada = new Date(this.fec_timbre); // Usamos la fecha y hora guardada
    fechaSeleccionada.setSeconds(fechaSeleccionada.getSeconds() + 0);
    this.fec_timbre = fechaSeleccionada.toISOString(); // Formato ISO string
    this.fec_timbre = this.formatDateLocal(fechaSeleccionada); // Formateamos la fecha como una cadena local

    this.versegundos = true;

  }

  // METODO PARA SUMAR LA FECHA CON LOS SEGUNDOS SELECCIONADOS
  updateFechaConSegundos() {
    if (this.initialDate && this.selectedSecond !== undefined) {
      const fechaSeleccionada = new Date(this.initialDate); // Usamos la fecha y hora guardada
      const segundosSeleccionados = Number(this.selectedSecond); // Convertimos los segundos seleccionados a número

      // Sumamos los segundos seleccionados a la fecha
      fechaSeleccionada.setSeconds(fechaSeleccionada.getSeconds() + segundosSeleccionados);

      // Convertimos la fecha modificada a cadena o la dejamos como Date, dependiendo de tu lógica
      this.fec_timbre = fechaSeleccionada.toISOString(); // Formato ISO string
      this.fec_timbre = this.formatDateLocal(fechaSeleccionada); // Formateamos la fecha como una cadena local

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

    if (this.accion === '' || this.tecla_funcion === -1 || this.fec_timbre === '') {
      return this.abrirToas('Falta llenar todos los campos', 'warning', 3000);
    }

    const fecHoraTimbre = this.normalizarFechaHoraTimbre(this.fec_timbre);

    if (!fecHoraTimbre) {
      return this.abrirToas('La fecha del timbre no es válida.', 'warning', 3000);
    }

    const timbrePayload = {
      fec_hora_timbre: fecHoraTimbre,
      accion: this.accion,
      tecl_funcion: this.tecla_funcion,
      observacion: 'Timbre realizado por ' + this.fullnameAdmin + ', ' + this.observacion,
      id_empleado: [this.data.id],
      id_reloj: 98,
    };

    const formData = new FormData();

    formData.append('timbres', JSON.stringify([timbrePayload]));

    const mapDocumentos: { index: number; fileIndex: number }[] = [];

    if (this.documento) {
      const archivo = this.convertirDataUrlAFile(
        this.documento,
        'documento_timbre.webp'
      );

      formData.append('documentos', archivo, archivo.name);

      mapDocumentos.push({
        index: 0,
        fileIndex: 0
      });
    }

    formData.append('mapDocumentos', JSON.stringify(mapDocumentos));

    this.timbresService.RegistrarTimbreAdmin(formData).subscribe({
      next: () => {

        this.closeModal(true);
        this.abrirToas('Operación exitosa.', 'success', 3000);
      },
      error: () => {
        this.abrirToas('Error al registrar el timbre.', 'danger', 3000);
      }
    });
  }

  normalizarFechaHoraTimbre(valor: any): string | null {
    if (!valor) return null;

    const fecha = new Date(valor);

    if (isNaN(fecha.getTime())) {

      return null;
    }

    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    const hh = String(fecha.getHours()).padStart(2, '0');
    const min = String(fecha.getMinutes()).padStart(2, '0');
    const ss = String(fecha.getSeconds()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
  }

  convertirDataUrlAFile(dataUrl: string, fileName: string): File {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/webp';

    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], fileName, { type: mime });
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

    this.modalController.dismiss({
      'refreshInfo': refreshInfo
    });
  }

  // METODO PARA ABRIR LA GALERIA Y SELECCIONAR UNA IMAGEN
  // METODO PARA ABRIR LA GALERIA Y SELECCIONAR UNA IMAGEN
  async selectImage() {
    console.log("ver imagen");

    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
      width: 1200,
      height: 1200,
    });

    if (image.dataUrl) {
      this.documento = await this.convertirBase64AWebP(image.dataUrl);
      this.fileName = 'documento_timbre.webp';
      this.mensajeFile = 'Imagen seleccionada correctamente';
    } else {
      this.documento = '';
      this.fileName = null;
      this.mensajeFile = null;
    }
  }

  // METODO QUE VERIFICA EL NUMERO DE CARACTERES
  ionChange() {
    this.numeroCaracteres = this.observacion.length;
  }

  // METODO PARA ELIMINAR LA IMAGEN SELECCIONADA
  deleteImagen() {

    this.validar.showToast('El archivo se quitó correctamente', 3500, 'acua');

    if (this.fileInput) {
      this.fileInput.value = '';
    }

    this.fileName = null;
    this.mensajeFile = null;
    this.documento = null;
  }

  async convertirBase64AWebP(base64: string): Promise<string> {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const webpBase64 = canvas.toDataURL("image/webp", 0.9);
        resolve(webpBase64);
      };

      img.onerror = reject;
      img.src = base64;
    });
  }

} 
