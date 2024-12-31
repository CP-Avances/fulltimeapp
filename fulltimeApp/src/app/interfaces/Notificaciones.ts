export interface Notificacion {
    id?: number;
    id_send_empl: number;
    id_receives_empl: any;
    id_receives_depa: any;
    estado: string;
    fecha_hora: string;
    visto: boolean;
    id_permiso: number | null;
    id_vacaciones: number | null;
    id_hora_extra: number | null;
    nempleadosend?: string;
    nempleadoreceives?: string;
    ndepartamento?: string;
    mensaje: string;
    tipo?: number | undefined;
    user_name?: string;
    ip?: string;
    ip_local?: any
}

export const notificacionValueDefault = {
    id: undefined,
    id_send_empl: undefined,
    id_receives_empl: null,
    id_receives_depa: null,
    estado: '',
    fecha_hora: '',
    visto: false,
    id_permiso: null,
    id_vacaciones: null,
    id_hora_extra: null,
    mensaje: '',
    tipo: undefined, 
    user_name:null,
    ip: null,
    ip_local: null

}

export interface EmpleadosSendNotiEmail {
    id_empleado: number;
    cedula: string;
    contrato: number;
    correo: string;
    comida_mail?: boolean;
    comida_noti?: boolean;
    id_dep_nivel: number | null;
    depa_nivel: string;
    departamento: string;
    empleado: number;
    estado: boolean;
    fullname: string;
    hora_extra_mail?: boolean;
    hora_extra_noti?: boolean;
    id: number;
    id_dep: number;
    id_suc: number;
    nivel: number;
    permiso_mail?: boolean;
    permiso_noti?: boolean;
    sucursal: string;
    vaca_mail?: boolean;
    vaca_noti?: boolean;
}

export interface NotificacionTimbre {
    id: number | undefined;
    fecha_hora: string | null;
    id_empleado_envia: number | null;
    id_empleado_recibe: number | null;
    visto: boolean | null;
    descripcion: string | null;
    id_timbre: number | null;
    tipo: number | null;
    nempleadosend?: string | null;
    nempleadoreceives?: string | null;
    id_comida: number | null;

    user_name?: string;
    ip?: string
    ip_local?: any
}

export const notificacionTimbreValueDefault = {
    id: undefined,
    fecha_hora: null,
    id_empleado_envia: null,
    id_empleado_recibe: null,
    visto: null,
    descripcion: null,
    id_timbre: null,
    tipo: null,
    id_comida: null,
    user_name: null,
    ip: null
}

export interface SettingsInfoEmpleado {
    id_depa: number;
    id_empleado: number;
    vacacion_mail: boolean;
    vacacion_notificacion: boolean;
    permiso_mail: boolean;
    permiso_notificacion: boolean;
    hora_extra_mail: boolean;
    hora_extra_notificacion: boolean;
    comida_mail: boolean;
    comida_notificacion: boolean;
    fullname: string;
    cedula: string;
    correo: string;
    ndepartamento: string;
    nsucursal: string;
    codigo: number | string;
    estado: number;
    id_suc: number;
    id_contrato: number;
}