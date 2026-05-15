import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { PermisosService } from 'src/app/services/permisos.service';
import { FeriadosService, IFeriado } from 'src/app/services/feriados.service';
import { DocumentosService } from 'src/app/services/documentos.service';

@Component({
  selector: 'app-registrar-permiso',
  templateUrl: './registrar-permiso.page.html',
  styleUrls: ['./registrar-permiso.page.scss'],
})
export class RegistrarPermisoPage implements OnInit {

  tiposPermiso: any[] = [];
  tipoPermisoSeleccionado: number | null = null;

  modoSolicitud: 'DIAS' | 'HORAS' = 'DIAS';
  permiteHoras = false;

  incluirFeriadosSeleccionado: boolean | null = null;
  requiereDocumento = false;

  fechaInicio = '';
  fechaFinal = '';
  fechaHoras = '';
  horaInicio = '';
  horaFinal = '';

  observacion = '';

  diasFeriados = 0;
  saldoVacacionesVisible = '—';
  cargandoSaldo = false;

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

  feriados: IFeriado[] = [];

  idEmpleado!: number;
  idSucursal!: number;

  cargandoTipos = false;
  cargandoFeriados = false;

  excedeMaximoDias = false;
  excedeMaximoHoras = false;
  incumpleAnticipacion = false;
  incumpleDiasAnteriores = false;

  constructor(
    private permisosService: PermisosService,
    private feriadosService: FeriadosService,
    private documentosService: DocumentosService,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.idEmpleado = parseInt(localStorage.getItem('empleadoID') || '0', 10);
    this.idSucursal = parseInt(localStorage.getItem('csucur') || '0', 10);

    this.cargarTiposPermiso();
    this.cargarFeriados();
  }

  cargarTiposPermiso() {
    this.cargandoTipos = true;

    this.permisosService.listarTiposPermiso().subscribe({
      next: (data) => {
        const lista = Array.isArray(data) ? data : [];

        this.tiposPermiso = lista.filter(
          p => Number(p.sucursal_id) === Number(this.idSucursal)
        );

        this.cargandoTipos = false;
      },
      error: () => {
        this.tiposPermiso = [];
        this.cargandoTipos = false;
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

  onTipoPermisoChange() {
    const tipo = this.obtenerTipoSeleccionado();

    this.incluirFeriadosSeleccionado = tipo?.contar_feriados ?? false;
    this.requiereDocumento = !!tipo?.documento;

    this.modoSolicitud = 'DIAS';
    this.permiteHoras = false;

    this.saldoVacacionesVisible = '—';
    this.cargandoSaldo = false;

    this.limpiarFormularioDependiente();

    if (this.esDescuentoVacaciones(tipo)) {
      this.cargarSaldoVacacionesPermiso();
    }
  }

  cambiarModoSolicitud() {
    this.permiteHoras = this.modoSolicitud === 'HORAS';
    this.limpiarFechasYResumen();
  }

  limpiarFormularioDependiente() {
    this.fechaInicio = '';
    this.fechaFinal = '';
    this.fechaHoras = '';
    this.horaInicio = '';
    this.horaFinal = '';

    this.observacion = '';

    this.diasFeriados = 0;
    this.diasTotales = 0;
    this.horasTotales = '00:00';
    this.diaSemanaSeleccionado = null;

    this.conteoDiasSemana = { L: 0, M: 0, X: 0, J: 0, V: 0, S: 0, D: 0 };

    this.excedeMaximoDias = false;
    this.excedeMaximoHoras = false;
    this.incumpleAnticipacion = false;
    this.incumpleDiasAnteriores = false;

    this.verificacionRealizada = false;
    this.estadoVerificacion = '';
    this.mensajeVerificacion = '';
    this.resultadoVerificacionDetalle = null;
  }

  limpiarFechasYResumen() {
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

    this.invalidarVerificacion();
  }

  onFechasChange() {
    this.invalidarVerificacion();

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
    this.excedeMaximoDias = false;
    this.incumpleAnticipacion = false;
    this.incumpleDiasAnteriores = false;

    if (!this.fechaInicio || !this.fechaFinal) return;

    const inicio = new Date(this.fechaInicio + 'T00:00:00');
    const fin = new Date(this.fechaFinal + 'T00:00:00');

    if (fin < inicio) {
      this.mostrarToast('La fecha fin no puede ser menor que la fecha inicio.', 'warning');
      return;
    }

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

      const fechaActual = this.formatearFechaLocal(actual);

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

    this.validarMaximoDias();
    this.validarReglasAnticipacionYRetroactividadPorDias(inicio);
  }

  actualizarResumenPorHoras() {
    this.diaSemanaSeleccionado = null;
    this.horasTotales = '00:00';
    this.diasFeriados = 0;
    this.excedeMaximoHoras = false;
    this.incumpleAnticipacion = false;
    this.incumpleDiasAnteriores = false;

    if (!this.fechaHoras || !this.horaInicio || !this.horaFinal) return;

    const fecha = new Date(this.fechaHoras + 'T00:00:00');
    const day = fecha.getDay();
    const dias = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    this.diaSemanaSeleccionado = dias[day];

    const [h1, m1] = this.horaInicio.split(':').map(Number);
    const [h2, m2] = this.horaFinal.split(':').map(Number);

    const minutosInicio = h1 * 60 + m1;
    const minutosFin = h2 * 60 + m2;

    if (minutosFin <= minutosInicio) {
      this.horaFinal = '';
      this.horasTotales = '00:00';
      this.mostrarToast('La hora fin debe ser mayor que la hora inicio.', 'warning');
      return;
    }

    const totalMinutos = minutosFin - minutosInicio;

    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;

    this.horasTotales = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;

    const esFeriado = this.feriados.some(f => String(f.fecha).substring(0, 10) === this.fechaHoras);
    this.diasFeriados = esFeriado ? 1 : 0;

    this.validarMaximoHoras();
    this.validarReglasAnticipacionYRetroactividadPorHoras(fecha);
  }

  validarMaximoDias() {
    const tipo = this.obtenerTipoSeleccionado();
    const maxDias = tipo?.dias_maximo_permiso ?? null;

    if (maxDias !== null && this.diasTotales > Number(maxDias)) {
      this.excedeMaximoDias = true;
      this.mostrarToast(
        `El número de días seleccionados (${this.diasTotales}) supera el máximo permitido (${maxDias}).`,
        'warning'
      );
    }
  }

  validarMaximoHoras() {
    const tipo = this.obtenerTipoSeleccionado();
    const maxHoras = tipo?.horas_maximo_permiso ?? null;

    if (!maxHoras) return;

    const maxMinutos = this.convertirHorasAMinutos(maxHoras);
    const totalMinutos = this.convertirHorasAMinutos(this.horasTotales);

    if (totalMinutos > maxMinutos) {
      this.excedeMaximoHoras = true;
      this.mostrarToast(
        `El número de horas seleccionadas (${this.horasTotales}) supera el máximo permitido (${maxHoras}).`,
        'warning'
      );
    }
  }

  validarReglasAnticipacionYRetroactividadPorDias(fechaInicio: Date) {
    const tipo = this.obtenerTipoSeleccionado();
    if (!tipo) return;

    const diasAnticipar = tipo.dias_anticipar_permiso ?? 0;
    const diasAnteriores = tipo.crear_dias_anteriores ?? 0;

    const hoy = this.normalizarFecha(new Date());
    const inicio = this.normalizarFecha(fechaInicio);

    const diferencia = this.diferenciaDias(hoy, inicio);

    if (diasAnticipar > 0 && inicio >= hoy && diferencia < diasAnticipar) {
      this.incumpleAnticipacion = true;
      this.mostrarToast(
        `Para este permiso debe solicitar con al menos ${diasAnticipar} día(s) de anticipación.`,
        'warning'
      );
    }

    if (diasAnteriores > 0 && inicio < hoy) {
      const diasAtras = this.diferenciaDias(inicio, hoy);

      if (diasAtras > diasAnteriores) {
        this.incumpleDiasAnteriores = true;
        this.mostrarToast(
          `Este permiso solo puede registrarse hasta ${diasAnteriores} día(s) después de la fecha del evento.`,
          'warning'
        );
      }
    }
  }

  validarReglasAnticipacionYRetroactividadPorHoras(fecha: Date) {
    this.validarReglasAnticipacionYRetroactividadPorDias(fecha);
  }

  verificarSolicitud() {
    this.verificacionRealizada = false;
    this.estadoVerificacion = '';
    this.mensajeVerificacion = '';
    this.resultadoVerificacionDetalle = null;

    const tipo = this.obtenerTipoSeleccionado();

    if (!tipo) {
      this.finalizarVerificacion('error', 'Seleccione un tipo de permiso.');
      return;
    }

    if (this.excedeMaximoDias) {
      this.finalizarVerificacion('error', 'El tiempo seleccionado supera el máximo de días permitido.');
      return;
    }

    if (this.excedeMaximoHoras) {
      this.finalizarVerificacion('error', 'El tiempo seleccionado supera el máximo de horas permitido.');
      return;
    }

    if (this.incumpleAnticipacion || this.incumpleDiasAnteriores) {
      this.finalizarVerificacion('error', 'La solicitud no cumple con las reglas de fechas configuradas.');
      return;
    }

    const payload: any = {
      empleados: [this.idEmpleado],
      incluirFeriados: !!tipo.contar_feriados,
      permiteHoras: this.permiteHoras,
      tipoDescuento: tipo.tipo_descuento
    };

    if (!this.permiteHoras) {
      if (!this.fechaInicio || !this.fechaFinal) {
        this.finalizarVerificacion('error', 'Ingrese la fecha inicial y la fecha final.');
        return;
      }

      payload.fechaInicio = this.fechaInicio;
      payload.fechaFin = this.fechaFinal;
      payload.numHoras = '00:00';
    } else {
      if (!this.fechaHoras || !this.horaInicio || !this.horaFinal) {
        this.finalizarVerificacion('error', 'Complete la fecha y el rango de horas.');
        return;
      }

      payload.fechaInicio = this.fechaHoras;
      payload.fechaFin = this.fechaHoras;
      payload.numHoras = this.horasTotales || '00:00';
      payload.horaInicio = this.horaInicio;
      payload.horaFin = this.horaFinal;
    }

    this.permisosService.verificarPermisosDescontandoVacaciones(payload).subscribe({
      next: (resultados) => {
        if (!Array.isArray(resultados) || resultados.length === 0) {
          this.finalizarVerificacion('error', 'No se obtuvo respuesta de la verificación.');
          return;
        }

        const resultado = resultados[0];
        this.resultadoVerificacionDetalle = resultado;

        if (resultado.observacion !== 'Ok') {
          this.finalizarVerificacion(
            'error',
            resultado.observacion || 'La solicitud no pasó la verificación.'
          );
          return;
        }

        this.calcularTiempoPermiso(payload);
      },
      error: () => {
        this.finalizarVerificacion('error', 'Ocurrió un error al verificar la solicitud.');
      }
    });
  }

  calcularTiempoPermiso(payloadVerificacion: any) {
    const tipo = this.obtenerTipoSeleccionado();

    if (!tipo) {
      this.finalizarVerificacion('error', 'No se encontró el tipo de permiso.');
      return;
    }

    const payloadTiempo: any = {
      empleados: [this.idEmpleado],
      fechaInicio: payloadVerificacion.fechaInicio,
      fechaFin: payloadVerificacion.fechaFin,
      permiteHoras: this.permiteHoras,
      incluirFeriados: !!tipo.contar_feriados,
      horaInicio: this.permiteHoras ? this.horaInicio : undefined,
      horaFin: this.permiteHoras ? this.horaFinal : undefined,
      idTipoPermiso: tipo.id
    };

    this.permisosService.calcularTiempoPermiso(payloadTiempo).subscribe({
      next: (tiempos) => {
        const tiempoEmpleado = Array.isArray(tiempos) ? tiempos[0] : null;

        if (this.esDescuentoVacaciones(tipo)) {
          this.saldoVacacionesVisible = tiempoEmpleado?.saldoVacacionesTexto || '—';
        }

        this.finalizarVerificacion('ok', 'La solicitud pasó la verificación correctamente.');
      },
      error: () => {
        this.finalizarVerificacion('error', 'La solicitud fue verificada, pero no se pudo calcular el tiempo.');
      }
    });
  }

  registrarSolicitud() {
    if (!this.verificacionRealizada || this.estadoVerificacion !== 'ok') {
      this.mostrarToast('Primero debe verificar correctamente la solicitud.', 'warning');
      return;
    }

    const tipo = this.obtenerTipoSeleccionado();

    if (!tipo) {
      this.mostrarToast('No se encontró el tipo de permiso seleccionado.', 'warning');
      return;
    }

    if (this.requiereDocumento && !this.archivoSeleccionado) {
      this.mostrarToast('Este tipo de permiso requiere adjuntar un documento.', 'warning');
      return;
    }

    if (this.archivoSeleccionado && this.archivoSeleccionado.size > 2e6) {
      this.mostrarToast('El archivo ha excedido el tamaño permitido. Máximo 2MB.', 'warning');
      return;
    }

    const esPorHoras = this.permiteHoras;

    const fechaInicioSolicitud = esPorHoras ? this.fechaHoras : this.fechaInicio;
    const fechaFinalSolicitud = esPorHoras ? this.fechaHoras : this.fechaFinal;

    const payload: any = {
      subir_documento: !!this.archivoSeleccionado,
      id_tipo_permiso: this.tipoPermisoSeleccionado,
      id_empleado: this.idEmpleado,
      descripcion: this.observacion || '',
      fecha_inicio: fechaInicioSolicitud,
      fecha_final: fechaFinalSolicitud,
      incluir_feriados: !!tipo.contar_feriados,

      permite_horas: esPorHoras,
      hora_inicio: esPorHoras ? this.horaInicio : null,
      hora_fin: esPorHoras ? this.horaFinal : null,
      num_horas: esPorHoras ? this.horasTotales || '00:00' : '00:00',
      dias_permiso: esPorHoras ? 0 : this.diasTotales,
      minutos_totales: esPorHoras ? this.calcularMinutosTotales() : 0,

      numero_dias_lunes: esPorHoras ? 0 : this.conteoDiasSemana.L,
      numero_dias_martes: esPorHoras ? 0 : this.conteoDiasSemana.M,
      numero_dias_miercoles: esPorHoras ? 0 : this.conteoDiasSemana.X,
      numero_dias_jueves: esPorHoras ? 0 : this.conteoDiasSemana.J,
      numero_dias_viernes: esPorHoras ? 0 : this.conteoDiasSemana.V,
      numero_dias_sabados: esPorHoras ? 0 : this.conteoDiasSemana.S,
      numero_dias_domingos: esPorHoras ? 0 : this.conteoDiasSemana.D
    };

    this.permisosService.registrarPermiso(payload).subscribe({
      next: (response) => {
        const solicitudCreada = response?.data ?? response ?? null;

        if (!solicitudCreada || !solicitudCreada.id) {
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
            'permisos'
          ).subscribe({
            next: () => {
              this.mostrarToast('Solicitud de permiso registrada correctamente.', 'success');
              this.router.navigateByUrl('/reloj/solicitudes/permiso-solicitud');
            },
            error: () => {
              this.mostrarToast('La solicitud se registró, pero ocurrió un error al subir el documento.', 'warning');
            }
          });

          return;
        }

        this.mostrarToast('Solicitud de permiso registrada correctamente.', 'success');
        this.router.navigateByUrl('/reloj/solicitudes/permiso-solicitud');
      },
      error: () => {
        this.mostrarToast('Ocurrió un error al registrar la solicitud.', 'danger');
      }
    });
  }

  seleccionarArchivo(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.archivoSeleccionado = file;
    this.nombreArchivo = file.name;

    this.invalidarVerificacion();
  }

  quitarArchivo() {
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
  }

  puedeVerificar(): boolean {
    if (!this.tipoPermisoSeleccionado) return false;
    if (this.excedeMaximoDias || this.excedeMaximoHoras) return false;
    if (this.incumpleAnticipacion || this.incumpleDiasAnteriores) return false;

    if (!this.permiteHoras) {
      return !!this.fechaInicio && !!this.fechaFinal;
    }

    return !!this.fechaHoras && !!this.horaInicio && !!this.horaFinal;
  }

  puedeRegistrar(): boolean {
    return this.verificacionRealizada && this.estadoVerificacion === 'ok';
  }

  obtenerTipoSeleccionado() {
    return this.tiposPermiso.find(
      t => Number(t.id) === Number(this.tipoPermisoSeleccionado)
    );
  }

  esDescuentoVacaciones(tipo: any): boolean {
    return String(tipo?.tipo_descuento || '').trim().toUpperCase() === 'VACACIONES';
  }

  cargarSaldoVacacionesPermiso() {
    const tipo = this.obtenerTipoSeleccionado();

    if (!tipo || !this.esDescuentoVacaciones(tipo)) {
      this.saldoVacacionesVisible = '—';
      this.cargandoSaldo = false;
      return;
    }

    if (!this.idEmpleado) {
      this.saldoVacacionesVisible = '—';
      this.cargandoSaldo = false;
      return;
    }

    this.cargandoSaldo = true;

    const fechaISO = this.formatearFechaLocal(new Date());

    const payloadTiempo: any = {
      empleados: [this.idEmpleado],
      fechaInicio: fechaISO,
      fechaFin: fechaISO,
      permiteHoras: false,
      incluirFeriados: false,
      horaInicio: undefined,
      horaFin: undefined,
      idTipoPermiso: tipo.id
    };

    this.permisosService.calcularTiempoPermiso(payloadTiempo).subscribe({
      next: (tiempos) => {
        const tiemposArr = Array.isArray(tiempos) ? tiempos : [];

        const tiempoEmpleado = tiemposArr.find(
          (t: any) => Number(t.idEmpleado) === Number(this.idEmpleado)
        );

        this.saldoVacacionesVisible = tiempoEmpleado?.saldoVacacionesTexto || '—';
        this.cargandoSaldo = false;
      },
      error: () => {
        this.saldoVacacionesVisible = '—';
        this.cargandoSaldo = false;
      }
    });
  }

  finalizarVerificacion(estado: string, mensaje: string) {
    this.estadoVerificacion = estado;
    this.mensajeVerificacion = mensaje;
    this.verificacionRealizada = true;
  }

  invalidarVerificacion() {
    this.verificacionRealizada = false;
    this.estadoVerificacion = '';
    this.mensajeVerificacion = '';
    this.resultadoVerificacionDetalle = null;
  }

  calcularMinutosTotales(): number {
    if (!this.horaInicio || !this.horaFinal) return 0;

    const [h1, m1] = this.horaInicio.split(':').map(Number);
    const [h2, m2] = this.horaFinal.split(':').map(Number);

    return Math.max(0, (h2 * 60 + m2) - (h1 * 60 + m1));
  }

  convertirHorasAMinutos(valor: string): number {
    if (!valor) return 0;

    const partes = valor.split(':').map(Number);
    const h = partes[0] || 0;
    const m = partes[1] || 0;
    const s = partes[2] || 0;

    return h * 60 + m + Math.floor(s / 60);
  }

  normalizarFecha(fecha: Date): Date {
    const f = new Date(fecha);
    f.setHours(0, 0, 0, 0);
    return f;
  }

  diferenciaDias(fechaInicio: Date, fechaFin: Date): number {
    const msDia = 1000 * 60 * 60 * 24;
    return Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / msDia);
  }

  formatearFechaLocal(fecha: Date): string {
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
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

  resetearFormularioCompleto() {
    this.tipoPermisoSeleccionado = null;
    this.modoSolicitud = 'DIAS';
    this.permiteHoras = false;
    this.incluirFeriadosSeleccionado = null;
    this.requiereDocumento = false;

    this.fechaInicio = '';
    this.fechaFinal = '';
    this.fechaHoras = '';
    this.horaInicio = '';
    this.horaFinal = '';
    this.observacion = '';

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

    this.excedeMaximoDias = false;
    this.excedeMaximoHoras = false;
    this.incumpleAnticipacion = false;
    this.incumpleDiasAnteriores = false;
  }
}