import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

import { VacacionesService } from 'src/app/services/vacaciones.service';

@Component({
  selector: 'app-vacacion-criterio-busqueda',
  templateUrl: './vacacion-criterio-busqueda.page.html',
  styleUrls: ['./vacacion-criterio-busqueda.page.scss'],
})
export class VacacionCriterioBusquedaPage implements OnInit {

  idEmpleado!: number;

  fechaDesde = '';
  estadoSeleccionado: number = 1;

  estados = [
    { valor: 1, etiqueta: 'Pendiente' },
    { valor: 2, etiqueta: 'Pre-Autorizado' },
    { valor: 3, etiqueta: 'Autorizado' },
    { valor: 4, etiqueta: 'No-Autorizado' },
  ];

  solicitudes: any[] = [];

  cargando = false;
  busquedaRealizada = false;
  mostrarFormularioBusqueda = true;

  limite = 10;
  desde = 0;
  totalSolicitudes = 0;

  constructor(
    private vacacionesService: VacacionesService,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.idEmpleado = parseInt(localStorage.getItem('empleadoID') || '0', 10);
    this.fechaDesde = this.obtenerFechaHoy();
  }

  ionViewWillEnter() {
    const debeResetear = localStorage.getItem('resetBusquedaVacaciones');

    if (debeResetear === 'true') {
      localStorage.removeItem('resetBusquedaVacaciones');
      this.resetearPantallaBusqueda();
    }
  }

  resetearPantallaBusqueda() {
    this.idEmpleado = parseInt(localStorage.getItem('empleadoID') || '0', 10);

    this.fechaDesde = this.obtenerFechaHoy();
    this.estadoSeleccionado = 1;

    this.solicitudes = [];
    this.totalSolicitudes = 0;
    this.busquedaRealizada = false;
    this.cargando = false;
    this.desde = 0;
    this.mostrarFormularioBusqueda = true;
  }

  obtenerFechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  buscarSolicitudes() {
    if (!this.idEmpleado) {
      this.mostrarToast('No se encontró el empleado logeado.', 'warning');
      return;
    }

    if (!this.fechaDesde) {
      this.mostrarToast('Seleccione la fecha desde.', 'warning');
      return;
    }

    if (!this.estadoSeleccionado) {
      this.mostrarToast('Seleccione el estado.', 'warning');
      return;
    }

    this.cargando = true;
    this.busquedaRealizada = true;
    this.solicitudes = [];
    this.totalSolicitudes = 0;
    this.desde = 0;

    const filtros = {
      empleados: [this.idEmpleado],
      estado: this.estadoSeleccionado,
      fechaDesde: this.fechaDesde
    };

    this.vacacionesService.ObtenerMisSolicitudesVacacion(
      this.limite,
      this.desde,
      filtros
    ).subscribe({
      next: (resp: any) => {
        this.solicitudes = resp?.data || [];
        this.totalSolicitudes = resp?.pagination?.total || this.solicitudes.length || 0;
        this.cargando = false;
        this.mostrarFormularioBusqueda = false;
      },
      error: (err) => {
        this.cargando = false;
        this.mostrarToast(err?.message || 'No se pudieron consultar las solicitudes.', 'danger');
      }
    });
  }

  limpiarFormulario() {
    this.fechaDesde = this.obtenerFechaHoy();
    this.estadoSeleccionado = 1;
    this.solicitudes = [];
    this.totalSolicitudes = 0;
    this.busquedaRealizada = false;
    this.cargando = false;
    this.desde = 0;
    this.mostrarFormularioBusqueda = true;
  }

  volverABusqueda() {
    this.mostrarFormularioBusqueda = true;
    this.busquedaRealizada = false;
    this.solicitudes = [];
    this.totalSolicitudes = 0;
  }

  estadoTexto(estado: number | string): string {
    const estadoNumber = Number(estado);

    const estadosMap: any = {
      1: 'Pendiente',
      2: 'Pre-Autorizado',
      3: 'Autorizado',
      4: 'No Autorizado'
    };

    return estadosMap[estadoNumber] || 'Desconocido';
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

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return 'Sin fecha';

    const date = new Date(fecha);

    return date.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  verSolicitud(solicitud: any) {
    this.router.navigateByUrl(
      '/reloj/solicitudes/vacacion-solicitud/vacacion-detalle-solicitud',
      {
        state: {
          solicitud
        }
      }
    );
  }

  regresar() {
    this.router.navigateByUrl('/reloj/solicitudes/vacacion-solicitud');
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