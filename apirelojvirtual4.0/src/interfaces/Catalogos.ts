export interface Cg_TipoPermiso {
    id: number;
    descripcion: string;
    fecha: Date;
    tipo_descuento: string;
    dias_maximo_permiso: number;
    dias_anticipar_permiso: number;
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
}

export interface Cg_Feriados {
    id: number;
    descripcion: string;
    fecha: Date | string;
    fecha_recuperacion: Date | string;
}

export interface Cg_DetalleMenu {
    id: number;
    nombre: string;
    valor: number;
    observacion: string;
    id_horario_comida: number;
}

export interface Servicios_Comida{
    id: number;
    nombre: string;
}

export interface Menu_Servicios{
    id: number;
    nombre: string;
    id_comida: number;
    hora_inicio: string;
    hora_fin: string;
}