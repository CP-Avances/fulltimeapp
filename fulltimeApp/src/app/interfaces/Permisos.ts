import { EmpleadosSendNotiEmail } from './Notificaciones';
import { Cg_TipoPermiso } from './Catalogos';

export interface Permiso {
    isChecked?: boolean;
    num_permiso: number;
    id?: number;
    id_empl_cargo: number;
    id_empl_contrato: number;
    id_peri_vacacion: number;
    id_tipo_permiso: number;
    codigo: number;
    descripcion: string;
    fec_creacion: string;
    fec_inicio: string;
    fec_final: string;
    hora_salida: string;
    hora_ingreso: string;
    hora_numero: string;
    dia: number;
    dia_libre: number;
    estado: number;
    legalizado: boolean;
    documento: string;
    docu_nombre: string;
    ntipopermiso?: string;
    nempleado?: string;
    // FORMATEAR FECHAS Y HORAS
    fec_creacion_: string;
    fec_inicio_: string;
    fec_final_: string;
    hora_salida_: string;
    hora_ingreso_: string;

    EmpleadosSendNotiEmail?: EmpleadosSendNotiEmail[];
}

export const permisoValueDefault: Permiso = {
    isChecked: false,
    num_permiso: 0,
    id_empl_cargo: 0,
    id_empl_contrato: 0,
    id_peri_vacacion: 0,
    id_tipo_permiso: 0,
    codigo: 0,
    descripcion: '',
    fec_creacion: '',
    fec_inicio: '',
    fec_final: '',
    hora_salida: '',
    hora_ingreso: '',
    hora_numero: '',
    dia: 0,
    dia_libre: 0,
    estado: 0,
    legalizado: false,
    documento: '',
    nempleado: undefined,
    docu_nombre: '',
    ntipopermiso: undefined,
    // FORMATEAR FECHAS Y HORAS
    fec_creacion_: '',
    fec_inicio_: '',
    fec_final_: '',
    hora_salida_: '',
    hora_ingreso_: '',
}

export const cg_permisoValueDefault: Cg_TipoPermiso = {
    id: 0,
    descripcion: '',
    fecha: new Date(),
    tipo_descuento: '',
    num_dia_maximo: 0,
    num_dia_ingreso: 0,
    vaca_afecta: false,
    anio_acumula: false,
    num_dia_justifica: 0,
    num_hora_maximo: '',
    almu_incluir: false,
    fec_validar: false,
    gene_justificacion: false,
    legalizar: false,
    acce_empleado: 0,
    documento: false
}

interface opcionesDiasHoras {
    label: string,
    value: string,
    message: string
}

interface opcionesTipoPermiso {
    label: string,
    id: number,
    message: string,
}

export const diasHoras: opcionesDiasHoras[] = [
    { label: 'Días', value: 'Días', message: 'Ingrese el rango de días a Solicitar' },
    { label: 'Horas', value: 'Horas', message: 'Ingrese el rango de horas y minutos a Solicitar' },
    //{ label: 'Días y Horas', value: 'Días y Horas', message: 'Ingrese el rango de días y horas a Solicitar' },
];

export const tipoPermiso: opcionesTipoPermiso [] = [
    { label: 'Asuntos Personales', id: 1, message: 'Dias maximos de Permiso - '},
    { label: 'Calamidad Doméstica', id: 2, message: 'Dias maximos de Permiso - '},
];