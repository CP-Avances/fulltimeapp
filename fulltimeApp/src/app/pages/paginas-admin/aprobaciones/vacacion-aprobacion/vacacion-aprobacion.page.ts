import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

import { VacacionesService } from 'src/app/services/vacaciones.service';
import { AprobacionesService } from 'src/app/services/aprobaciones.service';
import { DatosGeneralesService } from 'src/app/services/datos-generales.service';
import { ParametrosService } from 'src/app/services/parametros.service';

type TipoSelector = 'dep' | 'emp';

@Component({
  selector: 'app-vacacion-aprobacion',
  templateUrl: './vacacion-aprobacion.page.html',
  styleUrls: ['./vacacion-aprobacion.page.scss'],
})
export class VacacionAprobacionPage implements OnInit {

  idEmpleadoLogueado = 0;
  rolEmpleado = 0;

  cargandoInicial = false;
  cargando = false;
  procesandoMultiple = false;

  tieneConfiguracionAprobacion = false;
  mensajeSinConfiguracion = 'No tiene configuración activa para aprobar solicitudes de vacaciones.';

  modoVista: 'criterios' | 'lista' = 'criterios';

  criterioBusqueda: TipoSelector = 'dep';
  fechaDesde = '';
  estadoSolicitud = 1;

  estados = [
    { valor: 1, etiqueta: 'Pendiente' },
    { valor: 2, etiqueta: 'Pre-Autorizado' },
    { valor: 3, etiqueta: 'Autorizado' },
    { valor: 4, etiqueta: 'No-Autorizado' },
  ];

  scopeAprobacion: any = null;

  empleadosAll: any[] = [];
  departamentosAll: any[] = [];

  empleados: any[] = [];
  departamentos: any[] = [];

  miDepId: number | null = null;

  seleccionDepartamentos: any[] = [];
  seleccionEmpleados: any[] = [];

  selectorAbierto = false;
  tipoSelector: TipoSelector = 'dep';
  filtroSelector = '';
  seleccionTemporal: any[] = [];

  solicitudes: any[] = [];
  solicitudesSeleccionadas: any[] = [];

  page = 0;
  pageSize = 5;

  debeVerificarProgramacion = false;

  constructor(
    private vacacionesService: VacacionesService,
    private aprobacionesService: AprobacionesService,
    private datosGeneralesService: DatosGeneralesService,
    private parametrosService: ParametrosService,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    await this.inicializarPantalla();
  }

  async ionViewWillEnter() {
    await this.inicializarPantalla();
  }

  async inicializarPantalla() {
    this.cargandoInicial = true;

    this.idEmpleadoLogueado = Number(
      localStorage.getItem('empleadoID') ||
      localStorage.getItem('empleado') ||
      0
    );

    this.rolEmpleado = Number(localStorage.getItem('rol') || 0);

    if (!this.fechaDesde) {
      this.fechaDesde = this.obtenerFechaHoy();
    }

    this.modoVista = 'criterios';
    this.solicitudes = [];
    this.solicitudesSeleccionadas = [];

    await this.cargarParametroVerificacion();
    await this.validarScopeAprobacion();

    if (!this.tieneConfiguracionAprobacion) {
      this.cargandoInicial = false;
      return;
    }

    await this.cargarInformacionGeneral();

    this.cargandoInicial = false;
  }

  async cargarParametroVerificacion() {
    try {
      const detalles: any = await firstValueFrom(
        this.parametrosService.ListarDetalleParametro(38)
      );

      if (Array.isArray(detalles) && detalles.length > 0) {
        this.debeVerificarProgramacion = detalles[0]?.descripcion === 'Si';
      } else {
        this.debeVerificarProgramacion = false;
      }

    } catch (error) {
      this.debeVerificarProgramacion = false;
    }
  }

  async validarScopeAprobacion() {
    if (this.rolEmpleado === 1) {
      this.scopeAprobacion = null;
      this.tieneConfiguracionAprobacion = true;
      return;
    }

    try {
      const data: any = await firstValueFrom(
        this.aprobacionesService.ObtenerScopeFiltrosVacaciones()
      );

      const idsDepartamentoAprobables = Array.isArray(data?.idsDepartamentoAprobables)
        ? data.idsDepartamentoAprobables.map((x: any) => Number(x))
        : [];

      this.scopeAprobacion = {
        idsDepartamentoAprobables
      };

      this.tieneConfiguracionAprobacion = idsDepartamentoAprobables.length > 0;

      if (!this.tieneConfiguracionAprobacion) {
        this.mensajeSinConfiguracion = 'No tiene departamentos configurados para aprobar solicitudes de vacaciones.';
      }

    } catch (error) {
      this.scopeAprobacion = { idsDepartamentoAprobables: [] };
      this.tieneConfiguracionAprobacion = false;
      this.mensajeSinConfiguracion = 'No se pudo validar su configuración de aprobación.';
    }
  }

  async cargarInformacionGeneral() {
    try {
      const data: any[] = await firstValueFrom(
        this.datosGeneralesService.ObtenerInformacionGeneral(1)
      );

      this.procesarInformacionGeneral(data || []);
      this.aplicarScopeFiltros();

    } catch (error) {
      this.empleados = [];
      this.departamentos = [];
      this.empleadosAll = [];
      this.departamentosAll = [];
      await this.mostrarToast('No se pudo cargar la información general.', 'danger');
    }
  }

  procesarInformacionGeneral(data: any[]) {
    const mapaEmpleados = new Map<number, any>();
    const mapaDepartamentos = new Map<number, any>();

    for (const item of data) {
      const idEmpleado = Number(
        item.id_empleado ??
        item.idEmpleado ??
        item.id ??
        0
      );

      const idDepartamento = Number(
        item.id_departamento ??
        item.id_depa ??
        item.idDepartamento ??
        0
      );

      if (idEmpleado > 0) {
        mapaEmpleados.set(idEmpleado, {
          id: idEmpleado,
          nombre: item.nombre ?? item.nombre_empleado ?? '',
          apellido: item.apellido ?? item.apellido_empleado ?? '',
          identificacion: item.identificacion ?? '',
          codigo: item.codigo ?? item.codigo_empleado ?? '',
          rol: item.rol ?? item.nombre_rol ?? '',
          departamento: item.departamento ?? item.nombre_departamento ?? '',
          sucursal: item.sucursal ?? item.nombre_sucursal ?? '',
          id_depa: idDepartamento || null
        });
      }

      if (idDepartamento > 0) {
        mapaDepartamentos.set(idDepartamento, {
          id: idDepartamento,
          departamento: item.departamento ?? item.nombre_departamento ?? '',
          sucursal: item.sucursal ?? item.nombre_sucursal ?? '',
          empresa: item.empresa ?? item.nombre_empresa ?? ''
        });
      }
    }

    this.empleadosAll = Array.from(mapaEmpleados.values());
    this.departamentosAll = Array.from(mapaDepartamentos.values());

    const empleadoSesion = this.empleadosAll.find(
      e => Number(e.id) === Number(this.idEmpleadoLogueado)
    );

    this.miDepId = empleadoSesion?.id_depa != null
      ? Number(empleadoSesion.id_depa)
      : null;
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

    const yo = Number(this.idEmpleadoLogueado);
    const miDep = this.miDepId;

    const apruebaMiDep = miDep != null && scopeDeps.has(Number(miDep));

    const depsPermitidos = new Set<number>();

    if (miDep != null) {
      depsPermitidos.add(Number(miDep));
    }

    for (const d of scopeDeps) {
      depsPermitidos.add(Number(d));
    }

    this.departamentos = this.departamentosAll.filter((d: any) =>
      depsPermitidos.has(Number(d.id))
    );

    this.empleados = this.empleadosAll.filter((e: any) => {
      const idEmp = Number(e.id);
      const depEmp = e?.id_depa != null ? Number(e.id_depa) : null;

      if (idEmp === yo) return true;

      if (depEmp != null && scopeDeps.has(depEmp)) return true;

      if (apruebaMiDep && depEmp != null && miDep != null && depEmp === Number(miDep)) {
        return true;
      }

      return false;
    });
  }

  onCriterioChange() {
    this.seleccionDepartamentos = [];
    this.seleccionEmpleados = [];
    this.filtroSelector = '';
  }

  abrirSelector(tipo: TipoSelector) {
    this.tipoSelector = tipo;
    this.filtroSelector = '';

    if (tipo === 'dep') {
      this.seleccionTemporal = [...this.seleccionDepartamentos];
    } else {
      this.seleccionTemporal = [...this.seleccionEmpleados];
    }

    this.selectorAbierto = true;
  }

  cerrarSelector() {
    this.selectorAbierto = false;
  }

  confirmarSelector() {
    if (this.tipoSelector === 'dep') {
      this.seleccionDepartamentos = [...this.seleccionTemporal];
    } else {
      this.seleccionEmpleados = [...this.seleccionTemporal];
    }

    this.cerrarSelector();
  }

  getTituloSelector(): string {
    return this.tipoSelector === 'dep'
      ? 'Seleccionar departamentos'
      : 'Seleccionar empleados';
  }

  getPlaceholderSelector(): string {
    return this.tipoSelector === 'dep'
      ? 'Buscar departamento'
      : 'Buscar empleado';
  }

  getOpcionesSelector(): any[] {
    const filtro = this.filtroSelector.toLowerCase().trim();

    const data = this.tipoSelector === 'dep'
      ? this.departamentos
      : this.empleados;

    if (!filtro) return data;

    return data.filter((item: any) => {
      const texto = this.getTextoOpcionSelector(item).toLowerCase();
      const subTexto = this.getSubTextoOpcionSelector(item).toLowerCase();

      return texto.includes(filtro) || subTexto.includes(filtro);
    });
  }

  getTextoOpcionSelector(item: any): string {
    if (this.tipoSelector === 'dep') {
      return item.departamento || 'Departamento sin nombre';
    }

    return `${item.apellido || ''} ${item.nombre || ''}`.trim();
  }

  getSubTextoOpcionSelector(item: any): string {
    if (this.tipoSelector === 'dep') {
      return [item.sucursal, item.empresa].filter(Boolean).join(' - ');
    }

    return [item.codigo, item.identificacion, item.departamento].filter(Boolean).join(' - ');
  }

  estaSeleccionTemporal(id: any): boolean {
    return this.seleccionTemporal.some(x => Number(x.id) === Number(id));
  }

  toggleSeleccionTemporal(item: any, checked: boolean) {
    if (checked) {
      if (!this.estaSeleccionTemporal(item.id)) {
        this.seleccionTemporal.push(item);
      }
    } else {
      this.seleccionTemporal = this.seleccionTemporal.filter(
        x => Number(x.id) !== Number(item.id)
      );
    }
  }

  seleccionarTodasFiltradas() {
    const opciones = this.getOpcionesSelector();

    for (const item of opciones) {
      if (!this.estaSeleccionTemporal(item.id)) {
        this.seleccionTemporal.push(item);
      }
    }
  }

  limpiarSeleccionTemporal() {
    this.seleccionTemporal = [];
  }

  getResumenSeleccion(tipo: TipoSelector): string {
    const seleccion = tipo === 'dep'
      ? this.seleccionDepartamentos
      : this.seleccionEmpleados;

    if (seleccion.length === 0) {
      return tipo === 'dep'
        ? 'Seleccione departamentos'
        : 'Seleccione empleados';
    }

    if (seleccion.length === 1) {
      return this.getTextoResumenSeleccion(tipo, seleccion[0]);
    }

    return `${seleccion.length} seleccionados`;
  }

  getTextoResumenSeleccion(tipo: TipoSelector, item: any): string {
    if (tipo === 'dep') {
      return item.departamento || 'Departamento';
    }

    return `${item.apellido || ''} ${item.nombre || ''}`.trim();
  }

  async buscarSolicitudes() {
    if (!this.criterioBusqueda) {
      await this.mostrarToast('Seleccione un criterio de búsqueda.', 'warning');
      return;
    }

    if (!this.fechaDesde) {
      await this.mostrarToast('Seleccione la fecha desde.', 'warning');
      return;
    }

    if (this.estadoSolicitud == null) {
      await this.mostrarToast('Seleccione el estado de la solicitud.', 'warning');
      return;
    }

    if (this.criterioBusqueda === 'dep' && this.seleccionDepartamentos.length === 0) {
      await this.mostrarToast('Seleccione al menos un departamento.', 'warning');
      return;
    }

    if (this.criterioBusqueda === 'emp' && this.seleccionEmpleados.length === 0) {
      await this.mostrarToast('Seleccione al menos un empleado.', 'warning');
      return;
    }

    const filtros: any = {
      estado: this.estadoSolicitud,
      fechaDesde: this.fechaDesde
    };

    if (this.criterioBusqueda === 'dep') {
      filtros.departamentos = this.seleccionDepartamentos.map(d => Number(d.id));
    }

    if (this.criterioBusqueda === 'emp') {
      filtros.empleados = this.seleccionEmpleados.map(e => Number(e.id));
    }

    this.cargando = true;

    try {
      console.log('Filtros vacaciones móvil:', JSON.stringify(filtros));
      const resultado: any = await firstValueFrom(
        this.vacacionesService.ObtenerSolicitudesVacacion(10, 0, filtros)
      );

      const data = Array.isArray(resultado?.data) ? resultado.data : [];

      const solicitudesNormalizadas = this.normalizarSolicitudes(data);

      this.solicitudes = await this.filtrarSolicitudesAprobables(solicitudesNormalizadas);

      this.solicitudesSeleccionadas = [];
      this.page = 0;
      this.modoVista = 'lista';

      if (this.solicitudes.length === 0) {
        await this.mostrarToast('No existen solicitudes pendientes de aprobación para usted.', 'warning');
      } else {
        await this.mostrarToast(`Se encontraron ${this.solicitudes.length} solicitud(es) para aprobar.`, 'success');
      }

    } catch (error: any) {
      await this.mostrarToast(error?.message || 'Error al buscar solicitudes.', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  normalizarSolicitudes(data: any[]): any[] {
    return data.map((s: any) => ({
      ...s,
      id: Number(s?.id ?? s?.id_solicitud_vacacion ?? 0),
      accionesAprobacion: null
    }));
  }

  async filtrarSolicitudesAprobables(solicitudes: any[]): Promise<any[]> {
    const solicitudesAprobables: any[] = [];

    for (const solicitud of solicitudes) {
      try {
        const idSolicitud = Number(solicitud?.id);

        if (!idSolicitud || isNaN(idSolicitud)) {
          continue;
        }

        const estado = Number(solicitud?.estado);

        /**
         * Para aprobación normalmente solo tienen acción:
         * 1 = Pendiente
         * 2 = Pre-Autorizado
         *
         * Si viene autorizado o no autorizado, no se considera aprobable.
         */
        if (estado !== 1 && estado !== 2) {
          continue;
        }

        const validacion: any = await firstValueFrom(
          this.aprobacionesService.ValidarAccionesSolicitud({
            modulo: 'VACACION',
            id_solicitud_modulo: idSolicitud
          })
        );

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
        console.log('Error validando acciones vacación:', solicitud?.id, error);
      }
    }

    return solicitudesAprobables;
  }

  get solicitudesPaginadas(): any[] {
    const inicio = this.page * this.pageSize;
    const fin = inicio + this.pageSize;

    return this.solicitudes.slice(inicio, fin);
  }

  paginaAnterior() {
    if (this.page > 0) {
      this.page--;
    }
  }

  paginaSiguiente() {
    if ((this.page + 1) * this.pageSize < this.solicitudes.length) {
      this.page++;
    }
  }

  volverACriterios() {
    this.modoVista = 'criterios';
    this.solicitudes = [];
    this.solicitudesSeleccionadas = [];
    this.page = 0;
  }

  puedeActuarEnSolicitud(s: any): boolean {
    const a = s?.accionesAprobacion;

    return !!(
      a?.puede_preautorizar ||
      a?.puede_autorizar ||
      a?.puede_negar
    );
  }

  puedeAprobarSolicitud(s: any): boolean {
    const a = s?.accionesAprobacion;

    return !!(
      a?.puede_preautorizar ||
      a?.puede_autorizar
    );
  }

  puedeRechazarSolicitud(s: any): boolean {
    const a = s?.accionesAprobacion;

    return !!a?.puede_negar;
  }

  estaSeleccionada(s: any): boolean {
    return this.solicitudesSeleccionadas.some(
      x => Number(x.id) === Number(s.id)
    );
  }

  toggleSeleccionSolicitud(s: any, checked: boolean) {
    if (!this.puedeActuarEnSolicitud(s)) {
      return;
    }

    if (checked) {
      if (!this.estaSeleccionada(s)) {
        this.solicitudesSeleccionadas.push(s);
      }
    } else {
      this.solicitudesSeleccionadas = this.solicitudesSeleccionadas.filter(
        x => Number(x.id) !== Number(s.id)
      );
    }
  }

  todasSeleccionadas(): boolean {
    const seleccionables = this.solicitudes.filter(s => this.puedeActuarEnSolicitud(s));

    if (seleccionables.length === 0) return false;

    return seleccionables.every(s => this.estaSeleccionada(s));
  }

  toggleSeleccionarTodas(event: any) {
    const checked = event.detail.checked;

    if (checked) {
      this.solicitudesSeleccionadas = this.solicitudes.filter(
        s => this.puedeActuarEnSolicitud(s)
      );
    } else {
      this.solicitudesSeleccionadas = [];
    }
  }

  puedeAprobarSeleccion(): boolean {
    return this.solicitudesSeleccionadas.length > 0 &&
      this.solicitudesSeleccionadas.every(s => this.puedeAprobarSolicitud(s));
  }

  puedeRechazarSeleccion(): boolean {
    return this.solicitudesSeleccionadas.length > 0 &&
      this.solicitudesSeleccionadas.every(s => this.puedeRechazarSolicitud(s));
  }

  async confirmarAccionMultiple(titulo: string, decision: 'APRUEBA' | 'RECHAZA') {
    if (this.solicitudesSeleccionadas.length === 0) {
      await this.mostrarToast('Seleccione al menos una solicitud.', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: `${titulo} solicitudes`,
      message: decision === 'RECHAZA'
        ? 'Ingrese el motivo del rechazo.'
        : 'Ingrese una observación para la aprobación.',
      inputs: [
        {
          name: 'observacion',
          type: 'textarea',
          placeholder: decision === 'RECHAZA'
            ? 'Ej: No cumple política...'
            : 'Ej: Aprobado por cumplimiento de política...'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: titulo,
          handler: (data) => {
            const observacion = data?.observacion || '';
            this.ejecutarAccionMultiple(decision, observacion);
          }
        }
      ]
    });

    await alert.present();
  }

  async ejecutarAccionMultiple(decision: 'APRUEBA' | 'RECHAZA', observacion: string) {
    this.procesandoMultiple = true;

    let exitosas = 0;
    let sinPermiso = 0;
    let conflictos = 0;
    let errores = 0;

    for (const solicitud of this.solicitudesSeleccionadas) {
      try {
        await firstValueFrom(
          this.aprobacionesService.EjecutarAccionSolicitud({
            modulo: 'VACACION',
            id_solicitud_modulo: Number(solicitud.id),
            decision,
            observacion,
            verificarProgramacion: this.debeVerificarProgramacion
          })
        );

        exitosas++;

      } catch (error: any) {
        if (error?.status === 403) {
          sinPermiso++;
        } else if (error?.status === 409) {
          conflictos++;
        } else {
          errores++;
        }
      }
    }

    this.procesandoMultiple = false;

    if (exitosas > 0) {
      await this.mostrarToast(`Acción aplicada a ${exitosas} solicitud(es).`, 'success');
    }

    if (sinPermiso > 0) {
      await this.mostrarToast(`${sinPermiso} solicitud(es) sin permisos para esa acción.`, 'danger');
    }

    if (conflictos > 0) {
      await this.mostrarToast(`${conflictos} solicitud(es) no cumplen las validaciones actuales.`, 'warning');
    }

    if (errores > 0) {
      await this.mostrarToast(`${errores} solicitud(es) no pudieron procesarse.`, 'danger');
    }

    await this.buscarSolicitudes();
  }

  estadoTexto(estado: any): string {
    const valor = Number(estado);

    const estadoMap: any = {
      1: 'Pendiente',
      2: 'Pre-Autorizado',
      3: 'Autorizado',
      4: 'No Autorizado'
    };

    return estadoMap[valor] || 'Desconocido';
  }

  estadoColor(estado: any): string {
    const valor = Number(estado);

    const colorMap: any = {
      1: 'warning',
      2: 'tertiary',
      3: 'success',
      4: 'danger'
    };

    return colorMap[valor] || 'medium';
  }

  formatearFecha(fecha: any): string {
    if (!fecha) return '-';

    const d = new Date(fecha);

    if (isNaN(d.getTime())) return '-';

    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();

    return `${dia}/${mes}/${anio}`;
  }

  obtenerFechaHoy(): string {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  async mostrarToast(mensaje: string, color: string = 'medium') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      position: 'top',
      color,
      mode: 'ios'
    });

    await toast.present();
  }

}