import fs from 'fs';
import path from 'path';
import moment from 'moment';
import { pool } from '../database';

export const ImagenBase64LogosEmpresas = async function (path_file: string) {
    try {
        path_file = path.resolve('logos') + '/' + path_file
        let data = fs.readFileSync(path_file);
        return data.toString('base64');
    } catch (error) {
        return 0
    }
}

export const ModelarFechas = function (desde: string, hasta: string, horario: any): Array<any> {
    let fechasRango = {
        inicio: desde,
        final: hasta
    };

    let objeto = DiasConEstado(horario, fechasRango);
    // console.log('Objeto JSON: ', objeto);
    return objeto.filter(obj => { return (obj.estado === false) }).map(obj => { return { fecha: obj.fecha } })
}

/**
 * Mezcla el horario y las fechas para obtener los dias con su estado: TRUE=dia libre || FALSE=dia laborable
 * @param horario Es el horario del empleado
 * @param rango Rango de fecha de inicio y final 
 * @returns Un Array de objetos.
 */
function DiasConEstado(horario: any, rango: any) {
    var fec_aux = new Date(rango.inicio)
    var fecha1 = moment(rango.inicio);
    var fecha2 = moment(rango.final);

    var diasHorario = fecha2.diff(fecha1, 'days');
    let respuesta = [];
    for (let i = 0; i <= diasHorario; i++) {
        let horario_res = fechaIterada(fec_aux, horario);
        respuesta.push(horario_res)
        fec_aux.setDate(fec_aux.getDate() + 1)
    }
    return respuesta
}

/**
 * Funcion se utiliza en un Ciclo For de un rango de fechas.
 * @param fechaIterada Dia de un ciclo for
 * @param horario Es el horario del empleado
 * @returns Retorna objeto de fecha con su estado true si el dia es libre y false si el dia trabaja. 
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

/**
 * 
 * @param dato Hora en formato HH:MM:SS
 * @returns Retorna tiempo en segundos
 */
export const HHMMtoSegundos = function (dato: any) { // Tiempo saldra en segundos
    if (dato === '') return 0
    if (dato === null) return 0
    // if (dato === 0) return 0
    // console.log(dato);
    var h = parseInt(dato.split(':')[0]) * 3600;
    var m = parseInt(dato.split(':')[1]) * 60;
    var s = parseInt(dato.split(':')[2]);
    // console.log(h, '>>>>>', m);
    return h + m + s
}

export const SegundosToHHMM = function (dato: number) {
    // console.log('Hora decimal a HHMM ======>',dato);
    var h = Math.floor(dato / 3600);
    var m = Math.floor((dato % 3600) / 60);
    var s = dato % 60;
    if (h <= -1) {
        return '00:00:00'
    }
    let hora = (h >= 10) ? h : '0' + h;
    let min = (m >= 10) ? m : '0' + m;
    let seg = (s >= 10) ? s : '0' + s;

    return hora + ':' + min + ':' + seg
}

export function DiaSemana(dia: Date) {
    let dias = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
    return dias[dia.getUTCDay()]
}

/** ********************************************************************************* **
 ** **            METODO DE BUSQUEDA DE PARAMETROS DE FECHAS Y HORAS               ** ** 
 ** ********************************************************************************* **/

export const dia_abreviado: string = 'ddd';
export const dia_completo: string = 'dddd';

export const FormatearFecha = async function (fecha: string, dia: string) {
    let formato = await BuscarFecha();
    let valor = moment(fecha).format(dia).charAt(0).toUpperCase() +
        moment(fecha).format(dia).slice(1) +
        ' ' + moment(fecha).format(formato.fecha);
    return valor;
}

export const FormatearHora = async function (hora: string) {
    let formato = await BuscarHora();
    let valor = moment(hora, 'HH:mm:ss').format(formato.hora);
    return valor;
}

export const BuscarFecha = async function () {
    return {
        fecha: await pool.query(
            `SELECT descripcion FROM detalle_tipo_parametro WHERE id_tipo_parametro = 25`
        ).then(result => {
            if (result.rowCount != 0) {
                return result.rows[0].descripcion;
            }
            else {
                return 'DD/MM/YYYY';
            }
        })
    }
}

export const BuscarHora = async function () {
    return {
        hora: await pool.query(
            `SELECT descripcion FROM detalle_tipo_parametro WHERE id_tipo_parametro = 26`
        ).then(result => {
            if (result.rowCount != 0) {
                return result.rows[0].descripcion;
            }
            else {
                return 'HH:mm:ss';
            }
        })
    }
}