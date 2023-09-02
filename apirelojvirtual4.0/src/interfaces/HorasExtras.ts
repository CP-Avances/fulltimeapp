import { EmpleadosSendNotiEmail } from './Permisos';

export interface HoraExtra {
    id_empl_cargo: number;
    id_usua_solicita: number;
    fec_inicio: Date;
    fec_final: Date;
    fec_solicita: Date;
    descripcion: string;
    estado: number;
    tipo_funcion: number;
    id: number;
    num_hora: string;
    tiempo_autorizado: string;
    observacion: boolean;
    codigo: number;
    nempleado?: string;
    ncargo?: string;
    EmpleadosSendNotiEmail?: EmpleadosSendNotiEmail[];
}