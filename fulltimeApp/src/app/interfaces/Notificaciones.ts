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
    tipo?: number;
}

export const notificacionValueDefault = {
    id: 0,
    id_send_empl: 0,
    id_receives_empl: 0,
    id_receives_depa: 0,
    estado: '',
    create_at: '',
    visto: false,
    id_permiso: null,
    id_vacaciones: null,
    id_hora_extra: null,
    mensaje: '',
    tipo: 0
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
    id: number;
    create_at: string;
    id_send_empl: number;
    id_receives_empl: number;
    visto: boolean;
    descripcion: string;
    id_timbre: number | null;
    tipo: number;
    nempleadosend?: string;
    nempleadoreceives?: string;
    id_comida: number;
}

export const notificacionTimbreValueDefault = {
    id: undefined,
    create_at: undefined,
    id_send_empl: undefined,
    id_receives_empl: undefined,
    visto: undefined,
    descripcion: undefined,
    id_timbre: undefined,
    tipo: undefined,
    id_comida: undefined,
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