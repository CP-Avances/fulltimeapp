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

interface CheckOptions {
  valor: number;
  nombre: string;
}

@Component({
  selector: 'app-reporte-timbres',
  templateUrl: './reporte-timbres.page.html',
  styleUrls: ['./reporte-timbres.page.scss'],
})
export class ReporteTimbresPage {

  // INTERRUPTOR PARA VER LA INFORMACION DEL DISPOSITIVO
  activarOpcion: boolean = false;

  // VARIABLES DE FECHA
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

  // VARIABLES DE ESTADO
  loadingEmpleado: boolean = true;
  listLoaded: boolean = false;

  opcion_sucursal: boolean = false;
  opcion_depa: boolean = false;
  opcion_empleado: boolean = false;
  opcion_rol: boolean = false;

  radioValue: number = 0;

  // LISTAS
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

  // VARIABLES DE VISUALIZACIÓN
  ver: boolean = true;
  verDepartamento: boolean = true;
  verSucursal: boolean = true;
  verRol: boolean = true;

  // CHECKBOX TODOS
  isAllCheck_sucu: boolean = false;
  isAllCheck_depa: boolean = false;
  isAllCheck_empl: boolean = false;
  isAllCheck_rol: boolean = false;

  isChecked_sucu: boolean = true;
  isChecked_depa: boolean = true;
  isChecked_empl: boolean = true;
  isChecked_rol: boolean = true;

  // VARIABLES PARA EL MANEJO DE LA PAGINACION
  pageActual: number = 1;
  pageActualDepartamento: number = 1;
  pageActualSucursal: number = 1;
  pageActualRol: number = 1;

  public maxSize: number = 5;
  public directionLinks: boolean = true;
  public autoHide: boolean = false;
  public responsive: boolean = true;

  public labels: any = {
    previousLabel: 'ante..',
    nextLabel: 'sigui..',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };

  constructor(
    public modalController: ModalController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private dataUserService: DataUserLoggedService,
    public restN: NotificacionesService,
    public restP: ParametrosService,
  ) { }

  ngOnInit() {
    this.reiniciarPantalla();
  }

  ionViewWillEnter() {
    this.reiniciarPantalla();
  }

  ionViewWillLeave() {
    this.limpiarRango_fechas();
  }

  private reiniciarPantalla(): void {
    sessionStorage.removeItem('datos_comunicado');

    this.activarOpcion = false;
    this.radioValue = 0;
    this.loadingEmpleado = true;

    this.limpiarOpcionesVista();
    this.limpiarListas();
  }

  // INTERRUPTOR
  toggleChanged(event: any) {
    this.activarOpcion = event.detail.checked;
  }

  // METODO PARA ALMACENAR EN UNA VARIABLE LA FECHA DE INICIO SELECCIONADA
  changeFechaInicio(e: any) {
    const valor = e?.target?.value ?? '';

    this.dataUserService.setFechaRangoInicio(valor);
    this.datetimeInicio?.confirm(true);

    if (!this.fechaInicio) {
      this.fechaIn = null;
      return;
    }

    this.fechaIn = DateTime.fromISO(this.fechaInicio).toFormat('yyyy-MM-dd');
  }

  // METODO PARA ALMACENAR EN UNA VARIABLE LA FECHA FIN SELECCIONADA
  changeFechaFinal(e: any) {
    const valor = e?.target?.value ?? '';

    this.dataUserService.setFechaRangoFinal(valor);
    this.datetimeFinal?.confirm(true);

    if (!this.fechaFinal) {
      this.fechaFi = null;
      return;
    }

    this.fechaFi = DateTime.fromISO(this.fechaFinal).toFormat('yyyy-MM-dd');
  }

  // METODO PARA LIMPIAR LAS VARIBLES DE FECHA FINAL E INICIAL
  limpiarRango_fechas() {
    this.dataUserService.setFechaRangoInicio('');
    this.dataUserService.setFechaRangoFinal('');

    this.fechaIn = '';
    this.fechaFi = '';
  }

  // METODO DE CONFIGURACION DEL TOAST
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

  // METODO DE CONFIGURACION DE LAS ALERTAS
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

  // METODO PARA ABRIR EL MODAL DEL REPORTE DE TIMBRE
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

  // METODO PARA CARGAR LOS REGISTROS DE SUCURSALES, DEPARTAMENTOS, EMPLEADOS O ROLES
  showValue() {
    this.loadingEmpleado = this.radioValue === 0;

    this.opcion_sucursal = this.radioValue === 1;
    this.opcion_depa = this.radioValue === 2;
    this.opcion_empleado = this.radioValue === 3;
    this.opcion_rol = this.radioValue === 4;

    if (this.radioValue === 0) {
      sessionStorage.removeItem('datos_comunicado');
      this.limpiarListas();
      return;
    }

    this.loadingEmpleado = false;

    if (this.radioValue === 1) {
      this.cargarListaSucursales();
    } else if (this.radioValue === 2) {
      this.cargarDepartamentos();
    } else if (this.radioValue === 3) {
      this.cargarEmpleados();
    } else if (this.radioValue === 4) {
      this.cargarRoles();
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
  }

  private cargarDatosGenerales(callback: () => void): void {
    this.limpiarListas();

    this.restN.BuscarDatosGenerales().subscribe({
      next: (res: any[]) => {

        this.datosGenerales = res ?? [];
        sessionStorage.setItem('datos_comunicado', JSON.stringify(this.datosGenerales));

        callback();

        this.loadingEmpleado = true;
      },
      error: () => {
        this.loadingEmpleado = true;
        this.mostrarAlertas('No se ha encontrado información.', 1000, 'danger');
      }
    });
  }

  private filtrarUnicos<T>(lista: T[], obtenerClave: (item: T) => string): T[] {
    const claves = new Set<string>();

    return lista.filter((item: T) => {
      const clave = obtenerClave(item);

      if (claves.has(clave)) {
        return false;
      }

      claves.add(clave);
      return true;
    });
  }

  // METODO PARA CARGAR LOS REGISTROS DE SUCURSALES
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
      }));

      this.sucursales = this.filtrarUnicos(
        this.sucursales,
        (item: any) => String(item.id)
      );

      this.sucursales_filtro = [...this.sucursales];
      this.verSucursal = this.sucursales_filtro.length < 11;

      this.departamentos = [];
      this.empleados = [];
      this.roles = [];
    });
  }

  // METODO PARA CARGAR LOS REGISTROS DE DEPARTAMENTOS
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
      }));

      this.departamentos = this.filtrarUnicos(
        this.departamentos,
        (item: any) => `${item.id}-${item.id_suc}`
      );

      this.departamentos_filtro = [...this.departamentos];
      this.verDepartamento = this.departamentos_filtro.length < 11;

      this.sucursales = [];
      this.empleados = [];
      this.roles = [];
    });
  }

  // METODO PARA CARGAR LOS REGISTROS DE EMPLEADOS
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
      }));

      this.empleados_filtro = [...this.empleados];
      this.ver = this.empleados_filtro.length < 11;

      this.sucursales = [];
      this.departamentos = [];
      this.roles = [];
    });
  }

  // METODO PARA CARGAR LOS REGISTROS DE ROLES
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
        comunicado_noti: obj.comunicado_notificacion
      }));

      this.roles = this.filtrarUnicos(
        this.roles,
        (item: any) => String(item.id)
      );

      this.roles_filtro = [...this.roles];
      this.verRol = this.roles_filtro.length < 11;

      this.departamentos = [];
      this.sucursales = [];
      this.empleados = [];
    });
  }

  // METODO DE VERIFICACION DE MARCACION DE TODOS LOS REGISTROS DE SUCURSALES
  checkedAll_sucu(isAllChecked_sucu: boolean) {
    this.isAllCheck_sucu = !isAllChecked_sucu;

    if (this.radioValue === 1) {
      this.sucursales.forEach((o: any) => {
        o.isChecked_sucu = this.isAllCheck_sucu;
      });
    }
  }

  // METODO DE VERIFICACION DE MARCACION DE TODOS LOS REGISTROS DE DEPARTAMENTOS
  checkedAll_depa(isAllChecked_depa: boolean) {
    this.isAllCheck_depa = !isAllChecked_depa;

    if (this.radioValue === 2) {
      this.departamentos.forEach((o: any) => {
        o.isChecked_depa = this.isAllCheck_depa;
      });

    }
  }

  // METODO DE VERIFICACION DE MARCACION DE TODOS LOS REGISTROS DE EMPLEADOS
  checkedAll_empl(isAllChecked_empl: boolean) {
    this.isAllCheck_empl = !isAllChecked_empl;

    if (this.radioValue === 3) {
      this.empleados.forEach((o: any) => {
        o.isChecked_empl = this.isAllCheck_empl;
      });
    }
  }

  // METODO DE VERIFICACION DE MARCACION DE TODOS LOS REGISTROS DE ROLES
  checkedAll_rol(isAllChecked_rol: boolean) {
    this.isAllCheck_rol = !isAllChecked_rol;

    if (this.radioValue === 4) {
      this.roles.forEach((o: any) => {
        o.isChecked_rol = this.isAllCheck_rol;
      });
    }
  }

  private validarFechasSeleccionadas(): boolean {
    if (!this.fechaFi || !this.fechaIn) {
      this.mostrarToas('Seleccione Fechas', 3000, 'warning');
      return false;
    }

    return true;
  }

  private obtenerDatosComunicado(): any[] {
    return JSON.parse(sessionStorage.getItem('datos_comunicado') ?? '[]');
  }

  // METODO QUE ALMACENA LOS REGISTROS DE SUCURSALES EN UN ARREGLO
  EnviarSucursal() {
    if (!this.validarFechasSeleccionadas()) return;

    const sucu = this.sucursales.filter((o: any) => o.isChecked_sucu === true);

    this.ModelarSucursal(sucu);
  }

  // METODO QUE OBTIENE LOS EMPLEADOS DE LAS SUCURSALES Y LOS ENVIA EN EL MODAL
  ModelarSucursal(dataSucursal: any[]) {
    const respuesta = this.obtenerDatosComunicado();

    const seleccionados = dataSucursal.map((sucursal: any) => ({
      ...sucursal,
      opcion: 1,
      empleados: respuesta.filter((selec: any) => selec.id_suc === sucursal.id)
    }));

    this.presentModal(seleccionados);
  }

  // METODO QUE ALMACENA LOS REGISTROS DE DEPARTAMENTO EN UN ARREGLO
  EnviarDepartamento() {
    if (!this.validarFechasSeleccionadas()) return;

    const depa = this.departamentos.filter((o: any) => o.isChecked_depa === true);

    this.ModelarDepartamentos(depa);
  }

  // METODO QUE OBTIENE LOS EMPLEADOS DE LOS DEPARTAMENTOS Y LOS ENVIA EN EL MODAL
  ModelarDepartamentos(dataDepartamentos: any[]) {
    const respuesta = this.obtenerDatosComunicado();

    const seleccionados = dataDepartamentos.map((departamento: any) => ({
      ...departamento,
      opcion: 2,
      empleados: respuesta.filter((selec: any) => selec.id_depa === departamento.id)
    }));

    this.presentModal(seleccionados);
  }

  // METODO QUE ALMACENA LOS REGISTROS DE EMPLEADOS EN UN ARREGLO
  EnviarEmpleado() {
    if (!this.validarFechasSeleccionadas()) return;

    const empl = this.empleados.filter((o: any) => o.isChecked_empl === true);

    this.ModelarEmpleados(empl);
  }

  // METODO QUE OBTIENE LOS EMPLEADOS Y LOS ENVIA EN EL MODAL
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

  // METODO QUE ALMACENA LOS REGISTROS DE ROLES EN UN ARREGLO
  EnviarRoles() {
    if (!this.validarFechasSeleccionadas()) return;

    const role = this.roles.filter((o: any) => o.isChecked_rol === true);

    this.ModelarRol(role);
  }

  // METODO QUE OBTIENE LOS EMPLEADOS DE LOS ROLES Y LOS ENVIA EN EL MODAL
  ModelarRol(dataRol: any[]) {
    const respuesta = this.obtenerDatosComunicado();

    const seleccionados = dataRol.map((rol: any) => ({
      ...rol,
      opcion: 4,
      empleados: respuesta.filter((selec: any) => selec.id_rol === rol.id)
    }));

    this.presentModal(seleccionados);
  }

  private filtrarPorTexto(lista: any[], campo: string, texto: string): any[] {
    const palabrasBusqueda = String(texto ?? '')
      .toLowerCase()
      .split(' ')
      .filter(Boolean);

    return lista.filter((o: any) => {
      const valorCampo = String(o[campo] ?? '').toLowerCase();

      return palabrasBusqueda.every((palabra: string) => {
        return valorCampo.includes(palabra);
      });
    });
  }

  // METODOS PARA BUSCAR LOS REGISTROS DE SUCURSALES, DEPARTAMENTOS, EMPLEADOS
  changeSearchSucursales(e: any) {
    const texto = e?.detail?.value ?? '';

    this.sucursales_filtro = this.filtrarPorTexto(
      this.sucursales,
      'sucursal',
      texto
    );
  }

  changeSearchDepartamento(e: any) {
    const texto = e?.detail?.value ?? '';

    this.departamentos_filtro = this.filtrarPorTexto(
      this.departamentos,
      'departamento',
      texto
    );
  }

  changeSearchNombresCompletos(e: any) {
    const texto = String(e?.detail?.value ?? '').toLowerCase();
    const palabrasBusqueda = texto.split(' ').filter(Boolean);

    this.empleados_filtro = this.empleados.filter((o: any) => {
      const nombreCompleto = `${o.nombre ?? ''} ${o.apellido ?? ''}`.toLowerCase();

      return palabrasBusqueda.every((palabra: string) => {
        return nombreCompleto.includes(palabra);
      });
    });
  }

  // METODO PARA DEFINIR EL BUSCADOR DE ROLES
  changeSearchRoles(e: any) {
    const texto = e?.detail?.value ?? '';

    this.roles_filtro = this.filtrarPorTexto(
      this.roles,
      'rol',
      texto
    );
  }
}