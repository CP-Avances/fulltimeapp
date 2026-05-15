import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

import { PermisosService } from 'src/app/services/permisos.service';

@Component({
  selector: 'app-permiso-criterio-busqueda',
  templateUrl: './permiso-criterio-busqueda.page.html',
  styleUrls: ['./permiso-criterio-busqueda.page.scss'],
})
export class PermisoCriterioBusquedaPage implements OnInit {

  idEmpleado!: number;

  fechaDesde = '';
  estadoSeleccionado: string = 'PENDIENTE';

  estados = [
    { valor: 'PENDIENTE', etiqueta: 'Pendiente' },
    { valor: 'PRE_AUTORIZADO', etiqueta: 'Pre-Autorizado' },
    { valor: 'AUTORIZADO', etiqueta: 'Autorizado' },
    { valor: 'NO_AUTORIZADO', etiqueta: 'No-Autorizado' },
  ];

  solicitudes: any[] = [];

  cargando = false;
  busquedaRealizada = false;
  mostrarFormularioBusqueda = true;

  totalSolicitudes = 0;

  constructor(
    private permisosService: PermisosService,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.idEmpleado = parseInt(localStorage.getItem('empleadoID') || '0', 10);
    this.fechaDesde = this.obtenerFechaHoy();
  }

  ionViewWillEnter() {
    const debeResetear = localStorage.getItem('resetBusquedaPermisos');

    if (debeResetear === 'true') {
      localStorage.removeItem('resetBusquedaPermisos');
      this.resetearPantallaBusqueda();
    }
  }

  resetearPantallaBusqueda() {
    this.idEmpleado = parseInt(localStorage.getItem('empleadoID') || '0', 10);
    this.fechaDesde = this.obtenerFechaHoy();
    this.estadoSeleccionado = 'PENDIENTE';

    this.solicitudes = [];
    this.totalSolicitudes = 0;
    this.busquedaRealizada = false;
    this.cargando = false;
    this.mostrarFormularioBusqueda = true;
  }

  obtenerFechaHoy(): string {
    return this.formatearFechaLocal(new Date());
  }

  buscarSolicitudes() {
    if (!this.idEmpleado) {
      this.mostrarToast('No se encontró el empleado logueado.', 'warning');
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

    const payload = {
      criterio: 'EMP',
      fechaDesde: this.fechaDesde,
      estado: this.estadoSeleccionado,
      idsTipoPermiso: [],
      idsDepartamento: [],
      idsEmpleado: [this.idEmpleado]
    };

    this.permisosService.buscarSolicitudesPermisos(payload).subscribe({
      next: (resp: any) => {
        this.solicitudes = Array.isArray(resp?.data) ? resp.data : [];
        this.totalSolicitudes = this.solicitudes.length;

        this.cargando = false;
        this.mostrarFormularioBusqueda = false;
      },
      error: () => {
        this.cargando = false;
        this.mostrarToast('No se pudieron consultar las solicitudes de permiso.', 'danger');
      }
    });
  }

  limpiarFormulario() {
    this.fechaDesde = this.obtenerFechaHoy();
    this.estadoSeleccionado = 'PENDIENTE';

    this.solicitudes = [];
    this.totalSolicitudes = 0;
    this.busquedaRealizada = false;
    this.cargando = false;
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

  formatearFechaLocal(fecha: Date): string {
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  }

  getHorasFormatoHHmm(solicitud: any): string {
    const minutos = Number(solicitud?.minutos_totales ?? 0);
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  obtenerDiasPermiso(solicitud: any): number {
    return Number(
      solicitud?.dia ??
      solicitud?.dias_permiso ??
      solicitud?.dias ??
      0
    );
  }

  obtenerTiempoPermiso(solicitud: any): string {
    const dias = this.obtenerDiasPermiso(solicitud);
    const horas = this.getHorasFormatoHHmm(solicitud);

    if (dias > 0) {
      return `${dias} día(s)`;
    }

    return `${horas} hora(s)`;
  }

  verSolicitud(solicitud: any) {
    this.router.navigateByUrl(
      '/reloj/solicitudes/permiso-solicitud/permiso-detalle-solicitud',
      {
        state: {
          solicitud
        }
      }
    );
  }

  regresar() {
    this.router.navigateByUrl('/reloj/solicitudes/permiso-solicitud');
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