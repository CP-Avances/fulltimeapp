export interface Empresa {
    id?: number,
    nombre: string,
    ruc: string,
    direccion: string,
    telefono: string,
    correo: string,
    representante: string,
    tipo_empresa?: string,
    establecimiento?: string,
    logo?: string,
    color_p?: string,
    color_s?: string,
    dias_cambio?: number,
    cambios?: boolean,
    seg_contrasena?: boolean,
    seg_frase?: boolean,
    seg_ninguna?: boolean,
    acciones_timbres?: boolean,
    num_partida?: string,
    public_key?: string
}


