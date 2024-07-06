export interface HorarioE {
    id: number,
    codigo: number | string,
    fecha_inicio: Date | string,
    fecha_final: Date | string,
    lunes: Boolean,
    martes: Boolean,
    miercoles: Boolean,
    jueves: Boolean,
    viernes: Boolean,
    sabado: Boolean,
    domingo: Boolean,
    id_horarios?: number,
    estado?: number,
    id_empleado_cargo?: number,
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