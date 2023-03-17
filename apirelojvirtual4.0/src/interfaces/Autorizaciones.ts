export interface Autorizacion {
    id: number;
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
