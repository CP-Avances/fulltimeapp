import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { AprobacionesService } from 'src/app/services/aprobaciones.service';
import { PermisosService } from 'src/app/services/permisos.service';
import { DatosGeneralesService } from 'src/app/services/datos-generales.service';
import { firstValueFrom } from 'rxjs';

import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { TipoNotificacion } from 'src/app/interfaces/tipo-notificaciones.enum';
interface ResultadoValidacionPermiso {
  id: number;
  empleado: string;
  tipoPermiso: string;
  departamento: string;
  fechaSolicitud: any;
  fechaInicio: any;
  fechaFin: any;
  dias: number;
  minutos: number;
  esPorHoras: boolean;
  horas: string;
  horaInicio: string | null;
  horaFin: string | null;
  mensaje: string;
}
@Component({
  selector: 'app-permiso-aprobacion',
  templateUrl: './permiso-aprobacion.page.html',
  styleUrls: ['./permiso-aprobacion.page.scss'],
})
export class PermisoAprobacionPage implements OnInit {

  modoVista: 'criterios' | 'lista' | 'resultado-validacion' = 'criterios';

  idEmpleadoLogueado: number = 0;
  rolEmpleado: number = 0;

  cargandoInicial = false;
  cargando = false;

  tieneConfiguracionAprobacion = true;
  mensajeSinConfiguracion = '';

  criterioBusqueda: 'tipo' | 'dep' | 'emp' | null = null;
  fechaDesde: string = '';
  estadoSolicitud: string = 'PENDIENTE';
  
  solicitudesSeleccionadas: any[] = [];
  resultadosValidacion: ResultadoValidacionPermiso[] = [];
  solicitudesProcesadasExitosamente = 0;

  procesandoMultiple = false;

  selectorAbierto = false;
  tipoSelectorActivo: 'tipo' | 'dep' | 'emp' | null = null;
  filtroSelector = '';
  seleccionTemporal: number[] = [];

  estados = [
    { valor: 'PENDIENTE', etiqueta: 'Pendiente' },
    { valor: 'PRE_AUTORIZADO', etiqueta: 'Pre-Autorizado' },
    { valor: 'AUTORIZADO', etiqueta: 'Autorizado' },
    { valor: 'NO_AUTORIZADO', etiqueta: 'No-Autorizado' },
  ];

  tiposPermiso: any[] = [];
  departamentos: any[] = [];
  empleados: any[] = [];

  empleadosAll: any[] = [];
  departamentosAll: any[] = [];
  sucursalesAll: any[] = [];

  idsTipoPermisoSeleccionados: number[] = [];
  idsDepartamentoSeleccionados: number[] = [];
  idsEmpleadoSeleccionados: number[] = [];

  solicitudes: any[] = [];
  solicitudesPaginadas: any[] = [];

  page = 0;
  pageSize = 10;

  scopeAprobacion: any = null;

  private miDepId: number | null = null;
  private miSucId: number | null = null;

  constructor(
    private aprobacionesService: AprobacionesService,
    private permisosService: PermisosService,
    private datosGeneralesService: DatosGeneralesService,
    private notificacionesService: NotificacionesService,
    private toastController: ToastController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.inicializarPantalla();
  }

  ionViewWillEnter() {
    this.inicializarPantalla();
  }

  inicializarPantalla() {
    this.idEmpleadoLogueado = Number(localStorage.getItem('empleadoID') ?? 0);
    this.rolEmpleado = Number(localStorage.getItem('rol') ?? 0);
    this.fechaDesde = this.obtenerFechaHoy();
    this.modoVista = 'criterios';
    this.solicitudes = [];
    this.solicitudesPaginadas = [];
    this.solicitudesSeleccionadas = [];
    this.resultadosValidacion = [];
    this.solicitudesProcesadasExitosamente = 0;
    this.procesandoMultiple = false;
    this.cargarDatosIniciales();
  }


  cargarDatosIniciales() {
    this.cargandoInicial = true;

    this.validarScopeAprobacion();
    this.cargarTiposPermiso();
    this.cargarInformacionGeneral();
  }

  validarScopeAprobacion() {
    if (this.rolEmpleado === 1) {
      this.tieneConfiguracionAprobacion = true;
      return;
    }

    this.aprobacionesService.ObtenerScopeFiltrosPermisos().subscribe({
      next: (res: any) => {
        this.scopeAprobacion = res;

        const idsDepartamentoAprobables = Array.isArray(res?.idsDepartamentoAprobables)
          ? res.idsDepartamentoAprobables
          : [];

        if (idsDepartamentoAprobables.length === 0) {
          this.tieneConfiguracionAprobacion = false;
          this.mensajeSinConfiguracion = 'No tiene solicitudes de permisos configuradas para aprobación.';
          this.cargandoInicial = false;
          return;
        }

        this.tieneConfiguracionAprobacion = true;
      },
      error: () => {
        this.tieneConfiguracionAprobacion = false;
        this.mensajeSinConfiguracion = 'No se pudo validar su configuración de aprobación.';
        this.cargandoInicial = false;
      }
    });
  }

  cargarTiposPermiso() {
    this.permisosService.listarTiposPermiso().subscribe({
      next: (res: any[]) => {
        this.tiposPermiso = Array.isArray(res) ? res : [];
      },
      error: () => {
        this.tiposPermiso = [];
      }
    });
  }

  cargarInformacionGeneral() {
    this.datosGeneralesService.ObtenerInformacionGeneral(1).subscribe({
      next: (res: any[]) => {
        this.procesarInformacionGeneral(res);

        this.cargandoInicial = false;
      },
      error: () => {
        this.empleados = [];
        this.departamentos = [];
        this.sucursalesAll = [];

        this.cargandoInicial = false;
      }
    });
  }

  procesarInformacionGeneral(data: any[]) {
    const informacion = Array.isArray(data) ? data : [];

    this.empleadosAll = informacion.map((item: any) => {
      const idDepartamento = Number(
        item.id_depa ??
        item.id_departamento ??
        item.departamento_id ??
        0
      );

      const idSucursal = Number(
        item.id_suc ??
        item.id_sucursal ??
        item.sucursal_id ??
        0
      );

      const nombreDepartamento =
        item.departamento ??
        item.nombre_departamento ??
        item.name_dep ??
        '';

      const nombreSucursal =
        item.sucursal ??
        item.nombre_sucursal ??
        item.name_suc ??
        '';

      return {
        id: Number(item.id ?? item.id_empleado ?? item.idEmpleado ?? 0),
        identificacion: item.identificacion ?? item.cedula ?? '',
        codigo: item.codigo ?? item.codigo_empleado ?? '',
        nombre: item.nombre ?? item.nombres ?? '',
        apellido: item.apellido ?? item.apellidos ?? '',
        id_depa: idDepartamento,
        id_suc: idSucursal,
        departamento: nombreDepartamento,
        sucursal: nombreSucursal
      };
    }).filter((e: any) => e.id > 0);

    const empleadoSesion = this.empleadosAll.find(
      (e: any) => Number(e.id) === Number(this.idEmpleadoLogueado)
    );

    this.miDepId = empleadoSesion?.id_depa ? Number(empleadoSesion.id_depa) : null;
    this.miSucId = empleadoSesion?.id_suc ? Number(empleadoSesion.id_suc) : null;

    const mapaDepartamentos = new Map<number, any>();

    this.empleadosAll.forEach((e: any) => {
      if (!e.id_depa) return;

      if (!mapaDepartamentos.has(Number(e.id_depa))) {
        mapaDepartamentos.set(Number(e.id_depa), {
          id: Number(e.id_depa),
          departamento: e.departamento || 'Sin departamento',
          sucursal: e.sucursal || ''
        });
      }
    });

    this.departamentosAll = Array.from(mapaDepartamentos.values());

    this.aplicarScopeFiltros();
  }

  aplicarScopeFiltros() {

    if (this.rolEmpleado === 1) {
      this.empleados = [...this.empleadosAll];
      this.departamentos = [...this.departamentosAll];
      return;
    }

    const scopeDeps = new Set<number>(
      (this.scopeAprobacion?.idsDepartamentoAprobables || []).map((x: any) => Number(x))
    );
    if (scopeDeps.size === 0) {
      this.empleados = [];
      this.departamentos = [];
      return;
    }

    this.departamentos = this.departamentosAll.filter((d: any) =>
      scopeDeps.has(Number(d.id))
    );

    this.empleados = this.empleadosAll.filter((e: any) => {
      const depEmp = Number(e.id_depa);
      return scopeDeps.has(depEmp);
    });
  }

  onCriterioChange() {
    this.idsTipoPermisoSeleccionados = [];
    this.idsDepartamentoSeleccionados = [];
    this.idsEmpleadoSeleccionados = [];
    this.solicitudes = [];
  }

  buscarSolicitudes(mostrarMensajeResultado: boolean = true) {
    if (!this.validarFormularioBusqueda()) return;

    const payload: any = {
      criterio: this.obtenerCriterioBackend(),
      fechaDesde: this.fechaDesde,
      estado: this.estadoSolicitud,
      idsTipoPermiso: [],
      idsDepartamento: [],
      idsEmpleado: []
    };

    if (this.criterioBusqueda === 'tipo') {
      payload.idsTipoPermiso = this.idsTipoPermisoSeleccionados;
    }

    if (this.criterioBusqueda === 'dep') {
      payload.idsDepartamento = this.idsDepartamentoSeleccionados;
    }

    if (this.criterioBusqueda === 'emp') {
      payload.idsEmpleado = this.idsEmpleadoSeleccionados;
    }

    this.cargando = true;

    this.solicitudes = [];
    this.solicitudesPaginadas = [];
    this.solicitudesSeleccionadas = [];
    this.procesandoMultiple = false;

    this.permisosService.buscarSolicitudesPermisos(payload).subscribe({

      next: async (resp: any) => {

        const solicitudes = Array.isArray(resp?.data)
          ? resp.data
          : [];

        await this.filtrarSolicitudesAprobables(solicitudes);

        this.page = 0;
        this.actualizarPaginacion();

        this.resultadosValidacion = [];
        this.solicitudesProcesadasExitosamente = 0;

        this.cargando = false;
        this.modoVista = 'lista';

        if (
          mostrarMensajeResultado &&
          this.solicitudes.length === 0
        ) {
          this.mostrarToast(
            'No existen solicitudes pendientes de aprobación para usted.',
            'warning'
          );
        }
      },

      error: () => {
        this.cargando = false;
        this.mostrarToast(
          'No se pudieron consultar las solicitudes de permisos.',
          'danger'
        );
      }

    });
  }

  async filtrarSolicitudesAprobables(solicitudes: any[]) {
    const solicitudesAprobables: any[] = [];

    for (const solicitud of solicitudes) {
      try {
        const payloadValidar = {
          modulo: 'PERMISO' as const,
          id_solicitud_modulo: Number(solicitud.id)
        };

        const validacion: any = await this.aprobacionesService
          .ValidarAccionesSolicitud(payloadValidar)
          .toPromise();

        const acciones = validacion?.acciones ?? {};

        const puedePreautorizar = acciones?.puede_preautorizar === true;
        const puedeAutorizar = acciones?.puede_autorizar === true;
        const puedeNegar = acciones?.puede_negar === true;

        const puedeActuar =
          puedePreautorizar ||
          puedeAutorizar ||
          puedeNegar;

        if (puedeActuar) {
          solicitudesAprobables.push({
            ...solicitud,
            validacionAprobacion: validacion,
            accionesAprobacion: {
              puede_preautorizar: puedePreautorizar,
              puede_autorizar: puedeAutorizar,
              puede_negar: puedeNegar
            }
          });
        }

      } catch (error) {
        console.log('Error validando acciones solicitud:', solicitud?.id, error);
      }
    }

    this.solicitudes = solicitudesAprobables;

  }

  obtenerCriterioBackend(): 'TIPO' | 'DEP' | 'EMP' {
    if (this.criterioBusqueda === 'tipo') return 'TIPO';
    if (this.criterioBusqueda === 'dep') return 'DEP';
    return 'EMP';
  }

  validarFormularioBusqueda(): boolean {
    if (!this.tieneConfiguracionAprobacion) {
      this.mostrarToast(this.mensajeSinConfiguracion, 'warning');
      return false;
    }

    if (!this.criterioBusqueda) {
      this.mostrarToast('Debe seleccionar un criterio de búsqueda.', 'warning');
      return false;
    }

    if (!this.fechaDesde) {
      this.mostrarToast('Debe seleccionar la fecha desde.', 'warning');
      return false;
    }

    if (!this.estadoSolicitud) {
      this.mostrarToast('Debe seleccionar el estado de la solicitud.', 'warning');
      return false;
    }

    if (this.criterioBusqueda === 'tipo' && this.idsTipoPermisoSeleccionados.length === 0) {
      this.mostrarToast('Debe seleccionar al menos un tipo de permiso.', 'warning');
      return false;
    }

    if (this.criterioBusqueda === 'dep' && this.idsDepartamentoSeleccionados.length === 0) {
      this.mostrarToast('Debe seleccionar al menos un departamento.', 'warning');
      return false;
    }

    if (this.criterioBusqueda === 'emp' && this.idsEmpleadoSeleccionados.length === 0) {
      this.mostrarToast('Debe seleccionar al menos un empleado.', 'warning');
      return false;
    }

    return true;
  }

  actualizarPaginacion() {
    const inicio = this.page * this.pageSize;
    const fin = inicio + this.pageSize;

    this.solicitudesPaginadas = this.solicitudes.slice(inicio, fin);
  }

  paginaSiguiente() {
    const totalPaginas = Math.ceil(this.solicitudes.length / this.pageSize);

    if (this.page + 1 < totalPaginas) {
      this.page++;
      this.actualizarPaginacion();
    }
  }

  paginaAnterior() {
    if (this.page > 0) {
      this.page--;
      this.actualizarPaginacion();
    }
  }

  volverACriterios() {
    this.modoVista = 'criterios';
    this.solicitudes = [];
    this.solicitudesPaginadas = [];
    this.solicitudesSeleccionadas = [];
    this.resultadosValidacion = [];
    this.solicitudesProcesadasExitosamente = 0;

    this.procesandoMultiple = false;
  }

  obtenerFechaHoy(): string {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');

    return `${anio}-${mes}-01`;
  }

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return 'Sin fecha';

    const date = new Date(fecha);

    return date.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getHorasFormatoHHmm(solicitud: any): string {
    const minutos = Number(solicitud?.minutos_totales ?? 0);
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  estadoTexto(estado: number | string): string {
    const estadoNumber = Number(estado);

    const estadosMap: any = {
      1: 'Pendiente',
      2: 'Pre-Autorizado',
      3: 'Autorizado',
      4: 'No Autorizado'
    };

    return estadosMap[estadoNumber] || String(estado);
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

  async mostrarToast(
    mensaje: string,
    color: 'success' | 'warning' | 'danger' | 'primary' = 'primary'
  ) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color,
      position: 'top',
      mode: 'ios'
    });

    await toast.present();
  }

  estaSeleccionada(solicitud: any): boolean {
    return this.solicitudesSeleccionadas.some(
      (s: any) => Number(s.id) === Number(solicitud.id)
    );
  }

  toggleSeleccionSolicitud(solicitud: any, seleccionado: boolean) {
    if (seleccionado) {
      const yaExiste = this.estaSeleccionada(solicitud);

      if (!yaExiste) {
        this.solicitudesSeleccionadas.push(solicitud);
      }
    } else {
      this.solicitudesSeleccionadas = this.solicitudesSeleccionadas.filter(
        (s: any) => Number(s.id) !== Number(solicitud.id)
      );
    }
  }

  seleccionarTodas() {
    this.solicitudesSeleccionadas = [...this.solicitudes];
  }

  limpiarSeleccion() {
    this.solicitudesSeleccionadas = [];
  }

  todasSeleccionadas(): boolean {
    return this.solicitudes.length > 0 &&
      this.solicitudesSeleccionadas.length === this.solicitudes.length;
  }

  toggleSeleccionarTodas(event: any) {
    const checked = event.detail.checked;

    if (checked) {
      this.seleccionarTodas();
    } else {
      this.limpiarSeleccion();
    }
  }

  puedeAprobarSeleccion(): boolean {
    return this.solicitudesSeleccionadas.length > 0 &&
      this.solicitudesSeleccionadas.every((s: any) =>
        s.accionesAprobacion?.puede_autorizar === true ||
        s.accionesAprobacion?.puede_preautorizar === true
      );
  }

  puedeRechazarSeleccion(): boolean {
    return this.solicitudesSeleccionadas.length > 0 &&
      this.solicitudesSeleccionadas.every(
        (s: any) => s.accionesAprobacion?.puede_negar === true
      );
  }

  async confirmarAccionMultiple(
    tituloAccion: 'Aprobar' | 'Rechazar',
    decision: 'APRUEBA' | 'RECHAZA'
  ) {
    if (this.solicitudesSeleccionadas.length === 0) {
      this.mostrarToast('Debe seleccionar al menos una solicitud.', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: `${tituloAccion} solicitudes`,
      message: `¿Está seguro que desea ${tituloAccion.toLowerCase()} ${this.solicitudesSeleccionadas.length} solicitud(es)?`,
      inputs: [
        {
          name: 'observacion',
          type: 'textarea',
          placeholder: 'Observación opcional'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: tituloAccion,
          handler: (data) => {
            this.ejecutarAccionMultiple(
              decision,
              data?.observacion || ''
            );
          }
        }
      ]
    });

    await alert.present();
  }

  async ejecutarAccionMultiple(
    decision: 'APRUEBA' | 'RECHAZA',
    observacion: string
  ) {

    this.procesandoMultiple = true;

    let exitosas = 0;
    let sinPermiso = 0;
    let errores = 0;

    this.resultadosValidacion = [];
    this.solicitudesProcesadasExitosamente = 0;

    const solicitudesAProcesar = [
      ...this.solicitudesSeleccionadas
    ];

    for (const solicitud of solicitudesAProcesar) {
      const snapshot = JSON.parse(
        JSON.stringify(solicitud)
      );

      try {

        await firstValueFrom(
          this.aprobacionesService.EjecutarAccionSolicitud({
            modulo: 'PERMISO',
            id_solicitud_modulo: Number(solicitud.id),
            decision,
            observacion
          })
        );

        await this.enviarComunicacionesAprobacionPermiso(
          snapshot,
          decision,
          observacion
        );

        exitosas++;

      } catch (error: any) {

        console.log(
          'Error al procesar solicitud de permiso:',
          solicitud?.id,
          error
        );

        if (error?.status === 403) {
          sinPermiso++;
          continue;
        }

        if (error?.status === 409) {

          const mensajeBackend =
            error?.error?.detalle ||
            error?.error?.message ||
            'La solicitud no cumple las validaciones actuales.';

          const nombreEmpleado = [
            snapshot?.apellido_empleado,
            snapshot?.nombre_empleado
          ]
            .filter(Boolean)
            .join(' ')
            .trim();

          const tipoPermiso =
            snapshot?.tipo_permiso_descripcion ??
            snapshot?.descripcion_tipo_permiso ??
            snapshot?.tipoPermiso ??
            snapshot?.motivo ??
            'Permiso';

          const departamento =
            snapshot?.nombre_departamento ??
            snapshot?.nom_departamento ??
            snapshot?.departamento_nombre ??
            snapshot?.departamento ??
            '';

          const dias = Number(
            snapshot?.dias_permiso ??
            snapshot?.dia ??
            snapshot?.dias ??
            0
          );

          const minutos = Number(
            snapshot?.minutos_totales ??
            0
          );

          const esPorHoras =
            dias === 0 &&
            minutos > 0;

          this.resultadosValidacion.push({

            id: Number(
              snapshot?.id ??
              snapshot?.id_permiso ??
              snapshot?.id_solicitud_permiso ??
              0
            ),

            empleado:
              nombreEmpleado ||
              `Solicitud ${snapshot?.id ?? ''}`,

            tipoPermiso:
              String(tipoPermiso),

            departamento:
              String(departamento),

            fechaSolicitud:
              snapshot?.fecha_creacion ??
              snapshot?.fecha_solicitud ??
              null,

            fechaInicio:
              snapshot?.fecha_inicio ??
              snapshot?.fecha ??
              null,

            fechaFin:
              snapshot?.fecha_final ??
              snapshot?.fecha ??
              null,

            dias,

            minutos,

            esPorHoras,

            horas:
              this.getHorasFormatoHHmmDesdeMinutos(minutos),

            horaInicio:
              snapshot?.hora_inicio ??
              null,

            horaFin:
              snapshot?.hora_fin ??
              null,

            mensaje:
              String(mensajeBackend)

          });

          continue;
        }

        errores++;
      }
    }

    this.procesandoMultiple = false;

    this.solicitudesProcesadasExitosamente = exitosas;

    if (this.resultadosValidacion.length > 0) {

      this.modoVista = 'resultado-validacion';

      return;
    }

    if (exitosas > 0) {
      await this.mostrarToast(
        `Acción aplicada a ${exitosas} solicitud(es).`,
        'success'
      );
    }

    if (sinPermiso > 0) {
      await this.mostrarToast(
        `${sinPermiso} solicitud(es) sin permisos para esa acción.`,
        'danger'
      );
    }

    if (errores > 0) {
      await this.mostrarToast(
        `${errores} solicitud(es) no pudieron procesarse.`,
        'danger'
      );
    }

    this.buscarSolicitudes(false);
  }

  
  aceptarResultadoValidacion() {
    this.buscarSolicitudes(false);
  }

  private async enviarComunicacionesAprobacionPermiso(
    snapshot: any,
    decision: 'APRUEBA' | 'RECHAZA',
    observacion: string
  ): Promise<void> {
    try {
      const idSolicitud = Number(
        snapshot?.id ??
        snapshot?.id_permiso ??
        snapshot?.id_solicitud_permiso ??
        0
      );

      const idEmpleadoSolicitante = Number(
        snapshot?.id_empleado ??
        snapshot?.empleado_id ??
        0
      );

      const idTipoPermiso = Number(
        snapshot?.id_tipo_permiso ??
        snapshot?.id_tipo_solicitud ??
        snapshot?.tipo_permiso_id ??
        0
      );

      const idDepartamento = Number(
        snapshot?.id_departamento_origen ??
        snapshot?.id_departamento ??
        snapshot?.id_depa ??
        snapshot?.id_dep ??
        0
      );

      if (!idSolicitud || !idEmpleadoSolicitante || !idTipoPermiso) {
        console.warn('No se envía comunicación de aprobación permiso: faltan datos base.', {
          idSolicitud,
          idEmpleadoSolicitante,
          idTipoPermiso,
          idDepartamento,
          snapshot
        });
        return;
      }

      const pasoActual = snapshot?.validacionAprobacion?.paso_actual ?? null;

      const accion = this.obtenerAccionPermiso(decision, pasoActual);

      const mensaje = await this.armarMensajeAprobacionPermiso(
        snapshot,
        accion,
        observacion
      );

      const destinatarios = await this.obtenerDestinatariosAprobacionPermiso(
        snapshot,
        idEmpleadoSolicitante,
        idDepartamento,
        idTipoPermiso,
        decision,
        pasoActual
      );

      await this.enviarCorreoYNotificacionPermiso(
        destinatarios,
        mensaje,
        this.obtenerTipoNotificacionPermiso(accion),
        this.obtenerAsuntoPermiso(accion),
        idSolicitud,
        idTipoPermiso,
        accion
      );

    } catch (error) {
      console.error('ERROR GENERAL AL ENVIAR COMUNICACIONES DE APROBACION PERMISO', error);
    }
  }

  private async obtenerDestinatariosAprobacionPermiso(
    snapshot: any,
    idEmpleadoSolicitante: number,
    idDepartamento: number,
    idTipoPermiso: number,
    decision: 'APRUEBA' | 'RECHAZA',
    pasoActual: any
  ): Promise<Set<number>> {

    const destinatarios = new Set<number>([
      idEmpleadoSolicitante,
      this.idEmpleadoLogueado
    ]);

    const tipoPaso = String(pasoActual?.tipo_paso ?? '').toUpperCase();
    const ordenActual = Number(pasoActual?.orden ?? 0);

    const esRechazo = decision === 'RECHAZA';
    const esAutorizacionFinal = tipoPaso === 'AUTORIZA' && decision === 'APRUEBA';

    if (esRechazo || esAutorizacionFinal) {
      return destinatarios;
    }

    if (!idDepartamento || !idTipoPermiso || !ordenActual) {
      return destinatarios;
    }

    const detalle = await this.obtenerDetalleFlujoPermiso(
      idDepartamento,
      idTipoPermiso
    );

    const pasos = Array.isArray(detalle?.pasos)
      ? detalle.pasos.slice().sort((a: any, b: any) => Number(a?.orden ?? 0) - Number(b?.orden ?? 0))
      : [];

    const pasoDetActual = pasos.find((p: any) =>
      Number(p?.orden ?? 0) === Number(ordenActual)
    );

    const pasoDetSiguiente = pasos.find((p: any) =>
      Number(p?.orden ?? 0) === Number(ordenActual + 1)
    );

    if (pasoDetActual) {
      for (const idAprobador of this.obtenerDestinatariosPaso(pasoDetActual)) {
        destinatarios.add(idAprobador);
      }
    }

    if (pasoDetSiguiente) {
      for (const idAprobador of this.obtenerDestinatariosPaso(pasoDetSiguiente)) {
        destinatarios.add(idAprobador);
      }
    }

    return destinatarios;
  }

  private async enviarCorreoYNotificacionPermiso(
    destinatarios: Set<number>,
    mensajeJson: string,
    tipoNoti: number,
    asunto: string,
    idPermiso: number,
    idTipoPermiso: number,
    accion: 'PREAUTORIZADO' | 'AUTORIZADO' | 'RECHAZADO'
  ): Promise<void> {
    try {
      const empleados = await firstValueFrom(
        this.datosGeneralesService.ObtenerInformacionModulos(1)
      );

      const tiposPermiso: any[] = await firstValueFrom(
        this.permisosService.listarTiposPermiso()
      );

      const tipoPermiso = Array.isArray(tiposPermiso)
        ? tiposPermiso.find((t: any) => Number(t?.id) === Number(idTipoPermiso))
        : null;

      const tipoPermiteCorreo = this.tipoPermisoPermiteCorreoAprobacion(
        tipoPermiso,
        accion
      );

      const idsDestino = Array.from(destinatarios).map(id => Number(id));

      const empleadosReceptores = empleados.filter((e: any) =>
        idsDestino.includes(Number(e?.id_empleado ?? e?.id))
      );

      const correosEnviar = empleadosReceptores
        .filter((e: any) => {
          const recibeCorreo =
            e?.permiso_mail === true ||
            e?.permiso_mail === 1 ||
            e?.permiso_mail === 'true';

          return tipoPermiteCorreo && recibeCorreo && !!e?.correo;
        })
        .map((e: any) => String(e.correo).trim())
        .filter((correo: string) => !!correo);

      const idsNotificacion = empleadosReceptores
        .filter((e: any) =>
          e?.permiso_notificacion === true ||
          e?.permiso_notificacion === 1 ||
          e?.permiso_notificacion === 'true'
        )
        .map((e: any) => Number(e?.id_empleado ?? e?.id));

      const correoUnico = Array.from(new Set(correosEnviar)).join(', ');

      if (correoUnico) {
        try {
          const payloadCorreo = {
            id_envia: this.idEmpleadoLogueado,
            plataforma: 'Aplicación Móvil',
            items: [
              {
                correo: correoUnico,
                asunto,
                mensaje: mensajeJson,
                id_permiso: idPermiso
              }
            ]
          };

          await firstValueFrom(
            this.notificacionesService.EnviarCorreoPermisoLegalizacionMultiple(payloadCorreo)
          );

        } catch (error) {
          console.error('ERROR AL ENVIAR CORREO DE APROBACION PERMISO', error);
        }
      }

      const idsNotificacionUnicos = Array.from(new Set(idsNotificacion));

      if (idsNotificacionUnicos.length > 0) {
        try {
          const payloadNotificacion = {
            id_empl_envia: this.idEmpleadoLogueado,
            id_empl_recive: idsNotificacionUnicos,
            mensaje: mensajeJson,
            tipo: tipoNoti,
            id_permiso: idPermiso
          };

          await firstValueFrom(
            this.notificacionesService.EnviarNotificacionPermisoLegalizacionMultiple(payloadNotificacion)
          );

        } catch (error) {
          console.error('ERROR AL ENVIAR NOTIFICACION DE APROBACION PERMISO', error);
        }
      }

    } catch (error) {
      console.error('ERROR GENERAL EN CORREO/NOTIFICACION PERMISO', error);
    }
  }

  private tipoPermisoPermiteCorreoAprobacion(
    tipoPermiso: any,
    accion: 'PREAUTORIZADO' | 'AUTORIZADO' | 'RECHAZADO'
  ): boolean {

    if (!tipoPermiso) {
      return false;
    }

    if (accion === 'PREAUTORIZADO') {
      return this.valorBooleanoPermiso(
        tipoPermiso?.correo_preautorizar,
        false
      );
    }

    if (accion === 'AUTORIZADO') {
      return this.valorBooleanoPermiso(
        tipoPermiso?.correo_autorizar,
        false
      );
    }

    return this.valorBooleanoPermiso(
      tipoPermiso?.correo_negar,
      false
    );
  }

  private async armarMensajeAprobacionPermiso(
    solicitud: any,
    accion: 'PREAUTORIZADO' | 'AUTORIZADO' | 'RECHAZADO',
    observacionAccion: string
  ): Promise<string> {

    const empleados = await firstValueFrom(
      this.datosGeneralesService.ObtenerInformacionModulos(1)
    );

    const idEmpleadoSolicitante = Number(
      solicitud?.id_empleado ??
      solicitud?.empleado_id ??
      0
    );

    const empleadoSolicitante = empleados.find((e: any) =>
      Number(e?.id_empleado ?? e?.id) === Number(idEmpleadoSolicitante)
    );

    const empleadoEjecutor = empleados.find((e: any) =>
      Number(e?.id_empleado ?? e?.id) === Number(this.idEmpleadoLogueado)
    );

    const nombreEjecutor = [
      empleadoEjecutor?.apellido,
      empleadoEjecutor?.nombre
    ].filter(Boolean).join(' ').trim() || `Empleado ${this.idEmpleadoLogueado}`;

    const idTipoPermiso = Number(
      solicitud?.id_tipo_permiso ??
      solicitud?.id_tipo_solicitud ??
      solicitud?.tipo_permiso_id ??
      0
    );

    const tipoPermiso = await this.obtenerTipoPermisoPorId(idTipoPermiso);

    const nombreEmp = [
      empleadoSolicitante?.apellido ?? solicitud?.apellido_emple ?? solicitud?.apellido_empleado,
      empleadoSolicitante?.nombre ?? solicitud?.nombre_emple ?? solicitud?.nombre_empleado
    ].filter(Boolean).join(' ').trim() || `Empleado ${idEmpleadoSolicitante}`;

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
      tipoPermiso?.descripcion ??
      tipoPermiso?.nombre ??
      solicitud?.tipo_permiso_descripcion ??
      solicitud?.tipoPermiso ??
      solicitud?.motivo ??
      ''
    ).toString();

    const dias = Number(
      solicitud?.dias_permiso ??
      solicitud?.dia ??
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
      solicitud?.fecha ??
      ''
    ).substring(0, 10);

    const fechaHasta = String(
      solicitud?.fecha_final ??
      solicitud?.fecha ??
      ''
    ).substring(0, 10);

    const payloadMensaje = {
      accion,
      mensaje_principal: `La solicitud de permiso ha sido ${accion.toLowerCase()}:`,
      notificacion: `La solicitud de permiso ha sido ${accion.toLowerCase()}:`,
      data: {
        empleado: nombreEmp,
        identificacion: empleadoSolicitante?.identificacion ?? solicitud?.identificacion ?? null,
        cargo: cargoEmpleado,
        departamento: departamentoEmpleado,
        fecha_solicitud: (
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
        observacion: observacionAccion ?? '',
        observacion_accion: observacionAccion ?? '',
        estado_solicitud: accion,
        realizado_por: nombreEjecutor,
        codigo: empleadoSolicitante?.codigo ?? solicitud?.codigo ?? null
      }
    };

    return JSON.stringify(payloadMensaje);
  }

  private obtenerAccionPermiso(
    decision: 'APRUEBA' | 'RECHAZA',
    pasoActual: any
  ): 'PREAUTORIZADO' | 'AUTORIZADO' | 'RECHAZADO' {

    const tipoPaso = String(pasoActual?.tipo_paso ?? '').toUpperCase();

    if (decision === 'RECHAZA') {
      return 'RECHAZADO';
    }

    if (!tipoPaso || tipoPaso === 'AUTORIZA') {
      return 'AUTORIZADO';
    }

    return 'PREAUTORIZADO';
  }

  private obtenerTipoNotificacionPermiso(accion: string): number {
    if (accion === 'RECHAZADO') {
      return TipoNotificacion.RECHAZAR_PERMISO;
    }

    if (accion === 'AUTORIZADO') {
      return TipoNotificacion.AUTORIZAR_PERMISO;
    }

    return TipoNotificacion.PREAUTORIZAR_PERMISO;
  }

  private obtenerAsuntoPermiso(accion: string): string {
    if (accion === 'RECHAZADO') {
      return 'Solicitud de permiso rechazada';
    }

    if (accion === 'AUTORIZADO') {
      return 'Solicitud de permiso autorizada';
    }

    return 'Solicitud de permiso preautorizada';
  }

  private async obtenerTipoPermisoPorId(idTipoPermiso: number): Promise<any | null> {
    try {
      const tipos: any[] = await firstValueFrom(
        this.permisosService.listarTiposPermiso()
      );

      return Array.isArray(tipos)
        ? tipos.find((t: any) => Number(t?.id) === Number(idTipoPermiso)) ?? null
        : null;

    } catch (error) {
      console.error('Error consultando tipos de permiso:', error);
      return null;
    }
  }

  private async obtenerDetalleFlujoPermiso(
    idDepartamento: number,
    idTipoPermiso: number
  ): Promise<any> {
    try {
      const flujos = await firstValueFrom(
        this.aprobacionesService.ListarFlujosDepartamento(idDepartamento)
      );

      const flujo = flujos.find((f: any) => {
        const modulo = String(f?.modulo ?? '').trim().toUpperCase();

        const tipoFlujo = Number(
          f?.id_tipo_solicitud ??
          f?.id_tipo_permiso ??
          f?.id_tipo ??
          0
        );

        return modulo === 'PERMISO' && tipoFlujo === Number(idTipoPermiso);
      });

      const idFlujo = Number(flujo?.id_flujo ?? flujo?.id ?? 0);

      if (!idFlujo) return null;

      return await firstValueFrom(
        this.aprobacionesService.ObtenerDetalleFlujo(idFlujo)
      );

    } catch {
      return null;
    }
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

  private getHorasFormatoHHmmDesdeMinutos(minutos: number): string {
    const total = Number(minutos || 0);

    const horas = Math.floor(total / 60);
    const mins = total % 60;

    return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  private valorBooleanoPermiso(valor: any, defecto: boolean = true): boolean {
    if (valor === undefined || valor === null) {
      return defecto;
    }

    if (typeof valor === 'boolean') {
      return valor;
    }

    if (typeof valor === 'number') {
      return valor === 1;
    }

    const texto = String(valor).trim().toLowerCase();

    if (['true', '1', 'si', 'sí', 's', 'activo'].includes(texto)) {
      return true;
    }

    if (['false', '0', 'no', 'n', 'inactivo'].includes(texto)) {
      return false;
    }

    return defecto;
  }

  abrirSelector(tipo: 'tipo' | 'dep' | 'emp') {
    this.tipoSelectorActivo = tipo;
    this.filtroSelector = '';

    if (tipo === 'tipo') {
      this.seleccionTemporal = [...this.idsTipoPermisoSeleccionados];
    }

    if (tipo === 'dep') {
      this.seleccionTemporal = [...this.idsDepartamentoSeleccionados];
    }

    if (tipo === 'emp') {
      this.seleccionTemporal = [...this.idsEmpleadoSeleccionados];
    }

    this.selectorAbierto = true;
  }

  cerrarSelector() {
    this.selectorAbierto = false;
    this.tipoSelectorActivo = null;
    this.filtroSelector = '';
    this.seleccionTemporal = [];
  }

  confirmarSelector() {
    if (this.tipoSelectorActivo === 'tipo') {
      this.idsTipoPermisoSeleccionados = [...this.seleccionTemporal];
    }

    if (this.tipoSelectorActivo === 'dep') {
      this.idsDepartamentoSeleccionados = [...this.seleccionTemporal];
    }

    if (this.tipoSelectorActivo === 'emp') {
      this.idsEmpleadoSeleccionados = [...this.seleccionTemporal];
    }

    this.cerrarSelector();
  }

  getTituloSelector(): string {
    if (this.tipoSelectorActivo === 'tipo') return 'Tipos de permiso';
    if (this.tipoSelectorActivo === 'dep') return 'Departamentos';
    if (this.tipoSelectorActivo === 'emp') return 'Empleados';
    return '';
  }

  getPlaceholderSelector(): string {
    if (this.tipoSelectorActivo === 'tipo') return 'Buscar tipo de permiso';
    if (this.tipoSelectorActivo === 'dep') return 'Buscar departamento o sucursal';
    if (this.tipoSelectorActivo === 'emp') return 'Buscar empleado';
    return 'Buscar';
  }

  getOpcionesSelector(): any[] {
    const filtro = this.normalizarTexto(this.filtroSelector);

    if (this.tipoSelectorActivo === 'tipo') {
      return this.tiposPermiso.filter((tipo: any) => {
        const texto = this.normalizarTexto(
          `${tipo.descripcion ?? ''} ${tipo.nombre ?? ''}`
        );

        return filtro === '' || texto.includes(filtro);
      });
    }

    if (this.tipoSelectorActivo === 'dep') {
      return this.departamentos.filter((dep: any) => {
        const texto = this.normalizarTexto(
          `${dep.sucursal ?? ''} ${dep.departamento ?? ''}`
        );

        return filtro === '' || texto.includes(filtro);
      });
    }

    if (this.tipoSelectorActivo === 'emp') {
      return this.empleados.filter((emp: any) => {
        const texto = this.normalizarTexto(
          `${emp.apellido ?? ''} ${emp.nombre ?? ''} ${emp.identificacion ?? ''} ${emp.codigo ?? ''} ${emp.departamento ?? ''}`
        );

        return filtro === '' || texto.includes(filtro);
      });
    }

    return [];
  }

  normalizarTexto(valor: any): string {
    return String(valor ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  getTextoOpcionSelector(item: any): string {
    if (this.tipoSelectorActivo === 'tipo') {
      return item.descripcion || item.nombre || 'Sin nombre';
    }

    if (this.tipoSelectorActivo === 'dep') {
      const sucursal = item.sucursal ? `${item.sucursal} - ` : '';
      return `${sucursal}${item.departamento || 'Sin departamento'}`;
    }

    if (this.tipoSelectorActivo === 'emp') {
      return `${item.apellido || ''} ${item.nombre || ''}`.trim();
    }

    return '';
  }

  getSubTextoOpcionSelector(item: any): string {
    if (this.tipoSelectorActivo === 'emp') {
      const partes: string[] = [];

      if (item.identificacion) partes.push(`CI: ${item.identificacion}`);
      if (item.codigo) partes.push(`Código: ${item.codigo}`);
      if (item.departamento) partes.push(item.departamento);

      return partes.join(' | ');
    }

    if (this.tipoSelectorActivo === 'tipo') {
      return item.tipo_descuento ? `Descuento: ${item.tipo_descuento}` : '';
    }

    if (this.tipoSelectorActivo === 'dep') {
      return item.sucursal || '';
    }

    return '';
  }

  estaSeleccionTemporal(id: number): boolean {
    return this.seleccionTemporal.includes(Number(id));
  }

  toggleSeleccionTemporal(item: any, seleccionado: boolean) {
    const id = Number(item.id);

    if (seleccionado) {
      if (!this.seleccionTemporal.includes(id)) {
        this.seleccionTemporal.push(id);
      }
    } else {
      this.seleccionTemporal = this.seleccionTemporal.filter(
        (x: number) => Number(x) !== id
      );
    }
  }

  seleccionarTodasFiltradas() {
    const idsFiltrados = this.getOpcionesSelector().map((item: any) => Number(item.id));

    idsFiltrados.forEach((id: number) => {
      if (!this.seleccionTemporal.includes(id)) {
        this.seleccionTemporal.push(id);
      }
    });
  }

  limpiarSeleccionTemporal() {
    this.seleccionTemporal = [];
  }

  getResumenSeleccion(tipo: 'tipo' | 'dep' | 'emp'): string {
    let total = 0;

    if (tipo === 'tipo') total = this.idsTipoPermisoSeleccionados.length;
    if (tipo === 'dep') total = this.idsDepartamentoSeleccionados.length;
    if (tipo === 'emp') total = this.idsEmpleadoSeleccionados.length;

    if (total === 0) {
      if (tipo === 'tipo') return 'Seleccione tipo de permiso';
      if (tipo === 'dep') return 'Seleccione departamento';
      if (tipo === 'emp') return 'Seleccione empleado';
    }

    return `${total} seleccionado(s)`;
  }

}