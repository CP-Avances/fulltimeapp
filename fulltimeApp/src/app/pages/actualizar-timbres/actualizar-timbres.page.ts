import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { TimbresService } from 'src/app/services/timbres.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { ParametrosSistema } from 'src/app/libs/parametros.emun';

import { EditarTimbreModalComponent } from 'src/app/componentes/editar-timbre-modal/editar-timbre-modal.component';
import { AsignacionesMovilService } from 'src/app/services/asignaciones-movil.services';

@Component({
  selector: 'app-actualizar-timbres',
  templateUrl: './actualizar-timbres.page.html',
  styleUrls: ['./actualizar-timbres.page.scss'],
})
export class ActualizarTimbresPage implements OnInit {

  filtroNombre!: Observable<any[]>;

  funcionarioF = new FormControl('');
  codigo = new FormControl('');
  cedula = new FormControl('');
  fecha = new FormControl('', Validators.required);

  formulario = new FormGroup({
    funcionarioForm: this.funcionarioF,
    codigoForm: this.codigo,
    cedulaForm: this.cedula,
    fechaForm: this.fecha,
  });

  empleados: any[] = [];
  timbres: any[] = [];

  mostrarResultados = false;
  cargando = false;

  formato_fecha = 'dd/MM/yyyy';
  formato_hora = 'HH:mm:ss';
  idioma_fechas = 'es';

  rolEmpleado = 0;
  idEmpleado = 0;

  idUsuariosAcceso: Set<any> = new Set();

  constructor(
    private readonly timbresService: TimbresService,
    private readonly empleadosService: EmpleadosService,
    private readonly parametrosService: ParametrosService,
    public validar: ValidacionesService,
    private readonly modalController: ModalController,
    private readonly toastController: ToastController,
    private readonly asignacionesMovil: AsignacionesMovilService
  ) { }

  async ngOnInit() {
    this.idEmpleado = parseInt(localStorage.getItem('empleadoID') ?? '0', 10);
    this.rolEmpleado = parseInt(localStorage.getItem('rol') ?? '0', 10);

    await this.cargarAsignacionesUsuario();

    this.BuscarParametro();
    this.ObtenerEmpleados();
  }

  // ============================================================
  // PARÁMETROS DE FECHA / HORA
  // ============================================================

  BuscarParametro() {
    const detalles = [
      ParametrosSistema.FORMATO_FECHA,
      ParametrosSistema.FORMATO_HORA
    ];

    this.parametrosService.ObtenerFormatos(detalles).subscribe({
      next: (res: any[]) => {
        res.forEach((p: any) => {
          if (p.id_parametro === ParametrosSistema.FORMATO_FECHA) {
            this.formato_fecha = p.descripcion;
          }

          if (p.id_parametro === ParametrosSistema.FORMATO_HORA) {
            this.formato_hora = p.descripcion;
          }
        });
      },
      error: () => {
        this.formato_fecha = 'dd/MM/yyyy';
        this.formato_hora = 'HH:mm:ss';
      }
    });
  }

  // ============================================================
  // ASIGNACIONES DE EMPLEADOS
  // ============================================================

  private async cargarAsignacionesUsuario(): Promise<void> {
    if (!this.idEmpleado || this.idEmpleado <= 0) {
      this.idUsuariosAcceso = new Set();
      return;
    }

    try {
      await this.asignacionesMovil.ObtenerAsignacionesUsuario(this.idEmpleado);

      this.idUsuariosAcceso = this.asignacionesMovil.idUsuariosAcceso ?? new Set();

      // Permitimos también que el usuario pueda consultarse a sí mismo.
      this.idUsuariosAcceso.add(this.idEmpleado);

    } catch {
      this.idUsuariosAcceso = new Set();

      // Respaldo: el usuario puede verse a sí mismo.
      this.idUsuariosAcceso.add(this.idEmpleado);
    }
  }

  private aplicarFiltroPorAsignacion(empleados: any[]): any[] {
    if (!empleados || empleados.length === 0) {
      return [];
    }

    // SUPERADMINISTRADOR: rol 1 ve todos.
    if (this.rolEmpleado === 1) {
      return empleados;
    }

    if (!this.idUsuariosAcceso || this.idUsuariosAcceso.size === 0) {
      return [];
    }

    return empleados.filter((empleado: any) => {
      const idEmpleado = Number(
        empleado.id ??
        empleado.id_empleado ??
        empleado.idEmpleado ??
        0
      );

      return this.idUsuariosAcceso.has(idEmpleado);
    });
  }

  private aplicarFiltroTimbresPorAsignacion(timbres: any[]): any[] {
    if (!timbres || timbres.length === 0) {
      return [];
    }

    // SUPERADMINISTRADOR: rol 1 ve todos.
    if (this.rolEmpleado === 1) {
      return timbres;
    }

    if (!this.idUsuariosAcceso || this.idUsuariosAcceso.size === 0) {
      return [];
    }

    const codigosPermitidos = new Set(
      this.empleados.map((empleado: any) =>
        String(empleado.codigo ?? '').trim()
      )
    );

    return timbres.filter((timbre: any) => {
      const idEmpleadoTimbre = Number(
        timbre.id_empleado ??
        timbre.empleado_id ??
        timbre.idEmpleado ??
        0
      );

      const codigoTimbre = String(
        timbre.codigo ??
        timbre.timbre_codigo_reloj ??
        ''
      ).trim();

      const tieneAccesoPorId = this.idUsuariosAcceso.has(idEmpleadoTimbre);
      const tieneAccesoPorCodigo = codigosPermitidos.has(codigoTimbre);

      return tieneAccesoPorId || tieneAccesoPorCodigo;
    });
  }

  // ============================================================
  // EMPLEADOS / AUTOCOMPLETE
  // ============================================================

  ObtenerEmpleados() {
    this.empleados = [];

    this.empleadosService.BuscarListaEmpleados().subscribe({
      next: (data: any) => {
        const listaEmpleados = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];

        this.empleados = this.aplicarFiltroPorAsignacion(listaEmpleados);

        this.filtroNombre = this.funcionarioF.valueChanges.pipe(
          startWith(''),
          map((value: any) => this.FiltrarEmpleado(value ?? ''))
        );

        if (this.rolEmpleado !== 1 && this.empleados.length === 0) {
          this.abrirToast(
            'No tiene empleados asignados para consultar.',
            'warning'
          );
        }
      },
      error: () => {
        this.empleados = [];
        this.abrirToast('No se pudo cargar la lista de empleados.', 'warning');
      }
    });
  }

  FiltrarEmpleado(value: string): any[] {
    if (!value) {
      return this.empleados;
    }

    const filtros = value.toUpperCase().trim().split(/\s+/);

    return this.empleados.filter((info: any) => {
      const nombreCompleto = String(info.empleado ?? '').toUpperCase();

      return filtros.every(fragmento =>
        nombreCompleto.includes(fragmento)
      );
    });
  }

  seleccionarEmpleado(empleado: any) {
    if (!empleado) {
      return;
    }

    this.funcionarioF.setValue(empleado.empleado ?? '');

    if (empleado.codigo) {
      this.codigo.setValue(empleado.codigo);
    }

    if (empleado.identificacion) {
      this.cedula.setValue(empleado.identificacion);
    }
  }

  obtenerCodigoPorNombre(nombreEmpleado: string): string {
    if (!nombreEmpleado) {
      return '';
    }

    const empleado = this.empleados.find((e: any) =>
      String(e.empleado ?? '').trim().toLowerCase() === nombreEmpleado.trim().toLowerCase()
    );

    return String(empleado?.codigo ?? '').trim();
  }

  // ============================================================
  // BÚSQUEDA DE TIMBRES
  // ============================================================

  BuscarTimbresFecha(form: any) {
    this.timbres = [];
    this.mostrarResultados = false;

    const codigoForm = String(form.codigoForm ?? '').trim();
    const cedulaForm = String(form.cedulaForm ?? '').trim();
    const funcionarioForm = String(form.funcionarioForm ?? '').trim();

    if (!codigoForm && !cedulaForm && !funcionarioForm) {
      this.abrirToast(
        'Ingrese nombre, código o identificación del empleado.',
        'warning'
      );
      return;
    }

    if (!form.fechaForm) {
      this.abrirToast('Seleccione una fecha para consultar.', 'warning');
      return;
    }

    const codigoEmpleado = this.obtenerCodigoPorNombre(funcionarioForm);

    if (funcionarioForm && !codigoEmpleado && !codigoForm && !cedulaForm) {
      this.abrirToast(
        'Seleccione un empleado válido de la lista.',
        'warning'
      );
      return;
    }

    const datos = {
      codigo: codigoForm || codigoEmpleado,
      identificacion: cedulaForm,
      fecha: this.formatearFechaConsulta(form.fechaForm)
    };

    if (!datos.fecha) {
      this.abrirToast('La fecha seleccionada no es válida.', 'warning');
      return;
    }

    this.cargando = true;

    this.timbresService.ObtenerTimbresFechaEmple(datos).subscribe({
      next: (res: any) => {
        const registros = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];

        const registrosFiltrados = this.aplicarFiltroTimbresPorAsignacion(registros);

        this.timbres = registrosFiltrados.map((timbre: any) => {
          return this.prepararTimbreVisual(timbre);
        });

        this.mostrarResultados = true;
        this.cargando = false;

        if (registros.length > 0 && this.timbres.length === 0) {
          this.abrirToast(
            'No tiene acceso a los datos de este empleado.',
            'warning'
          );
          return;
        }

        if (this.timbres.length === 0) {
          this.abrirToast(
            'No se encontraron timbres para la búsqueda.',
            'medium'
          );
        }
      },
      error: () => {
        this.timbres = [];
        this.mostrarResultados = false;
        this.cargando = false;

        this.abrirToast('No se pudo consultar los timbres.', 'danger');
      }
    });
  }

  formatearFechaConsulta(fecha: any): string {
    if (!fecha) {
      return '';
    }

    try {
      return this.validar.DarFormatoFecha(fecha, 'yyyy-MM-dd');
    } catch {
      const fechaDate = new Date(fecha);

      if (isNaN(fechaDate.getTime())) {
        return '';
      }

      const yyyy = fechaDate.getFullYear();
      const mm = String(fechaDate.getMonth() + 1).padStart(2, '0');
      const dd = String(fechaDate.getDate()).padStart(2, '0');

      return `${yyyy}-${mm}-${dd}`;
    }
  }

  prepararTimbreVisual(timbre: any): any {
    const fechaValidada =
      timbre.fecha_hora_timbre_validado ??
      timbre.fecha_hora_timbre ??
      timbre.fecha_hora_timbre_servidor ??
      '';

    let fecha = '';
    let hora = '';

    if (fechaValidada && String(fechaValidada).includes(' ')) {
      const partes = String(fechaValidada).split(' ');
      const fechaParte = partes[0];
      const horaParte = partes[1];

      try {
        const fechaFormato = this.validar.DarFormatoFecha(fechaParte, 'yyyy-MM-dd');

        fecha = this.validar.FormatearFecha(
          fechaFormato,
          this.formato_fecha,
          this.validar.dia_abreviado
        );

        hora = this.validar.FormatearHora(horaParte, this.formato_hora);
      } catch {
        fecha = fechaParte;
        hora = horaParte;
      }
    }

    return {
      ...timbre,
      fecha,
      hora,
      accion_: this.obtenerNombreAccion(timbre.accion),
      tecla_funcion_: this.obtenerNombreTeclaFuncion(timbre.tecla_funcion),
    };
  }

  obtenerNombreAccion(accion: any): string {
    switch (String(accion ?? '')) {
      case 'E':
        return 'Entrada';
      case 'S':
        return 'Salida';
      case 'I/A':
      case 'S/A':
        return 'Inicio alimentación';
      case 'F/A':
      case 'E/A':
        return 'Fin alimentación';
      case 'I/P':
      case 'S/P':
        return 'Inicio permiso';
      case 'F/P':
      case 'E/P':
        return 'Fin permiso';
      case 'HA':
        return 'Timbre libre';
      case 'D':
        return 'Desconocido';
      default:
        return 'No identificado';
    }
  }

  obtenerNombreTeclaFuncion(teclaFuncion: any): string {
    switch (String(teclaFuncion ?? '')) {
      case '0':
        return 'Entrada';
      case '1':
        return 'Salida';
      case '2':
        return 'Inicio alimentación';
      case '3':
        return 'Fin alimentación';
      case '4':
        return 'Inicio permiso';
      case '5':
        return 'Fin permiso';
      case '7':
        return 'Timbre libre';
      case '99':
        return 'Desconocido';
      default:
        return 'No identificado';
    }
  }

  // ============================================================
  // MODALES
  // ============================================================

  async AbrirVentanaEditar(timbre: any) {
    const modal = await this.modalController.create({
      component: EditarTimbreModalComponent,
      componentProps: {
        timbre
      },
      cssClass: 'modal-timbre'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data?.actualizado === true) {
      this.BuscarTimbresFecha(this.formulario.value);
    }
  }

  // ============================================================
  // LIMPIAR
  // ============================================================

  LimpiarCampos() {
    this.codigo.reset('');
    this.cedula.reset('');
    this.fecha.reset('');
    this.funcionarioF.reset('');
    this.timbres = [];
    this.mostrarResultados = false;
  }

  // ============================================================
  // TOAST
  // ============================================================

  async abrirToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color,
      position: 'middle'
    });

    await toast.present();
  }
}