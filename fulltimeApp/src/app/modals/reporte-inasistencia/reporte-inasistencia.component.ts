import { Component, OnInit, Input } from '@angular/core';
import { ReportesService } from '../../services/reportes.service';
import { ModalController, AlertController } from '@ionic/angular';
import { DataUserLoggedService } from '../../services/data-user-logged.service';
import { PlantillaReportesService } from 'src/app/libs/plantilla-reportes.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import moment from 'moment';
import { ParametrosService } from 'src/app/services/parametros.service';

@Component({
  selector: 'app-reporte-inasistencia',
  templateUrl: './reporte-inasistencia.component.html',
  styleUrls: ['../reportes.component.scss'],
})
export class ReporteInasistenciaComponent implements OnInit {

  @Input() data: any;

  listadeUno: any = [
    { 
      nombre: 'Empleados', 
      empleados: [] // Lista vacía de empleados
    }
  ];

  get fechaInicio(): string { return this.dataUserService.fechaRangoInicio }

  get fechaFinal(): string { return this.dataUserService.fechaRangoFinal }

  faltas: any = [];

  showBtnPdf: boolean = false;
  loading: boolean = true;
  count: number = 0;


  constructor(
    private reporteService: ReportesService,
    public modalController: ModalController,
    private dataUserService: DataUserLoggedService,
    private plantillaPDF: PlantillaReportesService,
    public alertController: AlertController,
    public validar: ValidacionesService,
    public parametro: ParametrosService,

  ) { }

  ngOnInit() {
    console.log('reporte inasistencia | Data empleado: ', this.data);
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
    console.log(this.fechaFinal);
    console.log(this.fechaInicio);
    this.listadeUno[0].empleados.push(this.data)
    console.log("ver lista de empleados 1:",  this.listadeUno)
    this.loading = false;
    this.reporteService.BuscarFaltas(this.listadeUno, this.fechaInicio, this.fechaFinal).subscribe(res => {
      this.faltas = res;
      console.log("ver faltas buscadas",  this.faltas)

      this.faltas.forEach(data => {

        this.count = this.count + 1;
        data.num = this.count;
      })
      this.showBtnPdf = true;
      this.loading = true;
      if (this.count == 100) {
        this.alertLimiteReporte();
      }
    }, err => {

      console.log("ver el error", err)
      this.showBtnPdf = false;
      this.loading = true;
      console.log(err);
      this.plantillaPDF.abrirToas(err.error.message, 'danger', 3000)
    })

  }

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
        this.EstructurarDatosPDF(this.faltas),
      ],
      styles: this.plantillaPDF.estilosPdf()
    };
  }

  

  impresionDatosPDF(data: any[]): Array<any> {
    let c = 0;
    return [{
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
    }]
  }


  EstructurarDatosPDF(data: any[]): Array<any> {
    let totalFaltasEmpleado: number = 0;
    let resumen = '';
    let general: any = [];
    let n: any = [];
    let c = 0;
    data.forEach((selec: any) => {
      let arr_reg = selec.empleados.map((o: any) => { return o.faltas.length })
      let reg = this.reporteService.SumarRegistros(arr_reg);
      // NOMBRE DE CABECERAS DEL REPORTE DE ACUERDO CON EL FILTRO DE BUSQUEDA
      let descripcion = '';
      let establecimiento = 'SUCURSAL: ' + selec.sucursal;
      let opcion = selec.nombre;

      descripcion = 'LISTA EMPLEADOS';
      establecimiento = '';


      // DATOS DE RESUMEN GENERAL
      let informacion = {
        sucursal: selec.sucursal,
        nombre: opcion,
        faltas: 8,
      }
      general.push(informacion);

      // CABECERA PRINCIPAL
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

      console.log("selec", selec)
      // PRESENTACION DE LA INFORMACION USUARIO
      selec.empleados.forEach((empl: any) => {
        n.push({
          style: 'tableMarginCabeceraEmpleado',
          table: {
            widths: ['*', 'auto', 'auto'],
            headerRows: 2,
            body: [
              [
                {
                  border: [true, true, false, false],
                  text: 'C.C.: ' + empl.cedula,
                  style: 'itemsTableInfoEmpleado',
                },
                {
                  border: [true, true, false, false],
                  text: 'EMPLEADO: ' + empl.fullname,
                  style: 'itemsTableInfoEmpleado',
                },
                {
                  border: [true, true, true, false],
                  text: 'COD: ' + empl.codigo,
                  style: 'itemsTableInfoEmpleado',
                },
              ],
              [
                {
                  border: [true, false, false, false],
                  text: 'RÉGIMEN LABORAL: ' + empl.regimen,
                  style: 'itemsTableInfoEmpleado'
                },
                {
                  border: [true, false, false, false],
                  text: 'DEPARTAMENTO: ' + empl.departamento,
                  style: 'itemsTableInfoEmpleado'
                },
                {
                  border: [true, false, true, false],
                  text: 'CARGO: ' + empl.cargo,
                  style: 'itemsTableInfoEmpleado'
                }
              ],
            ],
          },
        });
        // ENCERAR VARIABLES
        totalFaltasEmpleado = 0;
        c = 0;
        // LEER DATOS DE FALTAS
        n.push({
          style: 'tableMargin',
          table: {
            widths: ['*', '*'],
            headerRows: 1,
            body: [
              [
                { text: 'N°', style: 'tableHeader' },
                { text: 'FECHA', style: 'tableHeader' },
              ],
              ...empl.faltas.map((usu: any) => {
                const fecha = this.validar.FormatearFecha(usu.fecha_horario, this.formato_fecha, this.validar.dia_abreviado);
                totalFaltasEmpleado++;
                c = c + 1;
                return [
                  { style: 'itemsTableCentrado', text: c },
                  { style: 'itemsTableCentrado', text: fecha },
                ];
              }),
              [
                { style: 'itemsTableCentradoTotal', text: 'TOTAL' },
                { style: 'itemsTableCentradoTotal', text: totalFaltasEmpleado },
              ],
            ],
          },
          layout: {
            fillColor: function (rowIndex: any) {
              return rowIndex % 2 === 0 ? '#E5E7E9' : null;
            },
          },
        });
      });
    })

    return n;
  }

}
