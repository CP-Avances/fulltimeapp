export interface Timbre {
    id?: number,
    fecha_hora_timbre?: string,
    accion?: string,
    tecla_funcion?: string,
    observacion?: string,
    latitud?: string,
    longitud?: string
    codigo?: string,
    id_reloj?: number,
    tipo_autenticacion?: string,
    dispositivo_timbre?: any,
    fecha_hora_timbre_servidor?: string,
    hora_timbre_diferente?: string,
    ubicacion?: string,
    fecha?: string,
    hora?: string,
    sfecha?: string,
    shora?: string,
    conexion?: boolean,
    fecha_subida_servidor?: string,
    novedades_conexion?: string,
    id_empleado?: string

    num?: number,

    ip?:string
    user_name?: string
    imagen?:string
    
}

export interface ITimbreFechaEmpleadoRow {
    empleado: string;
    id_empleado: number;
    fecha_hora_timbre: string;
    accion: string | null;
    tecla_funcion: string | null;
    observacion: string | null;
    latitud: string | null;
    longitud: string | null;
    codigo: string;
    id_reloj: number | null;
    ubicacion: string | null;
    fecha_hora_timbre_servidor: string | null;
    dispositivo_timbre: string | null;
    id: number;
    fecha_hora_timbre_validado: string | null;
}

export interface ConfiguracionMarcacionLocal {
  empleadoId: number;
  foto: boolean;
  fotoObligatoria: boolean;
  ubicacionDesconocida: boolean;
  timbreEspecial: boolean;
  requiereInternet: boolean;
  fechaActualizacion: string;
}

export type EstadoConsultaUbicacion =
  | 'ENCONTRADA'
  | 'NO_ASIGNADA'
  | 'FUERA_DE_ZONA'
  | 'ERROR';

export interface ResultadoConsultaUbicacion {
  estado: EstadoConsultaUbicacion;
  ubicacion: string;
}

