import { Component, OnInit, Input } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { DataUserLoggedService } from '../../services/data-user-logged.service';
import { ReportesService } from '../../services/reportes.service';
import { PlantillaReportesService } from '../../libs/plantilla-reportes.service';
import { Timbre } from '../../interfaces/Timbre';
import { RelojServiceService } from 'src/app/services/reloj-service.service';


import moment from 'moment';

import { ParametrosService } from 'src/app/services/parametros.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';

@Component({
  selector: 'app-reporte-timbre',
  templateUrl: './reporte-timbre.component.html',
  styleUrls: ['../reportes.component.scss'],
})
export class ReporteTimbreComponent implements OnInit {

  @Input() data: any;

  get fechaInicio(): string { return this.dataUserService.fechaRangoInicio }
  get fechaFinal(): string { return this.dataUserService.fechaRangoFinal }

  timbres: Timbre[];

  showBtnPdf: boolean = false;
  loading: boolean = true;
  count: number = 0;
  empresa: any = {
    nombre: '',
    ruc: '',
    direccion: '',
    telefono: '',
    correo: '',
    representante: '',
  };

  constructor(
    private dataUserService: DataUserLoggedService,
    private reporteService: ReportesService,
    private plantillaPDF: PlantillaReportesService,
    public modalController: ModalController,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    public alertController: AlertController,
    private relojService: RelojServiceService,

  ) { }

  ngOnInit() {
    console.log('reporte timbre | Data empleado: ', this.data);
    const id_empresa: string = localStorage.getItem('id_empresa');
    (id_empresa !== null) ? this.plantillaPDF.ShowColoresLogo(id_empresa) : this.plantillaPDF.abrirToas('No existe codigo de empresa', 'danger', 3000)
    this.BuscarFormatos();
    this.obtenerDatosEmpresa(localStorage.getItem('id_empresa'));
    this.ObtenerLogo();
    this.ObtenerColores();
  }


  obtenerDatosEmpresa(idEmpresa: any) {
    this.relojService.obtenerDatosEmpresa(idEmpresa).subscribe(
      res => {

        console.log("ver datos empresa", res)
        console.log(res);
        this.empresa = res[0];
      },
      err => {
        console.log(err)
      }
    );
  }

  // BUSQUEDA DE PARAMETROS DE FECHAS Y HORAS
  formato_fecha: string;
  formato_hora: string;
  BuscarFormatos() {
    this.parametro.ObtenerFormatos().subscribe(
      resp => {
        this.formato_fecha = resp.fecha;
        this.formato_hora = resp.hora;
      }
    )
  }

  consultarDataReporte() {
    console.log('generar reporte...');
    this.loading = false;
    this.reporteService.getInfoReporteTimbres(this.data.codigo, this.fechaInicio, this.fechaFinal).subscribe(res => {
      this.timbres = res;
      this.timbres.forEach(data => {
        data.fecha = this.validar.FormatearFecha(data.fecha_hora_timbre, this.formato_fecha, this.validar.dia_abreviado);
        data.hora = this.validar.FormatearHora(moment(data.fecha_hora_timbre).format('HH:mm:ss'), this.formato_hora);

        data.sfecha = this.validar.FormatearFecha(data.fecha_hora_timbre_servidor, this.formato_fecha, this.validar.dia_abreviado);
        data.shora = this.validar.FormatearHora(moment(data.fecha_hora_timbre_servidor).format('HH:mm:ss'), this.formato_hora);

        if (data.latitud == null || data.latitud == undefined) {
          data.latitud = '0';
        }

        if (data.longitud == null || data.longitud == undefined) {
          data.longitud = '0';
        }

        this.count = this.count + 1;
        data.num = this.count;
      })
      console.log('data_consultada ...', this.timbres)
      this.showBtnPdf = true;
      this.loading = true;

      if (this.count == 100) {
        this.alertLimiteReporte();
      }

    }, err => {
      this.showBtnPdf = false;
      this.loading = true;
      console.log(err);
      this.plantillaPDF.abrirToas(err.error.message, 'danger', 3000)
    })

  }




  //mostrar Alerta para notificar el limite del reporte
  async alertLimiteReporte() {
    const alert = await this.alertController.create({
      header: 'Notificacion',
      message: 'El limite de timbres de reporte son 100.',
      buttons: [
        {
          text: 'OK',
          role: 'aceptar',
        }
      ],
      mode: 'ios'
    });
    await alert.present();
  }
  //FIN mostrar Alerta
  /*
    generarPDF() {
      const filename = 'reporteTimbres.pdf'
      this.plantillaPDF.generarPdf(this.getDocumentDefinicion(), filename)
    }
  */
  closeModal() {
    console.log('CERRAR MODAL Reporte timbre');
    this.modalController.dismiss({
      'refreshInfo': true
    });
  }

  /* ****************************************************************************************************
   *                               PARA LA EXPORTACIÓN DE ARCHIVOS PDF
   * ****************************************************************************************************/

  /*
  getDocumentDefinicion() {
    var inicio = this.validar.FormatearFecha(this.fechaInicio, this.formato_fecha, this.validar.dia_completo);
    var fin = this.validar.FormatearFecha(this.fechaFinal, this.formato_fecha, this.validar.dia_completo);

    return {

      pageOrientation: this.plantillaPDF.Orientacion(false),
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
        this.plantillaPDF.EncabezadoHorizontal('Reporte de Timbres', inicio, fin),
        this.plantillaPDF.presentarDatosGenerales(this.data),
        this.impresionDatosPDF(this.timbres),
      ],
      styles: this.plantillaPDF.estilosPdf()
    };
  }

  */

  p_color: any;
  s_color: any;
  frase: any;
  ObtenerColores() {
    this.plantillaPDF.ConsultarDatosEmpresa(parseInt(localStorage.getItem('id_empresa') as string)).subscribe(res => {
      this.p_color = res[0].color_principal;
      this.s_color = res[0].color_secundario;
      this.frase = res[0].marca_agua;
    });
  }

  logo: any = String;
  ObtenerLogo() {
    this.plantillaPDF.LogoEmpresaImagenBase64(localStorage.getItem('id_empresa') as string).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

  GenerarPDF() {
    let documentDefinition: any;
    documentDefinition = this.DefinirInformacionPDF();
    let doc_name = `Timbres_usuario.pdf`;
    this.plantillaPDF.generarPdf(documentDefinition, doc_name)
  }

  DefinirInformacionPDF() {
    // DEFINIR ORIENTACION DE LA PAGINA
    var inicio = this.validar.FormatearFecha(this.fechaInicio, this.formato_fecha, this.validar.dia_completo);
    var fin = this.validar.FormatearFecha(this.fechaFinal, this.formato_fecha, this.validar.dia_completo);
    return {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [40, 50, 40, 50],
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + localStorage.getItem('nom') + ' ' + localStorage.getItem('ap'), margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        hora = f.format('HH:mm:ss');

        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + hora, opacity: 0.3 },
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' de ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ],
          fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: this.empresa.nombre.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: `TIMBRES`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        { text: 'PERIODO DEL: ' + inicio + " AL " + fin, bold: true, fontSize: 11, alignment: 'center', margin: [0, 0, 0, 0] },
        ...this.EstructurarDatosPDF(this.timbres).map((obj: any) => {
          return obj
        })
      ],
      styles: {
        derecha: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color, alignment: 'left' },
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color },
        centrado: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 7, 0, 0] },
        itemsTable: { fontSize: 8 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoBlanco: { fontSize: 9, margin: [0, 0, 0, 0], fillColor: '#E3E3E3' },
        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2], fillColor: '#E3E3E3' },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        tableMargin: { margin: [0, 0, 0, 0] },
        tableMarginCabecera: { margin: [0, 15, 0, 0] },
        tableMarginCabeceraEmpleado: { margin: [0, 10, 0, 0] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      }
    };
  }


  EstructurarDatosPDF(data: any): Array<any> {
    let c = 0;
    let n: any = []
    let descripcion = '';

    let reg = this.timbres.length
    let establecimiento = 'SUCURSAL: ' + data.sucursal;

    descripcion = 'LISTA EMPLEADOS';
    establecimiento = '';

    n.push({
      style: 'tableMarginCabecera',
      table: {
        widths: ['*', '*', '*'],
        headerRows: 1,
        body: [
          [
            {
              border: [true, true, false, true],
              bold: true,
              text: descripcion,
              style: 'itemsTableInfo',
            },
            {
              border: [false, true, false, true],
              bold: true,
              text: establecimiento,
              style: 'itemsTableInfo',
            },
            {
              border: [false, true, true, true],
              text: 'N° Registros: ' + reg,
              style: 'derecha',
            },
          ],
        ],
      },
    });

    n.push({
      style: 'tableMarginCabeceraEmpleado',
      table: {
        widths: ['*', 'auto', 'auto'],
        headerRows: 2,
        body: [
          [
            {
              border: [true, true, false, false],
              text: 'C.C.: ' + this.data.cedula,
              style: 'itemsTableInfoEmpleado',
            },
            {
              border: [true, true, false, false],
              text: 'EMPLEADO: ' + this.data.fullname,
              style: 'itemsTableInfoEmpleado',
            },
            {
              border: [true, true, true, false],
              text: 'COD: ' + this.data.codigo,
              style: 'itemsTableInfoEmpleado',
            },
          ],
          [
            {
              border: [true, false, true, false],
              text: 'RÉGIMEN LABORAL ' + this.data.regimen,
              style: 'itemsTableInfoEmpleado'
            },
            {
              border: [true, false, false, false],
              text: 'DEPARTAMENTO: ' + this.data.departamento,
              style: 'itemsTableInfoEmpleado'
            },
            {
              border: [true, false, true, false],
              text: 'CARGO: ' + this.data.cargo,
              style: 'itemsTableInfoEmpleado'
            }
          ]
        ],
      },
    });
 
    n.push({
      style: 'tableMargin',
      table: {
        widths: ['auto', '*', '*', '*', '*', 'auto', 'auto', '*', 'auto', 'auto'],
        body: [
          [
            { rowSpan: 2, text: 'N.', style: 'tableHeader' },
            { colSpan: 2, text: 'TIMBRE', style: 'tableHeader' },
            '',
            { colSpan: 2, text: 'SERVIDOR', style: 'tableHeader' },
            '',
            { rowSpan: 2, text: 'RELOJ', style: 'tableHeader' },
            { rowSpan: 2, text: 'ACCIÓN', style: 'tableHeader' },
            { rowSpan: 2, text: 'OBSERVACIÓN', style: 'tableHeader' },
            { rowSpan: 2, text: 'LATITUD', style: 'tableHeader' },
            { rowSpan: 2, text: 'LONGITUD', style: 'tableHeader' },
          ],
          [
            '',
            { text: 'FECHA', style: 'tableHeader' },
            { text: 'HORA', style: 'tableHeader' },
            { text: 'FECHA', style: 'tableHeader' },
            { text: 'HORA', style: 'tableHeader' },
            '', '', '', '', ''
          ],
          ...data.map(obj => {
            c = c + 1
            let accionT: string = '';
            switch (obj.accion) {
              case 'EoS': accionT = 'Entrada o Salida'; break;
              case 'AES': accionT = 'Entrada o Salida Almuerzo'; break;
              case 'PES': accionT = 'Entrada o Salida Permiso'; break;
              case 'E': accionT = 'Entrada'; break;
              case 'S': accionT = 'Salida'; break;
              case 'I/A': accionT = 'Entrada Almuerzo'; break;
              case 'F/A': accionT = 'Salida Almuerzo'; break;
              case 'E/P': accionT = 'Entrada Permiso'; break;
              case 'S/P': accionT = 'Salida Permiso'; break;
              case 'HA': accionT = 'Horario Abierto'; break;
              default: accionT = 'codigo 99'; break;
            }

            return [
              { style: 'itemsTableCentrado', text: c },
              { style: 'itemsTable', text: obj.fecha },
              { style: 'itemsTable', text: obj.hora },
              { style: 'itemsTable', text: (obj.fecha_hora_timbre_servidor === null) ? '' : obj.sfecha },
              { style: 'itemsTable', text: (obj.fecha_hora_timbre_servidor === null) ? '' : obj.shora },
              { style: 'itemsTable', text: obj.id_reloj },
              { style: 'itemsTable', text: accionT },
              { style: 'itemsTable', text: obj.observacion },
              { style: 'itemsTable', text: (obj.longitud === null) ? '' : obj.longitud.slice(0, 9) },
              { style: 'itemsTable', text: (obj.latitud === null) ? '' : obj.latitud.slice(0, 9) },
            ]
          })

        ]
      },
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
        }
      }
    })

    return n;
  }


}