import { EmpleadosSendNotiEmail } from './Notificaciones';

export interface HoraExtra {
    isChecked?: boolean;
    id_empl_cargo: number;
    id_usua_solicita: number;
    fec_inicio: string;
    fec_final: string;
    fec_solicita: Date | string;
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
    hora_salida?: string;
    hora_ingreso?: string;
    EmpleadosSendNotiEmail?: EmpleadosSendNotiEmail[];
    documento: string;
    docu_nombre: string;
    // FORMATO DE FECHAS
    fecha_inicio_: string;
    fecha_fin_: string;
    fec_solicita_: Date | string;
    hora_inicio_?: string;
    hora_fin_?: string;
}

export const horaExtraDefaultValue = {
    isChecked: false,
    id_empl_cargo: null,
    id_usua_solicita: null,
    fec_inicio: null,
    fec_final: null,
    fec_solicita: null,
    hora_salida: null,
    hora_ingreso: null,
    descripcion: null,
    estado: null,
    tipo_funcion: null,
    id: null,
    num_hora: null,
    tiempo_autorizado: null,
    observacion: null,
    codigo: null,
    documento: null,
    docu_nombre: null,
    // FORMATO DE FECHAS
    fecha_inicio_: null,
    fecha_fin_: null,
    fec_solicita_: null,
    hora_inicio_: null,
    hora_fin_: null,
}