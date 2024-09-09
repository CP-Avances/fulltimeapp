import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { ReportesService } from '../../services/reportes.service';
import { DataUserLoggedService } from '../../services/data-user-logged.service';
import { PlantillaReportesService } from '../../libs/plantilla-reportes.service';
import { ValidacionesService } from '../../libs/validaciones.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { RelojServiceService } from 'src/app/services/reloj-service.service';

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
  timbres: any = [];
  count: number = 0;
  formato_fecha: string;
  formato_hora: string;

  listadeUno: any = [
    {
      nombre: 'Empleados',
      empleados: [] // Lista vacía de empleados
    }
  ];
  atrasos: any = [];

  showBtnPdf: boolean = false;
  loading: boolean = true;

  constructor(
    private reporteService: ReportesService,
    public modalController: ModalController,
    private dataUserService: DataUserLoggedService,
    private plantillaPDF: PlantillaReportesService,
    private validacionService: ValidacionesService,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
    public alertController: AlertController,
    private relojService: RelojServiceService,

  ) { }

  ngOnInit() {
    console.log('reporte atraso | Data empleado: ', this.data);
    const id_empresa = localStorage.getItem('id_empresa');
    (id_empresa !== null) ? this.plantillaPDF.ShowColoresLogo(id_empresa) : this.plantillaPDF.abrirToas('No existe codigo de empresa', 'danger', 3000)
    this.BuscarFormatos();
    this.obtenerDatosEmpresa(localStorage.getItem('id_empresa'));
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  empresa: any = {
    nombre: '',
    ruc: '',
    direccion: '',
    telefono: '',
    correo: '',
    representante: '',
  };

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

  BuscarFormatos() {
    this.parametro.ObtenerFormatos().subscribe(
      resp => {
        this.formato_fecha = resp.fecha;
        this.formato_hora = resp.hora;
      }
    )
  }



  closeModal() {
    console.log('CERRAR MODAL Reporte timbre');
    this.modalController.dismiss({
      'refreshInfo': true
    });
  }

  // METODO PARA CONVERTIR MINUTOS A FORMATO HH:MM:SS
  MinutosAHorasMinutosSegundos(minutos: number) {
    let seconds = minutos * 60;
    let hour: string | number = Math.floor(seconds / 3600);
    hour = (hour < 10) ? '0' + hour : hour;
    let minute: string | number = Math.floor((seconds / 60) % 60);
    minute = (minute < 10) ? '0' + minute : minute;
    let second: string | number = Number((seconds % 60).toFixed(0));
    second = (second < 10) ? '0' + second : second;
    return `${hour}:${minute}:${second}`;
  }


  consultarDataReporte() {
    this.timbres = [];
    let n = 0; // Inicializa n en 0
    console.log('generar reporte...');
    console.log(this.fechaFinal);
    console.log(this.fechaInicio);
    this.listadeUno[0].empleados.push(this.data)
    console.log("ver lista de empleados 1:", this.listadeUno)
    this.loading = false;

    this.reporteService.BuscarAtrasos(this.listadeUno, this.fechaInicio, this.fechaFinal).subscribe(res => {
      this.atrasos = res;
      console.log("ver atrasos buscadas", this.atrasos)

      this.atrasos.forEach(data => {
        data.empleados.forEach((empl: any) => {
          empl.atrasos.forEach((usu: any) => {
            const fechaHorario = this.validar.FormatearFecha(usu.fecha_hora_horario.split(' ')[0], this.formato_fecha, this.validar.dia_abreviado);
            const fechaTimbre = this.validar.FormatearFecha(usu.fecha_hora_timbre.split(' ')[0], this.formato_fecha, this.validar.dia_abreviado);
            const horaHorario = this.validar.FormatearHora(usu.fecha_hora_horario.split(' ')[1], this.formato_hora);
            const horaTimbre = this.validar.FormatearHora(usu.fecha_hora_timbre.split(' ')[1], this.formato_hora);
            const tolerancia = this.MinutosAHorasMinutosSegundos(Number(usu.tolerancia));
            const minutos = this.SegundosAMinutosConDecimales(Number(usu.diferencia));
            const tiempo = this.MinutosAHorasMinutosSegundos(minutos);
            n = n + 1;
            let ele = {
              n: n,
              cedula: empl.cedula,
              codigo: empl.codigo,
              empleado: empl.fullname,
              ciudad: empl.ciudad,
              sucursal: empl.sucursal,
              regimen: empl.regimen,
              departamento: empl.departamento,
              tolerancia,
              fechaHorario,
              horaHorario,
              fechaTimbre,
              horaTimbre,
              atrasoM: minutos.toFixed(2), atrasoT: tiempo,
            }
            this.timbres.push(ele);
          })
        })

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

  /* ****************************************************************************************************
  *                               PARA LA EXPORTACIÓN DE ARCHIVOS PDF
  * ****************************************************************************************************/

  
  // METODO PARA CONVERTIR SEGUNDOS A MINUTOS
  SegundosAMinutosConDecimales(segundos: number) {
    return Number((segundos / 60).toFixed(2));
  }
  tolerancia: string = '1';
  BuscarTolerancia() {
    // id_tipo_parametro Tolerancia - atrasos = 3
    this.parametro.ObtenerDetallesParametros(3).subscribe(
      res => {
        this.tolerancia = res[0].descripcion;
      });
  }

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
    let doc_name = `Atrasos_usuario.pdf`;
    this.plantillaPDF.generarPdf(documentDefinition, doc_name)

    //pdfMake.createPdf(documentDefinition).download(doc_name);
 
  }

  
  
  DefinirInformacionPDF() {
    var inicio = this.validar.FormatearFecha(this.fechaInicio, this.formato_fecha, this.validar.dia_completo);
    var fin = this.validar.FormatearFecha(this.fechaFinal, this.formato_fecha, this.validar.dia_completo);
    return {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 50, 40, 50],
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  '+ localStorage.getItem('nom') + ' ' +localStorage.getItem('ap'), margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      footer: function (currentPage: any, pageCount: any, fecha: any) {
        let f = moment();
        fecha = f.format('YYYY-MM-DD');
        let time = f.format('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + time, opacity: 0.3 },
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
        { text: this.empresa.nombre.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, 0, 0, 5] },
        { text: `ATRASOS - USUARIOS`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        { text: 'PERIODO DEL: ' + inicio + " AL " + fin, bold: true, fontSize: 11, alignment: 'center', margin: [0, 0, 0, 0] },
        ...this.EstructurarDatosPDF(this.atrasos).map((obj: any) => {
          return obj
        })
      ],
      styles: {
        derecha: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color, alignment: 'left' },
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color },
        tableHeaderSecundario: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.s_color },
        centrado: { fontSize: 8, bold: true, alignment: 'centerz', fillColor: this.p_color, margin: [0, 5, 0, 0] },
        itemsTable: { fontSize: 8 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        itemsTableInfoBlanco: { fontSize: 9, margin: [0, 0, 0, 0], fillColor: '#E3E3E3' },
        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2], fillColor: '#E3E3E3' },
        itemsTableCentrado: { fontSize: 8, alignment: 'center' },
        itemsTableDerecha: { fontSize: 8, alignment: 'right' },
        itemsTableInfoTotal: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.s_color },
        itemsTableTotal: { fontSize: 8, bold: true, alignment: 'right', fillColor: '#E3E3E3' },
        itemsTableCentradoTotal: { fontSize: 8, bold: true, alignment: 'center', fillColor: '#E3E3E3' },
        tableMargin: { margin: [0, 0, 0, 0] },
        tableMarginCabecera: { margin: [0, 15, 0, 0] },
        tableMarginCabeceraEmpleado: { margin: [0, 10, 0, 0] },
        tableMarginCabeceraTotal: { margin: [0, 20, 0, 0] },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      }
    };
  }

  EstructurarDatosPDF(data: any[]): Array<any> {
    let totalTiempoEmpleado: number = 0;
    let totalTiempo = 0;
    let resumen = '';
    let general: any = [];
    let n: any = []
    let c = 0;
    data.forEach((selec: any) => {
      // CONTAR REGISTROS
      let arr_reg = selec.empleados.map((o: any) => { return o.atrasos.length });
      let reg = this.reporteService.SumarRegistros(arr_reg);
      // CONTAR MINUTOS DE ATRASOS
      totalTiempo = 0;
      selec.empleados.forEach((o: any) => {
        o.atrasos.map((a: any) => {
          const minutos_ = this.SegundosAMinutosConDecimales(Number(a.diferencia));
          totalTiempo += Number(minutos_);
          return totalTiempo;
        })
      })
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
        formato_general: this.MinutosAHorasMinutosSegundos(Number(totalTiempo.toFixed(2))),
        formato_decimal: totalTiempo.toFixed(2),
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
      // PRESENTACION DE LA INFORMACION
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
                  border: [true, false, true, false],
                  text: 'RÉGIMEN LABORAL ' + empl.regimen,
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
              ]
            ],
          },
        });
        // ENCERAR VARIABLES
        c = 0;
        totalTiempoEmpleado = 0;
        n.push({
          style: 'tableMargin',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            headerRows: 2,
            body: [
              [
                { rowSpan: 2, text: 'N°', style: 'centrado' },
                { rowSpan: 1, colSpan: 2, text: 'HORARIO', style: 'tableHeader' },
                {},
                { rowSpan: 1, colSpan: 2, text: 'TIMBRE', style: 'tableHeaderSecundario' },
                {},
                { rowSpan: 2, text: 'TIPO PERMISO', style: 'centrado' },
                { rowSpan: 2, text: 'DESDE', style: 'centrado' },
                { rowSpan: 2, text: 'HASTA', style: 'centrado' },
                { rowSpan: 2, colSpan: 2, text: 'PERMISO', style: 'centrado' },
                {},
                { rowSpan: 2, text: 'TOLERANCIA', style: 'centrado' },
                { rowSpan: 2, colSpan: 2, text: 'ATRASO', style: 'centrado' },
                {}
              ],
              [
                {},
                { rowSpan: 1, text: 'FECHA', style: 'tableHeader' },
                { rowSpan: 1, text: 'HORA', style: 'tableHeader' },
                { rowSpan: 1, text: 'FECHA', style: 'tableHeaderSecundario' },
                { rowSpan: 1, text: 'HORA', style: 'tableHeaderSecundario' },
                {}, {}, {}, {},
                {},
                {},
                {},
                {},
              ],
              ...empl.atrasos.map((usu: any) => {
                // FORMATEAR FECHAS
                const fechaHorario = this.validar.FormatearFecha(usu.fecha_hora_horario.split(' ')[0], this.formato_fecha, this.validar.dia_abreviado);
                const fechaTimbre = this.validar.FormatearFecha(usu.fecha_hora_timbre.split(' ')[0], this.formato_fecha, this.validar.dia_abreviado);
                const horaHorario = this.validar.FormatearHora(usu.fecha_hora_horario.split(' ')[1], this.formato_hora);
                const horaTimbre = this.validar.FormatearHora(usu.fecha_hora_timbre.split(' ')[1], this.formato_hora);
                var tolerancia = '00:00:00';
                if (this.tolerancia !== '1') {
                  tolerancia = this.MinutosAHorasMinutosSegundos(Number(usu.tolerancia));
                }
                const minutos = this.SegundosAMinutosConDecimales(Number(usu.diferencia));
                const tiempo = this.MinutosAHorasMinutosSegundos(minutos);
                totalTiempoEmpleado += Number(minutos);
                c = c + 1
                return [
                  { style: 'itemsTableCentrado', text: c },
                  { style: 'itemsTableCentrado', text: fechaHorario },
                  { style: 'itemsTableCentrado', text: horaHorario },
                  { style: 'itemsTableCentrado', text: fechaTimbre },
                  { style: 'itemsTableCentrado', text: horaTimbre },
                  {}, {}, {}, {}, {},
                  { style: 'itemsTableCentrado', text: tolerancia },
                  { style: 'itemsTableCentrado', text: tiempo },
                  { style: 'itemsTableDerecha', text: minutos.toFixed(2) },
                ];
              }),
              [
                {
                  border: [true, true, false, true],
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                {
                  border: [false, true, false, true],
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                {
                  border: [false, true, false, true],
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                {
                  border: [false, true, false, true],
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                {
                  border: [false, true, false, true],
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                {
                  border: [false, true, false, true],
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                {
                  border: [false, true, false, true],
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                { style: 'itemsTableCentradoTotal', text: 'TOTAL' },
                {
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                {
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                {
                  text: '',
                  style: 'itemsTableCentradoTotal'
                },
                { style: 'itemsTableCentradoTotal', text: this.MinutosAHorasMinutosSegundos(Number(totalTiempoEmpleado.toFixed(2))) },
                { style: 'itemsTableTotal', text: totalTiempoEmpleado.toFixed(2) },
              ],
            ],
          },
          layout: {
            fillColor: function (rowIndex: any) {
              return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
            }
          }
        });


      })
    })
    // RESUMEN TOTALES DE REGISTROS
   
    return n;
  }


}
