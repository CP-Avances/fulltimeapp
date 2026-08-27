import { Component, ViewChild } from '@angular/core';
import {IonDatetime, ToastController} from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { firstValueFrom } from 'rxjs';
import { DateTime } from 'luxon';

import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { AsignacionesMovilService } from 'src/app/services/asignaciones-movil.services';
import { ReportesService } from 'src/app/services/reportes.service';
import { ReportesMicroService } from 'src/app/services/reportes-micro.service';
import { EmpresaService } from 'src/app/services/empresa.service';

@Component({
  selector: 'app-reporte-resumen-asistencia',
  templateUrl: './reporte-resumen-asistencia.page.html',
  styleUrls: ['./reporte-resumen-asistencia.page.scss'],
})
export class ReporteResumenAsistenciaPage {

  idEmpleado: number = 0;
  rolEmpleado: number = 0;
  dataPdf: any[] = [];
  logo: any = null;
  p_color: any = null;
  s_color: any = null;
  frase: any = null;

  idUsuariosAcceso: Set<any> = new Set();
  idDepartamentosAcceso: Set<any> = new Set();
  idSucursalesAcceso: Set<any> = new Set();

  maxDate: string = DateTime.now().toFormat('yyyy-MM-dd');
  minDate: string = DateTime.now().minus({ months: 1 }).toFormat('yyyy-MM-dd');

  fechaInicio: string = '';
  fechaFin: string = '';

  @ViewChild('datetimeInicio')
  datetimeInicio!: IonDatetime;

  @ViewChild('datetimeFinal')
  datetimeFinal!: IonDatetime;

  datosGenerales: any[] = [];
  empleados: any[] = [];
  empleadosFiltro: any[] = [];
  empleadoSeleccionadoId: number | null = null;

  cargando: boolean = false;
  generando: boolean = false;

  pageActual: number = 1;
  itemsPorPagina: number = 5;

  constructor(
    private readonly toastController: ToastController,
    private readonly restN: NotificacionesService,
    private readonly asignacionesMovil: AsignacionesMovilService,
    private readonly reportesService: ReportesService,
    private readonly reportesMicroService: ReportesMicroService,
    private readonly empresaService: EmpresaService
  ) { }

  async ionViewWillEnter(): Promise<void> {
    this.reiniciarPantalla();
    this.inicializarUsuario();
    await this.cargarAsignacionesUsuario();
    this.cargarEmpleados();
  }

  private reiniciarPantalla(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.empleadoSeleccionadoId = null;
    this.datosGenerales = [];
    this.empleados = [];
    this.empleadosFiltro = [];
    this.dataPdf = [];
    this.pageActual = 1;
    this.cargando = false;
    this.generando = false;
  }

  private inicializarUsuario(): void {
    this.idEmpleado = parseInt(localStorage.getItem('empleadoID') ?? '0', 10);
    this.rolEmpleado = parseInt(localStorage.getItem('rol') ?? '0', 10);
  }

  private ObtenerLogo(): Promise<void> {
    return new Promise((resolve) => {

      this.empresaService.ObtenerEmpresaImagen('logo').subscribe({
        next: (base64) => {
          this.logo = base64;
          resolve();
        },

        error: (error) => {console.error('Error obteniendo logo de empresa:', error);
          this.logo = null;
          resolve();
        }

      });

    });
  }

  private ObtenerColores(): Promise<void> {
    return new Promise((resolve) => {

      this.empresaService.ConsultarDatosEmpresa().subscribe({
        next: (res) => {
          this.p_color = res?.color_principal ?? null;
          this.s_color = res?.color_secundario ?? null;
          this.frase = res?.marca_agua ?? null;
          resolve();
        },
        error: (error) => {

          console.error('Error obteniendo colores/marca de agua:', error);
          this.p_color = null;
          this.s_color = null;
          this.frase = null;
          resolve();
        }
      });
    });
  }

  private async cargarAsignacionesUsuario(): Promise<void> {
    if (!this.idEmpleado) {
      this.idUsuariosAcceso = new Set();
      this.idDepartamentosAcceso = new Set();
      this.idSucursalesAcceso = new Set();

      return;
    }

    try {
      await this.asignacionesMovil.ObtenerAsignacionesUsuario(
        this.idEmpleado
      );

      this.idUsuariosAcceso = this.asignacionesMovil.idUsuariosAcceso;
      this.idDepartamentosAcceso = this.asignacionesMovil.idDepartamentosAcceso;
      this.idSucursalesAcceso = this.asignacionesMovil.idSucursalesAcceso;

    } catch {
      this.idUsuariosAcceso = new Set();
      this.idDepartamentosAcceso = new Set();
      this.idSucursalesAcceso = new Set();
    }
  }

  private aplicarFiltroPorAsignacion( informacion: any[] ): any[] {

    if (!informacion || informacion.length === 0) {
      return [];
    }

    if (this.rolEmpleado === 1) {
      return informacion;
    }

    if (
      !this.idUsuariosAcceso || this.idUsuariosAcceso.size === 0
    ) {
      return [];
    }

    return informacion.filter((empleado: any) => {
      const idEmpleado = Number(empleado.id ?? empleado.id_empleado);
      return this.idUsuariosAcceso.has(idEmpleado);
    });
  }

  private cargarEmpleados(): void {
    this.cargando = true;
    this.restN.BuscarDatosGeneralesInfo().subscribe({

      next: (res: any[]) => {

        const informacion = Array.isArray(res) ? res : [];

        this.datosGenerales = this.aplicarFiltroPorAsignacion(informacion);

          this.empleados = this.datosGenerales.map((obj: any) => ({
            id: obj.id ?? obj.id_empleado,
            nombre: obj.nombre,
            apellido: obj.apellido,
            codigo: obj.codigo,
            identificacion: obj.identificacion,
            correo: obj.correo,
            genero: obj.genero,
            id_nacionalidad: obj.id_nacionalidad,
            usuario: obj.usuario,
            id_cargo: obj.id_cargo,
            id_contrato: obj.id_contrato,
            sucursal: obj.name_suc,
            id_suc: obj.id_suc,
            id_regimen: obj.id_regimen,
            id_depa: obj.id_depa,
            id_cargo_: obj.id_cargo_,
            ciudad: obj.ciudad,
            regimen: obj.name_regimen,
            hora_estandar: obj.dia_hora_estandar,
            departamento: obj.name_dep,
            cargo: obj.name_cargo,
            hora_trabaja: obj.hora_trabaja,
            rol: obj.name_rol,
            userid: obj.userid,
            app_habilita: obj.app_habilita,
            web_habilita: obj.web_habilita,
            comunicado_mail: obj.comunicado_mail,
            comunicado_noti: obj.comunicado_notificacion,
            id_empleado: obj.id_empleado
          }));

        this.empleadosFiltro = [
          ...this.empleados
        ];

        this.cargando = false;
      },

      error: () => {
        this.cargando = false;

        this.empleados = [];
        this.empleadosFiltro = [];

        this.mostrarToast(
          'No se pudo obtener la información de empleados.',
          'danger'
        );
      }
    });
  }

  changeFechaInicio(event: any): void {
    const valor = event?.detail?.value ?? event?.target?.value ?? '';

    if (!valor) {
      return;
    }

    this.fechaInicio = DateTime.fromISO(valor).toFormat('yyyy-MM-dd');

    if (this.fechaFin && this.fechaFin < this.fechaInicio) {
      this.fechaFin = '';
    }
    this.datetimeInicio?.confirm(true);
  }

  changeFechaFinal(event: any): void {
    const valor = event?.detail?.value ?? event?.target?.value ?? '';

    if (!valor) {
      return;
    }

    this.fechaFin = DateTime.fromISO(valor).toFormat('yyyy-MM-dd');
    this.datetimeFinal?.confirm(true);
  }


  changeSearchEmpleado(event: any): void {
    const texto = String(
      event?.detail?.value ?? ''
    )
      .trim()
      .toLowerCase();

    this.pageActual = 1;

    if (!texto) {
      this.empleadosFiltro = [
        ...this.empleados
      ];
      return;
    }

    const palabras = texto.split(/\s+/).filter(Boolean);

    this.empleadosFiltro = this.empleados.filter((empleado: any) => {

        const contenido = [
          empleado.nombre,
          empleado.apellido,
          empleado.codigo,
          empleado.identificacion,
          empleado.departamento,
          empleado.sucursal
        ]
          .map(valor => String(valor ?? ''))
          .join(' ')
          .toLowerCase();

        return palabras.every(
          palabra => contenido.includes(palabra)
        );
      });
  }

  private validarFechas(): boolean {

    if (!this.fechaInicio) {
      this.mostrarToast(
        'Seleccione la fecha inicial.',
        'warning'
      );

      return false;
    }

    if (!this.fechaFin) {
      this.mostrarToast(
        'Seleccione la fecha final.',
        'warning'
      );

      return false;
    }

    const inicio =
      DateTime.fromISO(this.fechaInicio);

    const fin =
      DateTime.fromISO(this.fechaFin);

    const minima =
      DateTime.fromISO(this.minDate);

    const maxima =
      DateTime.fromISO(this.maxDate);

    if (inicio < minima) {
      this.mostrarToast(
        'La fecha inicial solo puede seleccionarse hasta un mes atrás.',
        'warning'
      );

      return false;
    }

    if (inicio > maxima || fin > maxima) {
      this.mostrarToast(
        'No se pueden seleccionar fechas futuras.',
        'warning'
      );

      return false;
    }

    if (fin < inicio) {
      this.mostrarToast(
        'La fecha final no puede ser menor a la fecha inicial.',
        'warning'
      );

      return false;
    }

    if (fin > inicio.plus({ months: 1 })) {
      this.mostrarToast(
        'El rango máximo permitido es de un mes.',
        'warning'
      );

      return false;
    }

    return true;
  }

  private obtenerEmpleadoSeleccionado(): any | null {
    if (
      this.empleadoSeleccionadoId === null ||
      this.empleadoSeleccionadoId === undefined
    ) {
      return null;
    }

    return this.empleados.find(
      (empleado: any) =>
        Number(empleado.id) ===
        Number(this.empleadoSeleccionadoId)
    ) ?? null;
  }

  private construirPayloadReporteResumenAsistencia(): any {
    const nombreUsuario =
      localStorage.getItem('fullname') ||
      localStorage.getItem('nombre_usuario') ||
      [
        localStorage.getItem('nom'),
        localStorage.getItem('ap')
      ]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      localStorage.getItem('username') ||
      'Usuario AQHora';

    const nombreEmpresa =
      localStorage.getItem('nombre_empresa') ||
      '';

    return {

      usuario: nombreUsuario,

      empresa:
        nombreEmpresa.toUpperCase(),

      fraseMarcaAgua:
        this.frase,

      logoBase64:
        this.logo,

      colorPrincipal:
        this.p_color,

      colorSecundario:
        this.s_color,

      fechaInicio:
        this.fechaInicio,

      fechaFin:
        this.fechaFin,

      opcionBusqueda: 1,

      resumen: {
        bool_suc: false,
        bool_reg: false,
        bool_cargo: false,
        bool_dep: false,
        bool_emp: true
      },

      grupos: this.dataPdf.map((grupo: any) => ({

        sucursal:
          grupo.sucursal,

        ciudad:
          grupo.ciudad,

        nombre:
          grupo.nombre,

        departamento:
          grupo.departamento,

        empleados:
          (grupo.empleados ?? []).map((emp: any) => ({

            identificacion:
              emp.identificacion,

            codigo:
              emp.codigo,

            nombre:
              emp.nombre,

            apellido:
              emp.apellido,

            regimen:
              emp.regimen,

            departamento:
              emp.departamento,

            cargo:
              emp.cargo,

            ciudad:
              emp.ciudad,

            sucursal:
              emp.sucursal,

            tLaborado:
              (emp.tLaborado ?? []).map((reg: any) => ({

                tipo:
                  reg.tipo,

                origen:
                  reg.origen,

                control:
                  reg.control,

                entrada: {

                  fecha_horario:
                    reg.entrada?.fecha_horario,

                  fecha_hora_horario:
                    reg.entrada?.fecha_hora_horario,

                  fecha_hora_timbre:
                    reg.entrada?.fecha_hora_timbre,

                  estado_timbre:
                    reg.entrada?.estado_timbre
                },

                salida: {

                  fecha_horario:
                    reg.salida?.fecha_horario,

                  fecha_hora_horario:
                    reg.salida?.fecha_hora_horario,

                  fecha_hora_timbre:
                    reg.salida?.fecha_hora_timbre,

                  estado_timbre:
                    reg.salida?.estado_timbre
                },

                inicioAlimentacion: {

                  fecha_horario:
                    reg.inicioAlimentacion?.fecha_horario,

                  fecha_hora_horario:
                    reg.inicioAlimentacion?.fecha_hora_horario,

                  fecha_hora_timbre:
                    reg.inicioAlimentacion?.fecha_hora_timbre,

                  minutos_alimentacion:
                    reg.inicioAlimentacion?.minutos_alimentacion,

                  estado_timbre:
                    reg.inicioAlimentacion?.estado_timbre
                },

                finAlimentacion: {

                  fecha_horario:
                    reg.finAlimentacion?.fecha_horario,

                  fecha_hora_horario:
                    reg.finAlimentacion?.fecha_hora_horario,

                  fecha_hora_timbre:
                    reg.finAlimentacion?.fecha_hora_timbre,

                  estado_timbre:
                    reg.finAlimentacion?.estado_timbre
                },

                minLaborados:
                  reg.minLaborados,

                minPlanificados:
                  reg.minPlanificados,

                minAlimentacion:
                  reg.minAlimentacion,

                calculo_alimentacion_valido:
                  reg.calculo_alimentacion_valido,

                motivo_calculo_alimentacion:
                  reg.motivo_calculo_alimentacion,

                minAtrasos:
                  reg.minAtrasos,

                minSalidasAnticipadas:
                  reg.minSalidasAnticipadas,

                observaciones:
                  reg.observaciones ?? ''

              }))

          }))

      }))

    };
  }

  async generarReporte(): Promise<void> {


    if (this.generando) {
      return;
    }

    if (!this.validarFechas()) {
      return;
    }

    const empleado =
      this.obtenerEmpleadoSeleccionado();

    if (!empleado) {

      await this.mostrarToast(
        'Seleccione un empleado para generar el reporte.',
        'warning'
      );

      return;
    }

    const seleccionados =
      this.modelarEmpleadoParaConsulta(
        empleado
      );

    this.generando = true;
    this.dataPdf = [];

    try {

      const respuesta =
        await firstValueFrom(
          this.reportesService.ReporteResumenAsistencia(
            seleccionados,
            this.fechaInicio,
            this.fechaFin
          )
        );

      this.dataPdf =
        Array.isArray(respuesta)
          ? respuesta
          : [];

      if (this.dataPdf.length === 0) {

        await this.mostrarToast(
          'No existe información de asistencia para el periodo seleccionado.',
          'warning'
        );

        return;
      }

      await Promise.all([
        this.ObtenerLogo(),
        this.ObtenerColores()
      ]);

      const payload =
        this.construirPayloadReporteResumenAsistencia();

      console.log(
        '[RESUMEN ASISTENCIA PDF] Payload:',
        payload
      );

      const {
        blob,
        filename
      } =
        await firstValueFrom(
          this.reportesMicroService.generarReporteServicio(
            'asistencia',
            'pdf',
            payload
          )
        );

      await this.descargarArchivo(
        blob,
        filename
      );

      await this.mostrarToast(
        'Reporte generado correctamente.',
        'success'
      );

    } catch (error: any) {

      console.error(
        '[RESUMEN ASISTENCIA ERROR]',
        error
      );

      const mensaje =
        error?.error?.message ??
        error?.error?.mensaje ??
        'No se pudo generar el reporte. Intente nuevamente.';

      await this.mostrarToast(
        mensaje,
        'danger'
      );

    } finally {

      this.generando = false;

    }
  }

  private async descargarArchivo(
    blob: Blob,
    filename: string
  ): Promise<void> {

    const nombreArchivo =
      this.limpiarNombreArchivo(
        filename ||
        `resumen_asistencia_${Date.now()}.pdf`
      );

    const base64 =
      await this.blobToBase64(blob);

    if (Capacitor.isNativePlatform()) {

      const resultado =
        await Filesystem.writeFile({

          path:
            nombreArchivo,

          data:
            base64,

          directory:
            Directory.Cache,

          recursive:
            true

        });

      try {

        await FileOpener.open({

          filePath:
            resultado.uri,

          contentType:
            'application/pdf'

        });

      } catch (error) {

        console.error(
          'No se pudo abrir automáticamente el PDF:',
          error
        );

      }

      return;
    }

    const url =
      window.URL.createObjectURL(
        blob
      );

    const link =
      document.createElement('a');

    link.href =
      url;

    link.download =
      nombreArchivo;

    link.target =
      '_blank';

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    window.URL.revokeObjectURL(
      url
    );
  }

  private async blobToBase64(
    blob: Blob
  ): Promise<string> {

    const buffer =
      await blob.arrayBuffer();

    const bytes =
      new Uint8Array(buffer);

    let binary = '';

    const chunkSize =
      0x8000;

    for (
      let i = 0;
      i < bytes.length;
      i += chunkSize
    ) {

      const chunk =
        bytes.subarray(
          i,
          i + chunkSize
        );

      binary +=
        String.fromCharCode.apply(
          null,
          Array.from(chunk)
        );
    }

    return btoa(binary);
  }

  private limpiarNombreArchivo(
    nombre: string
  ): string {

    const limpio =
      nombre
        .replace(/[\\/:*?"<>|]/g, '_')
        .replace(/\s+/g, '_')
        .trim();

    return limpio
      .toLowerCase()
      .endsWith('.pdf')
        ? limpio
        : `${limpio}.pdf`;
  }

  trackById(
    index: number,
    item: any
  ): any {
    return item?.id ??
      item?.codigo ??
      index;
  }

  private async mostrarToast(
    mensaje: string,
    color: string
  ): Promise<void> {

    const toast =
      await this.toastController.create({
        message: mensaje,
        duration: 2500,
        color,
        mode: 'ios'
      });

    await toast.present();
  }

  private modelarEmpleadoParaConsulta(empleado: any): any[] {
    return [
      {
        nombre: 'Empleados',
        empleados: [
          empleado
        ]
      }
    ];
  }

  seleccionarEmpleado(empleado: any): void {
    this.empleadoSeleccionadoId = Number(empleado.id);
  }

  estaEmpleadoSeleccionado(idEmpleado: any): boolean {
    if (this.empleadoSeleccionadoId === null) {
      return false;
    }

    return Number(this.empleadoSeleccionadoId) === Number(idEmpleado);
  }

  get empleadosPaginados(): any[] {
    const inicio =
      (this.pageActual - 1) * this.itemsPorPagina;

    const fin =
      inicio + this.itemsPorPagina;

    return this.empleadosFiltro.slice(
      inicio,
      fin
    );
  }

  get totalPaginas(): number {

    if (
      !this.empleadosFiltro ||
      this.empleadosFiltro.length === 0
    ) {
      return 1;
    }

    return Math.ceil(
      this.empleadosFiltro.length /
      this.itemsPorPagina
    );
  }

  paginaAnterior(): void {

    if (this.pageActual > 1) {
      this.pageActual--;
    }
  }

  paginaSiguiente(): void {

    if (this.pageActual < this.totalPaginas) {
      this.pageActual++;
    }
  }

}