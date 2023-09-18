export interface Permiso {
    fec_creacion: Date;
    descripcion: string;
    fec_inicio: Date;
    fec_final: Date;
    dia: number;
    legalizado: boolean;
    dia_libre: number;
    id: number;
    id_tipo_permiso: number;
    id_empl_contrato: number;
    id_peri_vacacion: number;
    hora_numero: string;
    num_permiso: number;
    documento: string;
    docu_nombre: string;
    estado: number;
    id_empl_cargo: number;
    hora_salida: string;
    hora_ingreso: string;
    codigo: number | string;
    ntipopermiso?: string;
    EmpleadosSendNotiEmail?: EmpleadosSendNotiEmail[];
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