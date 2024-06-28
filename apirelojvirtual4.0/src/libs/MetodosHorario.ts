import { pool } from '../database';
import moment from 'moment';
import { ObtenerRangoSemanal, ObtenerRangoMensual } from './MetodosFechas'

const FECHA_FERIADOS: any = [];



/**
 * Metodo devuelve el tipo de horario que tiene el empleado.
 * @param inicio Fecha de inicio del horario del empleado.
 * @param final Fecha final del horario del empleado.
 */
function tipoHorario(inicio: Date, final: Date) {

    var fecha1 = moment(inicio.toJSON().split("T")[0]);
    var fecha2 = moment(final.toJSON().split("T")[0]);

    var diasHorario = fecha2.diff(fecha1, 'days');

    if (diasHorario >= 1 && diasHorario <= 7) return 'semanal'

    if (diasHorario >= 25 && diasHorario <= 35) return 'mensual'

    return 'anual'
    /**
     * semana = 6 (mayor a 1 menor a 7),
     * mensual (mayor a 25 y menor a 35)
     * anual = 365 (Hacer que sea mayor 40 y menor a 370)
     */
}

/**
 * Metodo que devuelve el arreglo de las fechas con su estado.
 * @param horario Ultimo horario del empleado con los estados de los dias libres y normales
 * @param rango Fecha de inicio y final, puede ser rango semanal o mensual
 */
function DiasByEstado(horario: any, rango: any) {
    var fec_aux = new Date(rango.inicio)
    // console.log('FECHA_FERIADOS', FECHA_FERIADOS);
    let respuesta = [];
    for (let i = fec_aux.getDate(); i <= rango.final.getDate(); i++) {
        let horario_res = fechaIterada(fec_aux, horario);
        respuesta.push(horario_res)
        fec_aux.setDate(fec_aux.getDate() + 1)
    }
    return respuesta
}

/**
 * Método para devolver la fecha y el estado de cada uno de los dias de ese horario
 * @param fechaIterada Fecha asignada por el ciclo for 
 * @param horario es el ultimo horario del empleado.
 */
function fechaIterada(fechaIterada: Date, horario: any) {
    let est;

    switch (fechaIterada.getDay()) {
        case 0: est = horario.domingo; break;
        case 1: est = horario.lunes; break;
        case 2: est = horario.martes; break;
        case 3: est = horario.miercoles; break;
        case 4: est = horario.jueves; break;
        case 5: est = horario.viernes; break;
        case 6: est = horario.sabado; break;
        default: break;
    }

    return {
        fecha: fechaIterada.toJSON().split('T')[0],
        estado: est
    }
}

export const EstadoHorarioPeriVacacion = async function (id_empleado: number) {
    console.log(id_empleado);

    let ids = await pool.query('SELECT co.id AS id_contrato, ca.id AS id_cargo FROM eu_empleado_contratos AS co, eu_empleado_cargos AS ca WHERE co.id_empleado = $1 AND co.id = ca.id_contrato', [id_empleado])
        .then(result => { return result.rows });

    if (ids.length === 0) {
        return 0;
    }
    console.log(ids);

    let contratos = [... new Set(
        ids.map(obj => {
            return obj.id_contrato
        })
    )]

    contratos.forEach(async (id_contrato) => {
        await pool.query('UPDATE mv_periodo_vacacion SET estado = 2 WHERE id_empleado_contrato = $1', [id_contrato]) //Estado 2 es para q esten desactivados esos periodos de vacacion
    })

    return 0
}

export const HorariosParaInasistencias = function (horario: any) {

    let fechasRango = {
        inicio: horario.fec_inicio,
        final: horario.fec_final
    };

    let objeto = DiasConEstado(horario, fechasRango);
    // console.log('Fechas rango: ', fechasRango);
    // console.log('Objeto JSON: ', objeto);
    return objeto.filter(obj => { return (obj.estado === false) }).map(obj => { return { fecha: obj.fecha } })
}

function DiasConEstado(horario: any, rango: any) {
    var fec_aux = new Date(rango.inicio)
    // console.log('FECHA_FERIADOS', FECHA_FERIADOS);
    var fecha1 = moment(rango.inicio.toJSON().split("T")[0]);
    var fecha2 = moment(rango.final.toJSON().split("T")[0]);

    var diasHorario = fecha2.diff(fecha1, 'days');
    let respuesta = [];
    for (let i = 0; i <= diasHorario; i++) {
        let horario_res = fechaIterada(fec_aux, horario);
        respuesta.push(horario_res)
        fec_aux.setDate(fec_aux.getDate() + 1)
    }
    return respuesta
}