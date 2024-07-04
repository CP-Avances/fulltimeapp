
export interface Timbre {
    id?: number,
    fecha_hora_timbre?: Date,
    accion?: string,
    tecla_funcion?: string,
    observacion?: string,
    latitud?: string,
    longitud?: string
    codigo?: number | string,
    id_reloj?: number,
    tipo_autenticacion?: string,
    dispositivo_timbre?: string,
    fecha_hora_timbre_servidor?: string,
    hora_timbre_diferente: boolean
    stimbre?: string,
    stimbre_servidor?: string,
    ubicacion?: string,
    conexion: boolean,
    fecha_subida_servidor?: string,
    novedades_conexion?: string,
}


