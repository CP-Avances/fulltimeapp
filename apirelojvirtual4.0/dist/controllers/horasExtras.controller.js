"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const metodos_1 = require("../libs/metodos");
const AUDITORIA_CONTROLADOR = __importStar(require("../controllers/auditotia.controller"));
/**
 * Metodo para obtener listado de las primeras 100 horas extras de empleados
 * @returns Retorna un array de horas extras
 */
const getlistaHorasExtras = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subquery1 = '( SELECT (nombre || \' \' || apellido) FROM eu_empleados i WHERE i.id = h.id_empleado_solicita) AS nempleado ';
        const subquery2 = '( SELECT t.cargo FROM eu_empleado_cargos i, e_cat_tipo_cargo t WHERE i.id = h.id_empleado_cargo and i.id_tipo_cargo = t.id) AS ncargo ';
        const subquery3 = '( SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.id = h.id_empleado_solicita ) AS id_contrato ';
        const subquery4 = '( SELECT da.id_departamento FROM datos_actuales_empleado AS da WHERE da.id = h.id_empleado_solicita ) AS id_departamento ';
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
        const { fecha_inicio, fecha_final } = req.query;
        const subquery1 = '( SELECT (nombre || \' \' || apellido) FROM eu_empleados i WHERE i.id = h.id_empleado_solicita) as nempleado ';
        const subquery2 = '( SELECT t.cargo FROM eu_empleado_cargos i, e_cat_tipo_cargo t WHERE i.id = h.id_empleado_cargo and i.id_tipo_cargo = t.id) as ncargo ';
        const subquery3 = '( SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.id = h.id_empleado_solicita ) AS id_contrato ';
        const subquery4 = '( SELECT da.id_departamento FROM datos_actuales_empleado AS da WHERE da.id = h.id_empleado_solicita ) AS id_departamento ';
        const query = `SELECT h.*, ${subquery1}, ${subquery2}, ${subquery3}, ${subquery4} 
        FROM mhe_solicitud_hora_extra h WHERE h.fecha_inicio BETWEEN \'${fecha_inicio}\' AND \'${fecha_final}\' 
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
        const subquery2 = '( SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.id = h.id_empleado_solicita ) AS id_contrato ';
        const query = `SELECT h.*, ${subquery1}, ${subquery2} 
        FROM mhe_solicitud_hora_extra h WHERE h.id_empleado_solicita = '${codigo}' 
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
        const { fecha_inicio, fecha_final, codigo } = req.query;
        const query = `SELECT h.* FROM mhe_solicitud_hora_extra h WHERE h.id_empleado_solicita = '${codigo}' AND (
            ((\'${fecha_inicio}\' BETWEEN h.fecha_inicio AND h.fecha_final ) OR 
             (\'${fecha_final}\' BETWEEN h.fecha_inicio AND h.fecha_final)) 
            OR
            ((h.fecha_inicio BETWEEN \'${fecha_inicio}\' AND \'${fecha_final}\') OR 
             (h.fecha_final BETWEEN \'${fecha_inicio}\' AND \'${fecha_final}\'))
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
        const { fecha_inicio, fecha_final, codigo, id } = req.query;
        console.log('fecha_inicio: ', fecha_inicio);
        console.log('fecha_final: ', fecha_final);
        console.log('codigo: ', codigo);
        console.log('id: ', id);
        const HorasExtras = yield database_1.pool.query(`SELECT h.* FROM mhe_solicitud_hora_extra h 
        WHERE h.id_empleado_solicita::varchar = $1 
        AND ((($2 BETWEEN h.fecha_inicio AND h.fecha_final ) OR ($3 BETWEEN h.fecha_inicio AND h.fecha_final)) OR ((h.fecha_inicio BETWEEN $2 AND $3) OR (h.fecha_final BETWEEN $2 AND $3))) 
        AND NOT h.id = $4 `, [codigo, fecha_inicio, fecha_final, id]);
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
        const { descripcion, estado, fecha_final, fecha_inicio, fecha_solicita, hora_ingreso, hora_salida, id_empleado_cargo, id_empleado_solicita, horas_solicitud, observacion, tiempo_autorizado, user_name, ip } = req.body;
        yield database_1.pool.query('BEGIN');
        console.log(req.body);
        const response = yield database_1.pool.query(`
            INSERT INTO mhe_solicitud_hora_extra ( descripcion, estado, fecha_final, fecha_inicio, fecha_solicita,
            id_empleado_cargo, id_empleado_solicita, horas_solicitud, observacion, tiempo_autorizado)
            VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 ) RETURNING * 
            `, [descripcion, estado, fecha_final, fecha_inicio, fecha_solicita,
            id_empleado_cargo, id_empleado_solicita, horas_solicitud, observacion, tiempo_autorizado]);
        const [objetoHoraExtra] = response.rows;
        const fechaHoraInicio = yield (0, metodos_1.FormatearHora)(fecha_inicio.toLocaleString().split(' ')[1]);
        const fechaTimbreInicio = yield (0, metodos_1.FormatearFecha2)(fecha_inicio.toLocaleString(), 'ddd');
        const fechaHoraFin = yield (0, metodos_1.FormatearHora)(fecha_final.toLocaleString().split(' ')[1]);
        const fechaTimbreFin = yield (0, metodos_1.FormatearFecha2)(fecha_final.toLocaleString(), 'ddd');
        const fechaSolicita = yield (0, metodos_1.FormatearFecha2)(fecha_solicita.toLocaleString(), 'ddd');
        yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'mhe_solicitud_hora_extra',
            usuario: user_name,
            accion: 'I',
            datosOriginales: '',
            datosNuevos: `{id_empleado_solicita: ${id_empleado_solicita}, id_empleado_cargo: ${id_empleado_cargo}, fecha_solicita: ${fechaSolicita}, fecha_inicio: ${fechaTimbreInicio + ' ' + fechaHoraInicio}, fecha_final: ${fechaTimbreFin + ' ' + fechaHoraFin}, descripcion: ${descripcion}, estado: ${estado}, horas_solicitud: ${horas_solicitud}, tiempo_autorizado: ${tiempo_autorizado}, observacion: ${observacion}}`,
            ip: ip,
            observacion: null
        });
        // FINALIZAR TRANSACCION
        yield database_1.pool.query('COMMIT');
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
        const { id, descripcion, fecha_final, fecha_inicio, horas_solicitud, observacion, tiempo_autorizado, documento, docu_nombre, estado, user_name, ip } = req.body;
        yield database_1.pool.query('BEGIN');
        console.log(req.body);
        const solicitudHoraExtra = yield database_1.pool.query('SELECT * FROM mhe_solicitud_hora_extra WHERE id = $1', [id]);
        const [datosOriginales] = solicitudHoraExtra.rows;
        if (!datosOriginales) {
            yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'mhe_solicitud_hora_extra',
                usuario: user_name,
                accion: 'U',
                datosOriginales: '',
                datosNuevos: '',
                ip: ip,
                observacion: `Error al actualizar solicitud de comidas con id: ${id}. Registro no encontrado`
            });
            // FINALIZAR TRANSACCION
            yield database_1.pool.query('COMMIT');
            return res.status(404).jsonp({ message: 'Registro no encontrado' });
        }
        if (estado === 1) {
            const response = yield database_1.pool.query(`
                UPDATE mhe_solicitud_hora_extra SET descripcion = $2 , fecha_final = $3, fecha_inicio = $4,
                horas_solicitud = $5, observacion = $6, tiempo_autorizado = $7, documento = $8, docu_nombre = $9
                WHERE id = $1  RETURNING *
                `, [id, descripcion, fecha_final, fecha_inicio, horas_solicitud, observacion, tiempo_autorizado, documento, docu_nombre]);
            const [objetoHora_extra] = response.rows;
            const fechaHoraInicioO = yield (0, metodos_1.FormatearHora)(datosOriginales.fecha_inicio.toLocaleString().split(' ')[1]);
            const fechaTimbreInicioO = yield (0, metodos_1.FormatearFecha2)(datosOriginales.fecha_inicio.toLocaleString(), 'ddd');
            const fechaHoraFinO = yield (0, metodos_1.FormatearHora)(datosOriginales.fecha_final.toLocaleString().split(' ')[1]);
            const fechaTimbreFinO = yield (0, metodos_1.FormatearFecha2)(datosOriginales.fecha_final.toLocaleString(), 'ddd');
            const fechaHoraInicioN = yield (0, metodos_1.FormatearHora)(fecha_inicio.toLocaleString().split(' ')[1]);
            const fechaTimbreInicioN = yield (0, metodos_1.FormatearFecha2)(fecha_inicio.toLocaleString(), 'ddd');
            const fechaHoraFinN = yield (0, metodos_1.FormatearHora)(fecha_final.toLocaleString().split(' ')[1]);
            const fechaTimbreFinN = yield (0, metodos_1.FormatearFecha2)(fecha_final.toLocaleString(), 'ddd');
            yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'mhe_solicitud_hora_extra',
                usuario: user_name,
                accion: 'U',
                datosOriginales: `{id_empleado_solicita: ${datosOriginales.id_empleado_solicita}, id_empleado_cargo: ${datosOriginales.id_empleado_cargo}, fecha_solicita: ${datosOriginales.fechaSolicita}, fecha_inicio: ${fechaTimbreInicioO + ' ' + fechaHoraInicioO}, fecha_final: ${fechaTimbreFinO + ' ' + fechaHoraFinO}, descripcion: ${datosOriginales.descripcion}, estado: ${datosOriginales.estado}, horas_solicitud: ${datosOriginales.horas_solicitud}, tiempo_autorizado: ${datosOriginales.tiempo_autorizado}, observacion: ${datosOriginales.observacion}, documento: ${datosOriginales.documento}, docu_nombre: ${datosOriginales.docu_nombre}}`,
                datosNuevos: `{id_empleado_solicita: ${datosOriginales.id_empleado_solicita}, id_empleado_cargo: ${datosOriginales.id_empleado_cargo}, fecha_solicita: ${datosOriginales.fechaSolicita}, fecha_inicio: ${fechaTimbreInicioN + ' ' + fechaHoraInicioN}, fecha_final: ${fechaTimbreFinN + ' ' + fechaHoraFinN}, descripcion: ${descripcion}, estado: ${estado}, horas_solicitud: ${horas_solicitud}, tiempo_autorizado: ${tiempo_autorizado}, observacion: ${observacion}, documento: ${documento}, docu_nombre: ${docu_nombre}}`,
                ip: ip,
                observacion: null
            });
            // FINALIZAR TRANSACCION
            yield database_1.pool.query('COMMIT');
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
