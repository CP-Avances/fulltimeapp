import { EmpleadosSendNotiEmail } from './Permisos';

export interface Vacacion {
    fecha_inicio: Date;
    fecha_final: Date;
    fecha_ingreso: Date;
    dia_libre: number;
    dia_laborable: number;
    legalizado: boolean;
    id: number;
    id_peri_vid_periodo_vacacionacacion: number;
    id_empleado_cargo: number;
    estado: number;
    codigo: number | string;
    nperivacacion?: string;
    ncargo?: string;
    nempleado?: string;
    EmpleadosSendNotiEmail?: EmpleadosSendNotiEmail[];
}
