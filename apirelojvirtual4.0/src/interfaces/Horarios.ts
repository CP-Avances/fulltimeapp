export interface HorarioE {
    id: number,
    codigo: number
    fec_inicio: Date | string,
    fec_final: Date | string,
    lunes: Boolean,
    martes: Boolean,
    miercoles: Boolean,
    jueves: Boolean,
    viernes: Boolean,
    sabado: Boolean,
    domingo: Boolean,
    id_horarios?: number,
    estado?: number,
    id_empl_cargo?: number,
    id_hora?: number,
    detalle_horario?: any
}

export interface HorarioEmpl{
    codigo_e: any,
    nombre_e: string,
    anio: string,
    mes: string,
    detalle_horario?: any
    dia1?: string,
    dia2?: string,
    dia3?: string,
    dia4?: string,
    dia5?: string,
    dia6?: string,
    dia7?: string,
    dia8?: string,
    dia9?: string,
    dia10?: string,
    dia11?: string,
    dia12?: string,
    dia13?: string,
    dia14?: string,
    dia15?: string,
    dia16?: string,
    dia17?: string,
    dia18?: string,
    dia19?: string,
    dia20?: string,
    dia21?: string,
    dia22?: string,
    dia23?: string,
    dia24?: string,
    dia25?: string,
    dia26?: string,
    dia27?: string,
    dia28?: string,
    dia29?: string,
    dia30?: string,
    dia31?: string
}

export interface DetalleHorario {
    orden: number,
    hora: string,
    id: number,
    id_horario: number,
    minu_espera: number,
    tipo_accion: string
}