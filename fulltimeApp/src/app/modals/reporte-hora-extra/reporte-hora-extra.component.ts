import { Component, OnInit, Input } from '@angular/core';
import { ReportesService } from '../../services/reportes.service';
import { ModalController } from '@ionic/angular';
import { DataUserLoggedService } from '../../services/data-user-logged.service';

import { PlantillaReportesService } from '../../libs/plantilla-reportes.service';
import { ValidacionesService } from '../../libs/validaciones.service';
import moment from 'moment';

@Component({
  selector: 'app-reporte-hora-extra',
  templateUrl: './reporte-hora-extra.component.html',
  styleUrls: ['../reportes.component.scss'],
})
export class ReporteHoraExtraComponent implements OnInit {

  @Input() data: any;

  get fechaInicio(): string { return this.dataUserService.fechaRangoInicio }
  get fechaFinal(): string { return this.dataUserService.fechaRangoFinal }

  horas_extras: any = [];

  showBtnPdf: boolean = false;
  loading: boolean = true;

  constructor(
    private reporteService: ReportesService,
    public modalController: ModalController,
    private dataUserService: DataUserLoggedService,
    private plantillaPDF: PlantillaReportesService,
  ) { }

  ngOnInit() {
    console.log('reporte hora extra | Data empleado: ', this.data);
    const id_empresa = localStorage.getItem('id_empresa');
    (id_empresa !== null) ? this.plantillaPDF.ShowColoresLogo(id_empresa) : this.plantillaPDF.abrirToas('No existe codigo de empresa', 'danger', 3000)
  }

  consultarDataReporte() {
    console.log('generar reporte...');
    console.log(this.fechaFinal);
    console.log(this.fechaInicio);
    this.loading = false;
    this.reporteService.getInfoReporteHorasExtras(this.data.id, this.data.codigo, this.fechaInicio, this.fechaFinal).subscribe(res => {
      this.horas_extras = res;
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

  /**********************************************
   *  METODOS PARA IMPRIMIR REPORTE DE HORAS EXTRAS
   **********************************************/
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
        this.plantillaPDF.EncabezadoHorizontal('Reporte de Horas Extras', this.fechaInicio.split('T')[0], this.fechaFinal.split('T')[0]),

        this.ImpresionInformacion(this.horas_extras.info[0]),
        this.ImpresionDetalle(this.horas_extras.detalle),
        this.ImprimirTotal(this.horas_extras.total),
        // this.ImprimirFirmas(this.horas_extras.info[0])
      ],
      styles: this.plantillaPDF.estilosPdf()
    };
    // styles: {
    //   tableHeaderDetalle: { bold: true, alignment: 'center', fillColor: this.p_color, fontSize: 9, margin: [0, 3, 0, 3] },
    //   itemsTableDetalle: { fontSize: 8, margin: [0, 3, 0, 3] },
    //   subtitulos: { fontSize: 16, alignment: 'center', margin: [0, 5, 0, 10] },
    //   tableTotal: { fontSize: 15, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 5, 0, 8] },
    //   tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
    //   itemsTable: { fontSize: 8, margin: [0, 3, 0, 3] },
    //   itemsTableInfo: { fontSize: 10, margin: [0, 5, 0, 5] },
    //   tableMargin: { margin: [0, 20, 0, 0] },
    //   MarginTable: { margin: [0, 10, 0, 10] },
    //   CabeceraTabla: { fontSize: 12, alignment: 'center', margin: [0, 8, 0, 8], fillColor: this.p_color},
    //   quote: { margin: [5, -2, 0, -2], italics: true },
    //   small: { fontSize: 8, color: 'blue', opacity: 0.5 }
    // }
  }

  ImpresionInformacion(e: any) {
    return {
      table: {
        widths: ['*', 'auto', 'auto'],
        body: [
          [
            { colSpan: 3, text: 'INFORMACIÓN GENERAL EMPLEADO', style: 'CabeceraTabla' },
            '', ''
          ],
          [
            {
              border: [true, true, false, true],
              bold: true,
              text: 'PERIODO DEL: ' + String(moment('2020/12/01', "YYYY/MM/DD").format("DD/MM/YYYY")) + ' AL ' + String(moment('2020/12/31', "YYYY/MM/DD").format("DD/MM/YYYY")),
              style: 'itemsTableInfo'
            },
            {
              border: [false, true, false, true],
              text: 'CIUDAD: ' + 'Quito',
              style: 'itemsTableInfo'
            },
            {
              border: [false, true, true, true],
              text: 'N° REGISTROS: ' + this.horas_extras.detalle.length,
              style: 'itemsTableInfo'
            }
          ],
          [
            {
              border: [true, true, false, true],
              text: 'EMPLEADO: ' + e.nombre,
              style: 'itemsTableInfo'
            },
            {
              border: [false, true, false, true],
              text: 'C.C.: ' + e.cedula,
              style: 'itemsTableInfo'
            },
            {
              border: [false, true, true, true],
              text: 'COD: ' + e.codigo,
              style: 'itemsTableInfo'
            }
          ],
          [
            {
              border: [true, true, false, true],
              text: 'SUELDO: ' + e.sueldo,
              style: 'itemsTableInfo'
            },
            {
              border: [false, true, false, true],
              text: 'HORAS TRABAJADAS EN EL DÍA: ' + e.hora_trabaja,
              style: 'itemsTableInfo'
            },
            {
              border: [false, true, true, true],
              text: ' ',
              style: 'itemsTableInfo'
            }
          ]
        ]
      }
    }
  }

  ImpresionDetalle(datosRest: any[]) {
    let contador = 0;
    return {
      style: 'MarginTable',
      table: {
        headerRows: 1,
        widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [
          this.FuncionTituloColumna(),
          ...datosRest.map((obj) => {
            contador = contador + 1;
            var array = [
              { style: 'itemsTableDetalle', text: contador },
              { style: 'itemsTableDetalle', text: obj.descripcion },
              { style: 'itemsTableDetalle', text: obj.fec_inicio.split('T')[0] },
              { style: 'itemsTableDetalle', text: obj.fec_inicio.split('T')[1].split('.')[0] },
              { style: 'itemsTableDetalle', text: obj.fec_final.split('T')[0] },
              { style: 'itemsTableDetalle', text: obj.fec_final.split('T')[1].split('.')[0] },
              { style: 'itemsTableDetalle', text: obj.total_horas },
              { style: 'itemsTableDetalle', text: obj.porcentaje },
              { style: 'itemsTableDetalle', text: obj.valor_recargo.toString().slice(0, 6) },
              { style: 'itemsTableDetalle', text: obj.valor_hora_total },
              { style: 'itemsTableDetalle', text: obj.valor_pago }
            ]
            return array
          })
        ]
      },
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
        }
      }
    }
  }

  FuncionTituloColumna() {
    var arrayTitulos = [
      { text: 'N°', style: 'tableHeaderDetalle' },
      { text: 'Descripcion', style: 'tableHeaderDetalle' },
      { text: 'Fecha Inicio', style: 'tableHeaderDetalle' },
      { text: 'Hora Inicio', style: 'tableHeaderDetalle' },
      { text: 'Fecha Final', style: 'tableHeaderDetalle' },
      { text: 'Hora Final', style: 'tableHeaderDetalle' },
      { text: 'Horas', style: 'tableHeaderDetalle' },
      { text: 'Porcentaje', style: 'tableHeaderDetalle' },
      { text: 'Valor recargo', style: 'tableHeaderDetalle' },
      { text: 'Valor hora', style: 'tableHeaderDetalle' },
      { text: 'Valor a pagar', style: 'tableHeaderDetalle' }
    ]

    return arrayTitulos
  }

  ImprimirTotal(t: any) {

    var arrayTitulos = [
      { text: 'VALOR HORAS EXTRAS: $ ' + t.total_pago_hx, style: 'tableTotal' },
      { text: 'TOTAL SUELDO: $ ' + t.total_sueldo, style: 'tableTotal' },
    ]

    return arrayTitulos
  }

  // ImprimirFirmas(e: any) {
  //   let n: any = [
  //     {
  //       columns: []
  //     }
  //   ];
  //   let nombreJefe = this.empleadoD[0].nombre + ' ' + this.empleadoD[0].apellido
  //   if (this.firma_jefe === true) {
  //     n[0].columns.push(
  //       {
  //         columns: [
  //           { width: '*', text: '' },
  //           {
  //             width: 'auto',
  //             layout: 'lightHorizontalLines',
  //             table: {
  //               widths: ['auto'],
  //               body: [
  //                 [{ text: 'AUTORIZADO', style: 'tableHeaderA' }],
  //                 [{ text: ' ', style: 'itemsTable', margin: [0, 20, 0, 20] }],
  //                 [{ text: nombreJefe + '\n' + 'GERENTE', style: 'itemsTable' }]
  //               ]
  //             }
  //           },
  //           { width: '*', text: '' },
  //         ]
  //       }
  //     )
  //   }

  //   if (this.firma_resp === true) {
  //     n[0].columns.push(
  //       {
  //         columns: [
  //           { width: '*', text: '' },
  //           {
  //             width: 'auto',
  //             layout: 'lightHorizontalLines',
  //             table: {
  //               widths: ['auto'],
  //               body: [
  //                 [{ text: 'RESPONSABLE', style: 'tableHeaderA' }],
  //                 [{ text: ' ', style: 'itemsTable', margin: [0, 20, 0, 20] }],
  //                 [{ text: 'Alejandra Cortez' + '\n' + 'RRHH', style: 'itemsTable' }]
  //               ]
  //             }
  //           },
  //           { width: '*', text: '' },
  //         ]
  //       }
  //     )
  //   }

  //   if(this.firma_empl === true) {
  //     n[0].columns.push(
  //       {
  //         columns: [
  //           { width: '*', text: '' },
  //           {
  //             width: 'auto',
  //             layout: 'lightHorizontalLines',
  //             table: {
  //               widths: ['auto'],
  //               body: [
  //                 [{ text: 'EMPLEADO', style: 'tableHeaderA' },],
  //                 [{ text: ' ', style: 'itemsTable', margin: [0, 20, 0, 20] }],
  //                 [{ text: e.nombre + '\n' + 'Asistente', style: 'itemsTable' }]
  //               ]
  //             }
  //           },
  //           { width: '*', text: '' },
  //         ]
  //       }
  //     )
  //   }

  //   return n
  // }


}
