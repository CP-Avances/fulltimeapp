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
    detalle_horario?: DetalleHorario[]
}

export interface DetalleHorario {
    orden: number,
    hora: string,
    id: number,
    id_horario: number,
    minu_espera: number,
    tipo_accion: string
}