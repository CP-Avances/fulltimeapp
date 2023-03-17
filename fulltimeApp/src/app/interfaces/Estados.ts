export interface EstadoSolicitudes {
    id: number,
    nombre: string
}

export const estadoSelectItems: EstadoSolicitudes[] = [
    //{ id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'Pre-autorizado' },
    { id: 3, nombre: 'Autorizado' },
    { id: 4, nombre: 'Negado' },
];

export interface EstadoAlimentacionSol {
    id: boolean,
    nombre: string
}

export const estadosAlimentacionSelectItems: EstadoAlimentacionSol[] = [
   // { id: null, nombre: 'Pendiente' },
    { id: true, nombre: 'Autorizado' },
    { id: false, nombre: 'Negado' },
];

interface EstadoBoolean {
    label: string,
    value: boolean
}

export const estadoBoolean: EstadoBoolean[] = [
    { label: 'Si', value: true },
    { label: 'No', value: false }
]