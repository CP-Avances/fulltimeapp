import { Component, OnInit, Input } from '@angular/core';
import { ModalController, NavParams, LoadingController, ToastController, Platform } from '@ionic/angular';
import { DatePipe } from '@angular/common';

//import { FileOpener } from '@ionic-native/file-opener/ngx';
// import jsPDF from 'jspdf/dist/jspdf.node.debug'
// import { applyPlugin } from 'jspdf-autotable'
//import jsPDF from 'jspdf'
//import autoTable from 'jspdf-autotable'

//import { File, IWriteOptions } from '@ionic-native/file/ngx';
//import * as XLSX from 'xlsx';

import { Timbre } from 'src/app/interfaces/Timbre';
import { RelojServiceService } from 'src/app/services/reloj-service.service';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8';
const PDF_TYPE = 'application/pdf';
const EXCEL_EXTENSION = '.xlsx';
// applyPlugin(jsPDF)
@Component({
  selector: 'app-construir-pdf',
  templateUrl: './construir-pdf.component.html',
  styleUrls: ['./construir-pdf.component.scss'],
})
export class ConstruirPDFComponent implements OnInit {

  @Input() timbres: Timbre[];
  @Input() horaServidor: boolean;
  loading: any;
  esAdministrador = false;
  pipe = new DatePipe('en-US');

  constructor(private modalCtrl: ModalController,
    navParams: NavParams,
    public loadingController: LoadingController,
    private file: File,
    //private fileOpener: FileOpener,
    private toastController: ToastController,
    private platform: Platform,
    private relojService: RelojServiceService
  ) {
  }

  ngOnInit() {
    this.modificarJson
    this.esAdministrador = this.relojService.esAdministrador();
  }


  //modificar JSON para descargar en excel
  modificarJson(): Timbre[] {
    //this.timbres.forEach(t => t.fecha_timbre = this.pipe.transform(t.fecha_timbre,'yyyy/MM/dd'));
    const timbresEx: Timbre[] = this.timbres;
    return timbresEx;
  }
  //Fin modificar JSOn
  // inicion de funcion para exportar XLSX
  /*exportarExcel() {
    const json: any = JSON.parse(JSON.stringify(this.modificarJson()))
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([], { header: ["Empleado ID", "Descripción de acción", "Acción ID", "Nombre", "Apelllido", "Fecha", "Hora servidor", "Hora celular", "Observación", "Latitud", "Longitud","Aut","ID dispositivo","ID registrado para este usuario"] });
    XLSX.utils.sheet_add_json(
      worksheet, json, { skipHeader: true, origin: "A2" }
    )


    worksheet["!cols"] = [{ wch: 8 }, { wch: 21 }, { hidden: true }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 11 }, { wch: 11 }, { wch: 3 }, { wch: 11 },{ wch: 11 }]

    const workbook: XLSX.WorkBook = {
      Sheets: { 'data': worksheet }, SheetNames: ['data']
    }

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    if (this.platform.is('cordova')) {
      this.descargarDeCelular(excelBuffer, 'reporte_excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', EXCEL_EXTENSION);
    } else {
      this.descargarDeExplorador(excelBuffer, 'reporte_excel');
    }

  }


  //fin exportar XLSX
  //INICIO metodos para guardar archivo desde explorador o desde celular
  descargarDeExplorador(excelBuffer: any, nombreArchivoExcel: string) {
    const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(data);
    a.download = nombreArchivoExcel + EXCEL_EXTENSION;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /*descargarDeCelular(buffer: any, nombreArchivo: string, tipo: string, extencion: string) {
    const directory = this.file.dataDirectory;

    const fileName = nombreArchivo + extencion;
    let options: IWriteOptions = { replace: true };
    //Writing File to Device
    this.file.writeFile(directory, fileName, buffer, options)
      .then((success) => {
        this.dismissLoading();
        console.log("Archivo creado satisfactoriamente" + JSON.stringify(success));
        this.fileOpener.open(this.file.dataDirectory + fileName, tipo)
          .then(() => console.log('Archivo abierto'))
          .catch(e => { console.log('Error abriendo archivo', e); this.mostrarToas('Error abiendo el archivo', 4000) });
      })
      .catch((error) => {
        this.dismissLoading();
        console.log("No se puede crear el archivo " + JSON.stringify(error));
      });


  }*/
  //FIN metodos para guardar archivo desde explorador o desde celular

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }



  //mensaje de cargando
  async presentLoading(msg) {
    const loading = await this.loadingController.create({
      message: msg
    });
    return await loading.present();
  }
  //fin mensaje cargando

  //transform to pdf

  /*exportPdf() {
    this.presentLoading('Creando archivo PDF...');
    //Initialize JSPDF
    var doc = new jsPDF("p", "mm", "a4");
    //Add image Url to PDF


    // doc.text(20, 20, 'REPORTE DE TIMBRES')
    // Example usage of columns property. Note that America will not be included even though it exist in the body since there is no column specified for it.
    autoTable(doc, { html: '#tablaTimbres' })
    doc.save('table.pdf')

    let pdfOutput = doc.output();

    // using ArrayBuffer will allow you to put image inside PDF
    let buffer = new ArrayBuffer(pdfOutput.length);

    let array = new Uint8Array(buffer);

    for (var i = 0; i < pdfOutput.length; i++) {
      array[i] = pdfOutput.charCodeAt(i);
    }

    //This is where the PDF file will stored , you can change it as you like
    // for more information please visit https://ionicframework.com/docs/native/file/

    if (this.platform.is('cordova')) {
      this.descargarDeCelular(buffer, 'timbresPDF', PDF_TYPE, '.pdf');
    } else {

      const data: Blob = new Blob([buffer]);
      var a = window.document.createElement('a');
      a.href = window.URL.createObjectURL(data);
      a.download = "timbres.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      this.dismissLoading();

    }

  }*/


  async mostrarToas(mensaje: string, duracion: number) {

    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: "danger"
    });
    toast.present();
    this.dismissLoading();
  }
  async dismissLoading() {
    while (await this.loadingController.getTop() !== undefined) {
      await this.loadingController.dismiss();
    }
  }

}
