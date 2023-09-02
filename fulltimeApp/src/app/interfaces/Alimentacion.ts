import { EmpleadosSendNotiEmail } from './Notificaciones';

export interface Alimentacion {
    isChecked?: boolean;
    id?: number;
    id_empleado: number | string;
    fecha: Date;
    id_comida: number;
    observacion: string;
    fec_comida: string;
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
    id_servicio: number,
    id_plato: number,
    nservicio: string,
    // FORMATO DE FECHAS Y HORAS
    fecha_: string;
    fec_comida_: string;
    hora_inicio_: string;
    hora_fin_: string;
}

export const alimentacionValueDefault = {
    isChecked: false,
    id: null,
    id_empleado: null,
    fecha: null,
    id_comida: null,
    observacion: null,
    fec_comida: null,
    hora_inicio: null,
    hora_fin: null,
    extra: null,
    aprobada: null,
    verificar: null,
    nempleado: null,
    ncomida: null,
    nvalor: null,
    ndetallecomida: null,
    id_servicio: null,
    id_plato: null,
    nservicio: null,
    // FORMATO DE FECHAS Y HORAS
    fecha_: null,
    fec_comida_: null,
    hora_inicio_: null,
    hora_fin_: null,
}