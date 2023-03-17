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
exports.updateEstadoSolicitudes = exports.updateAutorizacion = exports.postAutorizacion = exports.getAutorizacion = void 0;
const database_1 = require("../database");
/**
 * Obtener registro de la tabla de Autorizaciones
 * @returns
 */
const getAutorizacion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_auto, campo } = req.query;
        const subquery1 = `( select i.nombre from cg_departamentos i where i.id = a.id_departamento ) AS ndepartamento `;
        const query = `SELECT a.*, ${subquery1} FROM autorizaciones a WHERE a.${campo} = ${id_auto}`;
        const response = yield database_1.pool.query(query);
        const [autorizacion] = response.rows;
        if (!autorizacion)
            return res.status(400).jsonp({ message: 'No hay autorización' });
        return res.status(200).jsonp(autorizacion);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Error al conectarse con la BDD' });
    }
});
exports.getAutorizacion = getAutorizacion;
/**
 * Insertar nuevo registro de la tabla de Autorizaciones
 * @returns
 */
const postAutorizacion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orden, estado, id_departamento, id_permiso, id_vacacion, id_hora_extra, id_documento, id_plan_hora_extra } = req.body;
        const response = yield database_1.pool.query('INSERT INTO autorizaciones( orden, estado, id_departamento, id_permiso, id_vacacion, id_hora_extra, id_documento, id_plan_hora_extra ) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING * ', [orden, estado, id_departamento, id_permiso, id_vacacion, id_hora_extra, id_documento, id_plan_hora_extra]);
        const [autorizacion] = response.rows;
        if (!autorizacion)
            return res.status(400).jsonp({ message: 'No se creo autorización' });
        return res.status(200).jsonp({ message: 'Autorización creada' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Error al conectarse con la BDD' });
    }
});
exports.postAutorizacion = postAutorizacion;
/**
 * Actualizar registro de la tabla de Autorizaciones
 * @returns
 */
const updateAutorizacion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_auto, campo } = req.query;
        const { estado, id_documento } = req.body;
        const query = `UPDATE autorizaciones SET estado = ${estado} , id_documento = \'${id_documento}\' WHERE ${campo} = ${id_auto} RETURNING *`;
        const response = yield database_1.pool.query(query);
        const [autorizacion] = response.rows;
        if (!autorizacion)
            return res.status(400).jsonp({ message: 'No hay autorización' });
        return res.status(200).jsonp(autorizacion);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp('Error al conectarse con la BDD');
    }
});
exports.updateAutorizacion = updateAutorizacion;
/**
 * Actualizar registro de tablas de permisos, horas extras y vacaciones solo el estado de la solicitud.
 * @returns
 */
const updateEstadoSolicitudes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nameTable } = req.query;
        const { estado, id_solicitud } = req.body;
        const query = `UPDATE ${nameTable} SET estado = ${estado} WHERE id = ${id_solicitud} RETURNING * `;
        const response = yield database_1.pool.query(query);
        const [solicitud] = response.rows;
        if (!solicitud)
            return res.status(400).jsonp({ message: 'No se actualizo la solicitud' });
        return res.status(200).jsonp({ message: 'Solicitud actualizada' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Error al conectarse con la BDD' });
    }
});
exports.updateEstadoSolicitudes = updateEstadoSolicitudes;
