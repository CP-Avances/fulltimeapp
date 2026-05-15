import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EmpleadosService } from './empleados.service';

@Injectable({
    providedIn: 'root'
})
export class AsignacionesMovilService {

    idDepartamentosAcceso: Set<number> = new Set();
    idSucursalesAcceso: Set<number> = new Set();
    idUsuariosAcceso: Set<number> = new Set();
    asignacionesAcceso: any[] = [];

    constructor(
        private readonly restUsuario: EmpleadosService,
    ) {
        this.ObtenerEstado();
    }

    async ObtenerAsignacionesUsuario(idEmpleado: number): Promise<void> {
        this.limpiarEstado();

        const dataEmpleado = {
            id_empleado: Number(idEmpleado)
        };

        let noPersonal = false;

        const res: any = await firstValueFrom(
            this.restUsuario.BuscarUsuarioDepartamento(dataEmpleado)
        );

        this.asignacionesAcceso = res ?? [];

        if (this.asignacionesAcceso.length === 0) {
            this.GuardarEstado();
            return;
        }

        const consultas = this.asignacionesAcceso.map((asignacion: any) => {
            if (asignacion.principal) {

                if (!asignacion.administra && !asignacion.personal) {
                    noPersonal = true;
                    return Promise.resolve([]);
                }

                if (asignacion.administra && !asignacion.personal) {
                    noPersonal = true;
                }

                if (asignacion.personal && !asignacion.administra) {
                    this.idUsuariosAcceso.add(Number(idEmpleado));
                    return Promise.resolve([]);
                }
            }

            this.idDepartamentosAcceso.add(Number(asignacion.id_departamento));
            this.idSucursalesAcceso.add(Number(asignacion.id_sucursal));

            const data = {
                id_departamento: asignacion.id_departamento
            };

            return firstValueFrom(
                this.restUsuario.ObtenerIdUsuariosDepartamento(data)
            );
        });

        const resultados = await Promise.all(consultas);

        resultados
            .flat()
            .filter((item: any) => item?.id)
            .forEach((item: any) => {
                this.idUsuariosAcceso.add(Number(item.id));
            });

        if (noPersonal) {
            this.idUsuariosAcceso.delete(Number(idEmpleado));
        }

        this.GuardarEstado();
    }

    filtrarDatosGenerales(informacion: any[], rolEmpleado: number, idEmpleadoLogueado: number) {
        if (rolEmpleado === 1) {
            return informacion;
        }

        const empleadosFiltrados = informacion.filter((empleado: any) =>
            this.idUsuariosAcceso.has(Number(empleado.id))
        );

        const empleadoSesion = informacion.find((empleado: any) =>
            Number(empleado.id) === Number(idEmpleadoLogueado)
        );

        if (empleadoSesion) {
            this.idSucursalesAcceso.add(Number(empleadoSesion.id_suc));
            this.idDepartamentosAcceso.add(Number(empleadoSesion.id_depa));
        }

        return empleadosFiltrados;
    }

    tieneEstadoCargado(): boolean {
        return (
            this.idDepartamentosAcceso.size > 0 ||
            this.idSucursalesAcceso.size > 0 ||
            this.idUsuariosAcceso.size > 0
        );
    }

    private limpiarEstado(): void {
        this.asignacionesAcceso = [];
        this.idDepartamentosAcceso.clear();
        this.idSucursalesAcceso.clear();
        this.idUsuariosAcceso.clear();
    }

    GuardarEstado(): void {
        localStorage.setItem(
            'idDepartamentosAcceso',
            JSON.stringify(Array.from(this.idDepartamentosAcceso))
        );

        localStorage.setItem(
            'idSucursalesAcceso',
            JSON.stringify(Array.from(this.idSucursalesAcceso))
        );

        localStorage.setItem(
            'idUsuariosAcceso',
            JSON.stringify(Array.from(this.idUsuariosAcceso))
        );
    }

    ObtenerEstado(): void {
        this.idDepartamentosAcceso = new Set(
            JSON.parse(localStorage.getItem('idDepartamentosAcceso') || '[]').map(Number)
        );

        this.idSucursalesAcceso = new Set(
            JSON.parse(localStorage.getItem('idSucursalesAcceso') || '[]').map(Number)
        );

        this.idUsuariosAcceso = new Set(
            JSON.parse(localStorage.getItem('idUsuariosAcceso') || '[]').map(Number)
        );
    }

    LimpiarStorageAsignaciones(): void {
        localStorage.removeItem('idDepartamentosAcceso');
        localStorage.removeItem('idSucursalesAcceso');
        localStorage.removeItem('idUsuariosAcceso');
        this.limpiarEstado();
    }
}