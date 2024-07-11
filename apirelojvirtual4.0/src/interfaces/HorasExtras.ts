import { EmpleadosSendNotiEmail } from './Permisos';

export interface HoraExtra {
    id_empleado_cargo: number;
    id_empleado_solicita: number;
    fecha_inicio: Date;
    fecha_final: Date;
    fecha_solicita: Date;
    descripcion: string;
    estado: number;
    tipo_funcion: number;
    id: number;
    horas_solicitud: string;
    tiempo_autorizado: string;
    observacion: boolean;
    nempleado?: string;
    ncargo?: string;
    EmpleadosSendNotiEmail?: EmpleadosSendNotiEmail[];
}