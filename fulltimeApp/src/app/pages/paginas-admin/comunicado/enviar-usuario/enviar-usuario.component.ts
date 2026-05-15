import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { LocalNotifications } from '@capacitor/local-notifications';

import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { AsignacionesMovilService } from 'src/app/services/asignaciones-movil.services';

interface CheckOptions {
  valor: number;
  nombre: string;
}

@Component({
  selector: 'app-enviar-usuario',
  templateUrl: './enviar-usuario.component.html',
  styleUrls: ['./enviar-usuario.component.scss'],
})
export class EnviarUsuarioComponent implements OnInit {

  @Input() data: any;

  ips_locales: any = '';

  loadingEmpleado = true;
  listLoaded = false;

  opcion_sucursal = false;
  opcion_depa = false;
  opcion_empleado = false;
  opcion_rol = false;

  idEmpleado = 0;
  idEmpresa = 0;

  solicitudes: CheckOptions[] = [
    { valor: 1, nombre: 'Sucursal' },
    { valor: 2, nombre: 'Departamento' },
    { valor: 3, nombre: 'Empleado' },
    { valor: 4, nombre: 'Rol' },
  ];

  empleados: any[] = [];
  sucursales: any[] = [];
  departamentos: any[] = [];
  roles: any[] = [];

  empleados_filtro: any[] = [];
  sucursales_filtro: any[] = [];
  departamentos_filtro: any[] = [];
  roles_filtro: any[] = [];

  respuesta: any[] = [];

  selectedValue: any;
  radioValue: any;

  isChecked = true;

  isAllCheck_sucu = false;
  isAllCheck_depa = false;
  isAllCheck_empl = false;
  isAllCheck_rol = false;

  isChecked_sucu = true;
  isChecked_depa = true;
  isChecked_empl = true;
  isChecked_rol = true;

  envios: any[] = [];
  cont = 0;
  boton_enviar = false;

  verificador = 0;
  cont_correo = 0;
  info_correo = '';

  pageActual = 1;
  pageActualDepartamento = 1;
  pageActualSucursal = 1;
  pageActualRol = 1;

  ver = true;
  verDepartamento = true;
  verSucursal = true;
  verRol = true;
  rolEmpleado = 0;

  public maxSize = 5;
  public directionLinks = true;
  public autoHide = false;
  public responsive = true;

  public labels: any = {
    previousLabel: 'ante..',
    nextLabel: 'sigui..',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`,
  };

  constructor(
    public modalController: ModalController,
    public restN: NotificacionesService,
    public toastController: ToastController,
    public validar: ValidacionesService,
    private readonly asignacionesMovil: AsignacionesMovilService
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleadoID') ?? '0', 10);
  }

  ngOnInit(): void {

    this.rolEmpleado = parseInt(localStorage.getItem('rol') ?? '0', 10);

    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    sessionStorage.removeItem('datos_comunicado');

    this.loadingEmpleado = true;
    this.requestNotificationPermission();
  }

  private async cargarAsignacionesUsuario(): Promise<void> {
    if (!this.idEmpleado) return;

    try {
      await this.asignacionesMovil.ObtenerAsignacionesUsuario(this.idEmpleado);
    } catch (error) {
      console.log('Error al cargar asignaciones del usuario', error);
    }
  }

  // METODO PARA SOLICITAR EL PERMISO DE NOTIFICACIONES LOCALES AL DISPOSITIVO
  async requestNotificationPermission() {
    try {
      const permission = await LocalNotifications.requestPermissions();

      if (permission.display === 'granted') {
        console.log('Permiso concedido para notificaciones locales');
      } else {
        console.log('Permiso denegado para notificaciones locales');
      }

    } catch (error) {
      console.log('No se pudo solicitar permiso de notificaciones locales', error);
    }
  }

  // ==============================
  // CARGA GENERAL DE INFORMACIÓN
  // ==============================

  private cargarDatosGenerales(callback: () => void) {
    this.restN.BuscarDatosGeneralesComunicados().subscribe({
      next: async (res: any[]) => {
        this.limpiarListas();

        let empleadosMapeados = res.map((obj: any) => this.mapEmpleado(obj));

        if (this.rolEmpleado !== 1) {
          if (!this.asignacionesMovil.tieneEstadoCargado()) {
            await this.asignacionesMovil.ObtenerAsignacionesUsuario(this.idEmpleado);
          }

          empleadosMapeados = this.asignacionesMovil.filtrarDatosGenerales(
            empleadosMapeados,
            this.rolEmpleado,
            this.idEmpleado
          );
        }

        this.empleados = empleadosMapeados;

        sessionStorage.setItem(
          'datos_comunicado',
          JSON.stringify(this.empleados)
        );

        callback();

        this.loadingEmpleado = true;
      },
      error: () => {
        this.loadingEmpleado = true;
        this.mostrarAlertas('No se ha encontrado información.', 1000, 'danger');
      }
    });
  }

  private limpiarListas() {
    this.empleados = [];
    this.sucursales = [];
    this.departamentos = [];
    this.roles = [];

    this.empleados_filtro = [];
    this.sucursales_filtro = [];
    this.departamentos_filtro = [];
    this.roles_filtro = [];
  }

  private mapEmpleado(obj: any) {
    return {
      id: obj.id,
      nombre: `${(obj.nombre ?? '').toUpperCase()} ${(obj.apellido ?? '').toUpperCase()}`.trim(),
      codigo: obj.codigo,
      identificacion: obj.identificacion,
      correo: obj.correo,
      id_cargo: obj.id_cargo,
      id_contrato: obj.id_contrato,
      sucursal: obj.name_suc,
      departamento: obj.name_dep,
      rol: obj.name_rol,
      id_rol: obj.id_rol,
      id_suc: obj.id_suc,
      id_regimen: obj.id_regimen,
      id_depa: obj.id_depa,
      id_cargo_: obj.id_cargo_,
      hora_trabaja: obj.hora_trabaja,
      app_habilita: obj.app_habilita,
      web_habilita: obj.web_habilita,
      comunicado_mail: obj.comunicado_mail,
      comunicado_noti: obj.comunicado_notificacion,
    };
  }

  private obtenerDatosSession(): any[] {
    return JSON.parse(sessionStorage.getItem('datos_comunicado') ?? '[]');
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

  // ==============================
  // CARGA POR OPCIÓN
  // ==============================

  cargarListaSucursales() {
    this.cargarDatosGenerales(() => {
      this.sucursales = this.empleados.map((obj: any) => ({
        id: obj.id_suc,
        sucursal: obj.sucursal,
      }));

      this.sucursales = this.filtrarUnicos(this.sucursales, (item: any) => String(item.id));
      this.sucursales_filtro = [...this.sucursales];

      this.verSucursal = this.sucursales_filtro.length < 11;

      this.departamentos = [];
      this.roles = [];
    });
  }

  cargarDepartamentos() {
    this.cargarDatosGenerales(() => {
      this.departamentos = this.empleados.map((obj: any) => ({
        id: obj.id_depa,
        departamento: obj.departamento ?? obj.name_dep,
        sucursal: obj.sucursal,
        id_suc: obj.id_suc,
        id_regimen: obj.id_regimen,
      }));

      this.departamentos = this.filtrarUnicos(
        this.departamentos,
        (item: any) => `${item.id}-${item.id_suc}`
      );

      this.departamentos_filtro = [...this.departamentos];

      this.verDepartamento = this.departamentos_filtro.length < 11;

      this.sucursales = [];
      this.roles = [];
    });
  }

  cargarRoles() {
    this.cargarDatosGenerales(() => {
      this.roles = this.empleados.map((obj: any) => ({
        id: obj.id_rol,
        rol: obj.rol,
      }));

      this.roles = this.filtrarUnicos(this.roles, (item: any) => String(item.id));
      this.roles_filtro = [...this.roles];

      this.verRol = this.roles_filtro.length < 11;

      this.sucursales = [];
      this.departamentos = [];
    });
  }

  cargarEmpleados() {
    this.cargarDatosGenerales(() => {
      this.empleados_filtro = [...this.empleados];

      this.ver = this.empleados_filtro.length < 11;

      this.sucursales = [];
      this.departamentos = [];
      this.roles = [];
    });
  }

  // ==============================
  // BUSCADORES
  // ==============================

  private filtrarPorTexto(lista: any[], campo: string, texto: string): any[] {
    const palabrasBusqueda = String(texto ?? '').toLowerCase().split(' ').filter(Boolean);

    return lista.filter((item: any) => {
      const valorCampo = String(item[campo] ?? '').toLowerCase();
      return palabrasBusqueda.every((palabra: string) => valorCampo.includes(palabra));
    });
  }

  changeSearchSucursales(e: any) {
    this.sucursales_filtro = this.filtrarPorTexto(
      this.sucursales,
      'sucursal',
      e.detail.value
    );
  }

  changeSearchDepartamento(e: any) {
    this.departamentos_filtro = this.filtrarPorTexto(
      this.departamentos,
      'departamento',
      e.detail.value
    );
  }

  changeSearch(e: any) {
    this.empleados_filtro = this.filtrarPorTexto(
      this.empleados,
      'nombre',
      e.detail.value
    );
  }

  changeSearchRoles(e: any) {
    this.roles_filtro = this.filtrarPorTexto(
      this.roles,
      'rol',
      e.detail.value
    );
  }

  // ==============================
  // MODAL / ALERTAS
  // ==============================

  closeModal() {
    this.modalController.dismiss({
      refreshInfo: true
    });
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

  // ==============================
  // RADIO BUTTONS
  // ==============================

  showValue() {
    this.loadingEmpleado = false;

    this.opcion_sucursal = this.radioValue === 1;
    this.opcion_depa = this.radioValue === 2;
    this.opcion_empleado = this.radioValue === 3;
    this.opcion_rol = this.radioValue === 4;

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

  // ==============================
  // CHECK TODOS
  // ==============================

  checkedAll_sucu(isAllChecked_sucu: boolean) {
    this.isAllCheck_sucu = !isAllChecked_sucu;

    if (this.radioValue === 1) {
      this.sucursales.forEach((o: any) => {
        o.isChecked_sucu = this.isAllCheck_sucu;
      });
    }
  }

  checkedAll_depa(isAllChecked_depa: boolean) {
    this.isAllCheck_depa = !isAllChecked_depa;

    if (this.radioValue === 2) {
      this.departamentos.forEach((o: any) => {
        o.isChecked_depa = this.isAllCheck_depa;
      });
    }
  }

  checkedAll_empl(isAllChecked_empl: boolean) {
    this.isAllCheck_empl = !isAllChecked_empl;

    if (this.radioValue === 3) {
      this.empleados.forEach((o: any) => {
        o.isChecked_empl = this.isAllCheck_empl;
      });
    }
  }

  checkedAll_rol(isAllChecked_rol: boolean) {
    this.isAllCheck_rol = !isAllChecked_rol;

    if (this.radioValue === 4) {
      this.roles.forEach((o: any) => {
        o.isChecked_rol = this.isAllCheck_rol;
      });
    }
  }

  // ==============================
  // ENVIAR POR TIPO DE SELECCIÓN
  // ==============================

  EnviarSucursal() {
    const seleccionados = this.sucursales.filter((o: any) => o.isChecked_sucu === true);
    this.ModelarSucursal(seleccionados);
  }

  EnviarDepartamento() {
    const seleccionados = this.departamentos.filter((o: any) => o.isChecked_depa === true);
    this.ModelarDepartamentos(seleccionados);
  }

  EnviarEmpleado() {
    const seleccionados = this.empleados.filter((o: any) => o.isChecked_empl === true);
    this.ModelarEmpleados(seleccionados);
  }

  EnviarRoles() {
    const seleccionados = this.roles.filter((o: any) => o.isChecked_rol === true);
    this.ModelarRoles(seleccionados);
  }

  // ==============================
  // MODELAR USUARIOS
  // ==============================

  ModelarSucursal(dataSucursal: any[]) {
    const respuesta = this.obtenerDatosSession();

    const usuarios = respuesta.filter((empleado: any) =>
      dataSucursal.some((sucursal: any) => empleado.id_suc === sucursal.id)
    );

    this.EnviarNotificaciones(usuarios);
    this.closeModal();
  }

  ModelarDepartamentos(dataDepartamentos: any[]) {
    const respuesta = this.obtenerDatosSession();

    const usuarios = respuesta.filter((empleado: any) =>
      dataDepartamentos.some((departamento: any) => empleado.id_depa === departamento.id)
    );

    this.EnviarNotificaciones(usuarios);
    this.closeModal();
  }

  ModelarEmpleados(dataEmpleados: any[]) {
    const usuarios = this.empleados.filter((empleado: any) =>
      dataEmpleados.some((seleccionado: any) => seleccionado.id === empleado.id)
    );

    this.EnviarNotificaciones(usuarios);
    this.closeModal();
  }

  ModelarRoles(dataRoles: any[]) {
    const respuesta = this.obtenerDatosSession();

    const usuarios = respuesta.filter((empleado: any) =>
      dataRoles.some((rol: any) => empleado.id_rol === rol.id)
    );

    this.EnviarNotificaciones(usuarios);
    this.closeModal();
  }

  // ==============================
  // ENVÍO DE COMUNICADOS
  // ==============================

  EnviarNotificaciones(data: any[]) {
    if (!data || data.length === 0) {
      this.mostrarAlertas('No ha seleccionado usuarios.', 3000, 'danger');
      return;
    }

    this.LeerCorreos(data);

    this.cont = 0;
    this.boton_enviar = true;

    const ids = data
      .filter((obj: any) => obj.comunicado_noti === true)
      .map((obj: any) => obj.id);

    this.NotificarSistema(this.idEmpleado, ids);
  }

  LeerCorreos(data: any[]) {
    this.info_correo = data
      .filter((obj: any) => obj.comunicado_mail === true && obj.correo)
      .map((obj: any) => obj.correo)
      .join(', ');
  }

  EnviarCorreo(correos: string) {
    const datosCorreo = {
      id_envia: this.idEmpleado,
      mensaje: this.data.mensaje,
      correo: correos,
      asunto: this.data.asunto,
      plataforma: 'Aplicación Móvil'
    };

    this.restN.EnviarCorreoComunicado(datosCorreo).subscribe({
      next: () => {
        this.mostrarAlertas('Mensaje enviado exitosamente.', 6000, 'success');
        this.closeModal();
      },
      error: () => {
        this.mostrarAlertas(
          'Ups !!! algo salio mal, revisa tu configuración de correo electrónico.',
          6000,
          'danger'
        );
        this.closeModal();
      }
    });
  }

  NotificarSistema(empleado_envia: any, empleado_recive: any[]) {
    const mensaje = {
      id_empl_envia: empleado_envia,
      id_empl_recive: empleado_recive,
      descripcion: this.data.asunto,
      mensaje: this.data.mensaje,
      tipo: 6
    };

    this.restN.EnviarMensajeGeneralMultiple(mensaje).subscribe({
      next: () => {
        if (this.info_correo === '') {
          this.mostrarAlertas('Mensaje enviado exitosamente.', 4000, 'success');
        } else {
          this.EnviarCorreo(this.info_correo);
        }
      }
    });
  }

}