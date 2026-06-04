import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ParametrosService } from './parametros.service';

@Injectable({
  providedIn: 'root'
})
export class PermisosAccionesService {

  private accionesPermitidas: Record<string, boolean> = {};
  private cargado = false;

  constructor(
    private readonly parametros: ParametrosService
  ) { }

  async cargarAccionesRol(acciones: { pagina: string; accion: string }[]): Promise<void> {
    const idRol = Number(localStorage.getItem('rol') ?? 0);

    if (!idRol || !Array.isArray(acciones) || acciones.length === 0) {
      this.accionesPermitidas = {};
      this.cargado = true;
      return;
    }

    const datos = {
      id_rol: idRol,
      acciones
    };

    try {
      const res: any[] = await firstValueFrom(
        this.parametros.ObtenerAccionesRoles(datos)
      );

      this.accionesPermitidas = {};

      res.forEach((item: any) => {
        const key = this.crearKeyAccion(item.pagina, item.accion);
        this.accionesPermitidas[key] = item.permiso === true;
      });

      this.cargado = true;

    } catch {
      this.accionesPermitidas = {};
      this.cargado = true;
    }
  }

  tienePermisoAccion(pagina: string, accion: string): boolean {
    const key = this.crearKeyAccion(pagina, accion);
    return this.accionesPermitidas[key] === true;
  }

  limpiarPermisos(): void {
    this.accionesPermitidas = {};
    this.cargado = false;
  }

  estaCargado(): boolean {
    return this.cargado;
  }

  private crearKeyAccion(pagina: string, accion: string): string {
    return `${String(pagina ?? '').trim()}|${String(accion ?? '').trim()}`.toLowerCase();
  }

}