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
exports.putEstadoAlimentacion = exports.putAlimentacion = exports.postNuevoAlimentacion = exports.getlistaAlimentacionByFechasyCodigo = exports.getlistaAlimentacionByFechas = exports.getlistaAlimentacion = exports.getlistaAlimentacionByIdEmpleado = void 0;
const database_1 = require("../database");
const AUDITORIA_CONTROLADOR = __importStar(require("../controllers/auditotia.controller"));
const metodos_1 = require("../libs/metodos");
/**
 * Metodo para obtener listado de solicitudes de alimentacion por id_empleado
 * @returns Retorna un array de solicitudes de alimentacion.
 */
const getlistaAlimentacionByIdEmpleado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idEmpleado } = req.query;
        const subquery = '( SELECT (nombre || \' \' || apellido) from eu_empleados i where i.id = a.id_empleado) as nempleado ';
        const subquery1 = '( SELECT i.nombre from ma_detalle_comida i where i.id = a.id_detalle_comida ) as ncomida ';
        const subquery2 = '( SELECT i.valor from ma_detalle_comida i where i.id = a.id_detalle_comida )  as nvalor ';
        const subquery3 = '( SELECT i.observacion from ma_detalle_comida i where i.id = a.id_detalle_comida )  as ndetallecomida ';
        const subquery4 = '( SELECT t.nombre from ma_cat_comidas t, ma_horario_comidas ct, ma_detalle_comida i where i.id = a.id_detalle_comida AND i.id_horario_comida = ct.id AND ct.id_comida = t.id )  as nservicio ';
        const subquery5 = '( SELECT t.id from ma_cat_comidas t, ma_horario_comidas ct, ma_detalle_comida i where i.id = a.id_detalle_comida AND i.id_horario_comida = ct.id AND ct.id_comida = t.id )  as id_servicio ';
        const subquery6 = '( SELECT i.id_horario_comida  from ma_detalle_comida i where i.id = a.id_detalle_comida )  as id_plato ';
        const subquery7 = `(SELECT e.codigo FROM eu_empleados AS e WHERE e.id = a.id_empleado) AS codigo`;
        const query = `SELECT a.*, ${subquery}, ${subquery1}, ${subquery2}, ${subquery3}, ${subquery4}, 
        ${subquery5}, ${subquery6}, ${subquery7} FROM ma_solicitud_comida a WHERE a.id_empleado = ${idEmpleado} 
        ORDER BY a.fecha DESC LIMIT 100`;
        const response = yield database_1.pool.query(query);
        const alimentacion = response.rows;
        console.log('consulta comida', alimentacion);
        return res.status(200).jsonp(alimentacion);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getlistaAlimentacionByIdEmpleado = getlistaAlimentacionByIdEmpleado;
/**
 * Metodo para obtener listado de los primeros 100 solicitudes de alimentacion de empleados
 * @returns Retorna un array de solicitudes de alimentacion.
 */
const getlistaAlimentacion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subquery = '( SELECT (i.nombre || \' \' || i.apellido) from eu_empleados i where i.id = a.id_empleado) as nempleado ';
        const subquery1 = '( SELECT i.nombre from ma_detalle_comida i where i.id = a.id_detalle_comida ) as ncomida ';
        const subquery2 = '( SELECT i.valor from ma_detalle_comida i where i.id = a.id_detalle_comida )  as nvalor ';
        const subquery3 = '( SELECT i.observacion from ma_detalle_comida i where i.id = a.id_detalle_comida )  as ndetallecomida ';
        const subquery4 = '( SELECT t.nombre from ma_cat_comidas t, ma_horario_comidas ct, ma_detalle_comida i where i.id = a.id_detalle_comida AND i.id_horario_comida = ct.id AND ct.id_comida = t.id )  as nservicio ';
        const subquery5 = `(SELECT e.codigo FROM eu_empleados AS e WHERE e.id = a.id_empleado) AS codigo`;
        const query = `SELECT a.*, ${subquery}, ${subquery1}, ${subquery2}, ${subquery3}, ${subquery4}, ${subquery5} FROM ma_solicitud_comida a ORDER BY a.fecha DESC LIMIT 100`;
        const response = yield database_1.pool.query(query);
        const alimentacion = response.rows;
        return res.status(200).jsonp(alimentacion);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getlistaAlimentacion = getlistaAlimentacion;
/**
 * Metodo para obtener listado de alimentacion de empleados por rango de fecha
 * @returns Retorna un array de Permisos
 */
const getlistaAlimentacionByFechas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fec_inicio, fec_final } = req.query;
        const subquery = '( SELECT (i.nombre || \' \' || i.apellido) from eu_empleados i where i.id = a.id_empleado) as nempleado ';
        const subquery1 = '( SELECT i.nombre from ma_detalle_comida i where i.id = a.id_detalle_comida ) as ncomida ';
        const subquery2 = '( SELECT i.valor from ma_detalle_comida i where i.id = a.id_detalle_comida )  as nvalor ';
        const subquery3 = '( SELECT i.observacion from ma_detalle_comida i where i.id = a.id_detalle_comida )  as ndetallecomida ';
        const subquery4 = '( SELECT t.nombre from ma_cat_comidas t, ma_horario_comidas ct, ma_detalle_comida i where i.id = a.id_detalle_comida AND i.id_horario_comida = ct.id AND ct.id_comida = t.id )  as nservicio ';
        const subquery5 = `(SELECT e.codigo FROM eu_empleados AS e WHERE e.id = a.id_empleado) AS codigo`;
        const query = `SELECT a.*, ${subquery}, ${subquery1}, ${subquery2}, ${subquery3}, ${subquery4}, ${subquery5} 
        FROM ma_solicitud_comida a WHERE a.fecha_comida BETWEEN \'${fec_inicio}\' AND \'${fec_final}\' 
        ORDER BY a.fecha_comida DESC LIMIT 100`;
        const response = yield database_1.pool.query(query);
        const alimentacion = response.rows;
        return res.status(200).jsonp(alimentacion);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getlistaAlimentacionByFechas = getlistaAlimentacionByFechas;
/**
 * Metodo para obtener listado de Vacaciones por codigo y un rango de fechas del empleado
 * @returns Retorna un array de vacaciones
 */
const getlistaAlimentacionByFechasyCodigo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fec_comida, id_empleado } = req.query;
        const query = `SELECT a.* FROM ma_solicitud_comida a 
                        WHERE a.id_empleado = \'${id_empleado}'\ 
                        AND ((\'${fec_comida}\' =  a.fecha_comida))`;
        const response = yield database_1.pool.query(query);
        const vacaciones = response.rows;
        return res.status(200).jsonp(vacaciones);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getlistaAlimentacionByFechasyCodigo = getlistaAlimentacionByFechasyCodigo;
/**
 * Metodo para insertar una solicitud de comida
 * @returns Retorna datos comida ingresado
 */
const postNuevoAlimentacion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { extra, fecha_comida, fecha, hora_fin, hora_inicio, id_detalle_comida, id_empleado, observacion, verificar, user_name, ip } = req.body;
        console.log(req.body);
        // INICIAR TRANSACCION
        yield database_1.pool.query('BEGIN');
        const response = yield database_1.pool.query('INSERT INTO ma_solicitud_comida (extra, fecha_comida, fecha, hora_fin, hora_inicio, id_detalle_comida, ' +
            'id_empleado, observacion, verificar) ' +
            'VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [extra, fecha_comida, fecha, hora_fin, hora_inicio, id_detalle_comida, id_empleado, observacion, verificar]);
        const [objetoAlimento] = response.rows;
        var fechaN = yield (0, metodos_1.FormatearFecha2)(fecha, 'ddd');
        var fechaComidaN = yield (0, metodos_1.FormatearFecha2)(fecha_comida, 'ddd');
        var horaInicioN = yield (0, metodos_1.FormatearHora)(hora_inicio);
        var horaFinN = yield (0, metodos_1.FormatearHora)(hora_fin);
        // AUDITORIA
        yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'ma_solicitud_comida',
            usuario: user_name,
            accion: 'I',
            datosOriginales: '',
            datosNuevos: `{id_empleado: ${id_empleado}, id_detalle_comida: ${id_detalle_comida}, fecha: ${fechaN}, fecha_comida: ${fechaComidaN}, hora_inicio: ${horaInicioN}, hora_fin: ${horaFinN}, observacion: ${observacion}, extra: ${extra}, verificar: ${verificar}} `,
            ip,
            observacion: null
        });
        // FINALIZAR TRANSACCION
        yield database_1.pool.query('COMMIT');
        if (!objetoAlimento) {
            return res.status(404).jsonp({ message: 'Solicitud no registrada.' });
        }
        else {
            return res.status(200).jsonp(objetoAlimento);
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.postNuevoAlimentacion = postNuevoAlimentacion;
/**
 * METODO PARA ACTUALIZAR REGISTRO DE SOLICITUD DE ALIMENTACION
 * @returns RETORNA MENSAJE ACTUALIZACION.
 */
const putAlimentacion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, id_empleado, fecha, id_detalle_comida, observacion, fecha_comida, extra, aprobada, verificar, user_name, ip } = req.body;
        // INICIAR TRANSACCION
        yield database_1.pool.query('BEGIN');
        // CONSULTAR DATOSORIGINALES
        const planComida = yield database_1.pool.query('SELECT * FROM ma_solicitud_comida WHERE id = $1', [id]);
        const [datosOriginales] = planComida.rows;
        if (!datosOriginales) {
            yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'ma_solicitud_comida',
                usuario: user_name,
                accion: 'U',
                datosOriginales: '',
                datosNuevos: '',
                ip,
                observacion: `Error al actualizar solicitud de comidas con id: ${id}. Registro no encontrado`
            });
            // FINALIZAR TRANSACCION
            yield database_1.pool.query('COMMIT');
            return res.status(404).jsonp({ message: 'Registro no encontrado' });
        }
        const response = yield database_1.pool.query(`
            UPDATE ma_solicitud_comida SET id_empleado = $2 , fecha = $3, id_detalle_comida = $4, observacion = $5, 
            fecha_comida = $6, extra = $7, aprobada = $8, verificar = $9 
            WHERE id = $1  RETURNING *
            `, [id, id_empleado, fecha, id_detalle_comida, observacion, fecha_comida, extra, aprobada, verificar]);
        const [objetoAlimentacion] = response.rows;
        var fechaN = yield (0, metodos_1.FormatearFecha2)(fecha, 'ddd');
        var fechaComidaN = yield (0, metodos_1.FormatearFecha2)(fecha_comida, 'ddd');
        var fechaO = yield (0, metodos_1.FormatearFecha2)(datosOriginales.fecha, 'ddd');
        var fechaComidaO = yield (0, metodos_1.FormatearFecha2)(datosOriginales.fecha_comida, 'ddd');
        var horaInicioO = yield (0, metodos_1.FormatearHora)(datosOriginales.hora_inicio);
        var horaFinO = yield (0, metodos_1.FormatearHora)(datosOriginales.hora_fin);
        // AUDITORIA
        yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'ma_solicitud_comida',
            usuario: user_name,
            accion: 'U',
            datosOriginales: `{id_empleado: ${datosOriginales.id_empleado}, id_detalle_comida: ${datosOriginales.id_detalle_comida}, fecha: ${fechaO}, fecha_comida: ${fechaComidaO}, hora_inicio: ${horaInicioO}, hora_fin: ${horaFinO}, observacion: ${datosOriginales.observacion}, extra: ${datosOriginales.extra}, verificar: ${datosOriginales.verificar}} `,
            datosNuevos: `{id_empleado: ${id_empleado}, id_detalle_comida: ${id_detalle_comida}, fecha: ${fechaN}, fecha_comida: ${fechaComidaN}, hora_inicio: ${horaInicioO}, hora_fin: ${horaFinO}, observacion: ${observacion}, extra: ${extra}} `,
            ip,
            observacion: null
        });
        // FINALIZAR TRANSACCION
        yield database_1.pool.query('COMMIT');
        if (objetoAlimentacion) {
            return res.status(200).jsonp(objetoAlimentacion);
        }
        else {
            return res.status(400)
                .jsonp({ message: 'No se actualizo el registro.' });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500)
            .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.putAlimentacion = putAlimentacion;
/**
 * Metodo para actualizar registro de estado de la solicitud de alimentacion
 * @returns Retorna Array de solicitudes.
 */
const putEstadoAlimentacion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, id_empleado, aprobada, user_name, ip } = req.body;
        // INICIAR TRANSACCION
        yield database_1.pool.query('BEGIN');
        // CONSULTAR DATOSORIGINALES
        const planComida = yield database_1.pool.query('SELECT * FROM ma_solicitud_comida WHERE id = $1', [id]);
        const [datosOriginales] = planComida.rows;
        if (!datosOriginales) {
            yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'ma_solicitud_comida',
                usuario: user_name,
                accion: 'U',
                datosOriginales: '',
                datosNuevos: '',
                ip,
                observacion: `Error al actualizar solicitud de comidas con id: ${id}. Registro no encontrado`
            });
            // FINALIZAR TRANSACCION
            yield database_1.pool.query('COMMIT');
            return res.status(404).jsonp({ message: 'Registro no encontrado' });
        }
        const response = yield database_1.pool.query(`
            UPDATE ma_solicitud_comida SET aprobada = $2 WHERE id = $1 RETURNING id`, [id, aprobada]);
        const [objetoAlimentacion] = response.rows;
        var fechaO = yield (0, metodos_1.FormatearFecha2)(datosOriginales.fecha, 'ddd');
        var fechaComidaO = yield (0, metodos_1.FormatearFecha2)(datosOriginales.fecha_comida, 'ddd');
        var horaInicioO = yield (0, metodos_1.FormatearHora)(datosOriginales.hora_inicio);
        var horaFinO = yield (0, metodos_1.FormatearHora)(datosOriginales.hora_fin);
        // AUDITORIA
        yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'ma_solicitud_comida',
            usuario: user_name,
            accion: 'U',
            datosOriginales: `{id_empleado: ${datosOriginales.id_empleado}, id_detalle_comida: ${datosOriginales.id_detalle_comida}, fecha: ${fechaO}, fecha_comida: ${fechaComidaO}, hora_inicio: ${horaInicioO}, hora_fin: ${horaFinO}, observacion: ${datosOriginales.observacion}, extra: ${datosOriginales.extra}, verificar: ${datosOriginales.verificar}, aprobada: ${datosOriginales.aprobada}} `,
            datosNuevos: `{id_empleado: ${id_empleado}, id_detalle_comida: ${datosOriginales.id_detalle_comida}, fecha: ${fechaO}, fecha_comida: ${fechaComidaO}, hora_inicio: ${horaInicioO}, hora_fin: ${horaFinO}, observacion: ${datosOriginales.observacion}, extra: ${datosOriginales.extra}, verificar: ${datosOriginales.verificar}, aprobada: ${aprobada}}} `,
            ip,
            observacion: null
        });
        if (objetoAlimentacion) {
            return res.status(200).jsonp(objetoAlimentacion);
        }
        else {
            return res.status(400).jsonp({ message: 'No se actualizo el registro.' });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.putEstadoAlimentacion = putEstadoAlimentacion;
