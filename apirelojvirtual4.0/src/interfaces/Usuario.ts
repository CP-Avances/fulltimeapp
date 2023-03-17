export interface Usuario {
    id: number,
    id_registro_empleado: number,
    usuario: string,
    contrasena: string,
    id_celular: boolean,
    estado: boolean,
    id_rol: number,
    id_empleado: number,
    app_habilita: boolean,
    uLongitud: string,
    uLatitud: string,
    frase:string,
    idEmpleado?: number,
    cedula: string,
    apellido: string,
    nombre: string,
    esta_civil: number,
    genero: number,
    correo:string,  
    fec_nacimiento:Date,
    eestado:number,
    mail_alternativo: string,
    domicilio:string,
    telefono:string,
    id_nacionalidad:number,
    imagen:string,
    codigo:string,
    longitud:string,
    latitud:string,
    id_celulardb: boolean
}


export interface IdDispositivos {
    id: number;
    id_empleado: number;
    id_dispositivo: string;
    modelo_dispositivo: string;
}