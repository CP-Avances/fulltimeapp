import { EmpleadosSendNotiEmail } from './Notificaciones';
import { Cg_TipoPermiso } from './Catalogos';

export interface Permiso {
    isChecked?: boolean;
    numero_permiso: number;
    id?: number | any;
    id_empleado_cargo: number;
    id_empleado_contrato: number;
    id_periodo_vacacion: number;
    id_tipo_permiso: number;
    id_empleado: number | any;
    descripcion: string;
    fecha_creacion: any;
    fecha_inicio: string;
    fecha_final: string;
    hora_salida: string;
    hora_ingreso: string;
    horas_permiso: string;
    dias_permiso: number | null;
    dia_libre: number;
    estado: number;
    legalizado: boolean;
    documento: string;
    docu_nombre: string;
    tipo_permiso?: string;
    nempleado?: string;
    id_departamento?: number;
    aprobacion?: string;
    observacion?: string;
    fecha_edicion?: any;
    
    // FORMATEAR FECHAS Y HORAS
    fec_creacion_: string;
    fec_inicio_: string;
    fec_final_: string;
    hora_salida_: string;
    hora_ingreso_: string;

    EmpleadosSendNotiEmail?: EmpleadosSendNotiEmail[];

    user_name: string;
    ip: string;
    ip_local: any;
}

export const permisoValueDefault: Permiso = {
    isChecked: false,
    numero_permiso: 0,
    id_empleado_cargo: 0,
    id_empleado_contrato: 0,
    id_periodo_vacacion: 0,
    id_tipo_permiso: 0,
    id_empleado: 0,
    descripcion: '',
    fecha_creacion: '',
    fecha_inicio: '',
    fecha_final: '',
    hora_salida: '',
    hora_ingreso: '',
    horas_permiso: '',
    dias_permiso: 0,
    dia_libre: 0,
    estado: 0,
    legalizado: false,
    documento: '',
    nempleado: '',
    docu_nombre: '',
    tipo_permiso: '',
    id_departamento: 0,
    // FORMATEAR FECHAS Y HORAS
    fec_creacion_: '',
    fec_inicio_: '',
    fec_final_: '',
    hora_salida_: '',
    hora_ingreso_: '',
    user_name: ' ',
    ip: ' ',
    ip_local: []
}

export const cg_permisoValueDefault: Cg_TipoPermiso = {
    id: 0,
    descripcion: '',
    fecha_inicio: new Date(),
    fecha_fin: new Date(),
    tipo_descuento: '',
    dias_maximo_permiso: 0,
    dias_anticipar_permiso: 0,
    crear_dias_anteriores: 0,
    vaca_afecta: false,
    anio_acumula: false,
    dias_justificar: 0,
    horas_maximo_permiso: '',
    incluir_minutos_comida: false,
    fecha_restriccion: false,
    justificar: false,
    legalizar: false,
    solicita_empleado: 0,
    documento: false,
    correo_crear: false,
    correo_editar: false,
    correo_eliminar: false,
    correo_autorizar: false,
    correo_legalizar: false,
    correo_negar: false,
    correo_preautorizar: false,
    contar_feriados: null,
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