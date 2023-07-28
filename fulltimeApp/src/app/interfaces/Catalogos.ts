export interface Cg_TipoPermiso {
    id: number;
    descripcion: string;
    fecha_inicio: Date;
    fecha_fin: Date;
    tipo_descuento: any;
    num_dia_maximo: number;
    num_dia_anticipo: number;
    num_dia_anterior: number;
    vaca_afecta: boolean;
    anio_acumula: boolean;
    num_dia_justifica: number;
    num_hora_maximo: string;
    almu_incluir: boolean;
    fec_validar: boolean;
    gene_justificacion: boolean;
    legalizar: boolean;
    acce_empleado: number;
    documento: boolean;
    correo_crear: boolean;
    correo_editar: boolean;
    correo_eliminar: boolean;
    correo_preautorizar: boolean;
    correo_autorizar: boolean;
    correo_negar: boolean;
    correo_legalizar: boolean;
    contar_feriados: boolean;
}

export interface Cg_Feriados {
    id: number;
    descripcion: string;
    fecha: Date | string;
    fec_recuperacion: Date | string;
}

export interface Cg_DetalleMenu {
    id: number;
    nombre: string;
    valor: number;
    observacion: string;
    id_menu: number;
}

export interface Servicios_Comida{
    id: number;
    nombre: string;
}

export interface Menu_Servicios{
    id: number;
    nombre: string;
    tipo_comida: number;
    hora_inicio: string;
    hora_fin: string;
}