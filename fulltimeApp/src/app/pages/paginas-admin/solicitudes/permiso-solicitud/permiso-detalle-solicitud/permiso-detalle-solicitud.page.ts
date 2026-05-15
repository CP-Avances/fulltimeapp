import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

import { PermisosService } from 'src/app/services/permisos.service';

@Component({
  selector: 'app-permiso-detalle-solicitud',
  templateUrl: './permiso-detalle-solicitud.page.html',
  styleUrls: ['./permiso-detalle-solicitud.page.scss'],
})
export class PermisoDetalleSolicitudPage implements OnInit {

  solicitud: any = null;
  cargando = false;
  eliminando = false;

  constructor(
    private permisosService: PermisosService,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router
  ) { }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const solicitudState = navigation?.extras?.state?.['solicitud'];

    if (solicitudState) {
      this.solicitud = solicitudState;
      this.cargarDetalleDesdeBackend();
      return;
    }

    this.mostrarToast('No se recibió la información de la solicitud.', 'warning');
    this.regresar();
  }

  cargarDetalleDesdeBackend() {
    if (!this.solicitud?.id) return;

    this.cargando = true;

    this.permisosService.obtenerSolicitudPermisoPorId(this.solicitud.id).subscribe({
      next: (detalle) => {
        if (detalle) {
          this.solicitud = {
            ...this.solicitud,
            ...detalle
          };
        }

        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.mostrarToast('No se pudo cargar el detalle completo de la solicitud.', 'warning');
      }
    });
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

  formatearFechaHora(fecha: string | undefined): string {
    if (!fecha) return 'Sin fecha';

    const date = new Date(fecha);

    return date.toLocaleString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getNombreEmpleado(): string {
    const apellido = this.solicitud?.apellido_empleado || this.solicitud?.apellido || '';
    const nombre = this.solicitud?.nombre_empleado || this.solicitud?.nombre || '';

    const nombreCompleto = `${apellido} ${nombre}`.trim();

    return nombreCompleto || 'N/D';
  }

  getDepartamento(): string {
    return this.solicitud?.departamento_nombre ||
      this.solicitud?.nombre_departamento ||
      this.solicitud?.departamento ||
      'N/D';
  }

  getTipoPermiso(): string {
    return this.solicitud?.tipo_permiso_descripcion ||
      this.solicitud?.tipoPermiso ||
      this.solicitud?.descripcion_permiso ||
      'N/D';
  }

  getTipoDescuento(): string {
    return this.solicitud?.tipo_permiso_tipo_descuento ||
      this.solicitud?.tipo_descuento ||
      'NINGUNO';
  }

  getNumeroSolicitud(): string {
    return this.solicitud?.numero_permiso ||
      this.solicitud?.id ||
      '—';
  }

  getDiasPermiso(): number {
    return Number(
      this.solicitud?.dias_permiso ??
      this.solicitud?.dia ??
      this.solicitud?.dias ??
      0
    );
  }

  getMinutosTotales(): number {
    return Number(this.solicitud?.minutos_totales ?? 0);
  }

  getHorasFormatoHHmm(): string {
    const minutos = this.getMinutosTotales();
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  mostrarHorario(): boolean {
    return !!this.solicitud?.hora_inicio || !!this.solicitud?.hora_fin || this.getMinutosTotales() > 0;
  }

  getNumeroDia(campo: string): number {
    return Number(this.solicitud?.[campo] ?? 0);
  }

  editarSolicitud() {
    if (!this.solicitud?.id) {
      this.mostrarToast('No se pudo obtener el ID de la solicitud.', 'warning');
      return;
    }

    this.router.navigateByUrl(
      '/reloj/solicitudes/permiso-solicitud/permiso-editar-solicitud',
      {
        state: {
          solicitud: this.solicitud
        }
      }
    );
  }

  imprimirSolicitud() {
    this.mostrarToast('La impresión de permisos se conectará en el siguiente paso.', 'warning');
  }

  async confirmarEliminar() {
    if (!this.solicitud?.id) {
      this.mostrarToast('No se pudo obtener el ID de la solicitud.', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Eliminar solicitud',
      message: '¿Está seguro que desea eliminar esta solicitud de permiso?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarSolicitud();
          }
        }
      ]
    });

    await alert.present();
  }

  eliminarSolicitud() {
    if (!this.solicitud?.id) return;

    this.eliminando = true;

    this.permisosService.eliminarSolicitudPermiso(this.solicitud.id).subscribe({
      next: () => {
        this.eliminando = false;
        this.mostrarToast('Solicitud de permiso eliminada correctamente.', 'success');

        localStorage.setItem('resetBusquedaPermisos', 'true');
        this.router.navigateByUrl('/reloj/solicitudes/permiso-solicitud/permiso-criterio-busqueda');
      },
      error: () => {
        this.eliminando = false;
        this.mostrarToast('No se pudo eliminar la solicitud de permiso.', 'danger');
      }
    });
  }

  regresar() {
    this.router.navigateByUrl('/reloj/solicitudes/permiso-solicitud/permiso-criterio-busqueda');
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