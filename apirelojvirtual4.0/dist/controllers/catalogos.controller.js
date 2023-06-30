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
exports.getDetalleMenu = exports.getServiciosMenu = exports.getServiciosComida = exports.getCgTipoPermisos = exports.getCgFeriados = void 0;
const database_1 = require("../database");
/**
 * Metodo para obtener listado de los feriados del año para llenar en un selectItem o combobox.
 * @returns Retorna un array de catalogos de feriados
 */
const getCgFeriados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fecha = new Date();
        const response = yield database_1.pool.query('SELECT id, descripcion, CAST(fecha AS VARCHAR),CAST(fec_recuperacion AS VARCHAR) FROM cg_feriados WHERE CAST(fecha AS VARCHAR) LIKE $1 || \'%\' ORDER BY descripcion ASC', [fecha.toJSON().split("-")[0]]);
        const cg_feriados = response.rows;
        console.log('cg_feriados: ', cg_feriados);
        return res.status(200).jsonp(cg_feriados);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getCgFeriados = getCgFeriados;
/**
 * Metodo para obtener listado de los tipos de permisos para llenar en un selectItem o combobox.
 * @returns Retorna un array de Permisos
 */
const getCgTipoPermisos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT cg.* FROM cg_tipo_permisos cg ORDER BY cg.descripcion ASC');
        const cg_permisos = response.rows;
        return res.status(200).jsonp(cg_permisos);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getCgTipoPermisos = getCgTipoPermisos;
/**
 * Metodo para obtener listado del detalle de comidas llenar en un selectItem o combobox.
 * @returns Retorna un array de Detalle de comidas
 */
const getServiciosComida = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT * FROM tipo_comida');
        const servicios_comida = response.rows;
        return res.status(200).jsonp(servicios_comida);
    }
    catch (error) {
        console.log(error);
        return res.status(500).
            jsonp({
            message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 ' +
                'o https://casapazmino.com.ec'
        });
    }
});
exports.getServiciosComida = getServiciosComida;
const getServiciosMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT * FROM cg_tipo_comidas');
        const menu = response.rows;
        return res.status(200).jsonp(menu);
    }
    catch (error) {
        console.log(error);
        return res.status(500).
            jsonp({
            message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 ' +
                'o https://casapazmino.com.ec'
        });
    }
});
exports.getServiciosMenu = getServiciosMenu;
const getDetalleMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT cg.* FROM detalle_menu cg ORDER BY cg.valor ASC');
        const cg_detalle_menu = response.rows;
        return res.status(200).jsonp(cg_detalle_menu);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getDetalleMenu = getDetalleMenu;
