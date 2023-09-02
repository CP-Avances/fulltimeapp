import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ToastController, LoadingController, Platform } from '@ionic/angular';

import { environment } from 'src/environments/environment';
import { DataUserLoggedService } from '../services/data-user-logged.service';

import { File, IWriteOptions } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const PDF_TYPE = 'application/pdf';

@Injectable({
  providedIn: 'root'
})
export class PlantillaReportesService {

  constructor(
    private file: File,
    private fileOpener: FileOpener,
    public platform: Platform,
    public loadingController: LoadingController,
    private http: HttpClient,
    private toastController: ToastController,
    private dataUser: DataUserLoggedService,
  ) { }

  // Método para obtener colores y logotipo empresa

  private _imagenBase64: string;
  private _nameEmpresa: string;

  get logoBase64(): string { return this._imagenBase64 }
  setLogoBase64(arg: string) { this._imagenBase64 = arg }

  get nameEmpresa(): string { return this._nameEmpresa }
  setNameEmpresa(arg: string) { this._nameEmpresa = arg }

  private p_color: any;
  private s_color: any;

  get color_Primary(): string { return this.p_color }
  setColorPrimary(arg: string) { this.p_color = arg }

  get color_Secundary(): string { return this.s_color }
  setColorSecondary(arg: string) { this.s_color = arg }

  ShowColoresLogo(id_empresa: string) {
    const logoBase64 = sessionStorage.getItem('logo');
    const name_empresa = sessionStorage.getItem('name_empresa');
    const p = sessionStorage.getItem('p_color');
    const s = sessionStorage.getItem('s_color');

    if (logoBase64 === null || name_empresa === null || p === null || s === null) {
      localStorage.removeItem('name_empresa');
      const params = new HttpParams()
        .set('id_empresa', id_empresa)

      this.http.get<any>(`${environment.url}/reportes/info-plantilla`, { params }).subscribe(
        res => {
          this.setLogoBase64('data:image/jpeg;base64,' + res.imagen);
          this.setNameEmpresa(res.nom_empresa);
          this.setColorPrimary(res.color_p);
          this.setColorSecondary(res.color_s);

          sessionStorage.setItem('p_color', res.color_p);
          sessionStorage.setItem('s_color', res.color_s);
          sessionStorage.setItem('name_empresa', res.nom_empresa);
          (res.imagen == '') ? sessionStorage.setItem('logo', '') : sessionStorage.setItem('logo', 'data:image/jpeg;base64,' + res.imagen)
        }, err => {
          sessionStorage.removeItem('logo')
          sessionStorage.removeItem('name_empresa');
          sessionStorage.removeItem('p_color');
          sessionStorage.removeItem('s_color');
          console.log(err);
        })
    } else {
      this.setLogoBase64(logoBase64);
      this.setNameEmpresa(name_empresa);
      this.setColorPrimary(p);
      this.setColorSecondary(s);
    }

  }

  HeaderText() {
    return {
      margin: 10,
      columns: [
        {
          text: [{
            text: 'Aplicación Reloj Virtual',
            margin: 10,
            fontSize: 9,
            opacity: 0.3,
            alignment: 'left'
          }]
        },
        {
          text: [{
            text: 'Impreso por:  ' + this.dataUser.UserFullname,
            margin: 10,
            fontSize: 9,
            opacity: 0.3,
            alignment: 'right'
          }],
        }
      ], fontSize: 10
    }
  }

  Orientacion(vertical = true) {
    return (vertical) ? 'portrait' : 'landscape';
  }

  MargaDeAgua() {
    return { text: 'Confidencial', color: 'blue', opacity: 0.1, bold: true, italics: false }
  }

  EncabezadoVertical(titulo: string, fec_inicio: string, fec_final: string) {
    let arrayEncabezado = [
      // { image: this.logoBase64, width: 100, margin: [10, -25, 0, 5] },
      { text: sessionStorage.getItem('name_empresa'), bold: true, fontSize: 21, alignment: 'center', margin: [0, -30, 0, 10] },
      { text: titulo, bold: true, fontSize: 12, alignment: 'center', margin: [0, 5, 0, 5] },
      { text: 'Periodo del: ' + fec_inicio + " al " + fec_final, bold: true, fontSize: 12, alignment: 'center', margin: [0, 5, 0, 5] },
    ]
    // if (this.logoBase64.includes('data:image/jpeg;base64,')) {
    //   arrayEncabezado.shift();
    // }

    return arrayEncabezado
  }

  EncabezadoHorizontal(titulo: string, fec_inicio: string, fec_final: string) {
    // falta cambiar las dimensiones del encabezado
    let arrayEncabezado = [
      // { image: this.logoBase64, width: 100, margin: [10, -25, 0, 5] },
      { text: sessionStorage.getItem('name_empresa'), bold: true, fontSize: 21, alignment: 'center', margin: [0, -30, 0, 10] },
      { text: titulo, bold: true, fontSize: 12, alignment: 'center', margin: [0, 5, 0, 5] },
      { text: 'Periodo del: ' + fec_inicio + " al " + fec_final, bold: true, fontSize: 12, alignment: 'center', margin: [0, 5, 0, 5] },
    ]
    // if (this.logoBase64.indexOf('data:image/jpeg;base64,')) {
    //   arrayEncabezado.shift();
    // }

    return arrayEncabezado
  }

  EncabezadoHorizontalAprobacion(titulo: string) {
    // falta cambiar las dimensiones del encabezado
    let arrayEncabezado = [
      // { image: this.logoBase64, width: 100, margin: [10, -25, 0, 5] },
      { text: sessionStorage.getItem('name_empresa'), bold: true, fontSize: 21, alignment: 'center', margin: [0, -30, 0, 10] },
      { text: titulo, bold: true, fontSize: 12, alignment: 'center', margin: [0, 5, 0, 5] },
    ]
    // if (this.logoBase64.indexOf('data:image/jpeg;base64,')) {
    //   arrayEncabezado.shift();
    // }
    return arrayEncabezado
  }

  estilosPdf() {
    return {
      tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
      itemsTableCenter: { fontSize: 9, alignment: 'center' },
      tableMarginCabecera: { margin: [0, 10, 0, 0] },
      quote: { margin: [5, -2, 0, -2], italics: true },
      small: { fontSize: 8, color: 'blue', opacity: 0.5 },
      itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
      itemsTableInfoBlanco: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: '#E3E3E3' },
      itemsTable: { fontSize: 8 },
      tableTotal: { fontSize: 13, bold: true, alignment: 'rigth', fillColor: this.p_color },
    }
    // tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
    // itemsTableCentrado: { fontSize: 10, alignment: 'center' },
    // itemsTableI: { fontSize: 9, alignment: 'left', margin: [50, 5, 5, 5] },
    // itemsTableP: { fontSize: 9, alignment: 'left', bold: true, margin: [50, 5, 5, 5] },
    // centrado: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 10, 0, 10] }
  }

  presentarDatosGenerales(empleado: any) {
    const { cedula, codigo, fullname } = empleado;
    return [{
      style: 'tableMarginCabecera',
      table: {
        widths: ['*', 'auto', 'auto'],
        body: [
          [
            {
              border: [true, true, false, false],
              text: 'EMPLEADO: ' + fullname,
              style: 'itemsTableInfoBlanco'
            },
            {
              border: [false, true, false, false],
              text: 'C.C.: ' + cedula,
              style: 'itemsTableInfoBlanco'
            },
            {
              border: [false, true, true, false],
              text: 'COD: ' + codigo,
              style: 'itemsTableInfoBlanco'
            }
          ]
        ]
      }
    }];

  }

  generarPdf(getDocumentDefinicion: any, filename = 'reporte.pdf') {
    this.presentLoading('Creando archivo PDF...');
    const documentDefinition = getDocumentDefinicion;
    const pdfDoc = pdfMake.createPdf(documentDefinition);

    pdfDoc.getBuffer((uint8Array: Uint8Array) => {

      let buffer = uint8Array.buffer;
      if (this.platform.is('capacitor')) {
        this.descargarDeCelular(buffer, filename.split('.')[0], PDF_TYPE, '.pdf');
      } else {
        const data: Blob = new Blob([buffer]);
        var a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(data);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });

  }

  private descargarDeCelular(buffer: any, nombreArchivo: string, tipo: string, extencion: string) {

    const directory = this.file.dataDirectory;
    console.log(directory);
    const fileName = nombreArchivo + extencion;

    let options: IWriteOptions = { replace: true };
    
    //Writing File to Device
    this.file.writeFile(directory, fileName, buffer, options)
      .then((success) => {
        console.log("Archivo creado satisfactoriamente" + JSON.stringify(success));
        this.fileOpener.open(this.file.dataDirectory + fileName, tipo)
          .then(() => console.log('Archivo abierto'))
          .catch(e => { console.log('Error abriendo archivo', e); this.mostrarToas('Error abiendo el archivo', 4000) });
      })
      .catch((error) => {
        console.log("No se puede crear el archivo " + JSON.stringify(error));
      });
  }

  private async presentLoading(msg: string) {
    this.loadingController.create({
      message: msg,
      duration: 1000,
    }).then((response) => {
      response.present();
      response.onDidDismiss().then((response) => {});
    });
  }

  private async mostrarToas(mensaje: string, duracion: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: "danger"
    });
    toast.present();
  }

  public async abrirToas(mensaje: string, color: string, duracion: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      mode: 'ios',
    });
    toast.present();
  }

}
