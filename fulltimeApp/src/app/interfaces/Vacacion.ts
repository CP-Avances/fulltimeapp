import { EmpleadosSendNotiEmail } from './Notificaciones';

export interface Vacacion {
    isChecked?: boolean;
    fec_inicio: string;
    fec_final: string;
    fec_ingreso: string;
    dia_libre: number;
    dia_laborable: number;
    legalizado: boolean;
    id?: number;
    id_peri_vacacion: number | null;
    id_empl_cargo: number;
    estado: number;
    codigo: number | string;
    nperivacacion?: string;
    ncargo?: string;
    nempleado?: string;
    EmpleadosSendNotiEmail?: EmpleadosSendNotiEmail[];
    fec_inicio_: string;
    fec_final_: string;
    fec_ingreso_: string;
    id_departamento?: number;
}
export const vacacionValueDefault = {
    isChecked: false,
    fec_inicio: null,
    fec_final: null,
    fec_ingreso: null,
    dia_libre: null,
    dia_laborable: null,
    legalizado: null,
    id_peri_vacacion: null,
    id_empl_cargo: null,
    estado: null,
    codigo: null,
    fec_inicio_: null,
    fec_final_: null,
    fec_ingreso_: null,
    id_departamento: null,
}