export interface Usuario {
    id?: number,
    id_registro_empleado?: number,
    usuario: string,
    contrasena?: string,
    estado?: boolean,
    id_rol: any,
    id_empleado?: number,
    app_habilita?: boolean,
    uLongitud?: string,
    uLatitud?: string,
    frase?: string,
    idempleado?: number,
    cedula: string,
    apellido?: string,
    nombre?: string,
    esta_civil?: number,
    genero?: number,
    correo?: string,
    fec_nacimiento?: Date,
    eestado?: number,
    mail_alternativo?: string,
    domicilio?: string,
    telefono?: string,
    id_nacionalidad?: number,
    imagen?: string,
    codigo: string,
    longitud?: string,
    latitud?: string
    id_celular?: boolean
    id_celulardb?: boolean
}

export const UsuarioValueDefault = {
    id: undefined,
    id_registro_empleado: undefined,
    usuario: '',
    contrasena: '',
    estado: false,
    id_rol: undefined,
    id_empleado: undefined,
    app_habilita: false,
    uLongitud: '',
    uLatitud: '',
    frase: '',
    idempleado: undefined,
    cedula: '',
    apellido: '',
    nombre: '',
    esta_civil: undefined,
    genero: undefined,
    correo: '',
    fec_nacimiento: undefined,
    eestado: undefined,
    mail_alternativo: '',
    domicilio: '',
    telefono: '',
    id_nacionalidad: undefined,
    imagen: '',
    codigo: '',
    longitud: '',
    latitud: '',
    id_celular: false,
    id_celulardb: false
}

export interface Empleado {
    id: number,
    cedula: string,
    codigo: string,
    fullname?: string,
}

export interface ConfigNotificacion {
    id_empleado: number;
    comida_mail: boolean;
    comida_noti: boolean;
    hora_extra_mail: boolean;
    hora_extra_noti: boolean;
    permiso_mail: boolean;
    permiso_noti: boolean;
    vaca_mail: boolean;
    vaca_noti: boolean;
}

export interface IdDispositivos {
    id: number;
    id_empleado?: number;
    id_dispositivo?: string;
    modelo_dispositivo?: string;
}

export const IdDispositivosValueDefault = {
    id: undefined,
    id_empleado: null,
    id_dispositivo: null,
    modelo_dispositivo: null,
}