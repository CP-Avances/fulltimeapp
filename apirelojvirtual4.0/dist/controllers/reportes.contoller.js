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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInfoPlantilla = exports.getInfoReporteAlimentacion = exports.getInfoReporteVacaciones = exports.getInfoReporteSolicitudes = exports.getInfoReporteHorasExtras = exports.getInfoReporteAtrasos = exports.getInfoReporteInasistencia = exports.getInfoReporteTimbresNovedad = exports.getInfoReporteTimbres = void 0;
const database_1 = require("../database");
const metodos_1 = require("../libs/metodos");
const calculosReportes_1 = require("../libs/calculosReportes");
const CalcularHorasExtras_1 = require("../libs/CalcularHorasExtras");
const getInfoReporteTimbres = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codigo, fec_inicio, fec_final } = req.query;
        const response = yield database_1.pool.query('SELECT t.*, CAST(t.fec_hora_timbre AS VARCHAR) AS stimbre, CAST(t.fec_hora_timbre_servidor AS VARCHAR) AS stimbre_servidor FROM timbres as t WHERE codigo = $3 AND fec_hora_timbre BETWEEN $1 AND $2 ORDER BY fec_hora_timbre DESC LIMIT 100', [fec_inicio, fec_final, codigo]);
        const timbres = response.rows;
        // console.log(timbres);
        if (timbres.length === 0)
            return res.status(400).jsonp({ message: 'No hay timbres resgistrados' });
        return res.status(200).jsonp(timbres);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getInfoReporteTimbres = getInfoReporteTimbres;
const getInfoReporteTimbresNovedad = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codigo, fec_inicio, fec_final, conexion } = req.query;
        const response = yield database_1.pool.query('SELECT t.*, CAST(t.fec_hora_timbre AS VARCHAR) AS stimbre, CAST(t.fecha_subida_servidor AS VARCHAR) AS stimbre_servidor FROM timbres as t WHERE codigo = $3 AND fec_hora_timbre BETWEEN $1 AND $2 AND conexion = $4 ORDER BY fec_hora_timbre DESC LIMIT 100', [fec_inicio, fec_final, codigo, conexion]);
        const timbres = response.rows;
        // console.log(timbres);
        if (timbres.length === 0)
            return res.status(400).jsonp({ message: 'No hay timbres resgistrados' });
        return res.status(200).jsonp(timbres);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getInfoReporteTimbresNovedad = getInfoReporteTimbresNovedad;
//TODO Revisar query incompleto
const getInfoReporteInasistencia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codigo, fec_inicio, fec_final } = req.query;
        const response = yield database_1.pool.query('SELECT t.* ', [fec_inicio, fec_final, codigo]);
        const inasistencia = response.rows;
        if (inasistencia.length === 0)
            return res.status(400).jsonp({ message: 'No hay inasistencias resgistradas' });
        return res.status(200).jsonp(inasistencia);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getInfoReporteInasistencia = getInfoReporteInasistencia;
const getInfoReporteAtrasos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const qReport = req.query;
        const { codigo, fec_inicio, fec_final } = qReport;
        let atrasos = yield (0, calculosReportes_1.AtrasosTimbres)(fec_inicio, fec_final, codigo);
        // const response: QueryResult = await pool.query('SELECT t.* ', [fec_inicio, fec_final, codigo]);
        // const atrasos: any[] = response.rows;
        if (atrasos.error)
            return res.status(500).jsonp({ message: atrasos.error });
        if (atrasos.length === 0)
            return res.status(400).jsonp({ message: 'No hay atrasos resgistrados' });
        return res.status(200).jsonp(atrasos);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getInfoReporteAtrasos = getInfoReporteAtrasos;
const getInfoReporteHorasExtras = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const qReport = req.query;
        const { id_empleado, codigo, fec_inicio, fec_final } = qReport;
        //TODO CalcularHoraExtra
        const horasExtras = yield (0, CalcularHorasExtras_1.CalcularHoraExtra)(parseInt(id_empleado), codigo, new Date(fec_inicio), new Date(fec_final));
        console.log(horasExtras);
        if (horasExtras.message) {
            return res.status(400).jsonp(horasExtras);
        }
        if (horasExtras.length === 0)
            return res.status(400).jsonp({ message: 'No hay horas extras resgistradas' });
        return res.status(200).jsonp(horasExtras);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getInfoReporteHorasExtras = getInfoReporteHorasExtras;
//TODO revisar query
const getInfoReporteSolicitudes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codigo, fec_inicio, fec_final } = req.query;
        const response = yield database_1.pool.query('SELECT t.* ', [fec_inicio, fec_final, codigo]);
        const solicitudes = response.rows;
        if (solicitudes.length === 0)
            return res.status(400).jsonp({ message: 'No hay solicitudes resgistradas' });
        return res.status(200).jsonp(solicitudes);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getInfoReporteSolicitudes = getInfoReporteSolicitudes;
const getInfoReporteVacaciones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codigo, fec_inicio, fec_final } = req.query;
        const response = yield database_1.pool.query('SELECT t.* ', [fec_inicio, fec_final, codigo]);
        const vacaciones = response.rows;
        if (vacaciones.length === 0)
            return res.status(400).jsonp({ message: 'No hay vacaciones resgistradas' });
        return res.status(200).jsonp(vacaciones);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getInfoReporteVacaciones = getInfoReporteVacaciones;
const getInfoReporteAlimentacion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codigo, fec_inicio, fec_final } = req.query;
        const response = yield database_1.pool.query('SELECT t.* ', [fec_inicio, fec_final, codigo]);
        const alimentacion = response.rows;
        if (alimentacion.length === 0)
            return res.status(400).jsonp({ message: 'No hay alimentacion resgistradas' });
        return res.status(200).jsonp(alimentacion);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getInfoReporteAlimentacion = getInfoReporteAlimentacion;
/**
 *
 * @returns
 */
const getInfoPlantilla = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_empresa } = req.query;
        const [file_name] = yield database_1.pool.query('select nombre, logo, color_p, color_s from cg_empresa where id = $1', [id_empresa])
            .then(result => {
            return result.rows;
        });
        if (!file_name)
            return res.status(400).jsonp({ message: 'No hay información de la empresa' });
        const { nombre: nom_empresa, logo, color_p, color_s } = file_name;
        const codificado = yield (0, metodos_1.ImagenBase64LogosEmpresas)(logo);
        if (codificado === 0) {
            return res.status(200).jsonp({ imagen: '', nom_empresa, color_p, color_s });
        }
        else {
            return res.status(200).jsonp({ imagen: codificado, nom_empresa, color_p, color_s });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getInfoPlantilla = getInfoPlantilla;
