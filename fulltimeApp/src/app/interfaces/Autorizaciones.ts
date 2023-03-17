export interface Autorizacion {
    id?: number;
    orden: number;
    estado: number;
    id_departamento: number;
    id_permiso: number | null;
    id_vacacion: number | null;
    id_hora_extra: number | null;
    id_documento: string;
    id_plan_hora_extra: number | null;
    ndepartamento?: string;
}

export const autorizacionValueDefault = {
    id: undefined,
    orden: undefined,
    estado: undefined,
    id_departamento: undefined,
    id_permiso: null,
    id_vacacion: null,
    id_hora_extra: null,
    id_plan_hora_extra: null,
    id_documento: undefined,
}