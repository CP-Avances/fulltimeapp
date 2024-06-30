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
exports.putHoraExtra = exports.postNuevaHoraExtra = exports.getlistaHorasExtrasByFechasyCodigoEdit = exports.getlistaHorasExtrasByFechasyCodigo = exports.getlistaHorasExtrasByCodigo = exports.getlistaByFechas = exports.getlistaHorasExtras = void 0;
const database_1 = require("../database");
/**
 * Metodo para obtener listado de las primeras 100 horas extras de empleados
 * @returns Retorna un array de horas extras
 */
const getlistaHorasExtras = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subquery1 = '( SELECT (nombre || \' \' || apellido) FROM eu_empleados i WHERE i.id = h.id_empleado_solicita) AS nempleado ';
        const subquery2 = '( SELECT t.cargo FROM eu_empleado_cargos i, e_cat_tipo_cargo t WHERE i.id = h.id_empleado_cargo and i.id_tipo_cargo = t.id) AS ncargo ';
        const subquery3 = '( SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.codigo = h.codigo ) AS id_contrato ';
        const subquery4 = '( SELECT da.id_departamento FROM datos_actuales_empleado AS da WHERE da.codigo = h.codigo ) AS id_departamento ';
        const query = `SELECT h.*, ${subquery1}, ${subquery2}, ${subquery3}, ${subquery4}  FROM mhe_solicitud_hora_extra h ORDER BY h.fecha_inicio DESC LIMIT 100`;
        const response = yield database_1.pool.query(query);
        const horas_extras = response.rows;
        return res.status(200).jsonp(horas_extras);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getlistaHorasExtras = getlistaHorasExtras;
/**
 * Metodo para obtener listado de horas extras de empleados segun rango de fechas.
 * @returns Retorna un array de horas extras
 */
const getlistaByFechas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fec_inicio, fec_final } = req.query;
        const subquery1 = '( SELECT (nombre || \' \' || apellido) FROM eu_empleados i WHERE i.id = h.id_empleado_solicita) as nempleado ';
        const subquery2 = '( SELECT t.cargo FROM eu_empleado_cargos i, e_cat_tipo_cargo t WHERE i.id = h.id_empleado_cargo and i.id_tipo_cargo = t.id) as ncargo ';
        const subquery3 = '( SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.codigo = h.codigo ) AS id_contrato ';
        const subquery4 = '( SELECT da.id_departamento FROM datos_actuales_empleado AS da WHERE da.codigo = h.codigo ) AS id_departamento ';
        const query = `SELECT h.*, ${subquery1}, ${subquery2}, ${subquery3}, ${subquery4} 
        FROM mhe_solicitud_hora_extra h WHERE h.fecha_inicio BETWEEN \'${fec_inicio}\' AND \'${fec_final}\' 
        ORDER BY h.fecha_inicio DESC`;
        const response = yield database_1.pool.query(query);
        const horas_extras = response.rows;
        return res.status(200).jsonp(horas_extras);
    }
    catch (error) {
        console.log(error);
        return res.status(500)
            .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getlistaByFechas = getlistaByFechas;
/**
 * Metodo para obtener listado de HORAS EXTRAS por codigo del empleado
 * @returns Retorna un array de HORAS EXTRAS
 */
const getlistaHorasExtrasByCodigo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codigo } = req.query;
        const subquery1 = '( SELECT t.cargo FROM eu_empleado_cargos i, e_cat_tipo_cargo t WHERE i.id = h.id_empleado_cargo and i.id_tipo_cargo = t.id) as ncargo ';
        const subquery2 = '( SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.codigo = h.codigo ) AS id_contrato ';
        const query = `SELECT h.*, ${subquery1}, ${subquery2} 
        FROM mhe_solicitud_hora_extra h WHERE h.codigo = '${codigo}' 
        ORDER BY h.fecha_inicio DESC LIMIT 100`;
        const response = yield database_1.pool.query(query);
        const horas_extras = response.rows;
        return res.status(200).jsonp(horas_extras);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getlistaHorasExtrasByCodigo = getlistaHorasExtrasByCodigo;
/**
 * Metodo para obtener listado de HORAS EXTRAS por codigo y un rango de fechas del empleado
 * @returns Retorna un array de HORAS EXTRAS
 */
const getlistaHorasExtrasByFechasyCodigo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fec_inicio, fec_final, codigo } = req.query;
        const query = `SELECT h.* FROM mhe_solicitud_hora_extra h WHERE h.codigo = '${codigo}' AND (
            ((\'${fec_inicio}\' BETWEEN h.fecha_inicio AND h.fecha_final ) OR 
             (\'${fec_final}\' BETWEEN h.fecha_inicio AND h.fecha_final)) 
            OR
            ((h.fecha_inicio BETWEEN \'${fec_inicio}\' AND \'${fec_final}\') OR 
             (h.fecha_final BETWEEN \'${fec_inicio}\' AND \'${fec_final}\'))
            )`;
        const response = yield database_1.pool.query(query);
        const horas_extras = response.rows;
        return res.status(200).jsonp(horas_extras);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getlistaHorasExtrasByFechasyCodigo = getlistaHorasExtrasByFechasyCodigo;
/**
 * Metodo para obtener listado de HORAS EXTRAS por codigo y un rango de fechas del empleado filtrado por la id
 * @returns Retorna un array de HORAS EXTRAS
 */
const getlistaHorasExtrasByFechasyCodigoEdit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fec_inicio, fec_final, codigo, id } = req.query;
        console.log('fec_inicio: ', fec_inicio);
        console.log('fec_final: ', fec_final);
        console.log('codigo: ', codigo);
        console.log('id: ', id);
        const HorasExtras = yield database_1.pool.query(`SELECT h.* FROM mhe_solicitud_hora_extra h 
        WHERE h.codigo::varchar = $1 
        AND ((($2 BETWEEN h.fecha_inicio AND h.fecha_final ) OR ($3 BETWEEN h.fecha_inicio AND h.fecha_final)) OR ((h.fecha_inicio BETWEEN $2 AND $3) OR (h.fecha_final BETWEEN $2 AND $3))) 
        AND NOT h.id = $4 `, [codigo, fec_inicio, fec_final, id]);
        console.log('lista solicitudes: ', HorasExtras.rows);
        return res.status(200).jsonp(HorasExtras.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getlistaHorasExtrasByFechasyCodigoEdit = getlistaHorasExtrasByFechasyCodigoEdit;
/**
 * Metodo para insertar una hora extra
 * @returns Retorna datos hora extra ingresado
 */
const postNuevaHoraExtra = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codigo, descripcion, estado, fec_final, fec_inicio, fec_solicita, hora_ingreso, hora_salida, id_empl_cargo, id_usua_solicita, num_hora, observacion, tiempo_autorizado } = req.body;
        console.log(req.body);
        const response = yield database_1.pool.query(`
            INSERT INTO mhe_solicitud_hora_extra (codigo, descripcion, estado, fecha_final, fecha_inicio, fecha_solicita,
            id_empleado_cargo, id_empleado_solicita, horas_solicitud, observacion, tiempo_autorizado)
            VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 ) RETURNING * 
            `, [codigo, descripcion, estado, fec_final, fec_inicio, fec_solicita,
            id_empl_cargo, id_usua_solicita, num_hora, observacion, tiempo_autorizado]);
        const [objetoHoraExtra] = response.rows;
        if (!objetoHoraExtra)
            return res.status(404).jsonp({ message: 'Solicitud no registrada.' });
        const hora_extra = objetoHoraExtra;
        console.log(hora_extra);
        console.log(req.query);
        return res.status(200).jsonp(hora_extra);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.postNuevaHoraExtra = postNuevaHoraExtra;
/**
 * METODO PARA ACTUALIZAR REGISTRO DE HORA EXTRA SOLO EN ESTADO PENDIENTE
 * @returns RETORNA MENSAJE ACTUALIZACION.
 */
const putHoraExtra = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, descripcion, fec_final, fec_inicio, num_hora, observacion, tiempo_autorizado, documento, docu_nombre, estado } = req.body;
        console.log(req.body);
        if (estado === 1) {
            const response = yield database_1.pool.query(`
                UPDATE mhe_solicitud_hora_extra SET descripcion = $2 , fecha_final = $3, fecha_inicio = $4,
                horas_solicitud = $5, observacion = $6, tiempo_autorizado = $7, documento = $8, docu_nombre = $9
                WHERE id = $1  RETURNING *
                `, [id, descripcion, fec_final, fec_inicio, num_hora, observacion, tiempo_autorizado, documento, docu_nombre]);
            const [objetoHora_extra] = response.rows;
            if (objetoHora_extra) {
                return res.status(200).jsonp(objetoHora_extra);
            }
            else {
                return res.status(400).jsonp({ message: 'No se actualizo el registro.' });
            }
        }
        return res.status(400)
            .jsonp({ message: 'El estado debe ser pendiente para editar la solicitud.' });
    }
    catch (error) {
        console.log(error);
        return res.status(500)
            .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.putHoraExtra = putHoraExtra;
