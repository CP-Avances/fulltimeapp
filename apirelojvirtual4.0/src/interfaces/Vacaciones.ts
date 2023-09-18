import { EmpleadosSendNotiEmail } from './Permisos';

export interface Vacacion {
    fec_inicio: Date;
    fec_final: Date;
    fec_ingreso: Date;
    dia_libre: number;
    dia_laborable: number;
    legalizado: boolean;
    id: number;
    id_peri_vacacion: number;
    id_empl_cargo: number;
    estado: number;
    codigo: number | string;
    nperivacacion?: string;
    ncargo?: string;
    nempleado?: string;
    EmpleadosSendNotiEmail?: EmpleadosSendNotiEmail[];
}
