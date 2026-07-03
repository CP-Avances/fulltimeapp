import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { EmpleadosService } from '../../services/empleados.service';
import { ModalController, ToastController } from '@ionic/angular';
import { LoadingController, IonInfiniteScroll } from '@ionic/angular';
import { AsignacionesMovilService } from 'src/app/services/asignaciones-movil.services';

@Component({
  selector: 'app-lista-empleados',
  templateUrl: './lista-empleados.component.html',
  styleUrls: ['./lista-empleados.component.scss'],
})

export class ListaEmpleadosComponent implements OnInit {

  empleados: any[] = [];
  empleados_filtro: any[] = [];

  pageActual: number = 1;
  ver: boolean = true;
  loading: boolean = false;

  rolEmpleado: number = 0;
  idEmpleado: number = 0;
  idUsuariosAcceso: Set<any> = new Set();

  claveStorageEmpleados: string = '';

  @Input('open') presentModal!: (args: any) => void;
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  posts: any[] = [];
  totalPosts = 0;
  limit = 10;

  constructor(
    private empleadoService: EmpleadosService,
    public modalController: ModalController,
    private toastController: ToastController,
    public loadingController: LoadingController,
    private readonly asignacionesMovil: AsignacionesMovilService
  ) { }

  async ngOnInit(): Promise<void> {
    this.idEmpleado = parseInt(localStorage.getItem('empleadoID') ?? '0', 10);
    this.rolEmpleado = parseInt(localStorage.getItem('rol') ?? '0', 10);

    this.claveStorageEmpleados = `lista-empleados-${this.idEmpleado}`;

    await this.cargarAsignacionesUsuario();

    /**
     * Si quieres obligar a que siempre consulte al servidor,
     * deja activa esta línea.
     *
     * Si prefieres usar cache filtrado por usuario, déjala comentada.
     */
    // sessionStorage.removeItem(this.claveStorageEmpleados);

    this.ObtenerListaEmpleados();
  }

  private async cargarAsignacionesUsuario(): Promise<void> {
    if (!this.idEmpleado) return;

    try {
      await this.asignacionesMovil.ObtenerAsignacionesUsuario(this.idEmpleado);
      this.idUsuariosAcceso = this.asignacionesMovil.idUsuariosAcceso;
    } catch {
      this.idUsuariosAcceso = new Set();
    }
  }

  private aplicarFiltroPorAsignacion(empleados: any[]): any[] {
    if (!empleados || empleados.length === 0) return [];

    // Superadministrador: ve todos
    if (this.rolEmpleado === 1) {
      return empleados;
    }

    // Si no tiene asignaciones, no mostrar empleados
    if (!this.idUsuariosAcceso || this.idUsuariosAcceso.size === 0) {
      return [];
    }

    return empleados.filter((empleado: any) => {
      const idEmpleado = Number(empleado.id ?? empleado.id_empleado);
      return this.idUsuariosAcceso.has(idEmpleado);
    });
  }

  loadMorePosts(event: any) {
    setTimeout(() => {
      console.log('Begin async operation');

      this.limit += 10;
      event.target.complete();

      if (this.posts.length === this.limit) {
        event.target.disabled = true;
      }
    }, 500);
  }

  ObtenerListaEmpleados() {
    const emp = sessionStorage.getItem(this.claveStorageEmpleados);

    if (emp === null) {
      this.empleadoService.ObtenerListaEmpleados(1).subscribe({
        next: (res: any[]) => {
          const empleadosServidor = res ?? [];

          this.empleados = this.aplicarFiltroPorAsignacion(empleadosServidor);
          this.empleados_filtro = [...this.empleados];

          sessionStorage.setItem(
            this.claveStorageEmpleados,
            JSON.stringify(this.empleados)
          );

          this.loading = true;
          this.ver = this.empleados_filtro.length < 11;
        },
        error: () => {
          this.loading = true;
          this.ver = true;

          return this.abrirToas(
            'Ups!, No fue posible conectarse con el servidor',
            'danger',
            3500,
            'middle'
          );
        }
      });
    } else {
      this.loading = true;

      const empleadosCache = JSON.parse(emp);

      // Volvemos a aplicar filtro por seguridad
      this.empleados = this.aplicarFiltroPorAsignacion(empleadosCache);
      this.empleados_filtro = [...this.empleados];

      this.ver = this.empleados_filtro.length < 11;
    }

    if (!this.empleados_filtro) {
      this.loading = false;
      this.ver = true;
    }
  }

  changeSearch(e: any) {
    const texto = String(e?.detail?.value ?? '').toLowerCase();

    const palabrasBusqueda = texto
      .split(' ')
      .filter(Boolean);

    this.empleados_filtro = this.empleados.filter((o: any) => {
      const nombreCompleto = String(o.fullname ?? '').toLowerCase();
      const codigo = String(o.codigo ?? '').toLowerCase();
      const identificacion = String(o.identificacion ?? o.cedula ?? '').toLowerCase();

      return palabrasBusqueda.every((palabra: string) =>
        nombreCompleto.includes(palabra) ||
        codigo.includes(palabra) ||
        identificacion.includes(palabra)
      );
    });

    this.ver = this.empleados_filtro.length < 11;
  }

  async abrirToas(mensaje: string, color: string, duracion: number, position: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      mode: 'ios',
      position: position
    });

    toast.present();
  }

  public maxSize: number = 5;
  public directionLinks: boolean = true;
  public autoHide: boolean = false;
  public responsive: boolean = true;

  public labels: any = {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };

}