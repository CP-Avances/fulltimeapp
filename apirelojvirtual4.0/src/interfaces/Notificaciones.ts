export interface Notificacion {
    id: number;
    id_empleado_envia: number;
    id_empleado_recibe: number;
    id_departamento_recibe: number;
    estado: string;
    fecha_hora: Date;
    visto: boolean;
    id_permiso: number;
    id_vacaciones: null;
    id_hora_extra: null;
    nempleadosend?: string;
    nempleadoreceives?: string;
    ndepartamento?: string;
    usuario: string;
}

export interface NotificacionTimbre {
    id: number;
    create_at: Date;
    id_send_empl: number;
    id_receives_empl: number;
    visto: boolean;
    descripcion: string;
    id_timbre: number | null;
    tipo: number;
    nempleadosend?: string;
    nempleadoreceives?: string;
    usuario: string;
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
    codigo: number | string;
}
