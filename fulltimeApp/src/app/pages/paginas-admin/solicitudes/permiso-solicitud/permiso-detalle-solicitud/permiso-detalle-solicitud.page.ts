import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

import { PermisosService } from 'src/app/services/permisos.service';
import { ReportesMicroService } from 'src/app/services/reportes-micro.service';
import { EmpresaService } from 'src/app/services/empresa.service';

@Component({
  selector: 'app-permiso-detalle-solicitud',
  templateUrl: './permiso-detalle-solicitud.page.html',
  styleUrls: ['./permiso-detalle-solicitud.page.scss'],
})
export class PermisoDetalleSolicitudPage implements OnInit {

  solicitud: any = null;
  cargando = false;
  eliminando = false;
  imprimiendo = false;
  logo: any = null;
  p_color: any = null;
  s_color: any = null;
  frase: any = null;

  constructor(
    private permisosService: PermisosService,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
    private reportes: ReportesMicroService,
    private empresaService: EmpresaService
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

  ObtenerLogo(): Promise<void> {
    return new Promise((resolve) => {
      this.empresaService.ObtenerEmpresaImagen('logo').subscribe({
        next: (base64) => {
          this.logo = base64;
          resolve();
        },
        error: (error) => {
          console.error('Error obteniendo logo de empresa:', error);
          this.logo = null;
          resolve();
        }
      });
    });
  }

  ObtenerColores(): Promise<void> {
    return new Promise((resolve) => {
      this.empresaService.ConsultarDatosEmpresa().subscribe({
        next: (res) => {
          this.p_color = res?.color_principal ?? null;
          this.s_color = res?.color_secundario ?? null;
          this.frase = res?.marca_agua ?? null;
          resolve();
        },
        error: (error) => {
          console.error('Error obteniendo colores/marca de agua:', error);
          this.p_color = null;
          this.s_color = null;
          this.frase = null;
          resolve();
        }
      });
    });
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
    this.generarReporteSolicitudPermiso();
  }

  async generarReporteSolicitudPermiso() {
    if (!this.solicitud) {
      this.mostrarToast('No se encontró la solicitud para generar el reporte.', 'warning');
      return;
    }

    if (this.imprimiendo) return;

    this.imprimiendo = true;

    await this.ObtenerLogo();
    await this.ObtenerColores();

    const data = this.construirPayloadReporteSolicitudPermiso();

    console.log('PAYLOAD REPORTE SOLICITUD PERMISO:', data);

    this.reportes.generarReporteServicio('solicitud-permiso', 'pdf', data).subscribe({
      next: ({ blob, filename }) => {
        this.imprimiendo = false;
        this.descargarArchivo(blob, filename);
        this.mostrarToast('Reporte generado correctamente.', 'success');
      },
      error: (error) => {
        console.error('Error generando reporte de permiso:', error);

        this.imprimiendo = false;

        this.mostrarToast(
          'No se pudo generar el reporte. El servicio de reportes no está disponible en este momento.',
          'danger'
        );
      }
    });
  }

  construirPayloadReporteSolicitudPermiso() {
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

      fraseMarcaAgua: this.frase,
      logoBase64: this.logo,
      colorPrincipal: this.p_color,
      colorSecundario: this.s_color,

      solicitud: {
        id: this.solicitud.id,

        numero_permiso: this.solicitud.numero_permiso || this.solicitud.id,

        fecha_creacion:
          this.solicitud.fecha_creacion ||
          this.solicitud.fecha_registro ||
          this.solicitud.created_at ||
          null,

        descripcion: this.solicitud.descripcion ?? '',

        tipo_permiso:
          this.solicitud.tipo_permiso_descripcion ||
          this.solicitud.tipoPermiso ||
          this.solicitud.descripcion_permiso ||
          null,

        tipo_descuento:
          this.solicitud.tipo_permiso_tipo_descuento ||
          this.solicitud.tipo_descuento ||
          null,

        fecha_inicio: this.solicitud.fecha_inicio,
        fecha_final: this.solicitud.fecha_final,

        hora_inicio: this.solicitud.hora_inicio || null,
        hora_fin: this.solicitud.hora_fin || null,

        dias_permiso:
          this.solicitud.dias_permiso ??
          this.solicitud.dia ??
          this.solicitud.dias ??
          0,

        minutos_totales: this.solicitud.minutos_totales ?? 0,

        incluir_feriados: this.solicitud.incluir_feriados ?? false,
        legalizado: this.solicitud.legalizado ?? false,
        estado: this.solicitud.estado,

        documento: this.solicitud.documento ?? null,

        numero_dias_lunes: this.solicitud.numero_dias_lunes ?? 0,
        numero_dias_martes: this.solicitud.numero_dias_martes ?? 0,
        numero_dias_miercoles: this.solicitud.numero_dias_miercoles ?? 0,
        numero_dias_jueves: this.solicitud.numero_dias_jueves ?? 0,
        numero_dias_viernes: this.solicitud.numero_dias_viernes ?? 0,

        numero_dias_sabados:
          this.solicitud.numero_dias_sabados ??
          this.solicitud.numero_dias_sabado ??
          0,

        numero_dias_domingos:
          this.solicitud.numero_dias_domingos ??
          this.solicitud.numero_dias_domingo ??
          0,

        nombre_emple:
          this.solicitud.nombre_emple ||
          this.solicitud.nombre_empleado ||
          this.solicitud.nombre ||
          null,

        apellido_emple:
          this.solicitud.apellido_emple ||
          this.solicitud.apellido_empleado ||
          this.solicitud.apellido ||
          null,

        identificacion: this.solicitud.identificacion ?? null,

        codigo:
          this.solicitud.codigo ||
          this.solicitud.codigo_empleado ||
          null,

        nom_regimen: this.solicitud.nom_regimen ?? null,
        cargo: this.solicitud.cargo ?? null,

        nom_empresa:
          this.solicitud.nom_empresa ||
          nombreEmpresa ||
          null,

        nom_ciudad: this.solicitud.nom_ciudad ?? null,
        nom_sucursal: this.solicitud.nom_sucursal ?? null,

        nom_departamento:
          this.solicitud.nom_departamento ||
          this.solicitud.nombre_departamento ||
          this.solicitud.departamento_nombre ||
          this.solicitud.departamento ||
          null,
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