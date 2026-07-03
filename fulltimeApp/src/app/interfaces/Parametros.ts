export interface DetalleParametro {
    id_tipo: number,
    tipo: string,
    id_detalle: number,
    descripcion: string,
}

export interface ResultadoValidacionStorage {
    permitido: boolean;
    storageUsadoMb: number;
    storageContratadoMb: number;
    archivoMb: number;
    nuevoUsoMb: number;
    mensaje: string;
}