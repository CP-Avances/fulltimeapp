import { Component, OnInit, Input } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { DataUserLoggedService } from '../../services/data-user-logged.service';
import { ReportesService } from '../../services/reportes.service';
import { PlantillaReportesService } from '../../libs/plantilla-reportes.service';
import { Timbre } from '../../interfaces/Timbre';

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

  constructor(
    private dataUserService: DataUserLoggedService,
    private reporteService: ReportesService,
    private plantillaPDF: PlantillaReportesService,
    public modalController: ModalController,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    public alertController: AlertController,
  ) { }

  ngOnInit() {
    console.log('reporte timbre | Data empleado: ', this.data);
    const id_empresa: string = localStorage.getItem('id_empresa');
    (id_empresa !== null) ? this.plantillaPDF.ShowColoresLogo(id_empresa) : this.plantillaPDF.abrirToas('No existe codigo de empresa', 'danger', 3000)
    this.BuscarFormatos();
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
        data.fecha = this.validar.FormatearFecha(data.fec_hora_timbre, this.formato_fecha, this.validar.dia_abreviado);
        data.hora = this.validar.FormatearHora(moment(data.fec_hora_timbre).format('HH:mm:ss'), this.formato_hora);

        data.sfecha = this.validar.FormatearFecha(data.fec_hora_timbre_servidor, this.formato_fecha, this.validar.dia_abreviado);
        data.shora = this.validar.FormatearHora(moment(data.fec_hora_timbre_servidor).format('HH:mm:ss'), this.formato_hora);

        if(data.latitud == null || data.latitud == undefined){
          data.latitud = '0';
        }

        if(data.longitud == null || data.longitud == undefined){
          data.longitud = '0';
        }

        this.count = this.count + 1;
        data.num = this.count;
      })
      console.log('data_consultada ...', this.timbres)
      this.showBtnPdf = true;
      this.loading = true;

      if(this.count == 100){
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

  generarPDF() {
    const filename = 'reporteTimbres.pdf'
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

  impresionDatosPDF(data: any[]): Array<any> {
    let c = 0;
    return [{
      style: 'tableMargin',
      table: {
        widths: ['auto', '*', '*', '*', '*', 'auto', 'auto', '*', '*', '*'],
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
              case 'E/A': accionT = 'Entrada Almuerzo'; break;
              case 'S/A': accionT = 'Salida Almuerzo'; break;
              case 'E/P': accionT = 'Entrada Permiso'; break;
              case 'S/P': accionT = 'Salida Permiso'; break;
              case 'HA': accionT = 'Horario Abierto'; break;
              default: accionT = 'codigo 99'; break;
            }

            return [
              { style: 'itemsTableCentrado', text: c },
              { style: 'itemsTable', text: obj.fecha },
              { style: 'itemsTable', text: obj.hora },
              { style: 'itemsTable', text: (obj.fec_hora_timbre_servidor === null) ? '' : obj.sfecha },
              { style: 'itemsTable', text: (obj.fec_hora_timbre_servidor === null) ? '' : obj.shora },
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
    }]
  }

}