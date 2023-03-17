export interface Empleado {
    id: number,
    cedula: string,
    codigo: string,
    fullname?: string,
    apellido?: string
    nombre?: string,
    correo?: string,
    domicilio?: string,
    esta_civil?: number,
    estado?: number,
    fec_nacimiento?: string,
    genero?: number
    id_nacionalidad?: number,
    imagen?: string | null,
    latitud?: string | null
    longitud?: string | null
    mail_alternativo?: string | null
    telefono?: string,
    web_access?: boolean,
}

export interface Ubicacion {
    latitud?: string,
    longitud?: string,

}