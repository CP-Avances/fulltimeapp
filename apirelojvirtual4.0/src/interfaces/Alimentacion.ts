import { EmpleadosSendNotiEmail } from './Permisos';

export interface Alimentacion {
    id?: number;
    id_empleado: number;
    fecha: Date;
    id_comida: number;
    observacion: string;
    fec_comida: Date;
    hora_inicio: string;
    hora_fin: string;
    extra: boolean;
    aprobada: boolean;
    verificar: string;
    nempleado: string;
    ncomida: string;
    nvalor: number;
    ndetallecomida: string;
    EmpleadosSendNotiEmail?: EmpleadosSendNotiEmail[];
    id_plato: number
}
