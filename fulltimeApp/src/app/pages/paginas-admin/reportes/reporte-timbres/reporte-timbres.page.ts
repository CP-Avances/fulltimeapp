import { Component, ViewChild } from '@angular/core';
import {
  LoadingController,
  ModalController,
  ToastController,
  IonDatetime
} from '@ionic/angular';

import { DateTime } from 'luxon';

import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { ReporteTimbreComponent } from 'src/app/modals/reporte-timbre/reporte-timbre.component';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { AsignacionesMovilService } from 'src/app/services/asignaciones-movil.services';

interface CheckOptions {
  valor: number;
  nombre: string;
}

type TipoBusqueda = 'sucursal' | 'departamento' | 'empleado' | 'rol';

@Component({
  selector: 'app-reporte-timbres',
  templateUrl: './reporte-timbres.page.html',
  styleUrls: ['./reporte-timbres.page.scss'],
})
export class ReporteTimbresPage {

  activarOpcion: boolean = false;

  maxDate: string = new Date().toISOString().split('T')[0];

  get fechaInicio(): string {
    return this.dataUserService.fechaRangoInicio;
  }

  get fechaFinal(): string {
    return this.dataUserService.fechaRangoFinal;
  }

  @ViewChild('datetimeInicio') datetimeInicio!: IonDatetime;
  @ViewChild('datetimeFinal') datetimeFinal!: IonDatetime;

  fechaIn: string | null = '';
  fechaFi: string | null = '';

  loadingEmpleado: boolean = true;
  listLoaded: boolean = false;

  opcion_sucursal: boolean = false;
  opcion_depa: boolean = false;
  opcion_empleado: boolean = false;
  opcion_rol: boolean = false;

  radioValue: number = 0;

  datosGenerales: any[] = [];

  departamentos: any[] = [];
  departamentos_filtro: any[] = [];

  sucursales: any[] = [];
  sucursales_filtro: any[] = [];

  roles: any[] = [];
  roles_filtro: any[] = [];

  empleados: any[] = [];
  empleados_filtro: any[] = [];

  solicitudes: CheckOptions[] = [
    { valor: 1, nombre: 'Sucursal' },
    { valor: 2, nombre: 'Departamento' },
    { valor: 3, nombre: 'Empleado' },
    { valor: 4, nombre: 'Rol' },
  ];

  ver: boolean = true;
  verDepartamento: boolean = true;
  verSucursal: boolean = true;
  verRol: boolean = true;

  rolEmpleado: number = 0;
  idEmpleado: number = 0;

  idDepartamentosAcceso: Set<any> = new Set();
  idSucursalesAcceso: Set<any> = new Set();
  idUsuariosAcceso: Set<any> = new Set();

  isAllCheck_sucu: boolean = false;
  isAllCheck_depa: boolean = false;
  isAllCheck_empl: boolean = false;
  isAllCheck_rol: boolean = false;

  isChecked_sucu: boolean = true;
  isChecked_depa: boolean = true;
  isChecked_empl: boolean = true;
  isChecked_rol: boolean = true;

  pageActual: number = 1;
  pageActualDepartamento: number = 1;
  pageActualSucursal: number = 1;
  pageActualRol: number = 1;

  public itemsPorPagina: number = 8;
  public maxSize: number = 3;
  public directionLinks: boolean = true;
  public autoHide: boolean = true;
  public responsive: boolean = true;

  public labels: any = {
    previousLabel: '‹ Anterior',
    nextLabel: 'Siguiente ›',
    screenReaderPaginationLabel: 'Paginación',
    screenReaderPageLabel: 'Página',
    screenReaderCurrentLabel: 'Página actual'
  };

  constructor(
    public modalController: ModalController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private dataUserService: DataUserLoggedService,
    public restN: NotificacionesService,
    public restP: ParametrosService,
    private readonly asignacionesMovil: AsignacionesMovilService
  ) { }

  async ngOnInit(): Promise<void> {
    this.inicializarUsuario();
    this.reiniciarPantalla();
    await this.cargarAsignacionesUsuario();
  }

  async ionViewWillEnter(): Promise<void> {
    this.inicializarUsuario();
    this.reiniciarPantalla();
    await this.cargarAsignacionesUsuario();
  }

  ionViewWillLeave() {
    this.limpiarRango_fechas();
  }

  private inicializarUsuario(): void {
    this.idEmpleado = parseInt(localStorage.getItem('empleadoID') ?? '0', 10);
    this.rolEmpleado = parseInt(localStorage.getItem('rol') ?? '0', 10);
  }

  private async cargarAsignacionesUsuario(): Promise<void> {
    if (!this.idEmpleado) {
      return;
    }

    try {
      await this.asignacionesMovil.ObtenerAsignacionesUsuario(this.idEmpleado);

      this.idDepartamentosAcceso = this.asignacionesMovil.idDepartamentosAcceso;
      this.idSucursalesAcceso = this.asignacionesMovil.idSucursalesAcceso;
      this.idUsuariosAcceso = this.asignacionesMovil.idUsuariosAcceso;

    } catch {
      this.idDepartamentosAcceso = new Set();
      this.idSucursalesAcceso = new Set();
      this.idUsuariosAcceso = new Set();
    }
  }

  private aplicarFiltroPorAsignacion(informacion: any[]): any[] {
    if (!informacion || informacion.length === 0) {
      return [];
    }

    if (this.rolEmpleado === 1) {
      return informacion;
    }

    if (!this.idUsuariosAcceso || this.idUsuariosAcceso.size === 0) {
      return [];
    }

    return informacion.filter((empleado: any) => {
      const idEmpleado = Number(empleado.id ?? empleado.id_empleado);
      return this.idUsuariosAcceso.has(idEmpleado);
    });
  }

  private reiniciarPantalla(): void {
    sessionStorage.removeItem('datos_comunicado');

    this.activarOpcion = false;
    this.radioValue = 0;
    this.loadingEmpleado = true;
    this.listLoaded = false;

    this.reiniciarChecks();
    this.reiniciarPaginas();
    this.limpiarOpcionesVista();
    this.limpiarListas();
  }

  private reiniciarChecks(): void {
    this.isAllCheck_sucu = false;
    this.isAllCheck_depa = false;
    this.isAllCheck_empl = false;
    this.isAllCheck_rol = false;
  }

  private reiniciarPaginas(): void {
    this.pageActual = 1;
    this.pageActualDepartamento = 1;
    this.pageActualSucursal = 1;
    this.pageActualRol = 1;
  }

  toggleChanged(event: any) {
    this.activarOpcion = !!event?.detail?.checked;
  }

  changeFechaInicio(e: any) {
    const valor = e?.detail?.value ?? e?.target?.value ?? '';

    this.dataUserService.setFechaRangoInicio(valor);
    this.datetimeInicio?.confirm(true);

    if (!this.fechaInicio) {
      this.fechaIn = '';
      return;
    }

    this.fechaIn = DateTime.fromISO(this.fechaInicio).toFormat('yyyy-MM-dd');

    if (this.fechaFi && this.fechaFi < this.fechaIn) {
      this.dataUserService.setFechaRangoFinal('');
      this.fechaFi = '';
    }
  }

  changeFechaFinal(e: any) {
    const valor = e?.detail?.value ?? e?.target?.value ?? '';

    this.dataUserService.setFechaRangoFinal(valor);
    this.datetimeFinal?.confirm(true);

    if (!this.fechaFinal) {
      this.fechaFi = '';
      return;
    }

    this.fechaFi = DateTime.fromISO(this.fechaFinal).toFormat('yyyy-MM-dd');
  }

  limpiarRango_fechas() {
    this.dataUserService.setFechaRangoInicio('');
    this.dataUserService.setFechaRangoFinal('');

    this.fechaIn = '';
    this.fechaFi = '';
  }

  async mostrarToas(mensaje: string, duracion: number, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color,
      mode: 'ios',
    });

    await toast.present();
    this.dismissLoading();
  }

  async mostrarAlertas(mensaje: string, duracion: number, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color,
      mode: 'ios',
      cssClass: 'showtoast-custom-class'
    });

    await toast.present();
  }

  async dismissLoading() {
    while (await this.loadingController.getTop() !== undefined) {
      await this.loadingController.dismiss();
    }
  }

  async presentModal(objeto: any) {
    const modal = await this.modalController.create({
      component: ReporteTimbreComponent,
      componentProps: {
        data: objeto,
        activarOpcion: this.activarOpcion
      },
      cssClass: 'my-custom-class'
    });

    return await modal.present();
  }

  showValue() {
    this.reiniciarChecks();
    this.reiniciarPaginas();
    this.limpiarListas();

    this.opcion_sucursal = this.radioValue === 1;
    this.opcion_depa = this.radioValue === 2;
    this.opcion_empleado = this.radioValue === 3;
    this.opcion_rol = this.radioValue === 4;

    if (this.radioValue === 0) {
      sessionStorage.removeItem('datos_comunicado');
      this.loadingEmpleado = true;
      return;
    }

    this.loadingEmpleado = false;

    switch (this.radioValue) {
      case 1:
        this.cargarListaSucursales();
        break;
      case 2:
        this.cargarDepartamentos();
        break;
      case 3:
        this.cargarEmpleados();
        break;
      case 4:
        this.cargarRoles();
        break;
      default:
        this.loadingEmpleado = true;
        break;
    }
  }

  private limpiarOpcionesVista(): void {
    this.opcion_sucursal = false;
    this.opcion_depa = false;
    this.opcion_empleado = false;
    this.opcion_rol = false;
  }

  private limpiarListas(): void {
    this.departamentos = [];
    this.departamentos_filtro = [];

    this.sucursales = [];
    this.sucursales_filtro = [];

    this.roles = [];
    this.roles_filtro = [];

    this.empleados = [];
    this.empleados_filtro = [];

    this.datosGenerales = [];
  }

  private cargarDatosGenerales(callback: () => void): void {
    this.limpiarListas();

    this.restN.BuscarDatosGeneralesInfo().subscribe({
      next: (res: any[]) => {
        const informacion = res ?? [];

        this.datosGenerales = this.aplicarFiltroPorAsignacion(informacion);

        sessionStorage.setItem(
          'datos_comunicado',
          JSON.stringify(this.datosGenerales)
        );

        callback();

        this.loadingEmpleado = true;
        this.listLoaded = true;
      },
      error: () => {
        this.loadingEmpleado = true;
        this.listLoaded = false;
        this.mostrarAlertas('No se ha encontrado información.', 1800, 'danger');
      }
    });
  }

  private filtrarUnicos<T>(lista: T[], obtenerClave: (item: T) => string): T[] {
    const claves = new Set<string>();

    return lista.filter((item: T) => {
      const clave = obtenerClave(item);

      if (!clave || claves.has(clave)) {
        return false;
      }

      claves.add(clave);
      return true;
    });
  }

  cargarListaSucursales() {
    this.cargarDatosGenerales(() => {
      this.sucursales = this.datosGenerales.map((obj: any) => ({
        id: obj.id_suc,
        sucursal: obj.name_suc,
        ciudad: obj.ciudad,
        cargo: obj.name_cargo,
        departemento: obj.name_dep,
        regimen: obj.name_regimen,
        nombre1: `${obj.apellido ?? ''} ${obj.nombre ?? ''}`.trim(),
        isChecked_sucu: false
      }));

      this.sucursales = this.filtrarUnicos(
        this.sucursales,
        (item: any) => String(item.id ?? '')
      );

      this.sucursales_filtro = [...this.sucursales];
      this.verSucursal = !this.mostrarPaginacionSucursal();

      this.departamentos = [];
      this.empleados = [];
      this.roles = [];
    });
  }

  cargarDepartamentos() {
    this.cargarDatosGenerales(() => {
      this.departamentos = this.datosGenerales.map((obj: any) => ({
        id: obj.id_depa,
        departamento: obj.name_dep,
        sucursal: obj.name_suc,
        id_suc: obj.id_suc,
        id_regimen: obj.id_regimen,
        ciudad: obj.ciudad,
        cargo: obj.name_cargo,
        departemento: obj.name_dep,
        regimen: obj.name_regimen,
        nombre1: `${obj.apellido ?? ''} ${obj.nombre ?? ''}`.trim(),
        isChecked_depa: false
      }));

      this.departamentos = this.filtrarUnicos(
        this.departamentos,
        (item: any) => `${item.id ?? ''}-${item.id_suc ?? ''}`
      );

      this.departamentos_filtro = [...this.departamentos];
      this.verDepartamento = !this.mostrarPaginacionDepartamento();

      this.sucursales = [];
      this.empleados = [];
      this.roles = [];
    });
  }

  cargarEmpleados() {
    this.cargarDatosGenerales(() => {
      this.empleados = this.datosGenerales.map((obj: any) => ({
        id: obj.id ?? obj.id_empleado,
        nombre: obj.nombre,
        apellido: obj.apellido,
        codigo: obj.codigo,
        identificacion: obj.identificacion,
        correo: obj.correo,
        genero: obj.genero,
        id_cargo: obj.id_cargo,
        name_rol: obj.name_rol,
        id_contrato: obj.id_contrato,
        name_suc: obj.name_suc,
        id_suc: obj.id_suc,
        id_regimen: obj.id_regimen,
        id_depa: obj.id_depa,
        id_cargo_: obj.id_cargo_,
        ciudad: obj.ciudad,
        hora_trabaja: obj.hora_trabaja,
        name_cargo: obj.name_cargo,
        name_dep: obj.name_dep,
        name_regimen: obj.name_regimen,
        isChecked_empl: false
      }));

      this.empleados_filtro = [...this.empleados];
      this.ver = !this.mostrarPaginacionEmpleado();

      this.sucursales = [];
      this.departamentos = [];
      this.roles = [];
    });
  }

  cargarRoles() {
    this.cargarDatosGenerales(() => {
      this.roles = this.datosGenerales.map((obj: any) => ({
        id: obj.id_rol,
        rol: obj.name_rol,
        identificacion: obj.identificacion,
        correo: obj.correo,
        id_cargo: obj.id_cargo,
        id_contrato: obj.id_contrato,
        name_rol: obj.name_rol,
        ciudad: obj.ciudad,
        sucursal: obj.name_suc,
        departemento: obj.name_dep,
        regimen: obj.name_regimen,
        nombre1: `${obj.apellido ?? ''} ${obj.nombre ?? ''}`.trim(),
        id_suc: obj.id_suc,
        id_regimen: obj.id_regimen,
        id_depa: obj.id_depa,
        id_cargo_: obj.id_cargo_,
        hora_trabaja: obj.hora_trabaja,
        app_habilita: obj.app_habilita,
        web_habilita: obj.web_habilita,
        comunicado_mail: obj.comunicado_mail,
        comunicado_noti: obj.comunicado_notificacion,
        isChecked_rol: false
      }));

      this.roles = this.filtrarUnicos(
        this.roles,
        (item: any) => String(item.id ?? '')
      );

      this.roles_filtro = [...this.roles];
      this.verRol = !this.mostrarPaginacionRol();

      this.departamentos = [];
      this.sucursales = [];
      this.empleados = [];
    });
  }

  checkedAll_sucu(isAllChecked_sucu: boolean) {
    this.isAllCheck_sucu = !isAllChecked_sucu;

    this.sucursales_filtro.forEach((o: any) => {
      o.isChecked_sucu = this.isAllCheck_sucu;
    });
  }

  checkedAll_depa(isAllChecked_depa: boolean) {
    this.isAllCheck_depa = !isAllChecked_depa;

    this.departamentos_filtro.forEach((o: any) => {
      o.isChecked_depa = this.isAllCheck_depa;
    });
  }

  checkedAll_empl(isAllChecked_empl: boolean) {
    this.isAllCheck_empl = !isAllChecked_empl;

    this.empleados_filtro.forEach((o: any) => {
      o.isChecked_empl = this.isAllCheck_empl;
    });
  }

  checkedAll_rol(isAllChecked_rol: boolean) {
    this.isAllCheck_rol = !isAllChecked_rol;

    this.roles_filtro.forEach((o: any) => {
      o.isChecked_rol = this.isAllCheck_rol;
    });
  }

  private validarFechasSeleccionadas(): boolean {
    if (!this.fechaIn) {
      this.mostrarToas('Seleccione la fecha inicial.', 2500, 'warning');
      return false;
    }

    if (!this.fechaFi) {
      this.mostrarToas('Seleccione la fecha final.', 2500, 'warning');
      return false;
    }

    if (this.fechaFi < this.fechaIn) {
      this.mostrarToas('La fecha final no puede ser menor a la fecha inicial.', 3000, 'warning');
      return false;
    }

    return true;
  }

  private validarSeleccion(
    tipo: TipoBusqueda,
    listaCompleta: any[],
    seleccionados: any[]
  ): boolean {
    if (!this.validarFechasSeleccionadas()) {
      return false;
    }

    if (!listaCompleta || listaCompleta.length === 0) {
      this.mostrarToas(`No existen registros de ${this.obtenerNombreTipo(tipo)} para consultar.`, 3000, 'warning');
      return false;
    }

    if (!seleccionados || seleccionados.length === 0) {
      this.mostrarToas(`Seleccione al menos un ${this.obtenerNombreTipo(tipo)}.`, 3000, 'warning');
      return false;
    }

    return true;
  }

  private obtenerNombreTipo(tipo: TipoBusqueda): string {
    switch (tipo) {
      case 'sucursal':
        return 'sucursal';
      case 'departamento':
        return 'departamento';
      case 'empleado':
        return 'empleado';
      case 'rol':
        return 'rol';
      default:
        return 'registro';
    }
  }

  private obtenerDatosComunicado(): any[] {
    try {
      return JSON.parse(sessionStorage.getItem('datos_comunicado') ?? '[]');
    } catch {
      return [];
    }
  }

  EnviarSucursal() {
    const sucu = this.sucursales.filter((o: any) => o.isChecked_sucu === true);

    if (!this.validarSeleccion('sucursal', this.sucursales, sucu)) {
      return;
    }

    this.ModelarSucursal(sucu);
  }

  ModelarSucursal(dataSucursal: any[]) {
    const respuesta = this.obtenerDatosComunicado();

    const seleccionados = dataSucursal.map((sucursal: any) => ({
      ...sucursal,
      opcion: 1,
      empleados: respuesta.filter((selec: any) => Number(selec.id_suc) === Number(sucursal.id))
    }));

    this.presentModal(seleccionados);
  }

  EnviarDepartamento() {
    const depa = this.departamentos.filter((o: any) => o.isChecked_depa === true);

    if (!this.validarSeleccion('departamento', this.departamentos, depa)) {
      return;
    }

    this.ModelarDepartamentos(depa);
  }

  ModelarDepartamentos(dataDepartamentos: any[]) {
    const respuesta = this.obtenerDatosComunicado();

    const seleccionados = dataDepartamentos.map((departamento: any) => ({
      ...departamento,
      opcion: 2,
      empleados: respuesta.filter((selec: any) => {
        return Number(selec.id_depa) === Number(departamento.id)
          && Number(selec.id_suc) === Number(departamento.id_suc);
      })
    }));

    this.presentModal(seleccionados);
  }

  EnviarEmpleado() {
    const empl = this.empleados.filter((o: any) => o.isChecked_empl === true);

    if (!this.validarSeleccion('empleado', this.empleados, empl)) {
      return;
    }

    this.ModelarEmpleados(empl);
  }

  ModelarEmpleados(dataEmpleados: any[]) {
    const seleccionados: any[] = [
      {
        nombre: 'Empleados',
        opcion: 3,
        empleados: dataEmpleados
      }
    ];

    this.presentModal(seleccionados);
  }

  EnviarRoles() {
    const role = this.roles.filter((o: any) => o.isChecked_rol === true);

    if (!this.validarSeleccion('rol', this.roles, role)) {
      return;
    }

    this.ModelarRol(role);
  }

  ModelarRol(dataRol: any[]) {
    const respuesta = this.obtenerDatosComunicado();

    const seleccionados = dataRol.map((rol: any) => ({
      ...rol,
      opcion: 4,
      empleados: respuesta.filter((selec: any) => Number(selec.id_rol) === Number(rol.id))
    }));

    this.presentModal(seleccionados);
  }

  private filtrarPorTexto(lista: any[], campos: string[], texto: string): any[] {
    const palabrasBusqueda = String(texto ?? '')
      .toLowerCase()
      .split(' ')
      .filter(Boolean);

    if (palabrasBusqueda.length === 0) {
      return [...lista];
    }

    return lista.filter((o: any) => {
      const valorCampo = campos
        .map((campo: string) => String(o[campo] ?? ''))
        .join(' ')
        .toLowerCase();

      return palabrasBusqueda.every((palabra: string) => {
        return valorCampo.includes(palabra);
      });
    });
  }

  changeSearchSucursales(e: any) {
    const texto = e?.detail?.value ?? '';

    this.pageActualSucursal = 1;

    this.sucursales_filtro = this.filtrarPorTexto(
      this.sucursales,
      ['sucursal', 'ciudad'],
      texto
    );

    this.verSucursal = !this.mostrarPaginacionSucursal();
  }

  changeSearchDepartamento(e: any) {
    const texto = e?.detail?.value ?? '';

    this.pageActualDepartamento = 1;

    this.departamentos_filtro = this.filtrarPorTexto(
      this.departamentos,
      ['departamento', 'sucursal'],
      texto
    );

    this.verDepartamento = !this.mostrarPaginacionDepartamento();
  }

  changeSearchNombresCompletos(e: any) {
    const texto = e?.detail?.value ?? '';

    this.pageActual = 1;

    this.empleados_filtro = this.filtrarPorTexto(
      this.empleados,
      ['nombre', 'apellido', 'codigo', 'identificacion'],
      texto
    );

    this.ver = !this.mostrarPaginacionEmpleado();
  }

  changeSearchRoles(e: any) {
    const texto = e?.detail?.value ?? '';

    this.pageActualRol = 1;

    this.roles_filtro = this.filtrarPorTexto(
      this.roles,
      ['rol'],
      texto
    );

    this.verRol = !this.mostrarPaginacionRol();
  }

  mostrarPaginacionSucursal(): boolean {
    return this.sucursales_filtro.length > this.itemsPorPagina;
  }

  mostrarPaginacionDepartamento(): boolean {
    return this.departamentos_filtro.length > this.itemsPorPagina;
  }

  mostrarPaginacionEmpleado(): boolean {
    return this.empleados_filtro.length > this.itemsPorPagina;
  }

  mostrarPaginacionRol(): boolean {
    return this.roles_filtro.length > this.itemsPorPagina;
  }

  trackById(index: number, item: any): any {
    return item?.id ?? item?.codigo ?? index;
  }
}