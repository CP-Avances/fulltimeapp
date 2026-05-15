import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { VacacionesService } from 'src/app/services/vacaciones.service';
import { FeriadosService, IFeriado } from 'src/app/services/feriados.service';
import { DocumentosService } from 'src/app/services/documentos.service';

@Component({
  selector: 'app-vacacion-editar-solicitud',
  templateUrl: './vacacion-editar-solicitud.page.html',
  styleUrls: ['./vacacion-editar-solicitud.page.scss'],
})
export class VacacionEditarSolicitudPage implements OnInit {

  solicitud: any = null;

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
  resultadoVerificacionDetalle: any = null;

  nombreArchivo = '';
  archivoSeleccionado: File | null = null;
  documentoOriginal = '';
  documentoPendienteEliminar = false;

  feriados: IFeriado[] = [];

  idEmpleado!: number;
  idSucursal!: number;

  cargandoTipos = false;
  cargandoSaldo = false;
  cargandoFeriados = false;
  actualizando = false;

  debeVerificarProgramacion = false;

  constructor(
    private vacacionesService: VacacionesService,
    private feriadosService: FeriadosService,
    private documentosService: DocumentosService,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    this.solicitud = navigation?.extras?.state?.['solicitud'] || history.state?.solicitud || null;

    if (!this.solicitud) {
      this.mostrarToast('No se encontró la solicitud para editar.', 'warning');
      this.router.navigateByUrl('/reloj/solicitudes/vacacion-solicitud/vacacion-criterio-busqueda');
      return;
    }

    this.idEmpleado = Number(this.solicitud.id_empleado || localStorage.getItem('empleadoID') || 0);
    this.idSucursal = parseInt(localStorage.getItem('csucur') || '0', 10);

    this.precargarFormulario();
    this.cargarTiposVacacion();
    this.cargarSaldoEmpleado();
    this.cargarFeriados();
  }

  obtenerIdSolicitud(): number {
    return Number(this.solicitud?.id_solicitud_vacacion || this.solicitud?.id || 0);
  }

  precargarFormulario() {
    this.tipoVacacionSeleccionado = Number(this.solicitud.id_configuracion);

    this.fechaInicio = this.formatearFechaInput(this.solicitud.fecha_inicio);
    this.fechaFinal = this.formatearFechaInput(this.solicitud.fecha_final);
    this.fechaHoras = this.formatearFechaInput(this.solicitud.fecha_inicio);

    this.conteoDiasSemana = {
      L: Number(this.solicitud.numero_dias_lunes || 0),
      M: Number(this.solicitud.numero_dias_martes || 0),
      X: Number(this.solicitud.numero_dias_miercoles || 0),
      J: Number(this.solicitud.numero_dias_jueves || 0),
      V: Number(this.solicitud.numero_dias_viernes || 0),
      S: Number(this.solicitud.numero_dias_sabado || 0),
      D: Number(this.solicitud.numero_dias_domingo || 0),
    };

    this.diasTotales = Number(this.solicitud.numero_dias_totales || 0);
    this.incluirFeriadosSeleccionado = !!this.solicitud.incluir_feriados;

    this.documentoOriginal = this.solicitud.documento || '';
    this.nombreArchivo = this.documentoOriginal;

    const minutos = Number(this.solicitud.minutos_totales || 0);
    if (minutos > 0) {
      const horas = Math.floor(minutos / 60);
      const mins = minutos % 60;

      this.horasTotales = `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      this.horaInicio = '';
      this.horaFinal = '';
    }
  }

  cargarTiposVacacion() {
    this.cargandoTipos = true;

    this.vacacionesService.ListarTodasConfiguraciones().subscribe({
      next: (data) => {
        const lista = Array.isArray(data) ? data : [];
        this.tiposVacacion = lista.filter(v => Number(v.sucursal_id) === Number(this.idSucursal));

        this.aplicarConfiguracionTipo();
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

  aplicarConfiguracionTipo() {
    const tipo = this.tiposVacacion.find(t => Number(t.id) === Number(this.tipoVacacionSeleccionado));

    this.permiteHoras = !!tipo?.permite_horas;
    this.incluirFeriadosSeleccionado = tipo?.incluir_feriados ?? this.incluirFeriadosSeleccionado;
    this.requiereDocumento = !!tipo?.documento;
  }

  onTipoVacacionChange() {
    this.aplicarConfiguracionTipo();
    this.limpiarVerificacion();

    if (!this.permiteHoras) {
      this.fechaHoras = '';
      this.horaInicio = '';
      this.horaFinal = '';
      this.calcularDias();
    } else {
      this.fechaInicio = '';
      this.fechaFinal = '';
      this.conteoDiasSemana = { L: 0, M: 0, X: 0, J: 0, V: 0, S: 0, D: 0 };
      this.diasTotales = 0;
      this.actualizarResumenPorHoras();
    }
  }

  onFechasChange() {
    this.limpiarVerificacion();

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

    const esFeriado = this.feriados.some(f => String(f.fecha).substring(0, 10) === this.fechaHoras);
    this.diasFeriados = esFeriado ? 1 : 0;
  }

  seleccionarArchivo(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.archivoSeleccionado = file;
    this.nombreArchivo = file.name;
    this.documentoPendienteEliminar = false;
    this.limpiarVerificacion();
  }

  quitarArchivo() {
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    this.documentoPendienteEliminar = !!this.documentoOriginal;
    this.limpiarVerificacion();
  }

  verificarSolicitud() {
    this.limpiarVerificacion();

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

      if (new Date(this.fechaFinal) < new Date(this.fechaInicio)) {
        this.estadoVerificacion = 'error';
        this.mensajeVerificacion = 'La fecha final debe ser posterior o igual a la fecha inicial.';
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
          excluir_solicitud_actual: this.obtenerIdSolicitud()
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

  actualizarSolicitud() {
    if (!this.verificacionRealizada || this.estadoVerificacion !== 'ok') {
      this.mostrarToast('Primero debe verificar correctamente la solicitud.', 'warning');
      return;
    }

    const tipoSeleccionado = this.obtenerTipoSeleccionado();

    if (!tipoSeleccionado) {
      this.mostrarToast('No se encontró el tipo de vacación seleccionado.', 'warning');
      return;
    }

    const tieneDocumentoActual = !!this.documentoOriginal && !this.documentoPendienteEliminar;
    const tieneDocumentoNuevo = !!this.archivoSeleccionado;

    if (this.requiereDocumento && !tieneDocumentoActual && !tieneDocumentoNuevo) {
      this.mostrarToast('Este tipo de vacación requiere adjuntar un documento.', 'warning');
      return;
    }

    const esPorHoras = this.permiteHoras;

    const fechaInicioSolicitud = esPorHoras ? this.fechaHoras : this.fechaInicio;
    const fechaFinalSolicitud = esPorHoras ? this.fechaHoras : this.fechaFinal;

    const payload: any = {
      id_solicitud_vacacion: this.obtenerIdSolicitud(),
      id_configuracion: this.tipoVacacionSeleccionado,
      fecha_inicio: fechaInicioSolicitud,
      fecha_final: fechaFinalSolicitud,
      numero_dias_lunes: esPorHoras ? 0 : this.conteoDiasSemana.L,
      numero_dias_martes: esPorHoras ? 0 : this.conteoDiasSemana.M,
      numero_dias_miercoles: esPorHoras ? 0 : this.conteoDiasSemana.X,
      numero_dias_jueves: esPorHoras ? 0 : this.conteoDiasSemana.J,
      numero_dias_viernes: esPorHoras ? 0 : this.conteoDiasSemana.V,
      numero_dias_sabado: esPorHoras ? 0 : this.conteoDiasSemana.S,
      numero_dias_domingo: esPorHoras ? 0 : this.conteoDiasSemana.D,
      numero_dias_totales: esPorHoras ? 0 : this.diasTotales,
      incluir_feriados: this.incluirFeriadosSeleccionado ?? false,
      documento: this.documentoPendienteEliminar ? null : this.documentoOriginal,
      minutos_totales: esPorHoras ? this.calcularMinutosTotales() : 0
    };

    this.actualizando = true;

    this.vacacionesService.EditarSolicitudesVacaciones(payload).subscribe({
      next: (solicitudActualizada) => {
        this.procesarDocumentoDespuesActualizar(solicitudActualizada);
      },
      error: (err) => {
        this.actualizando = false;
        this.mostrarToast(err?.message || 'Ocurrió un error al actualizar la solicitud.', 'danger');
      }
    });
  }

  procesarDocumentoDespuesActualizar(solicitudActualizada: any) {
    const idSolicitud = this.obtenerIdSolicitud();

    if (this.archivoSeleccionado) {
      const formData = new FormData();
      formData.append('uploads', this.archivoSeleccionado, this.archivoSeleccionado.name);

      this.documentosService.SubirDocumento(
        formData,
        idSolicitud,
        this.idEmpleado,
        'vacaciones'
      ).subscribe({
        next: () => {
          this.actualizando = false;
          this.mostrarToast('Solicitud actualizada correctamente.', 'success');
          this.regresarDetalleConSolicitudActualizada(solicitudActualizada);
        },
        error: () => {
          this.actualizando = false;
          this.mostrarToast('La solicitud se actualizó, pero ocurrió un error al subir el documento.', 'warning');
          this.regresarDetalleConSolicitudActualizada(solicitudActualizada);
        }
      });

      return;
    }

    if (this.documentoPendienteEliminar) {
      this.vacacionesService.EliminarDocumentoSolicitud(idSolicitud).subscribe({
        next: () => {
          this.actualizando = false;
          this.mostrarToast('Solicitud actualizada correctamente.', 'success');
          this.regresarDetalleConSolicitudActualizada({
            ...solicitudActualizada,
            documento: null
          });
        },
        error: () => {
          this.actualizando = false;
          this.mostrarToast('La solicitud se actualizó, pero no se pudo eliminar el documento.', 'warning');
          this.regresarDetalleConSolicitudActualizada(solicitudActualizada);
        }
      });

      return;
    }

    this.actualizando = false;
    this.mostrarToast('Solicitud actualizada correctamente.', 'success');
    this.regresarDetalleConSolicitudActualizada(solicitudActualizada);
  }

  regresarDetalleConSolicitudActualizada(solicitudActualizada: any) {
    localStorage.setItem('resetBusquedaVacaciones', 'true');
    this.router.navigateByUrl(
      '/reloj/solicitudes/vacacion-solicitud/vacacion-criterio-busqueda'
    );
  }

  calcularMinutosTotales(): number {
    if (!this.horaInicio || !this.horaFinal) return 0;

    const [h1, m1] = this.horaInicio.split(':').map(Number);
    const [h2, m2] = this.horaFinal.split(':').map(Number);

    const total = (h2 * 60 + m2) - (h1 * 60 + m1);
    return total > 0 ? total : 0;
  }

  puedeVerificar(): boolean {
    if (!this.tipoVacacionSeleccionado) return false;

    if (!this.permiteHoras) {
      return !!this.fechaInicio && !!this.fechaFinal;
    }

    return !!this.fechaHoras && !!this.horaInicio && !!this.horaFinal;
  }

  puedeActualizar(): boolean {
    return this.verificacionRealizada && this.estadoVerificacion === 'ok' && !this.actualizando;
  }

  obtenerTipoSeleccionado() {
    return this.tiposVacacion.find(t => Number(t.id) === Number(this.tipoVacacionSeleccionado));
  }

  limpiarVerificacion() {
    this.verificacionRealizada = false;
    this.estadoVerificacion = '';
    this.mensajeVerificacion = '';
    this.resultadoVerificacionDetalle = null;
  }

  formatearFechaInput(fecha: string): string {
    if (!fecha) return '';
    return String(fecha).substring(0, 10);
  }

  regresarDetalle() {
    this.router.navigateByUrl(
      '/reloj/solicitudes/vacacion-solicitud/vacacion-detalle-solicitud',
      {
        state: {
          solicitud: this.solicitud
        }
      }
    );
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
}