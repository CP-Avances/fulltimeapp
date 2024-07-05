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
    fecha_hora: Date;
    id_empleado_envia: number;
    id_empleado_recibe: number;
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
}
