import { Component, OnInit } from '@angular/core';
import { VacacionesService } from 'src/app/services/vacaciones.service';
import { FeriadosService, IFeriado } from 'src/app/services/feriados.service';
import { DocumentosService } from 'src/app/services/documentos.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { DatosGeneralesService } from 'src/app/services/datos-generales.service';
import { AprobacionesService } from 'src/app/services/aprobaciones.service';
import { TipoNotificacion } from 'src/app/interfaces/tipo-notificaciones.enum';
 
@Component({
  selector: 'app-registrar-vacacion',
  templateUrl: './registrar-vacacion.page.html',
  styleUrls: ['./registrar-vacacion.page.scss'],
})
export class RegistrarVacacionPage implements OnInit {

  tiposVacacion: any[] = [];
  tipoVacacionSeleccionado: number | null = null;

  permiteHoras = false;
  incluirFeriadosSeleccionado: boolean | null = null;
  requiereDocumento = false;

  fechaInicio = '';
  fechaFinal = '';
  fechaHoras = '';
  horaInicio = '';
  horaFinal = '';

  diasFeriados = 0;
  saldoVacacionesVisible = '—';

  conteoDiasSemana = {
    L: 0, M: 0, X: 0, J: 0, V: 0, S: 0, D: 0
  };

  diasTotales = 0;
  horasTotales = '00:00';
  diaSemanaSeleccionado: string | null = null;

  verificacionRealizada = false;
  estadoVerificacion = '';
  mensajeVerificacion = '';

  nombreArchivo = '';
  archivoSeleccionado: File | null = null;

  feriados: IFeriado[] = [];
  idEmpleado!: number;
  idSucursal!: number;

  cargandoTipos = false;
  cargandoSaldo = false;
  cargandoFeriados = false;
  registrandoSolicitud = false;
  debeVerificarProgramacion = false;
  resultadoVerificacionDetalle: any = null;

  constructor(
    private vacacionesService: VacacionesService,
    private feriadosService: FeriadosService,
    private documentosService: DocumentosService,
    private toastController: ToastController,
    private router: Router,
    private notificacionesService: NotificacionesService,
    private datosGeneralesService: DatosGeneralesService,
    private aprobacionesService: AprobacionesService,

  ) { }

  ngOnInit() {
    this.idEmpleado = parseInt(localStorage.getItem('empleadoID') || '0', 10);
    this.idSucursal = parseInt(localStorage.getItem('csucur') || '0', 10);

    this.cargarTiposVacacion();
    this.cargarSaldoEmpleado();
    this.cargarFeriados();
  }

  cargarTiposVacacion() {
    this.cargandoTipos = true;

    this.vacacionesService.ListarTodasConfiguraciones().subscribe({
      next: (data) => {
        const lista = Array.isArray(data) ? data : [];
        this.tiposVacacion = lista.filter(v => Number(v.sucursal_id) === Number(this.idSucursal));
        this.cargandoTipos = false;
      },
      error: () => {
        this.tiposVacacion = [];
        this.cargandoTipos = false;
      }
    });
  }

  cargarSaldoEmpleado() {
    if (!this.idEmpleado) return;

    this.cargandoSaldo = true;

    this.vacacionesService.ObtenerSaldoEmpleados(this.idEmpleado).subscribe({
      next: (response) => {
        const saldo = response?.data?.saldo_disponible;
        if (saldo) {
          this.saldoVacacionesVisible = `${saldo.dias} días, ${saldo.horas} horas, ${saldo.minutos} minutos`;
        } else {
          this.saldoVacacionesVisible = '—';
        }
        this.cargandoSaldo = false;
      },
      error: () => {
        this.saldoVacacionesVisible = '—';
        this.cargandoSaldo = false;
      }
    });
  }

  cargarFeriados() {
    this.cargandoFeriados = true;

    this.feriadosService.ConsultarFeriado().subscribe({
      next: (data) => {
        this.feriados = Array.isArray(data) ? data : [];
        this.cargandoFeriados = false;
      },
      error: () => {
        this.feriados = [];
        this.cargandoFeriados = false;
      }
    });
  }

  onTipoVacacionChange() {
    const tipo = this.tiposVacacion.find(t => Number(t.id) === Number(this.tipoVacacionSeleccionado));

    this.permiteHoras = !!tipo?.permite_horas;
    this.incluirFeriadosSeleccionado = tipo?.incluir_feriados ?? null;
    this.requiereDocumento = !!tipo?.documento;

    this.limpiarFormularioDependiente();
  }

  limpiarFormularioDependiente() {
    this.fechaInicio = '';
    this.fechaFinal = '';
    this.fechaHoras = '';
    this.horaInicio = '';
    this.horaFinal = '';
    this.diasFeriados = 0;
    this.diasTotales = 0;
    this.horasTotales = '00:00';
    this.diaSemanaSeleccionado = null;
    this.conteoDiasSemana = { L: 0, M: 0, X: 0, J: 0, V: 0, S: 0, D: 0 };
    this.verificacionRealizada = false;
    this.estadoVerificacion = '';
    this.mensajeVerificacion = '';
  }

  onFechasChange() {
    this.verificacionRealizada = false;
    this.estadoVerificacion = '';
    this.mensajeVerificacion = '';
    this.resultadoVerificacionDetalle = null;

    if (!this.permiteHoras) {
      this.calcularDias();
    } else {
      this.actualizarResumenPorHoras();
    }
  }

  calcularDias() {
    this.conteoDiasSemana = { L: 0, M: 0, X: 0, J: 0, V: 0, S: 0, D: 0 };
    this.diasTotales = 0;
    this.diasFeriados = 0;

    if (!this.fechaInicio || !this.fechaFinal) return;

    const inicio = new Date(this.fechaInicio + 'T00:00:00');
    const fin = new Date(this.fechaFinal + 'T00:00:00');

    if (fin < inicio) return;

    const actual = new Date(inicio);

    while (actual <= fin) {
      const day = actual.getDay();

      switch (day) {
        case 0: this.conteoDiasSemana.D++; break;
        case 1: this.conteoDiasSemana.L++; break;
        case 2: this.conteoDiasSemana.M++; break;
        case 3: this.conteoDiasSemana.X++; break;
        case 4: this.conteoDiasSemana.J++; break;
        case 5: this.conteoDiasSemana.V++; break;
        case 6: this.conteoDiasSemana.S++; break;
      }

      const yyyy = actual.getFullYear();
      const mm = String(actual.getMonth() + 1).padStart(2, '0');
      const dd = String(actual.getDate()).padStart(2, '0');
      const fechaActual = `${yyyy}-${mm}-${dd}`;

      const esFeriado = this.feriados.some(f => {
        const fechaFeriado = String(f.fecha).substring(0, 10);
        return fechaFeriado === fechaActual;
      });

      if (esFeriado) {
        this.diasFeriados++;
      }

      if (!esFeriado || this.incluirFeriadosSeleccionado) {
        this.diasTotales++;
      }

      actual.setDate(actual.getDate() + 1);
    }
  }

  actualizarResumenPorHoras() {
    this.diaSemanaSeleccionado = null;
    this.horasTotales = '00:00';
    this.diasFeriados = 0;

    if (!this.fechaHoras || !this.horaInicio || !this.horaFinal) return;

    const fecha = new Date(this.fechaHoras + 'T00:00:00');
    const day = fecha.getDay();
    const dias = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    this.diaSemanaSeleccionado = dias[day];

    const [h1, m1] = this.horaInicio.split(':').map(Number);
    const [h2, m2] = this.horaFinal.split(':').map(Number);

    let totalMinutos = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (totalMinutos < 0) totalMinutos = 0;

    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    this.horasTotales = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;

    const fechaActual = this.fechaHoras;
    const esFeriado = this.feriados.some(f => String(f.fecha).substring(0, 10) === fechaActual);
    this.diasFeriados = esFeriado ? 1 : 0;
  }

  seleccionarArchivo(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.archivoSeleccionado = file;
    this.nombreArchivo = file.name;
  }

  quitarArchivo() {
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
  }

  verificarSolicitud() {
    this.verificacionRealizada = false;
    this.estadoVerificacion = '';
    this.mensajeVerificacion = '';
    this.resultadoVerificacionDetalle = null;

    if (!this.tipoVacacionSeleccionado) {
      this.estadoVerificacion = 'error';
      this.mensajeVerificacion = 'Seleccione un tipo de vacación.';
      this.verificacionRealizada = true;
      return;
    }

    const incluirFeriados = this.incluirFeriadosSeleccionado ?? false;

    const payload: any = {
      empleados: [this.idEmpleado],
      incluirFeriados,
      permiteHoras: this.permiteHoras,
      verificarProgramacion: this.debeVerificarProgramacion
    };

    if (!this.permiteHoras) {
      if (!this.fechaInicio || !this.fechaFinal) {
        this.estadoVerificacion = 'error';
        this.mensajeVerificacion = 'Ingrese la fecha inicial y la fecha final.';
        this.verificacionRealizada = true;
        return;
      }

      payload.fechaInicio = this.fechaInicio;
      payload.fechaFin = this.fechaFinal;
      payload.numHoras = '00:00';
    } else {
      if (!this.fechaHoras || !this.horaInicio || !this.horaFinal) {
        this.estadoVerificacion = 'error';
        this.mensajeVerificacion = 'Complete la fecha y el rango de horas.';
        this.verificacionRealizada = true;
        return;
      }

      payload.fechaInicio = this.fechaHoras;
      payload.fechaFin = this.fechaHoras;
      payload.numHoras = this.horasTotales || '00:00';
    }

    this.vacacionesService.VerificarVacacionesMultiples(payload).subscribe({
      next: (resultados) => {
        if (!Array.isArray(resultados) || resultados.length === 0) {
          this.estadoVerificacion = 'error';
          this.mensajeVerificacion = 'No se obtuvo respuesta de la verificación.';
          this.verificacionRealizada = true;
          return;
        }

        const resultado = resultados[0];
        this.resultadoVerificacionDetalle = resultado;

        if (resultado.observacion !== 'Ok') {
          this.estadoVerificacion = 'error';
          this.mensajeVerificacion = resultado.observacion || 'La solicitud no pasó la verificación.';
          this.verificacionRealizada = true;
          return;
        }

        const payloadExistente = {
          id_empleado: this.idEmpleado,
          fecha_inicio: payload.fechaInicio,
          fecha_final: payload.fechaFin,
          excluir_solicitud_actual: null
        };

        this.vacacionesService.BuscarSolicitudExistente(payloadExistente).subscribe({
          next: (respExiste) => {
            if (respExiste?.ok) {
              this.estadoVerificacion = 'error';
              this.mensajeVerificacion = 'Ya existe una solicitud para este rango de fechas.';
              this.verificacionRealizada = true;
              return;
            }

            this.estadoVerificacion = 'ok';
            this.mensajeVerificacion = 'La solicitud pasó la verificación correctamente.';
            this.verificacionRealizada = true;
          },
          error: () => {
            this.estadoVerificacion = 'error';
            this.mensajeVerificacion = 'No fue posible validar si ya existe una solicitud en ese rango.';
            this.verificacionRealizada = true;
          }
        });
      },
      error: (err) => {
        this.estadoVerificacion = 'error';
        this.mensajeVerificacion = err?.message || 'Ocurrió un error al verificar la solicitud.';
        this.verificacionRealizada = true;
      }
    });
  }

  registrarSolicitud() {
    if (this.registrandoSolicitud) {
      return;
    }

    if (!this.verificacionRealizada || this.estadoVerificacion !== 'ok') {
      this.mostrarToast('Primero debe verificar correctamente la solicitud.', 'warning');
      return;
    }

    const tipoSeleccionado = this.obtenerTipoSeleccionado();

    if (!tipoSeleccionado) {
      this.mostrarToast('No se encontró el tipo de vacación seleccionado.', 'warning');
      return;
    }

    if (this.requiereDocumento && !this.archivoSeleccionado) {
      this.mostrarToast('Este tipo de vacación requiere adjuntar un documento.', 'warning');
      return;
    }

    if (this.archivoSeleccionado && this.archivoSeleccionado.size > 2e6) {
      this.mostrarToast('El archivo ha excedido el tamaño permitido. Máximo 2MB.', 'warning');
      return;
    }

    this.registrandoSolicitud = true;

    const esPorHoras = this.permiteHoras;

    const fechaInicioSolicitud = esPorHoras ? this.fechaHoras : this.fechaInicio;
    const fechaFinalSolicitud = esPorHoras ? this.fechaHoras : this.fechaFinal;

    const payload: any = {
      subir_documento: !!this.archivoSeleccionado,
      id_tipo_vacacion: this.tipoVacacionSeleccionado,
      id_empleado: this.idEmpleado,
      fecha_inicio: fechaInicioSolicitud,
      fecha_final: fechaFinalSolicitud,
      incluir_feriados: this.incluirFeriadosSeleccionado ?? false,
      permite_horas: esPorHoras,
      num_horas: esPorHoras ? this.horasTotales : '00:00',
      num_lunes: esPorHoras ? 0 : this.conteoDiasSemana.L,
      num_martes: esPorHoras ? 0 : this.conteoDiasSemana.M,
      num_miercoles: esPorHoras ? 0 : this.conteoDiasSemana.X,
      num_jueves: esPorHoras ? 0 : this.conteoDiasSemana.J,
      num_viernes: esPorHoras ? 0 : this.conteoDiasSemana.V,
      num_sabado: esPorHoras ? 0 : this.conteoDiasSemana.S,
      num_domingo: esPorHoras ? 0 : this.conteoDiasSemana.D,
      num_dias_totales: esPorHoras ? 0 : this.diasTotales
    };

    this.vacacionesService.RegistrarVacaciones(payload).subscribe({
      next: (response) => {
        const solicitudCreada = response?.data ?? response ?? null;

        if (!solicitudCreada || !solicitudCreada.id) {
          this.registrandoSolicitud = false;
          this.mostrarToast('La solicitud se registró, pero no se obtuvo el identificador.', 'warning');
          return;
        }

        if (this.archivoSeleccionado) {
          const formData = new FormData();
          formData.append('uploads', this.archivoSeleccionado, this.archivoSeleccionado.name);

          this.documentosService.SubirDocumento(
            formData,
            solicitudCreada.id,
            this.idEmpleado,
            'vacaciones'
          ).subscribe({
            next: async () => {
              await this.enviarComunicacionesCreacionVacacion(solicitudCreada, tipoSeleccionado);

              this.mostrarToast('Solicitud registrada correctamente.', 'success');
              this.router.navigateByUrl('/reloj/solicitudes/vacacion-solicitud');
            },
            error: () => {
              this.registrandoSolicitud = false;
              this.mostrarToast('La solicitud se registró, pero ocurrió un error al subir el documento.', 'warning');
            }
          });

          return;
        }

        this.enviarComunicacionesCreacionVacacion(solicitudCreada, tipoSeleccionado).finally(() => {
          this.mostrarToast('Solicitud registrada correctamente.', 'success');
          this.router.navigateByUrl('/reloj/solicitudes/vacacion-solicitud');
        });
      },
      error: (err) => {
        this.registrandoSolicitud = false;
        this.mostrarToast(err?.message || 'Ocurrió un error al registrar la solicitud.', 'danger');
      }
    });
  }

  private async enviarComunicacionesCreacionVacacion(
    solicitud: any,
    tipoVacacion: any
  ): Promise<void> {
    try {
      const idEmpleadoSolicitante = Number(
        solicitud?.id_empleado ??
        this.idEmpleado ??
        0
      );

      const idTipoVacacion = Number(
        solicitud?.id_tipo_vacacion ??
        solicitud?.id_configuracion ??
        this.tipoVacacionSeleccionado ??
        0
      );

      const empleados = await firstValueFrom(
        this.datosGeneralesService.ObtenerInformacionModulos(1)
      );

      const empleadoSolicitante = empleados.find((e: any) =>
        Number(e?.id_empleado ?? e?.id) === Number(idEmpleadoSolicitante)
      );

      const idDepartamento = Number(
        solicitud?.id_departamento ??
        solicitud?.id_departamento_origen ??
        solicitud?.id_dep ??
        empleadoSolicitante?.id_departamento ??
        empleadoSolicitante?.id_dep ??
        empleadoSolicitante?.departamento_id ??
        0
      );

      if (!idEmpleadoSolicitante || !idTipoVacacion || !idDepartamento) {
        console.warn('No se envía comunicación de vacación: faltan datos base.', {
          idEmpleadoSolicitante,
          idTipoVacacion,
          idDepartamento,
          solicitud,
          empleadoSolicitante
        });
        return;
      }

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

      const idFlujo = Number(flujoVacacion?.id_flujo ?? flujoVacacion?.id ?? 0);

      let detalleFlujo: any = null;

      if (idFlujo) {
        detalleFlujo = await firstValueFrom(
          this.aprobacionesService.ObtenerDetalleFlujo(idFlujo)
        );
      }

      const esJefe =
        empleadoSolicitante?.jefe === true ||
        empleadoSolicitante?.jefe === 1 ||
        empleadoSolicitante?.jefe === 'true' ||
        solicitud?.es_jefe === true;

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

      const mensaje = this.armarMensajeCreacionVacacion(
        solicitud,
        tipoVacacion,
        empleadoSolicitante
      );

      const idVacaciones = Number(
        solicitud?.id ??
        solicitud?.id_vacaciones ??
        0
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
                asunto: 'Solicitud de vacación registrada',
                mensaje,
                id_vacaciones: idVacaciones
              }
            ]
          };

          await firstValueFrom(
            this.notificacionesService.EnviarCorreoPermisoLegalizacionMultiple(payloadCorreo)
          );

        } catch (error) {
          console.error('ERROR AL ENVIAR CORREO DE CREACION DE VACACION', error);
        }
      }

      if (idsNotificacion.length > 0) {
        try {
          const idsNotificacionUnicos = Array.from(new Set(idsNotificacion));

          const payloadNotificacion = {
            id_empl_envia: idEnvia,
            id_empl_recive: idsNotificacionUnicos,
            mensaje,
            tipo: TipoNotificacion.CREAR_VACACION,
            id_vacaciones: idVacaciones
          };

          await firstValueFrom(
            this.notificacionesService.EnviarNotificacionPermisoLegalizacionMultiple(payloadNotificacion)
          );

        } catch (error) {
          console.error('ERROR AL ENVIAR NOTIFICACION DE CREACION DE VACACION', error);
        }
      }

    } catch (error) {
      console.error('ERROR GENERAL AL ENVIAR COMUNICACIONES DE CREACION DE VACACION', error);
    }
  }

  private armarMensajeCreacionVacacion(
    solicitud: any,
    tipoVacacion: any,
    empleadoSolicitante?: any
  ): string {

    const nombreEmp = [
      empleadoSolicitante?.apellido,
      empleadoSolicitante?.nombre
    ].filter(Boolean).join(' ').trim() || `Empleado ${solicitud?.id_empleado ?? this.idEmpleado}`;

    const cargoEmpleado =
      empleadoSolicitante?.cargo ??
      empleadoSolicitante?.name_cargo ??
      null;

    const departamentoEmpleado =
      empleadoSolicitante?.departamento ??
      empleadoSolicitante?.name_dep ??
      null;

    const motivo = (
      tipoVacacion?.descripcion ??
      tipoVacacion?.nombre ??
      solicitud?.tipo_vacacion_descripcion ??
      ''
    ).toString();

    const dias = Number(
      solicitud?.num_dias_totales ??
      solicitud?.numero_dias_totales ??
      this.diasTotales ??
      0
    );

    const horasTexto = (
      solicitud?.num_horas ??
      this.horasTotales ??
      '00:00'
    ).toString();

    const esPorHoras = dias === 0 && horasTexto !== '00:00';

    const fechaDesde = String(
      solicitud?.fecha_inicio ??
      this.fechaInicio ??
      this.fechaHoras ??
      ''
    ).substring(0, 10);

    const fechaHasta = String(
      solicitud?.fecha_final ??
      this.fechaFinal ??
      this.fechaHoras ??
      ''
    ).substring(0, 10);

    const fechaSolicitudRaw =
      solicitud?.fecha_registro ??
      solicitud?.fecha_creacion ??
      new Date().toISOString();

    const fechaSolicitud = fechaSolicitudRaw
      ? new Date(fechaSolicitudRaw).toISOString().substring(0, 10)
      : null;

    const payloadMensaje = {
      accion: 'CREADO',
      mensaje_principal: 'Se ha registrado la siguiente solicitud de vacación:',
      notificacion: 'Se ha registrado la siguiente solicitud de vacación:',
      data: {
        empleado: nombreEmp,
        identificacion: empleadoSolicitante?.identificacion ?? null,
        cargo: cargoEmpleado,
        departamento: departamentoEmpleado,
        fecha_solicitud: fechaSolicitud,
        fecha_desde: fechaDesde,
        fecha_hasta: esPorHoras ? fechaDesde : fechaHasta,
        dias: esPorHoras ? null : dias,
        hora: esPorHoras ? horasTexto : null,
        hora_inicio: esPorHoras ? (solicitud?.hora_inicio ?? this.horaInicio ?? null) : null,
        hora_fin: esPorHoras ? (solicitud?.hora_fin ?? this.horaFinal ?? null) : null,
        motivo,
        observacion: solicitud?.descripcion ?? '',
        estado_solicitud: this.mapearEstadoTexto(Number(solicitud?.estado ?? 1)),
        realizado_por:
          localStorage.getItem('fullname') ||
          localStorage.getItem('nombre') ||
          nombreEmp
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


  puedeVerificar(): boolean {
    if (!this.tipoVacacionSeleccionado) return false;

    if (!this.permiteHoras) {
      return !!this.fechaInicio && !!this.fechaFinal;
    }

    return !!this.fechaHoras && !!this.horaInicio && !!this.horaFinal;
  }

  puedeRegistrar(): boolean {
    return this.verificacionRealizada &&
      this.estadoVerificacion === 'ok' &&
      !this.registrandoSolicitud;
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

  obtenerTipoSeleccionado() {
    return this.tiposVacacion.find(t => Number(t.id) === Number(this.tipoVacacionSeleccionado));
  }

  resetearFormularioCompleto() {
    this.tipoVacacionSeleccionado = null;
    this.permiteHoras = false;
    this.incluirFeriadosSeleccionado = null;
    this.requiereDocumento = false;

    this.fechaInicio = '';
    this.fechaFinal = '';
    this.fechaHoras = '';
    this.horaInicio = '';
    this.horaFinal = '';

    this.diasFeriados = 0;
    this.diasTotales = 0;
    this.horasTotales = '00:00';
    this.diaSemanaSeleccionado = null;

    this.conteoDiasSemana = { L: 0, M: 0, X: 0, J: 0, V: 0, S: 0, D: 0 };

    this.verificacionRealizada = false;
    this.estadoVerificacion = '';
    this.mensajeVerificacion = '';
    this.resultadoVerificacionDetalle = null;

    this.archivoSeleccionado = null;
    this.nombreArchivo = '';

    this.cargarSaldoEmpleado();
  }



}