import { EmpleadosSendNotiEmail } from './Notificaciones';

export interface Vacacion {
    isChecked?: boolean;
    fecha_inicio: string;
    fecha_final: string;
    fecha_ingreso: string;
    dia_libre: number;
    dia_laborable: number;
    legalizado: boolean;
    id?: number;
    id_periodo_vacacion: number | null;
    id_empleado_cargo: number;
    estado: number;
    id_empleado: number | string;
    nperivacacion?: string;
    ncargo?: string;
    nempleado?: string;
    EmpleadosSendNotiEmail?: EmpleadosSendNotiEmail[];
    fec_inicio_: string;
    fec_final_: string;
    fec_ingreso_: string;
    id_departamento?: number;
    user_name?: string;
    ip?: string;
    ip_local?: any


}
export const vacacionValueDefault = {
    isChecked: false,
    fecha_inicio: null,
    fecha_final: null,
    fecha_ingreso: null,
    dia_libre: null,
    dia_laborable: null,
    legalizado: null,
    id_periodo_vacacion: null,
    id_empleado_cargo: null,
    estado: null,
    id_empleado: null,
    fec_inicio_: null,
    fec_final_: null,
    fec_ingreso_: null,
    id_departamento: null,
    user_name: null,
    ip: null,
    ip_local:null


}

export interface SaldoDisponible {
  dias: number;
  horas: number;
  minutos: number;
}

export interface SaldoEmpleadoResponse {
  ok?: boolean;
  data: {
    id_empleado: number;
    saldo_disponible: SaldoDisponible;
  };
}

export interface ResultVerificacion {
  idEmpleado: number;
  observacion: string;
  [key: string]: any;
}

export interface VerificarVacacionesRequest {
  empleados: number[];
  incluirFeriados: boolean;
  permiteHoras: boolean;
  verificarProgramacion: boolean;
  fechaInicio: string;
  fechaFin: string;
  numHoras: string;
}

export interface VerificarSolicitudResponse {
  ok: boolean;
  message?: string;
  data?: any;
}