import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { VacacionesService } from 'src/app/services/vacaciones.service';
import { ReportesMicroService } from 'src/app/services/reportes-micro.service';
import { PermisosAccionesService } from 'src/app/services/permisos-acciones.service';
import { EmpresaService } from 'src/app/services/empresa.service';
import { firstValueFrom } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';

import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { DatosGeneralesService } from 'src/app/services/datos-generales.service';
import { AprobacionesService } from 'src/app/services/aprobaciones.service';
import { TipoNotificacion } from 'src/app/interfaces/tipo-notificaciones.enum';

@Component({
  selector: 'app-vacacion-detalle-solicitud',
  templateUrl: './vacacion-detalle-solicitud.page.html',
  styleUrls: ['./vacacion-detalle-solicitud.page.scss'],
})
export class VacacionDetalleSolicitudPage implements OnInit {

  solicitud: any = null;
  eliminando = false;
  imprimiendo = false;
  logo: any = null;
  p_color: any = null;
  s_color: any = null;
  frase: any = null;
  imagen: string = localStorage.getItem('imagen64') ?? '';
  historialAprobaciones: any[] = [];

  constructor(
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private vacacionesService: VacacionesService,
    private navCtrl: NavController,
    private reportes: ReportesMicroService,
    private permisosAcciones: PermisosAccionesService,
    private empresaService: EmpresaService,
    private notificacionesService: NotificacionesService,
    private datosGeneralesService: DatosGeneralesService,
    private aprobacionesService: AprobacionesService,

  ) { }

  async ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    this.solicitud = navigation?.extras?.state?.['solicitud'];

    if (!this.solicitud) {
      const state = history.state;
      this.solicitud = state?.solicitud || null;
    }

    if (!this.solicitud) {
      this.mostrarToast('No se encontró la información de la solicitud.', 'warning');
      this.regresar();
    }

    await this.ObtenerLogo();
    await this.ObtenerColores();

    await this.cargarPermisosAcciones();

    this.cargarHistorialAprobaciones();
  }

  ObtenerLogo(): Promise<void> {
    return new Promise((resolve) => {
      this.empresaService.ObtenerEmpresaImagen('logo').subscribe({
        next: (base64) => {
          this.logo = base64;
          resolve();
        },
        error: (error) => {
          console.error('Error obteniendo logo de empresa:', error);
          this.logo = null;
          resolve();
        }
      });
    });
  }

  ObtenerColores(): Promise<void> {
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

  regresar() {
    this.router.navigateByUrl('/reloj/solicitudes/vacacion-solicitud/vacacion-criterio-busqueda');
  }

  obtenerIdSolicitud(): number {
    return Number(this.solicitud?.id_solicitud_vacacion || this.solicitud?.id || 0);
  }

  private cargarHistorialAprobaciones(): void {
    const idSolicitud = this.obtenerIdSolicitud();

    if (!idSolicitud) {
      this.historialAprobaciones = [];
      return;
    }

    this.aprobacionesService
      .ListarHistorialSolicitud('VACACION', idSolicitud)
      .subscribe({
        next: (data: any[]) => {
          const rows = Array.isArray(data) ? data : [];

          this.historialAprobaciones = rows.filter((r: any) => r?.activo !== false);

          console.log('[VACACION PDF HISTORIAL] Historial aprobaciones cargado', {
            idSolicitud,
            total: this.historialAprobaciones.length,
            historial: this.historialAprobaciones
          });
        },
        error: (error) => {
          console.error('[VACACION PDF HISTORIAL ERROR] No se pudo cargar historial', error);
          this.historialAprobaciones = [];
        }
      });
  }

  estadoTexto(estado: number | string): string {
    const estadoNumber = Number(estado);

    const estadosMap: any = {
      1: 'Pendiente',
      2: 'Pre-Autorizado',
      3: 'Autorizado',
      4: 'No Autorizado'
    };

    return estadosMap[estadoNumber] || 'Desconocido';
  }

  estadoColor(estado: number | string): string {
    const estadoNumber = Number(estado);

    const colores: any = {
      1: 'warning',
      2: 'tertiary',
      3: 'success',
      4: 'danger'
    };

    return colores[estadoNumber] || 'medium';
  }

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return '—';

    const date = new Date(fecha);

    return date.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  textoFeriadosIncluidos(valor: any): string {
    return valor === true || valor === 'true' || valor === 1 || valor === '1'
      ? 'Sí'
      : 'No';
  }

  editarSolicitud() {
    this.router.navigateByUrl(
      '/reloj/solicitudes/vacacion-solicitud/vacacion-editar-solicitud',
      {
        state: {
          solicitud: this.solicitud
        }
      }
    );
  }

  async eliminarSolicitud() {
    const idSolicitud = this.obtenerIdSolicitud();

    if (!idSolicitud) {
      this.mostrarToast('No se encontró el ID de la solicitud.', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Eliminar solicitud',
      message: '¿Está seguro que desea eliminar esta solicitud de vacación?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.confirmarEliminarSolicitud(idSolicitud);
          }
        }
      ]
    });

    await alert.present();
  }

  confirmarEliminarSolicitud(idSolicitud: number) {
    if (this.eliminando) return;

    this.eliminando = true;

    const snapshot = JSON.parse(JSON.stringify(this.solicitud));

    this.vacacionesService.EliminarSolicitudesVacaciones(idSolicitud).subscribe({
      next: async (resp) => {
        const fallo = (resp && resp.message === 'error') || resp?.ok === false;

        if (fallo) {
          this.eliminando = false;
          this.mostrarToast(
            resp?.mensaje || 'No se pudo eliminar esta solicitud.',
            'danger'
          );
          return;
        }

        await this.enviarComunicacionesEliminacionVacacion(snapshot);

        this.eliminando = false;
        this.mostrarToast('Solicitud eliminada correctamente.', 'success');

        localStorage.setItem('resetBusquedaVacaciones', 'true');

        setTimeout(() => {
          this.navCtrl.navigateRoot(
            '/reloj/solicitudes/vacacion-solicitud/vacacion-criterio-busqueda',
            {
              animated: true
            }
          );
        }, 300);
      },
      error: (err) => {
        this.eliminando = false;

        if (err?.status === 409) {
          this.mostrarToast(
            'Existen datos relacionados con esta solicitud. No fue posible eliminar.',
            'danger'
          );
          return;
        }

        this.mostrarToast(
          err?.message || 'Ocurrió un error al eliminar la solicitud.',
          'danger'
        );
      }
    });
  }

  private async enviarComunicacionesEliminacionVacacion(snapshot: any): Promise<void> {
    try {
      if (!snapshot?.id && !snapshot?.id_solicitud_vacacion) return;
      if (!snapshot?.id_empleado) return;

      const idVacaciones = Number(
        snapshot?.id ??
        snapshot?.id_solicitud_vacacion ??
        0
      );

      const idEmpleadoSolicitante = Number(
        snapshot?.id_empleado ??
        snapshot?.empleado_id ??
        0
      );

      const idTipoVacacion = Number(
        snapshot?.id_configuracion ??
        snapshot?.id_tipo_vacacion ??
        snapshot?.tipo_vacacion_id ??
        0
      );

      const empleados = await firstValueFrom(
        this.datosGeneralesService.ObtenerInformacionModulos(1)
      );

      const empleadoSolicitante = empleados.find((e: any) =>
        Number(e?.id_empleado ?? e?.id) === Number(idEmpleadoSolicitante)
      );

      const idDepartamento = Number(
        snapshot?.id_departamento ??
        snapshot?.id_departamento_origen ??
        snapshot?.id_dep ??
        empleadoSolicitante?.id_departamento ??
        empleadoSolicitante?.id_dep ??
        empleadoSolicitante?.departamento_id ??
        0
      );

      if (!idVacaciones || !idEmpleadoSolicitante || !idTipoVacacion) {
        console.warn('No se envía comunicación de eliminación de vacación: faltan datos base.', {
          idVacaciones,
          idEmpleadoSolicitante,
          idTipoVacacion,
          idDepartamento,
          snapshot,
          empleadoSolicitante
        });
        return;
      }

      let detalleFlujo: any = null;

      if (idDepartamento && idTipoVacacion) {
        const flujos = await firstValueFrom(
          this.aprobacionesService.ListarFlujosDepartamento(idDepartamento)
        );

        const flujoVacacion = flujos.find((f: any) => {
          const modulo = String(f?.modulo ?? '').trim().toUpperCase();

          const tipoFlujo = Number(
            f?.id_tipo_solicitud ??
            f?.id_tipo_vacacion ??
            f?.id_tipo ??
            0
          );

          return modulo === 'VACACION' && tipoFlujo === idTipoVacacion;
        });

        const idFlujo = Number(
          flujoVacacion?.id_flujo ??
          flujoVacacion?.id ??
          0
        );

        if (idFlujo) {
          detalleFlujo = await firstValueFrom(
            this.aprobacionesService.ObtenerDetalleFlujo(idFlujo)
          );
        }
      }

      const esJefe =
        empleadoSolicitante?.jefe === true ||
        empleadoSolicitante?.jefe === 1 ||
        empleadoSolicitante?.jefe === 'true' ||
        snapshot?.es_jefe === true;

      const pasosIniciales = detalleFlujo
        ? this.seleccionarPasosIniciales(detalleFlujo, esJefe)
        : [];

      const aprobadores = new Set<number>();

      for (const paso of pasosIniciales) {
        for (const idAprobador of this.obtenerDestinatariosPaso(paso)) {
          aprobadores.add(idAprobador);
        }
      }

      const idsReceptores = [
        idEmpleadoSolicitante,
        ...Array.from(aprobadores)
      ].filter(id => !!id);

      const idsUnicos = Array.from(new Set(idsReceptores));

      const empleadosReceptores = empleados.filter((e: any) =>
        idsUnicos.includes(Number(e?.id_empleado ?? e?.id))
      );

      const mensaje = this.armarMensajeEliminacionVacacion(
        snapshot,
        empleadoSolicitante
      );

      const idEnvia = Number(
        localStorage.getItem('empleadoID') ||
        localStorage.getItem('empleado') ||
        idEmpleadoSolicitante
      );

      const idsCorreo = empleadosReceptores
        .filter((e: any) => {
          const recibeCorreo =
            e?.vacacion_mail === true ||
            e?.vacacion_mail === 1 ||
            e?.vacacion_mail === 'true';

          return recibeCorreo && !!e?.correo;
        })
        .map((e: any) => Number(e?.id_empleado ?? e?.id));

      const idsNotificacion = empleadosReceptores
        .filter((e: any) =>
          e?.vacacion_notificacion === true ||
          e?.vacacion_notificacion === 1 ||
          e?.vacacion_notificacion === 'true'
        )
        .map((e: any) => Number(e?.id_empleado ?? e?.id));

      if (idsCorreo.length > 0) {
        try {
          const correosEnviar = empleadosReceptores
            .filter((e: any) => {
              const recibeCorreo =
                e?.vacacion_mail === true ||
                e?.vacacion_mail === 1 ||
                e?.vacacion_mail === 'true';

              return recibeCorreo && !!e?.correo;
            })
            .map((e: any) => String(e.correo).trim())
            .filter((correo: string) => !!correo);

          const correoUnico = Array.from(new Set(correosEnviar)).join(', ');

          const payloadCorreo = {
            id_envia: idEnvia,
            plataforma: 'Aplicación Móvil',
            items: [
              {
                correo: correoUnico,
                asunto: 'Solicitud de vacación eliminada',
                mensaje,
                id_vacaciones: idVacaciones
              }
            ]
          };

          await firstValueFrom(
            this.notificacionesService.EnviarCorreoPermisoLegalizacionMultiple(payloadCorreo)
          );

        } catch (error) {
          console.error('ERROR AL ENVIAR CORREO DE ELIMINACION DE VACACION', error);
        }
      }

      if (idsNotificacion.length > 0) {
        try {
          const idsNotificacionUnicos = Array.from(new Set(idsNotificacion));

          const payloadNotificacion = {
            id_empl_envia: idEnvia,
            id_empl_recive: idsNotificacionUnicos,
            mensaje,
            tipo: TipoNotificacion.ELIMINAR_VACACION,
            id_vacaciones: idVacaciones
          };

          await firstValueFrom(
            this.notificacionesService.EnviarNotificacionPermisoLegalizacionMultiple(payloadNotificacion)
          );

        } catch (error) {
          console.error('ERROR AL ENVIAR NOTIFICACION DE ELIMINACION DE VACACION', error);
        }
      }

    } catch (error) {
      console.error('ERROR GENERAL AL ENVIAR COMUNICACIONES DE ELIMINACION DE VACACION', error);
    }
  }

  private armarMensajeEliminacionVacacion(
    solicitud: any,
    empleadoSolicitante?: any
  ): string {

    const nombreEmp = [
      empleadoSolicitante?.apellido ?? solicitud?.apellido_emple ?? solicitud?.apellido_empleado ?? solicitud?.apellido,
      empleadoSolicitante?.nombre ?? solicitud?.nombre_emple ?? solicitud?.nombre_empleado ?? solicitud?.nombre
    ].filter(Boolean).join(' ').trim() || `Empleado ${solicitud?.id_empleado ?? ''}`;

    const cargoEmpleado =
      empleadoSolicitante?.cargo ??
      empleadoSolicitante?.name_cargo ??
      solicitud?.cargo ??
      null;

    const departamentoEmpleado =
      empleadoSolicitante?.departamento ??
      empleadoSolicitante?.name_dep ??
      solicitud?.nom_departamento ??
      solicitud?.nombre_departamento ??
      solicitud?.departamento_nombre ??
      solicitud?.departamento ??
      null;

    const motivo = (
      solicitud?.tipo_vacacion_descripcion ??
      solicitud?.descripcion_vacacion ??
      solicitud?.descripcion ??
      solicitud?.motivo ??
      ''
    ).toString();

    const dias = Number(
      solicitud?.numero_dias_totales ??
      solicitud?.num_dias_totales ??
      solicitud?.dias ??
      0
    );

    const minutos = Number(
      solicitud?.minutos_totales ??
      0
    );

    const esPorHoras = dias === 0 && minutos > 0;

    const fechaDesde = String(
      solicitud?.fecha_inicio ??
      ''
    ).substring(0, 10);

    const fechaHasta = String(
      solicitud?.fecha_final ??
      ''
    ).substring(0, 10);

    const payloadMensaje = {
      accion: 'ELIMINADO',
      mensaje_principal: 'Se ha eliminado la siguiente solicitud de vacación:',
      notificacion: 'Se ha eliminado la siguiente solicitud de vacación:',
      data: {
        empleado: nombreEmp,
        identificacion: empleadoSolicitante?.identificacion ?? solicitud?.identificacion ?? null,
        cargo: cargoEmpleado,
        departamento: departamentoEmpleado,
        fecha_solicitud: (
          solicitud?.fecha_registro ??
          solicitud?.fecha_creacion ??
          solicitud?.fecha_solicitud ??
          null
        )?.toString()?.substring(0, 10) ?? null,
        fecha_desde: fechaDesde,
        fecha_hasta: esPorHoras ? fechaDesde : fechaHasta,
        dias: esPorHoras ? null : dias,
        hora: esPorHoras ? this.getHorasFormatoHHmmDesdeMinutos(minutos) : null,
        hora_inicio: esPorHoras ? (solicitud?.hora_inicio ?? null) : null,
        hora_fin: esPorHoras ? (solicitud?.hora_fin ?? null) : null,
        motivo,
        observacion: solicitud?.descripcion ?? '',
        estado_solicitud: this.mapearEstadoTexto(Number(solicitud?.estado ?? 1)),
        realizado_por:
          localStorage.getItem('fullname') ||
          localStorage.getItem('nombre') ||
          nombreEmp,
        codigo: empleadoSolicitante?.codigo ?? solicitud?.codigo ?? null
      }
    };

    return JSON.stringify(payloadMensaje);
  }

  private cumpleTargetSolicitante(target: string, esJefe: boolean): boolean {
    const t = String(target ?? 'AMBOS').toUpperCase();

    if (t === 'AMBOS') return true;
    if (t === 'JEFES') return esJefe === true;
    if (t === 'EMPLEADOS') return esJefe === false;

    return true;
  }

  private seleccionarPasosIniciales(detalle: any, esJefe: boolean): any[] {
    const pasos = Array.isArray(detalle?.pasos)
      ? detalle.pasos.slice().sort((a: any, b: any) => Number(a?.orden ?? 0) - Number(b?.orden ?? 0))
      : [];

    const aplicables = pasos.filter((p: any) =>
      this.cumpleTargetSolicitante(p?.target_solicitante, esJefe)
    );

    const seleccionados: any[] = [];

    for (const paso of aplicables) {
      seleccionados.push(paso);

      if (paso?.obligatorio === true) {
        break;
      }
    }

    return seleccionados;
  }

  private obtenerDestinatariosPaso(paso: any): number[] {
    const modo = String(paso?.modo_aprobador ?? '').toUpperCase();

    const jefes: number[] = Array.isArray(paso?.ids_empleados_jefes_destino)
      ? paso.ids_empleados_jefes_destino.map((x: any) => Number(x)).filter(Number.isFinite)
      : [];

    const especificos: number[] = Array.isArray(paso?.ids_empleados_especificos)
      ? paso.ids_empleados_especificos.map((x: any) => Number(x)).filter(Number.isFinite)
      : [];

    if (modo === 'JEFES') return jefes;
    if (modo === 'ESPECIFICOS') return especificos;

    return Array.from(new Set([...jefes, ...especificos]));
  }

  private mapearEstadoTexto(estado: number): string {
    switch (Number(estado)) {
      case 1:
        return 'PENDIENTE';
      case 2:
        return 'PREAUTORIZADO';
      case 3:
        return 'AUTORIZADO';
      case 4:
        return 'RECHAZADO';
      default:
        return 'PENDIENTE';
    }
  }

  private getHorasFormatoHHmmDesdeMinutos(minutos: number): string {
    const total = Number(minutos || 0);

    const horas = Math.floor(total / 60);
    const mins = total % 60;

    return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  imprimirSolicitud() {
    this.generarReporteSolicitudVacacion();
  }

  async generarReporteSolicitudVacacion() {
    if (!this.solicitud) {
      this.mostrarToast('No se encontró la solicitud para generar el reporte.', 'warning');
      return;
    }

    if (this.imprimiendo) return;

    this.imprimiendo = true;

    try {
      await this.ObtenerLogo();
      await this.ObtenerColores();

      const data = this.construirPayloadReporteSolicitud();

      console.log('[VACACION PDF 01] Payload armado', {
        idSolicitud: data?.solicitud?.id,
        empresa: data?.empresa,
        totalAprobaciones: data?.aprobaciones?.length ?? 0,
        aprobaciones: data?.aprobaciones ?? []
      });

      this.reportes.generarReporteServicio('solicitud-vacacion', 'pdf', data).subscribe({
        next: async ({ blob, filename }) => {
          try {
            await this.descargarArchivo(blob, filename);

            this.mostrarToast('Reporte guardado correctamente.', 'success');
          } catch (error) {
            console.error('[VACACION PDF ERROR A] Error guardando reporte de vacación:', error);

            this.mostrarToast(
              'El reporte se generó, pero no se pudo guardar en el dispositivo.',
              'danger'
            );
          } finally {
            this.imprimiendo = false;
          }
        },
        error: (error) => {
          console.error('[VACACION PDF ERROR B] Error generando reporte:', error);

          this.imprimiendo = false;

          this.mostrarToast(
            'No se pudo generar el reporte. El servicio de reportes no está disponible en este momento.',
            'danger'
          );
        }
      });

    } catch (error) {
      console.error('[VACACION PDF ERROR C] Error preparando reporte:', error);

      this.imprimiendo = false;

      this.mostrarToast(
        'No se pudo preparar la información del reporte.',
        'danger'
      );
    }
  }

  construirPayloadReporteSolicitud() {
    const nombreUsuario =
      localStorage.getItem('fullname') ||
      localStorage.getItem('nombre_usuario') ||
      [
        localStorage.getItem('nom'),
        localStorage.getItem('ap')
      ].filter(Boolean).join(' ').trim() ||
      localStorage.getItem('username') ||
      'Usuario AQHora';

    const nombreEmpresa =
      localStorage.getItem('nombre_empresa') ||
      this.solicitud?.nom_empresa ||
      '';

    const aprobacionesOrdenadas = [...(this.historialAprobaciones || [])]
      .filter((h: any) => h?.activo !== false)
      .sort((a: any, b: any) => Number(a?.orden_paso ?? 0) - Number(b?.orden_paso ?? 0));

    return {
      usuario: nombreUsuario,
      empresa: nombreEmpresa.toUpperCase(),

      fraseMarcaAgua: this.frase,
      logoBase64: this.logo,
      colorPrincipal: this.p_color,
      colorSecundario: this.s_color,

      solicitud: {
        id: this.solicitud.id || this.solicitud.id_solicitud_vacacion,
        estado: this.solicitud.estado,
        incluir_feriados: this.solicitud.incluir_feriados ?? false,

        fecha_inicio: this.solicitud.fecha_inicio,
        fecha_final: this.solicitud.fecha_final,
        fecha_registro: this.solicitud.fecha_registro ?? null,
        fecha_actualizacion: this.solicitud.fecha_actualizacion ?? null,
        fecha_creacion: this.solicitud.fecha_registro ?? null,

        documento: this.solicitud.documento || null,

        numero_dias_lunes: this.solicitud.numero_dias_lunes || 0,
        numero_dias_martes: this.solicitud.numero_dias_martes || 0,
        numero_dias_miercoles: this.solicitud.numero_dias_miercoles || 0,
        numero_dias_jueves: this.solicitud.numero_dias_jueves || 0,
        numero_dias_viernes: this.solicitud.numero_dias_viernes || 0,
        numero_dias_sabado: this.solicitud.numero_dias_sabado || this.solicitud.numero_dias_sabados || 0,
        numero_dias_domingo: this.solicitud.numero_dias_domingo || this.solicitud.numero_dias_domingos || 0,

        numero_dias_totales: this.solicitud.numero_dias_totales || this.solicitud.total_dias || 0,

        nombre_emple: this.solicitud.nombre_emple || this.solicitud.nombre_empleado || null,
        apellido_emple: this.solicitud.apellido_emple || this.solicitud.apellido_empleado || null,
        identificacion: this.solicitud.identificacion || null,
        codigo: this.solicitud.codigo || this.solicitud.codigo_empleado || null,

        nom_regimen: this.solicitud.nom_regimen || null,
        cargo: this.solicitud.cargo || null,
        nom_empresa: this.solicitud.nom_empresa || nombreEmpresa || null,
        nom_ciudad: this.solicitud.nom_ciudad || null,
        nom_sucursal: this.solicitud.nom_sucursal || null,
        nom_departamento: this.solicitud.nom_departamento || this.solicitud.nombre_departamento || null,
      },

      aprobaciones: aprobacionesOrdenadas.map((h: any) => ({
        orden_paso: h.orden_paso,
        departamento_nombre: h.departamento_nombre,
        empleado_nombre: h.empleado_nombre,
        accion: h.accion,
        fecha_hora_accion: h.fecha_hora_accion,
        observacion: h.observacion ?? null,
        cargo_en_momento: h.cargo_en_momento ?? null,
      }))
    };
  }

  async descargarArchivo(blob: Blob, filename: string) {
    const nombreArchivo = this.limpiarNombreArchivo(
      filename || `solicitud_vacacion_${this.obtenerIdSolicitud() || new Date().getTime()}.pdf`
    );

    const base64 = await this.blobToBase64(blob);

    if (Capacitor.isNativePlatform()) {
      const resultado = await Filesystem.writeFile({
        path: nombreArchivo,
        data: base64,
        directory: Directory.Cache,
        recursive: true
      });

      try {
        await FileOpener.open({
          filePath: resultado.uri,
          contentType: 'application/pdf'
        });
      } catch (error) {
        console.error('[VACACION PDF OPEN ERROR] Archivo guardado, pero no se pudo abrir:', error);
      }

      return;
    }

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.target = '_blank';

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    try {
      const buffer = await blob.arrayBuffer();

      const bytes = new Uint8Array(buffer);

      let binary = '';
      const chunkSize = 0x8000;

      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }

      return btoa(binary);

    } catch (error) {
      console.error('[VACACION PDF BASE64 ERROR] Error convirtiendo blob a base64:', error);
      throw error;
    }
  }

  private limpiarNombreArchivo(nombre: string): string {
    const limpio = nombre
      .replace(/[\\/:*?"<>|]/g, '_')
      .replace(/\s+/g, '_')
      .trim();

    return limpio.toLowerCase().endsWith('.pdf') ? limpio : `${limpio}.pdf`;
  }

  async mostrarToast(mensaje: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color,
      position: 'top',
      mode: 'ios'
    });

    await toast.present();
  }



  // CONTROL DE BOTONES
  async cargarPermisosAcciones() {
    await this.permisosAcciones.cargarAccionesRol([
      {
        pagina: 'Solicitud Permisos',
        accion: 'Editar Solicitud Permiso'
      },
      {
        pagina: 'Solicitud Permisos',
        accion: 'Eliminar Solicitud Permiso'
      },
      {
        pagina: 'Solicitud Vacaciones',
        accion: 'Editar Solicitud Vacación'
      },
      {
        pagina: 'Solicitud Vacaciones',
        accion: 'Eliminar Solicitud Vacación'
      }
    ]);
  }

  tienePermisoAccion(pagina: string, accion: string): boolean {
    return this.permisosAcciones.tienePermisoAccion(pagina, accion);
  }
}