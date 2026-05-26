import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { AprobacionesService } from 'src/app/services/aprobaciones.service';
import { PermisosService } from 'src/app/services/permisos.service';
import { DatosGeneralesService } from 'src/app/services/datos-generales.service';

@Component({
  selector: 'app-permiso-aprobacion',
  templateUrl: './permiso-aprobacion.page.html',
  styleUrls: ['./permiso-aprobacion.page.scss'],
})
export class PermisoAprobacionPage implements OnInit {

  modoVista: 'criterios' | 'lista' = 'criterios';

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
        console.log('Scope aprobación permisos:', res);

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
      error: (error) => {
        console.log('Error al validar scope aprobación permisos:', error);

        this.tieneConfiguracionAprobacion = false;
        this.mensajeSinConfiguracion = 'No se pudo validar su configuración de aprobación.';
        this.cargandoInicial = false;
      }
    });
  }

  cargarTiposPermiso() {
    this.permisosService.listarTiposPermiso().subscribe({
      next: (res: any[]) => {
        console.log('Tipos permiso:', res);

        this.tiposPermiso = Array.isArray(res) ? res : [];
      },
      error: (error) => {
        console.log('Error al cargar tipos de permiso:', error);
        this.tiposPermiso = [];
      }
    });
  }

  cargarInformacionGeneral() {
    this.datosGeneralesService.ObtenerInformacionGeneral(1).subscribe({
      next: (res: any[]) => {
        console.log('Información general permisos aprobación:', res);

        this.procesarInformacionGeneral(res);

        this.cargandoInicial = false;
      },
      error: (error) => {
        console.log('Error al cargar información general:', error);

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

    console.log('Departamentos procesados:', this.departamentosAll);
    console.log('Empleados procesados:', this.empleadosAll);

    this.aplicarScopeFiltros();
  }

  aplicarScopeFiltros() {
    console.log('Aplicando scope filtros...');
    console.log('Rol empleado:', this.rolEmpleado);
    console.log('Scope aprobación:', this.scopeAprobacion);
    console.log('DepartamentosAll antes de filtrar:', this.departamentosAll);
    console.log('EmpleadosAll antes de filtrar:', this.empleadosAll);

    if (this.rolEmpleado === 1) {
      this.empleados = [...this.empleadosAll];
      this.departamentos = [...this.departamentosAll];

      console.log('Departamentos visibles admin:', this.departamentos);
      console.log('Empleados visibles admin:', this.empleados);
      return;
    }

    const scopeDeps = new Set<number>(
      (this.scopeAprobacion?.idsDepartamentoAprobables || []).map((x: any) => Number(x))
    );

    console.log('Departamentos aprobables:', Array.from(scopeDeps));

    if (scopeDeps.size === 0) {
      this.empleados = [];
      this.departamentos = [];

      console.log('No hay departamentos aprobables.');
      return;
    }

    this.departamentos = this.departamentosAll.filter((d: any) =>
      scopeDeps.has(Number(d.id))
    );

    this.empleados = this.empleadosAll.filter((e: any) => {
      const depEmp = Number(e.id_depa);
      return scopeDeps.has(depEmp);
    });

    console.log('Departamentos visibles filtrados:', this.departamentos);
    console.log('Empleados visibles filtrados:', this.empleados);
  }

  onCriterioChange() {
    this.idsTipoPermisoSeleccionados = [];
    this.idsDepartamentoSeleccionados = [];
    this.idsEmpleadoSeleccionados = [];
    this.solicitudes = [];
  }

  buscarSolicitudes() {
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

    console.log('Payload buscar solicitudes aprobación permisos:', payload);

    this.cargando = true;
    this.solicitudes = [];
    this.solicitudesPaginadas = [];
    this.solicitudesSeleccionadas = [];
    this.procesandoMultiple = false;

    this.permisosService.buscarSolicitudesPermisos(payload).subscribe({
      next: async (resp: any) => {
        const solicitudes = Array.isArray(resp?.data) ? resp.data : [];

        console.log('Solicitudes encontradas antes de filtrar:', solicitudes);

        await this.filtrarSolicitudesAprobables(solicitudes);

        this.page = 0;
        this.actualizarPaginacion();

        this.cargando = false;
        this.modoVista = 'lista';

        if (this.solicitudes.length === 0) {
          this.mostrarToast('No existen solicitudes pendientes de aprobación para usted.', 'warning');
        }
      },
      error: (error) => {
        console.log('Error al buscar solicitudes permisos:', error);

        this.cargando = false;
        this.mostrarToast('No se pudieron consultar las solicitudes de permisos.', 'danger');
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

        console.log('Payload validar acciones:', payloadValidar);
        console.log('Solicitud enviada a validar:', solicitud);

        const validacion: any = await this.aprobacionesService
          .ValidarAccionesSolicitud(payloadValidar)
          .toPromise();

        console.log('Respuesta validar acciones solicitud:', solicitud.id, validacion);

        const acciones = validacion?.acciones ?? {};

        const puedePreautorizar = acciones?.puede_preautorizar === true;
        const puedeAutorizar = acciones?.puede_autorizar === true;
        const puedeNegar = acciones?.puede_negar === true;

        const puedeActuar =
          puedePreautorizar ||
          puedeAutorizar ||
          puedeNegar;

        console.log('Acciones normalizadas:', {
          idSolicitud: solicitud.id,
          puedePreautorizar,
          puedeAutorizar,
          puedeNegar,
          puedeActuar
        });

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

    console.log('Solicitudes aprobables:', this.solicitudes);
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
    this.procesandoMultiple = false;
  }

  obtenerFechaHoy(): string {
    const fecha = new Date();
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
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
    this.cargando = true;

    const solicitudesProcesadas: number[] = [];
    const solicitudesConError: number[] = [];

    for (const solicitud of this.solicitudesSeleccionadas) {
      try {
        const payload = {
          modulo: 'PERMISO' as const,
          id_solicitud_modulo: Number(solicitud.id),
          decision,
          observacion
        };

        console.log('Payload aprobación múltiple:', payload);

        await this.aprobacionesService.EjecutarAccionSolicitud(payload).toPromise();

        solicitudesProcesadas.push(Number(solicitud.id));

      } catch (error) {
        console.log('Error aprobando solicitud múltiple:', solicitud.id, error);
        solicitudesConError.push(Number(solicitud.id));
      }
    }

    this.solicitudes = this.solicitudes.filter(
      (s: any) => !solicitudesProcesadas.includes(Number(s.id))
    );

      this.solicitudesSeleccionadas = [];
      this.procesandoMultiple = false;
      this.cargando = false;

    this.actualizarPaginacion();

    if (solicitudesProcesadas.length > 0 && solicitudesConError.length === 0) {
      this.mostrarToast('Solicitudes procesadas correctamente.', 'success');
    } else if (solicitudesProcesadas.length > 0 && solicitudesConError.length > 0) {
      this.mostrarToast('Algunas solicitudes fueron procesadas, pero otras fallaron.', 'warning');
    } else {
      this.mostrarToast('No se pudo procesar ninguna solicitud.', 'danger');
    }
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