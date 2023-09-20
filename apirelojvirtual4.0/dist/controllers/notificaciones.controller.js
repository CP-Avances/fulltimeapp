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
exports.ObtenerConfigEmpleado = exports.EnviarNotificacionGeneral = exports.NotifiTimbreVisto = exports.NotificaVisto = exports.DatosGenerales = exports.sendCorreoEmpleados = exports.getInfoEmpleadoById = exports.getInfoEmpleadoByCodigo = exports.EnviarNotificacionComidas = exports.postAvisosGenerales = exports.getNotificacionTimbres = exports.postNotificacion = exports.getNotificacion = void 0;
const database_1 = require("../database");
const nodemailer_1 = __importDefault(require("nodemailer"));
/**
 * obtener registro de la tabla de realtime_noti
 * @returns
 */
const getNotificacion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_empleado } = req.query;
        const subquery1 = `( select (i.nombre || ' ' || i.apellido) from empleados i where i.id = r.id_send_empl ) as nempleadosend`;
        const subquery2 = `( select (i.nombre || ' ' || i.apellido) from empleados i where i.id = r.id_receives_empl ) as nempleadoreceives`;
        const query = `SELECT r.*, ${subquery1}, ${subquery2} FROM realtime_noti r WHERE r.id_receives_empl = ${id_empleado} ORDER BY r.create_at DESC LIMIT 40`;
        const response = yield database_1.pool.query(query);
        const notificacion = response.rows;
        return res.status(200).jsonp(notificacion);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getNotificacion = getNotificacion;
/**
 * INSERTAR NOTIFICACION DE LA TABLA DE REALTIME_NOTI
 * @returns
 */
const postNotificacion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_send_empl, id_receives_empl, id_receives_depa, estado, create_at, id_permiso, id_vacaciones, id_hora_extra, mensaje, tipo } = req.body;
        const response = yield database_1.pool.query(`
        INSERT INTO realtime_noti( id_send_empl, id_receives_empl, id_receives_depa, estado, create_at, 
            id_permiso, id_vacaciones, id_hora_extra, mensaje, tipo ) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10 ) RETURNING * 

        `, [id_send_empl, id_receives_empl, id_receives_depa, estado, create_at, id_permiso, id_vacaciones,
            id_hora_extra, mensaje, tipo]);
        const [notificiacion] = response.rows;
        if (!notificiacion)
            return res.status(400).jsonp({ message: 'No se registro notificación.' });
        const USUARIO = yield database_1.pool.query(`
            SELECT (nombre || ' ' || apellido) AS usuario
            FROM empleados WHERE id = $1
            `, [id_send_empl]);
        notificiacion.usuario = USUARIO.rows[0].usuario;
        return res.status(200).jsonp({ message: 'Se ha enviado la respectiva notificación.', respuesta: notificiacion });
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.postNotificacion = postNotificacion;
/**
 * obtener registro de la tabla de realtime_timbres
 * @returns
 */
const getNotificacionTimbres = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_empleado } = req.query;
        const subquery1 = `( select (i.nombre || ' ' || i.apellido) from empleados i where i.id = r.id_send_empl ) as nempleadosend`;
        const subquery2 = `( select (i.nombre || ' ' || i.apellido) from empleados i where i.id = r.id_receives_empl ) as nempleadoreceives`;
        const query = `SELECT r.id, r.create_at, r.id_send_empl, r.id_receives_empl,r.visto, r.descripcion as mensaje, r.id_timbre, r.tipo, ${subquery1}, ${subquery2} FROM realtime_timbres r WHERE r.id_receives_empl = ${id_empleado} ORDER BY r.create_at DESC LIMIT 60`;
        const response = yield database_1.pool.query(query);
        const notificacion = response.rows;
        return res.status(200).jsonp(notificacion);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getNotificacionTimbres = getNotificacionTimbres;
/**
 * Insertar notificacion de la tabla de realtime_timbres
 * @returns
 */
const postAvisosGenerales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { create_at, id_send_empl, id_receives_empl, descripcion, tipo } = req.body;
        const response = yield database_1.pool.query(`
            INSERT INTO realtime_timbres (create_at, id_send_empl, id_receives_empl, descripcion, tipo) 
            VALUES($1, $2, $3, $4, $5) RETURNING * 
            `, [create_at, id_send_empl, id_receives_empl, descripcion, tipo]);
        const [notificiacion] = response.rows;
        if (!notificiacion)
            return res.status(400).jsonp({ message: 'No se inserto notificación' });
        const USUARIO = yield database_1.pool.query(`
            SELECT (nombre || ' ' || apellido) AS usuario
            FROM empleados WHERE id = $1
            `, [id_send_empl]);
        notificiacion.usuario = USUARIO.rows[0].usuario;
        return res.status(200).jsonp({ message: 'Notificación creada', respuesta: notificiacion });
    }
    catch (error) {
        console.log(error);
        return res.status(500)
            .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.postAvisosGenerales = postAvisosGenerales;
/** *************************************************************************
 *      ENVIO DE NOTIFICACIONES DE SERVICIOS DE ALIMENTACIÓN
 * @returns
 ** **************************************************************************/
// NOTIFICACIONES DE SOLICITUDES Y PLANIFICACIÓN DE SERVICIO DE ALIMENTACIÓN
const EnviarNotificacionComidas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id_empl_envia, id_empl_recive, mensaje, tipo, id_comida, create_at } = req.body;
    const SERVICIO_SOLICITADO = yield database_1.pool.query(`
        SELECT tc.nombre AS servicio, ctc.nombre AS menu, ctc.hora_inicio, ctc.hora_fin, 
          dm.nombre AS comida, dm.valor, dm.observacion 
        FROM tipo_comida AS tc, cg_tipo_comidas AS ctc, detalle_menu AS dm 
        WHERE tc.id = ctc.tipo_comida AND ctc.id = dm.id_menu AND dm.id = $1
      `, [id_comida]);
    let notifica = mensaje + SERVICIO_SOLICITADO.rows[0].servicio;
    const response = yield database_1.pool.query(`
        INSERT INTO realtime_timbres(create_at, id_send_empl, id_receives_empl, descripcion, tipo) 
        VALUES($1, $2, $3, $4, $5) RETURNING *
        `, [create_at, id_empl_envia, id_empl_recive, notifica, tipo]);
    const [notificiacion] = response.rows;
    if (!notificiacion)
        return res.status(400).jsonp({ message: 'Notificación no ingresada.' });
    const USUARIO = yield database_1.pool.query(`
        SELECT (nombre || ' ' || apellido) AS usuario
        FROM empleados WHERE id = $1
        `, [id_empl_envia]);
    notificiacion.usuario = USUARIO.rows[0].usuario;
    return res.status(200)
        .jsonp({ message: 'Se ha enviado la respectiva notificación.', respuesta: notificiacion });
});
exports.EnviarNotificacionComidas = EnviarNotificacionComidas;
/**
 * OBTENER REGISTRO DE INFORMACION REQUERIDA PARA LAS NOTIFICACIONES DE LA TABLA DE EMPLEADO
 * @returns
 */
const getInfoEmpleadoByCodigo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codigo } = req.query;
        const query = `
            SELECT da.id_departamento,  cn.* , (da.nombre || ' ' || da.apellido) as fullname, da.cedula,
            da.correo, da.codigo, da.estado, da.id_sucursal, da.id_contrato,
            (SELECT cd.nombre FROM cg_departamentos AS cd WHERE cd.id = da.id_departamento) AS ndepartamento,
            (SELECT s.nombre FROM sucursales AS s WHERE s.id = da.id_sucursal) AS nsucursal
            FROM datos_actuales_empleado AS da, config_noti AS cn            
            WHERE da.codigo = '${codigo}' AND cn.id_empleado = da.id
            `;
        const response = yield database_1.pool.query(query);
        const [infoEmpleado] = response.rows;
        console.log(infoEmpleado);
        return res.status(200).jsonp(infoEmpleado);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getInfoEmpleadoByCodigo = getInfoEmpleadoByCodigo;
/**
 * OBTENER REGISTRO DE INFORMACION REQUERIDA PARA LAS NOTIFICACIONES DE LA TABLA DE EMPLEADO
 * @returns
 */
const getInfoEmpleadoById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_empleado } = req.query;
        const query = `
            SELECT da.id_departamento,  cn.* , (da.nombre || ' ' || da.apellido) as fullname, da.cedula,
            da.correo, da.codigo, da.estado, da.id_sucursal,
            (SELECT cd.nombre FROM cg_departamentos AS cd WHERE cd.id = da.id_departamento) AS ndepartamento,
            (SELECT s.nombre FROM sucursales AS s WHERE s.id = da.id_sucursal) AS nsucursal
            FROM datos_actuales_empleado AS da, config_noti AS cn 
            WHERE da.id = '${id_empleado}' AND cn.id_empleado = da.id
            `;
        const response = yield database_1.pool.query(query);
        const [infoEmpleado] = response.rows;
        console.log(infoEmpleado);
        return res.status(200).jsonp(infoEmpleado);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getInfoEmpleadoById = getInfoEmpleadoById;
/**
 * Insertar notificacion de la tabla de realtime_noti
 * @returns
 */
const sendCorreoEmpleados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let formatoMail = req.body;
        formatoMail.from = 'casapazmino@gmail.com';
        console.log(formatoMail);
        const email = 'casapazmino@gmail.com';
        const pass = 'fulltime3.0';
        const smtpTransport = nodemailer_1.default.createTransport({
            service: 'Gmail',
            auth: {
                user: email,
                pass: pass
            }
        });
        smtpTransport.sendMail(formatoMail, (error, info) => __awaiter(void 0, void 0, void 0, function* () {
            if (error) {
                console.warn(error);
            }
            else {
                console.log('Email sent: ' + info.response);
            }
        }));
        return res.status(200).jsonp({ message: 'Emails enviados.' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Error al enviar los emails.' });
    }
});
exports.sendCorreoEmpleados = sendCorreoEmpleados;
/**
 * Insertar notificacion de la tabla de realtime_noti
 * @returns
 */
const DatosGenerales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let estado = req.params.estado;
        console.log('Estado: ', estado);
        let suc = yield database_1.pool.query(`
            SELECT s.id AS id_suc, s.nombre AS name_suc, c.descripcion AS ciudad FROM sucursales AS s, 
            ciudades AS c WHERE s.id_ciudad = c.id ORDER BY s.id
            `).then(result => { return result.rows; });
        if (suc.length === 0)
            return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
        let departamentos = yield Promise.all(suc.map((ele) => __awaiter(void 0, void 0, void 0, function* () {
            ele.departamentos = yield database_1.pool.query(`
                SELECT d.id as id_depa, d.nombre as name_dep FROM cg_departamentos AS d
                WHERE d.id_sucursal = $1
                `, [ele.id_suc])
                .then(result => {
                return result.rows.filter(obj => {
                    return obj.name_dep != 'Ninguno';
                });
            });
            return ele;
        })));
        let depa = departamentos.filter(obj => {
            return obj.departamentos.length > 0;
        });
        if (depa.length === 0)
            return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
        let lista = yield Promise.all(depa.map((obj) => __awaiter(void 0, void 0, void 0, function* () {
            obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(void 0, void 0, void 0, function* () {
                if (estado === '1') {
                    ele.empleado = yield database_1.pool.query(`
                        SELECT DISTINCT e.id, CONCAT(nombre, ' ' , apellido) 
                        name_empleado, e.codigo, e.cedula, e.genero, e.correo, cn.comunicado_mail, 
                        cn.comunicado_noti 
                        FROM empl_cargos AS ca, empl_contratos AS co, cg_regimenes AS r, empleados AS e, 
                        config_noti AS cn 
                        WHERE ca.id = (SELECT MAX(cargo_id) AS cargo_id FROM datos_empleado_cargo WHERE 
                        codigo = e.codigo) 
                        AND ca.id_departamento = $1 
                        AND co.id = (SELECT MAX(id_contrato) AS contrato_id FROM datos_contrato_actual WHERE 
                        codigo = e.codigo) 
                        AND e.id = cn.id_empleado 
                        AND co.id_regimen = r.id AND e.estado = $2
                        `, [ele.id_depa, estado])
                        .then(result => { return result.rows; });
                }
                else {
                    ele.empleado = yield database_1.pool.query(`
                        SELECT DISTINCT e.id, CONCAT(nombre, \' \', apellido) 
                        name_empleado, e.codigo, e.cedula, e.genero, e.correo, cn.comunicado_mail, 
                        cn.comunicado_noti, ca.fec_final 
                        FROM empl_cargos AS ca, empl_contratos AS co, cg_regimenes AS r, empleados AS e, 
                        config_noti AS cn 
                        WHERE ca.id = (SELECT MAX(cargo_id) AS cargo_id FROM datos_empleado_cargo WHERE 
                        codigo = e.codigo) AND ca.id_departamento = $1 
                        AND co.id = (SELECT MAX(id_contrato) AS contrato_id FROM datos_contrato_actual WHERE 
                        codigo = e.codigo) 
                        AND e.id = cn.id_empleado 
                        AND co.id_regimen = r.id AND e.estado = $2
                        `, [ele.id_depa, estado])
                        .then(result => { return result.rows; });
                }
                return ele;
            })));
            return obj;
        })));
        if (lista.length === 0)
            return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
        let respuesta = lista.map(obj => {
            obj.departamentos = obj.departamentos.filter((ele) => {
                return ele.empleado.length > 0;
            });
            return obj;
        }).filter(obj => {
            return obj.departamentos.length > 0;
        });
        if (respuesta.length === 0)
            return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
        return res.status(200).jsonp(respuesta);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'No se han encontrado datos.' });
    }
});
exports.DatosGenerales = DatosGenerales;
const NotificaVisto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_notificacion, visible } = req.body;
        const response = yield database_1.pool.query('UPDATE realtime_noti SET visto = $1 WHERE id = $2', [visible, id_notificacion]);
        const notificacion = response.rows;
        return res.status(200).jsonp(notificacion);
    }
    catch (error) {
        console.log(error);
        return res.status(400).jsonp({ message: error });
    }
});
exports.NotificaVisto = NotificaVisto;
const NotifiTimbreVisto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_notificacion, visible } = req.body;
        console.log(req.body);
        const response = yield database_1.pool.query('UPDATE realtime_timbres SET visto = $1 WHERE id = $2', [visible, id_notificacion]);
        const notificacionTimbre = response.rows;
        return res.status(200).jsonp(notificacionTimbre);
    }
    catch (error) {
        console.log(error);
        return res.status(400).jsonp({ message: error });
    }
});
exports.NotifiTimbreVisto = NotifiTimbreVisto;
// NOTIFICACIÓNES GENERALES
const EnviarNotificacionGeneral = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { create_at, id_empl_envia, id_empl_recive, mensaje, tipo } = req.body;
    const response = yield database_1.pool.query(`
        INSERT INTO realtime_timbres(create_at, id_send_empl, id_receives_empl, descripcion, tipo) 
        VALUES($1, $2, $3, $4, $5) RETURNING *
      `, [create_at, id_empl_envia, id_empl_recive, mensaje, tipo]);
    const [notificiacion] = response.rows;
    if (!notificiacion)
        return res.status(400).jsonp({ message: 'Notificación no ingresada.' });
    const USUARIO = yield database_1.pool.query(`
        SELECT (nombre || ' ' || apellido) AS usuario
        FROM empleados WHERE id = $1
        `, [id_empl_envia]);
    notificiacion.usuario = USUARIO.rows[0].usuario;
    return res.status(200)
        .jsonp({ message: 'Comunicado enviado exitosamente.', respuesta: notificiacion });
});
exports.EnviarNotificacionGeneral = EnviarNotificacionGeneral;
// METODO PARA LISTAR CONFIGURACION DE RECEPCION DE NOTIFICACIONES
const ObtenerConfigEmpleado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id_empleado = req.params.id;
    if (id_empleado != 'NaN') {
        const CONFIG_NOTI = yield database_1.pool.query(`
        SELECT * FROM config_noti WHERE id_empleado = $1
        `, [id_empleado]);
        if (CONFIG_NOTI.rowCount > 0) {
            return res.status(200).jsonp(CONFIG_NOTI.rows);
        }
        else {
            return res.status(404).jsonp({ text: 'Registro no encontrados.' });
        }
    }
    else {
        return res.status(500).jsonp({ text: 'Sin registros encontrados.' });
    }
});
exports.ObtenerConfigEmpleado = ObtenerConfigEmpleado;
