"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuscarHora = exports.BuscarFecha = exports.FormatearHora = exports.FormatearFecha = exports.dia_completo = exports.dia_abreviado = exports.DiaSemana = exports.SegundosToHHMM = exports.HHMMtoSegundos = exports.ModelarFechas = exports.ImagenBase64LogosEmpresas = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const moment_1 = __importDefault(require("moment"));
const database_1 = require("../database");
const ImagenBase64LogosEmpresas = function (path_file) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            path_file = path_1.default.resolve('logos') + '/' + path_file;
            let data = fs_1.default.readFileSync(path_file);
            return data.toString('base64');
        }
        catch (error) {
            return 0;
        }
    });
};
exports.ImagenBase64LogosEmpresas = ImagenBase64LogosEmpresas;
const ModelarFechas = function (desde, hasta, horario) {
    let fechasRango = {
        inicio: desde,
        final: hasta
    };
    let objeto = DiasConEstado(horario, fechasRango);
    // console.log('Objeto JSON: ', objeto);
    return objeto.filter(obj => { return (obj.estado === false); }).map(obj => { return { fecha: obj.fecha }; });
};
exports.ModelarFechas = ModelarFechas;
/**
 * Mezcla el horario y las fechas para obtener los dias con su estado: TRUE=dia libre || FALSE=dia laborable
 * @param horario Es el horario del empleado
 * @param rango Rango de fecha de inicio y final
 * @returns Un Array de objetos.
 */
function DiasConEstado(horario, rango) {
    var fec_aux = new Date(rango.inicio);
    var fecha1 = (0, moment_1.default)(rango.inicio);
    var fecha2 = (0, moment_1.default)(rango.final);
    var diasHorario = fecha2.diff(fecha1, 'days');
    let respuesta = [];
    for (let i = 0; i <= diasHorario; i++) {
        let horario_res = fechaIterada(fec_aux, horario);
        respuesta.push(horario_res);
        fec_aux.setDate(fec_aux.getDate() + 1);
    }
    return respuesta;
}
/**
 * Funcion se utiliza en un Ciclo For de un rango de fechas.
 * @param fechaIterada Dia de un ciclo for
 * @param horario Es el horario del empleado
 * @returns Retorna objeto de fecha con su estado true si el dia es libre y false si el dia trabaja.
 */
function fechaIterada(fechaIterada, horario) {
    let est;
    switch (fechaIterada.getDay()) {
        case 0:
            est = horario.domingo;
            break;
        case 1:
            est = horario.lunes;
            break;
        case 2:
            est = horario.martes;
            break;
        case 3:
            est = horario.miercoles;
            break;
        case 4:
            est = horario.jueves;
            break;
        case 5:
            est = horario.viernes;
            break;
        case 6:
            est = horario.sabado;
            break;
        default: break;
    }
    return {
        fecha: fechaIterada.toJSON().split('T')[0],
        estado: est
    };
}
/**
 *
 * @param dato Hora en formato HH:MM:SS
 * @returns Retorna tiempo en segundos
 */
const HHMMtoSegundos = function (dato) {
    if (dato === '')
        return 0;
    if (dato === null)
        return 0;
    // if (dato === 0) return 0
    // console.log(dato);
    var h = parseInt(dato.split(':')[0]) * 3600;
    var m = parseInt(dato.split(':')[1]) * 60;
    var s = parseInt(dato.split(':')[2]);
    // console.log(h, '>>>>>', m);
    return h + m + s;
};
exports.HHMMtoSegundos = HHMMtoSegundos;
const SegundosToHHMM = function (dato) {
    // console.log('Hora decimal a HHMM ======>',dato);
    var h = Math.floor(dato / 3600);
    var m = Math.floor((dato % 3600) / 60);
    var s = dato % 60;
    if (h <= -1) {
        return '00:00:00';
    }
    let hora = (h >= 10) ? h : '0' + h;
    let min = (m >= 10) ? m : '0' + m;
    let seg = (s >= 10) ? s : '0' + s;
    return hora + ':' + min + ':' + seg;
};
exports.SegundosToHHMM = SegundosToHHMM;
function DiaSemana(dia) {
    let dias = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
    return dias[dia.getUTCDay()];
}
exports.DiaSemana = DiaSemana;
/** ********************************************************************************* **
 ** **            METODO DE BUSQUEDA DE PARAMETROS DE FECHAS Y HORAS               ** **
 ** ********************************************************************************* **/
exports.dia_abreviado = 'ddd';
exports.dia_completo = 'dddd';
const FormatearFecha = function (fecha, dia) {
    return __awaiter(this, void 0, void 0, function* () {
        let formato = yield (0, exports.BuscarFecha)();
        let valor = (0, moment_1.default)(fecha).format(dia).charAt(0).toUpperCase() +
            (0, moment_1.default)(fecha).format(dia).slice(1) +
            ' ' + (0, moment_1.default)(fecha).format(formato.fecha);
        return valor;
    });
};
exports.FormatearFecha = FormatearFecha;
const FormatearHora = function (hora) {
    return __awaiter(this, void 0, void 0, function* () {
        let formato = yield (0, exports.BuscarHora)();
        let valor = (0, moment_1.default)(hora, 'HH:mm:ss').format(formato.hora);
        return valor;
    });
};
exports.FormatearHora = FormatearHora;
const BuscarFecha = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            fecha: yield database_1.pool.query(`SELECT descripcion FROM detalle_tipo_parametro WHERE id_tipo_parametro = 25`).then(result => {
                if (result.rowCount != 0) {
                    return result.rows[0].descripcion;
                }
                else {
                    return 'DD/MM/YYYY';
                }
            })
        };
    });
};
exports.BuscarFecha = BuscarFecha;
const BuscarHora = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            hora: yield database_1.pool.query(`SELECT descripcion FROM detalle_tipo_parametro WHERE id_tipo_parametro = 26`).then(result => {
                if (result.rowCount != 0) {
                    return result.rows[0].descripcion;
                }
                else {
                    return 'HH:mm:ss';
                }
            })
        };
    });
};
exports.BuscarHora = BuscarHora;
