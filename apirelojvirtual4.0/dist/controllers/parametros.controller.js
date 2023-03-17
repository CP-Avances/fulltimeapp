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
exports.BuscarFunciones = exports.BuscarFechasHoras = exports.BuscarCoordenadasUsuario = exports.CompararCoordenadas = exports.VerDetalleParametro = void 0;
const metodos_1 = require("../libs/metodos");
const database_1 = require("../database");
const VerDetalleParametro = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const response = yield database_1.pool.query('SELECT tp.id AS id_tipo, tp.descripcion AS tipo, ' +
            'dtp.id AS id_detalle, dtp.descripcion ' +
            'FROM tipo_parametro AS tp, detalle_tipo_parametro AS dtp ' +
            'WHERE tp.id = dtp.id_tipo_parametro AND tp.id = $1', [id]);
        const detalle = response.rows;
        console.log(detalle);
        return res.jsonp(detalle);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.VerDetalleParametro = VerDetalleParametro;
const CompararCoordenadas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lat1, lng1, lat2, lng2, valor } = req.body;
        console.log(lat1, lng1, lat2, lng2, valor);
        const response = yield database_1.pool.query('SELECT CASE ( SELECT 1 ' +
            'WHERE ' +
            ' ($1::DOUBLE PRECISION  BETWEEN $3::DOUBLE PRECISION  - $5 AND $3::DOUBLE PRECISION  + $5) AND ' +
            ' ($2::DOUBLE PRECISION  BETWEEN $4::DOUBLE PRECISION  - $5 AND $4::DOUBLE PRECISION  + $5) ' +
            ') IS null WHEN true THEN \'vacio\' ELSE \'ok\' END AS verificar', [lat1, lng1, lat2, lng2, valor]);
        console.log(response.rows);
        return res.jsonp(response.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.CompararCoordenadas = CompararCoordenadas;
const BuscarCoordenadasUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codigo } = req.params;
        const response = yield database_1.pool.query('SELECT eu.id AS id_emplu, eu.codigo, eu.id_ubicacion, eu.id_empl, ' +
            'cu.latitud, cu.longitud, cu.descripcion ' +
            'FROM empl_ubicacion AS eu, cg_ubicaciones AS cu ' +
            'WHERE eu.id_ubicacion = cu.id AND eu.codigo = $1', [codigo]);
        console.log(response.rows);
        return res.jsonp(response.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.BuscarCoordenadasUsuario = BuscarCoordenadasUsuario;
const BuscarFechasHoras = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let formato_fecha = yield (0, metodos_1.BuscarFecha)();
        let formato_hora = yield (0, metodos_1.BuscarHora)();
        let formatos = {
            fecha: formato_fecha.fecha,
            hora: formato_hora.hora
        };
        return res.jsonp(formatos);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.BuscarFechasHoras = BuscarFechasHoras;
const BuscarFunciones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT * FROM funciones');
        console.log(response.rows);
        return res.jsonp(response.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.BuscarFunciones = BuscarFunciones;
