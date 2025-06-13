import { Component, OnInit, Input } from '@angular/core';
import { ReportesService } from '../../services/reportes.service';
import { ModalController, AlertController } from '@ionic/angular';
import { DataUserLoggedService } from '../../services/data-user-logged.service';
import { PlantillaReportesService } from 'src/app/libs/plantilla-reportes.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { DateTime } from 'luxon';
import { ParametrosService } from 'src/app/services/parametros.service';
import { RelojServiceService } from 'src/app/services/reloj-service.service';
import ExcelJS, { FillPattern } from "exceljs";

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = (pdfFonts as any).vfs;


@Component({
  selector: 'app-reporte-inasistencia',
  templateUrl: './reporte-inasistencia.component.html',
  styleUrls: ['../reportes.component.scss'],
})
export class ReporteInasistenciaComponent implements OnInit {
  private imagen: any;

  private bordeCompleto!: Partial<ExcelJS.Borders>;

  private bordeGrueso!: Partial<ExcelJS.Borders>;

  private fillAzul!: FillPattern;

  private fontTitulo!: Partial<ExcelJS.Font>;

  private fontHipervinculo!: Partial<ExcelJS.Font>;

  @Input() data: any;
  get fechaInicio(): string { return this.dataUserService.fechaRangoInicio }
  get fechaFinal(): string { return this.dataUserService.fechaRangoFinal }
  existenEmpleados = true;
  faltas: any = [];
  showBtnPdf: boolean = false;
  showBtnBuscar: boolean = false;
  loading: boolean = true;
  count: number = 0;
  timbres: any = [];
  verReporte = false

  constructor(
    private reporteService: ReportesService,
    public modalController: ModalController,
    private dataUserService: DataUserLoggedService,
    private plantillaPDF: PlantillaReportesService,
    public alertController: AlertController,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
    private relojService: RelojServiceService

  ) { }

  ionViewWillEnter() {
    this.ngOnInit();
    this.consultarDataReporte();

  }

  ngOnInit() {
    console.log('reporte inasistencia | Data empleado: ', this.data);
    this.BuscarFormatos();
   // this.consultarDataReporte();
    this.obtenerDatosEmpresa(localStorage.getItem('id_empresa'));
    this.ObtenerLogo();
    this.ObtenerColores();
    this.bordeCompleto = {
      top: { style: "thin" as ExcelJS.BorderStyle },
      left: { style: "thin" as ExcelJS.BorderStyle },
      bottom: { style: "thin" as ExcelJS.BorderStyle },
      right: { style: "thin" as ExcelJS.BorderStyle },
    };

    this.bordeGrueso = {
      top: { style: "medium" as ExcelJS.BorderStyle },
      left: { style: "medium" as ExcelJS.BorderStyle },
      bottom: { style: "medium" as ExcelJS.BorderStyle },
      right: { style: "medium" as ExcelJS.BorderStyle },
    };

    this.fillAzul = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4F81BD" }, // Azul claro
    };
    this.fontTitulo = { bold: true, size: 12, color: { argb: "FFFFFF" } };
    this.fontHipervinculo = { color: { argb: "0000FF" }, underline: true };
  }

  // METODOS PARA OBTENER LOS DATOS DE LA EMPRESA
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

  empresa: any = {
    nombre: '',
    ruc: '',
    direccion: '',
    telefono: '',
    correo: '',
    representante: '',
  };

  // METODO PARA CONSULTAR LOS REGISTROS DEL REPORTE DE FALTAS
  consultarDataReporte() {
    this.showBtnBuscar = true
    this.existenEmpleados = false;
    let n = 0;
    this.reporteService.BuscarFaltas(this.data, this.fechaInicio, this.fechaFinal).subscribe(res => {
      this.faltas = res;
      console.log("ver faltas buscadas", this.faltas)
      this.faltas.forEach(data => {
        data.empleados.forEach((empl: any) => {
          empl.faltas.forEach((usu: any) => {

            const fecha = this.validar.FormatearFecha(usu.fecha_horario, this.formato_fecha, this.validar.dia_completo);
            n = n + 1;
            this.count = this.count + 1;
            data.num = this.count;
            let ele = {
              n: n,
              cedula: empl.cedula,
              codigo: empl.codigo,
              empleado: empl.apellido + ' ' + empl.nombre,
              rol: empl.name_rol,
              ciudad: empl.ciudad,
              sucursal: empl.sucursal,
              departamento: empl.name_dep,
              cargo: empl.name_cargo,
              fecha
            }
            this.timbres.push(ele);
          })
        })
      })
      console.log("ver timbre ", this.timbres)
      this.existenEmpleados = true;
      this.verReporte = true;
      this.loading = true;
      this.showBtnPdf = true;
      if (this.count == 100) {
        this.alertLimiteReporte();
      }
    }, err => {
      this.existenEmpleados = true;

      console.log("ver el error", err)
      this.showBtnPdf = false;
      this.loading = true;
      console.log(err);
      this.plantillaPDF.abrirToas(err.error.message, 'danger', 3000)
    })
  }


  // MOSTRAR ALERTA PARA NOTIFICAR EL LIMITE DEL REPORTE
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

  closeModal() {
    console.log('CERRAR MODAL Reporte timbre');
    this.modalController.dismiss({
      'refreshInfo': true
    });
  }



  // METODO PARA OBTENER COLORES Y MARCA DE AGUA DE EMPRESA
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

  // METODO PARA OBTENER EL LOGO DE LA EMPRESA
  logo: any = String;
  ObtenerLogo() {
    this.plantillaPDF.LogoEmpresaImagenBase64(localStorage.getItem('id_empresa') as string).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

  // METODO PARA GENERAR EL PDF
  GenerarPDF() {
    let documentDefinition: any;
    documentDefinition = this.DefinirInformacionPDF();
    let doc_name = `Faltas_usuario.pdf`;
    this.plantillaPDF.generarPdf(documentDefinition, doc_name);
  }

  // METODO PARA DEFINIR LA INFORMACION INICIAL DE LOS PDFS
  DefinirInformacionPDF() {
    return {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 50, 40, 50],
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + localStorage.getItem('nom') + ' ' + localStorage.getItem('ap'), margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      footer: function (currentPage: any, pageCount: any, fecha: any) {
        const fechaLuxon = DateTime.local(); // Obtiene la fecha y hora local
        fecha = fechaLuxon.toFormat('yyyy-MM-dd'); // Formatear la fecha
        let time = fechaLuxon.toFormat('HH:mm:ss'); // Formatear la hora
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
        { text: this.empresa.nombre.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: `FALTAS - USUARIOS`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        { text: 'PERIODO DEL: ' + this.fechaInicio.split('T')[0] + " AL " + this.fechaFinal.split('T')[0], bold: true, fontSize: 11, alignment: 'center', margin: [0, 0, 0, 0] },
        ...this.EstructurarDatosPDF(this.faltas).map((obj: any) => {
          return obj
        })
      ],
      styles: {
        derecha: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color, alignment: 'left' },
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 1, 0, 1] },
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

  // METODO PARA ESTRUCTURAR LA INFORMACION CONSULTADA EN EL PDF
  EstructurarDatosPDF(data: any[]): Array<any> {
    let totalFaltasEmpleado: number = 0;
    let resumen = '';
    let general: any = [];
    let n: any = [];
    let c = 0;
    console.log("ver la data del pdf", data)
    data.forEach((selec: any) => {
      let arr_reg = selec.empleados.map((o: any) => { return o.faltas.length })
      // NOMBRE DE CABECERAS DEL REPORTE DE ACUERDO CON EL FILTRO DE BUSQUEDA
      let reg = this.reporteService.SumarRegistros(arr_reg);
      let descripcion = '';
      let establecimiento = 'SUCURSAL: ' + selec.sucursal;
      let nombreGeneral = selec.sucursal;
      let opcion = selec.nombre;

      if (selec.opcion == 2) {
        descripcion = 'DEPARTAMENTO: ' + selec.departamento;
        resumen = 'TOTAL DEPARTAMENTOS';
        opcion = selec.departamento;

      } else if (selec.opcion == 1) {
        descripcion = 'CIUDAD: ' + selec.ciudad;
        resumen = 'TOTAL SUCURSALES';
      }
      else if (selec.opcion == 3) {
        descripcion = 'LISTA EMPLEADOS';
        establecimiento = '';
      }
      else if (selec.opcion == 4) {
        descripcion = 'ROL: '+ selec.rol;
        establecimiento = '';
        resumen = 'TOTAL ROLES';
        nombreGeneral = selec.rol;
      }

      // DATOS DE RESUMEN GENERAL
      let informacion = {
        sucursal: nombreGeneral,
        nombre: opcion,
        faltas: reg,
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
                  text: 'EMPLEADO: ' + empl.apellido + ' ' + empl.nombre,
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
                  text: 'RÉGIMEN LABORAL: ' + empl.name_regimen,
                  style: 'itemsTableInfoEmpleado'
                },
                {
                  border: [true, false, false, false],
                  text: 'DEPARTAMENTO: ' + empl.name_dep,
                  style: 'itemsTableInfoEmpleado'
                },
                {
                  border: [true, false, true, false],
                  text: 'CARGO: ' + empl.name_cargo,
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
                const fecha = this.validar.FormatearFecha(usu.fecha_horario, this.formato_fecha, this.validar.dia_completo);
                console.log("ver fecha formateada", fecha)
                usu.fechaFormat = fecha;
                totalFaltasEmpleado++;
                c = c + 1;
                usu.conteo = c

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
    if (data[0].opcion != 3) {
      n.push({
        style: 'tableMarginCabeceraTotal',
        table: {
          widths: ['*', '*', '*'],
          headerRows: 1,
          body: [
            [
              {
                border: [true, true, false, true],
                bold: true,
                text: resumen,
                style: 'itemsTableInfoTotal',
                colSpan: 2
              },
              {},
              { text: 'FALTAS', style: 'itemsTableInfoTotal' },
            ],
            ...general.map((info: any) => {
              let valor = 0;
              if (data[0].opcion == 1 || data[0].opcion == 4) {
                valor = 2;
              }
              return [
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: info.sucursal,
                  style: 'itemsTableCentrado',
                  colSpan: valor
                },
                {
                  border: [true, true, false, true],
                  bold: true,
                  text: info.nombre,
                  style: 'itemsTableCentrado',
                },
                { text: info.faltas, style: 'itemsTableCentrado' },
              ]
            })
          ]
        },
        layout: {
          fillColor: function (rowIndex: any) {
            return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
          }
        }
      });
    }
    return n;
  }

  async generarExcel() {
    let datos: any[] = [];
    let n: number = 1;

    this.faltas.forEach((suc) => {
      suc.empleados.map((empl: any) => {
        empl.faltas.map((obj3: any) => {
          const fecha = this.validar.FormatearFecha(obj3.fecha_horario, this.formato_fecha, this.validar.dia_abreviado);
          datos.push([
            n++,
            empl.cedula,
            empl.codigo,
            empl.apellido + ' ' + empl.nombre,
            empl.name_rol,
            empl.ciudad,
            empl.sucursal,
            empl.name_regimen,
            empl.name_dep,
            empl.name_cargo,
            fecha,
          ])
        });
      })
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Faltas");
    this.imagen = workbook.addImage({
      base64: this.logo,
      extension: "png",
    });

    worksheet.addImage(this.imagen, {
      tl: { col: 0, row: 0 },
      ext: { width: 220, height: 105 },
    });
    // COMBINAR CELDAS
    worksheet.mergeCells("B1:J1");
    worksheet.mergeCells("B2:J2");
    worksheet.mergeCells("B3:J3");
    worksheet.mergeCells("B4:J4");
    worksheet.mergeCells("B5:J5");

    // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
    worksheet.getCell("B1").value = this.empresa.nombre.toUpperCase();
    worksheet.getCell("B2").value = 'Lista de Faltas'.toUpperCase();
    worksheet.getCell(
      "B3"
    ).value = 'PERIODO DEL: ' + this.fechaInicio.split('T')[0] + " AL " + this.fechaFinal.split('T')[0];
    // APLICAR ESTILO DE CENTRADO Y NEGRITA A LAS CELDAS COMBINADAS
    ["B1", "B2", "B3"].forEach((cell) => {
      worksheet.getCell(cell).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.getCell(cell).font = { bold: true, size: 14 };
    });

    worksheet.columns = [
      { key: "n", width: 10 },
      { key: "cedula", width: 20 },
      { key: "codigo", width: 20 },
      { key: "apenombre", width: 20 },
      { key: "rol", width: 20 },
      { key: "ciudad", width: 20 },
      { key: "sucursal", width: 20 },
      { key: "regimen", width: 20 },
      { key: "departamento", width: 20 },
      { key: "cargo", width: 20 },
      { key: "fecha", width: 20 },
    ]

    const columnas = [
      { name: "ITEM", totalsRowLabel: "Total:", filterButton: false },
      { name: "CÉDULA", totalsRowLabel: "Total:", filterButton: true },
      { name: "CÓDIGO", totalsRowLabel: "", filterButton: true },
      { name: "APELLIDO NOMBRE", totalsRowLabel: "", filterButton: true },
      { name: "ROL", totalsRowLabel: "", filterButton: true },
      { name: "CIUDAD", totalsRowLabel: "", filterButton: true },
      { name: "SUCURSAL", totalsRowLabel: "", filterButton: true },
      { name: "RÉGIMEN", totalsRowLabel: "", filterButton: true },
      { name: "DEPARTAMENTO", totalsRowLabel: "", filterButton: true },
      { name: "CARGO", totalsRowLabel: "", filterButton: true },
      { name: "FECHA", totalsRowLabel: "", filterButton: true },
    ]

    worksheet.addTable({
      name: "FaltasReporteTabla",
      ref: "A6",
      headerRow: true,
      totalsRow: false,
      style: {
        theme: "TableStyleMedium16",
        showRowStripes: true,
      },
      columns: columnas,
      rows: datos,
    });


    const numeroFilas = datos.length;
    for (let i = 0; i <= numeroFilas; i++) {
      for (let j = 1; j <= 10; j++) {
        const cell = worksheet.getRow(i + 6).getCell(j);
        if (i === 0) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        } else {
          cell.alignment = {
            vertical: "middle",
            horizontal: this.obtenerAlineacionHorizontal(j),
          };
        }
        cell.border = this.bordeCompleto;
      }
    }
    worksheet.getRow(6).font = this.fontTitulo;

    try {

      const buffer: ArrayBuffer = await workbook.xlsx.writeBuffer();
      this.plantillaPDF.generarExcel(buffer, 'Faltas_usuarios_activos');
    } catch (error) {
      console.error("Error al generar el archivo Excel:", error);
    }
  }

  private obtenerAlineacionHorizontal(
    j: number
  ): "left" | "center" | "right" {
    if (j === 1 || j === 9 || j === 10 || j === 11) {
      return "center";
    } else {
      return "left";
    }
  }

}
