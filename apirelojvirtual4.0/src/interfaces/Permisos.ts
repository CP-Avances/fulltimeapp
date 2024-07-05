export interface Permiso {
    fecha_creacion: Date;
    descripcion: string;
    fecha_inicio: Date;
    fecha_final: Date;
    dias_permiso: number;
    legalizado: boolean;
    dia_libre: number;
    id: number;
    id_tipo_permiso: number;
    id_empleado_contrato: number;
    id_periodo_vacacion: number;
    horas_permiso: string;
    numero_permiso: number;
    documento: string;
    docu_nombre: string;
    estado: number;
    id_empleado_cargo: number;
    hora_salida: string;
    hora_ingreso: string;
    codigo: number | string;
    ntipopermiso?: string;
    EmpleadosSendNotiEmail?: EmpleadosSendNotiEmail[];
    id_empleado: number;
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