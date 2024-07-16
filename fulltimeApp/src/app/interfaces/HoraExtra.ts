import { EmpleadosSendNotiEmail } from './Notificaciones';

export interface HoraExtra {
    isChecked?: boolean;
    id_empleado_cargo: number;
    id_empleado_solicita: number;
    fecha_inicio: string;
    fecha_final: string;
    fecha_solicita: Date | string;
    descripcion: string;
    estado: number;
    tipo_funcion: number;
    id: number;
    horas_solicitud: string;
    tiempo_autorizado: string;
    observacion: boolean;
    nempleado?: string;
    ncargo?: string;
    hora_salida?: string;
    hora_ingreso?: string;
    EmpleadosSendNotiEmail?: EmpleadosSendNotiEmail[];
    documento: string;
    docu_nombre: string;
    // FORMATO DE FECHAS
    fecha_inicio_: string;
    fecha_fin_: string;
    fecha_solicita_: Date | string;
    hora_inicio_?: string;
    hora_fin_?: string;
    id_departamento?: number;
    ip?: string;
    user_name?: string;
}

export const horaExtraDefaultValue = {
    isChecked: false,
    id_empleado_cargo: null,
    id_empleado_solicita: null,
    fecha_inicio: null,
    fecha_final: null,
    fecha_solicita: null,
    hora_salida: null,
    hora_ingreso: null,
    descripcion: null,
    estado: null,
    tipo_funcion: null,
    id: null,
    horas_solicitud: null,
    tiempo_autorizado: null,
    observacion: null,
    codigo: null,
    documento: null,
    docu_nombre: null,
    // FORMATO DE FECHAS
    fecha_inicio_: null,
    fecha_fin_: null,
    fecha_solicita_: null,
    hora_inicio_: null,
    hora_fin_: null,
    id_departamento: null
}