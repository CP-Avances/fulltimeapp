export interface Notificacion {
    id?: number;
    id_send_empl: number;
    id_receives_empl: number;
    id_receives_depa: number;
    estado: string;
    create_at: string;
    visto: boolean;
    id_permiso: number | null;
    id_vacaciones: number | null;
    id_hora_extra: number | null;
    nempleadosend?: string;
    nempleadoreceives?: string;
    ndepartamento?: string;
    mensaje: string;
    tipo?: number | undefined;
}

export const notificacionValueDefault = {
    id: undefined,
    id_send_empl: undefined,
    id_receives_empl: undefined,
    id_receives_depa: undefined,
    estado: '',
    create_at: '',
    visto: false,
    id_permiso: null,
    id_vacaciones: null,
    id_hora_extra: null,
    mensaje: '',
    tipo: undefined
}

export interface EmpleadosSendNotiEmail {
    cargo: number;
    cedula: string;
    contrato: number;
    correo: string;
    depa_padre: number | null;
    departamento: string;
    empleado: number;
    estado: boolean;
    fullname: string;
    id: number;
    id_dep: number;
    id_suc: number;
    nivel: number;
    permiso_mail?: boolean;
    permiso_noti?: boolean;
    vaca_mail?: boolean;
    vaca_noti?: boolean;
    hora_extra_mail?: boolean;
    hora_extra_noti?: boolean;
    comida_mail?: boolean;
    comida_noti?: boolean;
    sucursal: string;




}

export interface NotificacionTimbre {
    id: number | undefined;
    create_at: string | null;
    id_send_empl: number | null;
    id_receives_empl: number | null;
    visto: boolean | null;
    descripcion: string | null;
    id_timbre: number | null;
    tipo: number | null;
    nempleadosend?: string | null;
    nempleadoreceives?: string | null;
    id_comida: number | null;
}

export const notificacionTimbreValueDefault = {
    id: undefined,
    create_at: null,
    id_send_empl: null,
    id_receives_empl: null,
    visto: null,
    descripcion: null,
    id_timbre: null,
    tipo: null,
    id_comida: null,
}

export interface SettingsInfoEmpleado {
    id_departamento: number;
    id_empleado: number;
    vaca_mail: boolean;
    vaca_noti: boolean;
    permiso_mail: boolean;
    permiso_noti: boolean;
    hora_extra_mail: boolean;
    hora_extra_noti: boolean;
    comida_mail: boolean;
    comida_noti: boolean;
    fullname: string;
    cedula: string;
    correo: string;
    ndepartamento: string;
    nsucursal: string;
    codigo: number;
    estado: number;
    id_sucursal: number;
    id_contrato: number;
}