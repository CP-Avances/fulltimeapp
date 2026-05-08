export interface Cg_TipoPermiso {
    id: number;
    descripcion: string;
    fecha_inicio: Date;
    fecha_fin: Date;
    tipo_descuento: any;
    dias_maximo_permiso: number;
    dias_anticipar_permiso: number;
    crear_dias_anteriores: number;
    vaca_afecta: boolean;
    anio_acumula: boolean;
    dias_justificar: number;
    horas_maximo_permiso: string;
    incluir_minutos_comida: boolean;
    fecha_restriccion: boolean;
    justificar: boolean;
    legalizar: boolean;
    solicita_empleado: number;
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
    fecha_recuperacion: Date | string;
}
