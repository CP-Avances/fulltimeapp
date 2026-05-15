import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { VacacionesService } from 'src/app/services/vacaciones.service';
import { ReportesMicroService } from 'src/app/services/reportes-micro.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { PermisosAccionesService } from 'src/app/services/permisos-acciones.service';

@Component({
  selector: 'app-vacacion-detalle-solicitud',
  templateUrl: './vacacion-detalle-solicitud.page.html',
  styleUrls: ['./vacacion-detalle-solicitud.page.scss'],
})
export class VacacionDetalleSolicitudPage implements OnInit {

  solicitud: any = null;
  eliminando = false;
  imprimiendo = false;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private vacacionesService: VacacionesService,
    private navCtrl: NavController,
    private reportes: ReportesMicroService,
    private permisosAcciones: PermisosAccionesService
  ) { }

  async ngOnInit() {
    this.imprimirLocalStorage();
    const navigation = this.router.getCurrentNavigation();
    this.solicitud = navigation?.extras?.state?.['solicitud'];

    if (!this.solicitud) {
      const state = history.state;
      this.solicitud = state?.solicitud || null;
    }

    if (!this.solicitud) {
      this.mostrarToast('No se encontró la información de la solicitud.', 'warning');
      this.regresar();
    }

    await this.cargarPermisosAcciones();
  }

  imprimirLocalStorage() {

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
    }

  }

  regresar() {
    this.router.navigateByUrl('/reloj/solicitudes/vacacion-solicitud/vacacion-criterio-busqueda');
  }

  obtenerIdSolicitud(): number {
    return Number(this.solicitud?.id_solicitud_vacacion || this.solicitud?.id || 0);
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
    if (!fecha) return '—';

    const date = new Date(fecha);

    return date.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  textoFeriadosIncluidos(valor: any): string {
    return valor === true || valor === 'true' || valor === 1 || valor === '1'
      ? 'Sí'
      : 'No';
  }

  editarSolicitud() {
    this.router.navigateByUrl(
      '/reloj/solicitudes/vacacion-solicitud/vacacion-editar-solicitud',
      {
        state: {
          solicitud: this.solicitud
        }
      }
    );
  }

  async eliminarSolicitud() {
    const idSolicitud = this.obtenerIdSolicitud();

    if (!idSolicitud) {
      this.mostrarToast('No se encontró el ID de la solicitud.', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Eliminar solicitud',
      message: '¿Está seguro que desea eliminar esta solicitud de vacación?',
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
            this.confirmarEliminarSolicitud(idSolicitud);
          }
        }
      ]
    });

    await alert.present();
  }

  confirmarEliminarSolicitud(idSolicitud: number) {
    if (this.eliminando) return;

    this.eliminando = true;

    this.vacacionesService.EliminarSolicitudesVacaciones(idSolicitud).subscribe({
      next: (resp) => {
        const fallo = (resp && resp.message === 'error') || resp?.ok === false;

        if (fallo) {
          this.eliminando = false;
          this.mostrarToast(
            resp?.mensaje || 'No se pudo eliminar esta solicitud.',
            'danger'
          );
          return;
        }

        this.mostrarToast('Solicitud eliminada correctamente.', 'success');

        localStorage.setItem('resetBusquedaVacaciones', 'true');

        setTimeout(() => {
          this.navCtrl.navigateRoot(
            '/reloj/solicitudes/vacacion-solicitud/vacacion-criterio-busqueda',
            {
              animated: true
            }
          );
        }, 300);
      },
      error: (err) => {

        this.eliminando = false;

        if (err?.status === 409) {
          this.mostrarToast(
            'Existen datos relacionados con esta solicitud. No fue posible eliminar.',
            'danger'
          );
          return;
        }

        this.mostrarToast(
          err?.message || 'Ocurrió un error al eliminar la solicitud.',
          'danger'
        );
      }
    });
  }

  imprimirSolicitud() {
    this.generarReporteSolicitudVacacion();
  }

  generarReporteSolicitudVacacion() {
    if (!this.solicitud) {
      this.mostrarToast('No se encontró la solicitud para generar el reporte.', 'warning');
      return;
    }

    if (this.imprimiendo) return;

    this.imprimiendo = true;

    const data = this.construirPayloadReporteSolicitud();

    this.reportes.generarReporteServicio('solicitud-vacacion', 'pdf', data).subscribe({
      next: ({ blob, filename }) => {
        this.imprimiendo = false;
        this.descargarArchivo(blob, filename);
        this.mostrarToast('Reporte generado correctamente.', 'success');
      },
      error: () => {
        this.imprimiendo = false;
        this.mostrarToast(
          'No se pudo generar el reporte. El servicio de reportes no está disponible en este momento.',
          'danger'
        );
      }
    });
  }

  construirPayloadReporteSolicitud() {
    const nombreUsuario =
      localStorage.getItem('fullname') ||
      localStorage.getItem('nombre_usuario') ||
      'Usuario Fulltime';

    const nombreEmpresa =
      localStorage.getItem('nombre_empresa') ||
      this.solicitud?.nom_empresa ||
      '';

    return {
      usuario: nombreUsuario,
      empresa: nombreEmpresa.toUpperCase(),

      fraseMarcaAgua: null,
      logoBase64: null,
      colorPrincipal: null,
      colorSecundario: null,

      solicitud: {
        id: this.solicitud.id || this.solicitud.id_solicitud_vacacion,
        estado: this.solicitud.estado,
        incluir_feriados: this.solicitud.incluir_feriados ?? false,

        fecha_inicio: this.solicitud.fecha_inicio,
        fecha_final: this.solicitud.fecha_final,
        fecha_registro: this.solicitud.fecha_registro ?? null,
        fecha_actualizacion: this.solicitud.fecha_actualizacion ?? null,
        fecha_creacion: this.solicitud.fecha_registro ?? null,

        documento: this.solicitud.documento || null,

        numero_dias_lunes: this.solicitud.numero_dias_lunes || 0,
        numero_dias_martes: this.solicitud.numero_dias_martes || 0,
        numero_dias_miercoles: this.solicitud.numero_dias_miercoles || 0,
        numero_dias_jueves: this.solicitud.numero_dias_jueves || 0,
        numero_dias_viernes: this.solicitud.numero_dias_viernes || 0,
        numero_dias_sabado: this.solicitud.numero_dias_sabado || this.solicitud.numero_dias_sabados || 0,
        numero_dias_domingo: this.solicitud.numero_dias_domingo || this.solicitud.numero_dias_domingos || 0,

        numero_dias_totales: this.solicitud.numero_dias_totales || this.solicitud.total_dias || 0,

        nombre_emple: this.solicitud.nombre_emple || this.solicitud.nombre_empleado || null,
        apellido_emple: this.solicitud.apellido_emple || this.solicitud.apellido_empleado || null,
        identificacion: this.solicitud.identificacion || null,
        codigo: this.solicitud.codigo || this.solicitud.codigo_empleado || null,

        nom_regimen: this.solicitud.nom_regimen || null,
        cargo: this.solicitud.cargo || null,
        nom_empresa: this.solicitud.nom_empresa || nombreEmpresa || null,
        nom_ciudad: this.solicitud.nom_ciudad || null,
        nom_sucursal: this.solicitud.nom_sucursal || null,
        nom_departamento: this.solicitud.nom_departamento || this.solicitud.nombre_departamento || null,
      },

      aprobaciones: []
    };
  }

  descargarArchivo(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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



  // CONTROL DE BOTONES
  async cargarPermisosAcciones() {
    await this.permisosAcciones.cargarAccionesRol([
      {
        pagina: 'Solicitud Permisos',
        accion: 'Editar Solicitud Permiso'
      },
      {
        pagina: 'Solicitud Permisos',
        accion: 'Eliminar Solicitud Permiso'
      },
      {
        pagina: 'Solicitud Vacaciones',
        accion: 'Editar Solicitud Vacación'
      },
      {
        pagina: 'Solicitud Vacaciones',
        accion: 'Eliminar Solicitud Vacación'
      }
    ]);
  }

  tienePermisoAccion(pagina: string, accion: string): boolean {
    return this.permisosAcciones.tienePermisoAccion(pagina, accion);
  }
}