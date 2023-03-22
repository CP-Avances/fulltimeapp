import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReportesService } from '../../services/reportes.service';
import { DataUserLoggedService } from '../../services/data-user-logged.service';
import { PlantillaReportesService } from '../../libs/plantilla-reportes.service';
import { ValidacionesService } from '../../libs/validaciones.service';
import moment from 'moment';

@Component({
  selector: 'app-reporte-atraso',
  templateUrl: './reporte-atraso.component.html',
  styleUrls: ['../reportes.component.scss'],
})
export class ReporteAtrasoComponent implements OnInit {

  @Input() data: any;

  get fechaInicio(): string { return this.dataUserService.fechaRangoInicio }

  get fechaFinal(): string { return this.dataUserService.fechaRangoFinal }

  atrasos: any = [];

  showBtnPdf: boolean = false;
  loading: boolean = true;

  constructor(
    private reporteService: ReportesService,
    public modalController: ModalController,
    private dataUserService: DataUserLoggedService,
    private plantillaPDF: PlantillaReportesService,
    private validacionService: ValidacionesService
  ) { }

  ngOnInit() {
    console.log('reporte atraso | Data empleado: ', this.data);
    const id_empresa = localStorage.getItem('id_empresa');
    (id_empresa !== null) ? this.plantillaPDF.ShowColoresLogo(id_empresa) : this.plantillaPDF.abrirToas('No existe codigo de empresa', 'danger', 3000)
  }

  consultarDataReporte() {
    console.log('generar reporte...');
    console.log(this.fechaFinal);
    console.log(this.fechaInicio);
    this.loading = false;
    this.reporteService.getInfoReporteAtrasos(this.data.codigo, this.fechaInicio, this.fechaFinal).subscribe(res => {
      this.atrasos = res;
      this.showBtnPdf = true;
      this.loading = true;
    }, err => {
      this.showBtnPdf = false;
      this.loading = true;
      console.log(err);
      this.plantillaPDF.abrirToas(err.error.message, 'danger', 3000)
    })

  }

  generarPDF() {
    const filename = 'reporteAtrasos.pdf'
    this.plantillaPDF.generarPdf(this.getDocumentDefinicion(), filename)
  }

  closeModal() {
    console.log('CERRAR MODAL Reporte timbre');
    this.modalController.dismiss({
      'refreshInfo': true
    });
  }

  /* ****************************************************************************************************
  *                               PARA LA EXPORTACIÓN DE ARCHIVOS PDF
  * ****************************************************************************************************/

  getDocumentDefinicion() {

    return {

      pageOrientation: this.plantillaPDF.Orientacion(),
      watermark: this.plantillaPDF.MargaDeAgua(),
      header: this.plantillaPDF.HeaderText(),

      footer: function (currentPage, pageCount, fecha) {
        const h = new Date();
        const f = moment();
        fecha = f.format('YYYY-MM-DD');
        h.setUTCHours(h.getHours());
        const time = h.toJSON().split("T")[1].split(".")[0];
        return {
          margin: 10,
          columns: [
            {
              text: [{
                text: 'Fecha: ' + fecha + ' Hora: ' + time,
                alignment: 'left', opacity: 0.3
              }]
            },
            {
              text: [{
                text: '© Pag ' + currentPage.toString() + ' of ' + pageCount, alignment: 'right', opacity: 0.3
              }],
            }
          ], fontSize: 10
        }
      },
      content: [
        this.plantillaPDF.EncabezadoHorizontal('Reporte de Atrasos', this.fechaInicio.split('T')[0], this.fechaFinal.split('T')[0]),
        this.plantillaPDF.presentarDatosGenerales(this.data),
        this.impresionDatosPDF(this.atrasos),
      ],
      styles: this.plantillaPDF.estilosPdf()
    };
  }

  SumarValoresArray(array: any[]) {
    let valor = 0;
    for (let i = 0; i < array.length; i++) {
      valor = valor + array[i];
    }
    return valor
  }

  SumarValoresArrayDecimal(array: any[]) {
    let valor = 0;
    for (let i = 0; i < array.length; i++) {
      valor = valor + parseFloat(array[i]);
    }
    return valor.toFixed(2)
  }
  impresionDatosPDF(data: any[]): Array<any> {
    let c = 0;
    let arr = data.map(o => { return o.atraso_HHMM })
    let arr_seg = arr.map(o => { return this.validacionService.HHMMSStoSegundos(o) })
    let suma_seg = this.SumarValoresArray(arr_seg)
    let suma_HHMM = this.validacionService.SegundosToHHMM(suma_seg)

    let arr_dec = data.map(o => { return o.atraso_dec })
    let suma_dec = this.SumarValoresArrayDecimal(arr_dec)

    return [{
      style: 'tableMargin',
      table: {
        widths: ['auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [
          [
            { rowSpan: 2, text: 'N°', style: 'tableHeader', margin: [0, 7, 0, 0] },
            { rowSpan: 2, text: 'Fecha', style: 'tableHeader', margin: [0, 7, 0, 0] },
            { rowSpan: 2, text: 'Horario', style: 'tableHeader', margin: [0, 7, 0, 0] },
            { rowSpan: 2, text: 'Timbre', style: 'tableHeader', margin: [0, 7, 0, 0] },
            { rowSpan: 2, text: 'Tipo permiso', style: 'tableHeader', margin: [0, 7, 0, 0] },
            { rowSpan: 2, text: 'Desde', style: 'tableHeader', margin: [0, 7, 0, 0] },
            { rowSpan: 2, text: 'Hasta', style: 'tableHeader', margin: [0, 7, 0, 0] },
            { colSpan: 2, text: 'Permiso', style: 'tableHeader' },
            '',
            { colSpan: 2, text: 'Atraso', style: 'tableHeader' },
            ''
          ],
          [
            '', '', '', '', '', '', '',
            { text: 'Cal Dec', style: 'tableHeader', fontSize: 7 },
            { text: 'HH:MM:SS', style: 'tableHeader', fontSize: 7 },
            { text: 'Cal Dec', style: 'tableHeader', fontSize: 7 },
            { text: 'HH:MM:SS', style: 'tableHeader', fontSize: 7 },
          ],
          ...data.map(obj3 => {
            c = c + 1
            return [
              { style: 'itemsTableCentrado', text: c },
              { style: 'itemsTable', text: obj3.fecha },
              { style: 'itemsTable', text: obj3.horario },
              { style: 'itemsTable', text: obj3.timbre },
              { style: 'itemsTable', text: '' },
              { style: 'itemsTable', text: '' },
              { style: 'itemsTable', text: '' },
              { style: 'itemsTable', text: '' },
              { style: 'itemsTable', text: '' },
              { style: 'itemsTable', text: obj3.atraso_dec },
              { style: 'itemsTable', text: obj3.atraso_HHMM },
            ]
          }),
          [
            { rowSpan: 2, colSpan: 7, text: 'TOTAL EMPLEADO', style: 'tableTotal', margin: [0, 5, 15, 0], alignment: 'right' },
            '', '', '', '', '', '',
            { text: 'Cal Dec', style: 'tableHeader', fontSize: 7 },
            { text: 'HH:MM:SS', style: 'tableHeader', fontSize: 7 },
            { text: 'Cal Dec', style: 'tableHeader', fontSize: 7 },
            { text: 'HH:MM:SS', style: 'tableHeader', fontSize: 7 },
          ],
          [
            '', '', '', '', '', '', '',
            { text: ' ', style: 'itemsTable' },
            { text: ' ', style: 'itemsTable' },
            { text: suma_dec, style: 'itemsTable' },
            { text: suma_HHMM, style: 'itemsTable' },
          ]
        ]
      },
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
        }
      }
    }]

  }

}
