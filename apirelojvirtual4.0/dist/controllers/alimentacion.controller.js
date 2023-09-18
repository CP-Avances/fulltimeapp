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
exports.putEstadoAlimentacion = exports.putAlimentacion = exports.postNuevoAlimentacion = exports.getlistaAlimentacionByFechasyCodigo = exports.getlistaAlimentacionByFechas = exports.getlistaAlimentacion = exports.getlistaAlimentacionByIdEmpleado = void 0;
const database_1 = require("../database");
/**
 * Metodo para obtener listado de solicitudes de alimentacion por id_empleado
 * @returns Retorna un array de solicitudes de alimentacion.
 */
const getlistaAlimentacionByIdEmpleado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idEmpleado } = req.query;
        const subquery = '( SELECT (nombre || \' \' || apellido) from empleados i where i.id = a.id_empleado) as nempleado ';
        const subquery1 = '( SELECT i.nombre from detalle_menu i where i.id = a.id_comida ) as ncomida ';
        const subquery2 = '( SELECT i.valor from detalle_menu i where i.id = a.id_comida )  as nvalor ';
        const subquery3 = '( SELECT i.observacion from detalle_menu i where i.id = a.id_comida )  as ndetallecomida ';
        const subquery4 = '( SELECT t.nombre from tipo_comida t, cg_tipo_comidas ct, detalle_menu i where i.id = a.id_comida AND i.id_menu = ct.id AND ct.tipo_comida = t.id )  as nservicio ';
        const subquery5 = '( SELECT t.id from tipo_comida t, cg_tipo_comidas ct, detalle_menu i where i.id = a.id_comida AND i.id_menu = ct.id AND ct.tipo_comida = t.id )  as id_servicio ';
        const subquery6 = '( SELECT i.id_menu from detalle_menu i where i.id = a.id_comida )  as id_plato ';
        const subquery7 = `(SELECT e.codigo FROM empleados AS e WHERE e.id = a.id_empleado) AS codigo`;
        const query = `SELECT a.*, ${subquery}, ${subquery1}, ${subquery2}, ${subquery3}, ${subquery4}, 
        ${subquery5}, ${subquery6}, ${subquery7} FROM solicita_comidas a WHERE a.id_empleado = ${idEmpleado} 
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
        const subquery = '( SELECT (i.nombre || \' \' || i.apellido) from empleados i where i.id = a.id_empleado) as nempleado ';
        const subquery1 = '( SELECT i.nombre from detalle_menu i where i.id = a.id_comida ) as ncomida ';
        const subquery2 = '( SELECT i.valor from detalle_menu i where i.id = a.id_comida )  as nvalor ';
        const subquery3 = '( SELECT i.observacion from detalle_menu i where i.id = a.id_comida )  as ndetallecomida ';
        const subquery4 = '( SELECT t.nombre from tipo_comida t, cg_tipo_comidas ct, detalle_menu i where i.id = a.id_comida AND i.id_menu = ct.id AND ct.tipo_comida = t.id )  as nservicio ';
        const subquery5 = `(SELECT e.codigo FROM empleados AS e WHERE e.id = a.id_empleado) AS codigo`;
        const query = `SELECT a.*, ${subquery}, ${subquery1}, ${subquery2}, ${subquery3}, ${subquery4}, ${subquery5} FROM solicita_comidas a ORDER BY a.fecha DESC LIMIT 100`;
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
        const subquery = '( SELECT (i.nombre || \' \' || i.apellido) from empleados i where i.id = a.id_empleado) as nempleado ';
        const subquery1 = '( SELECT i.nombre from detalle_menu i where i.id = a.id_comida ) as ncomida ';
        const subquery2 = '( SELECT i.valor from detalle_menu i where i.id = a.id_comida )  as nvalor ';
        const subquery3 = '( SELECT i.observacion from detalle_menu i where i.id = a.id_comida )  as ndetallecomida ';
        const subquery4 = '( SELECT t.nombre from tipo_comida t, cg_tipo_comidas ct, detalle_menu i where i.id = a.id_comida AND i.id_menu = ct.id AND ct.tipo_comida = t.id )  as nservicio ';
        const subquery5 = `(SELECT e.codigo FROM empleados AS e WHERE e.id = a.id_empleado) AS codigo`;
        const query = `SELECT a.*, ${subquery}, ${subquery1}, ${subquery2}, ${subquery3}, ${subquery4}, ${subquery5} 
        FROM solicita_comidas a WHERE a.fec_comida BETWEEN \'${fec_inicio}\' AND \'${fec_final}\' 
        ORDER BY a.fec_comida DESC LIMIT 100`;
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
        const query = `SELECT a.* FROM solicita_comidas a 
                        WHERE a.id_empleado = \'${id_empleado}'\ 
                        AND ((\'${fec_comida}\' =  a.fec_comida))`;
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
        const { extra, fec_comida, fecha, hora_fin, hora_inicio, id_comida, id_empleado, observacion, verificar } = req.body;
        console.log(req.body);
        const response = yield database_1.pool.query('INSERT INTO solicita_comidas (extra, fec_comida, fecha, hora_fin, hora_inicio, id_comida, ' +
            'id_empleado, observacion, verificar) ' +
            'VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [extra, fec_comida, fecha, hora_fin, hora_inicio, id_comida, id_empleado, observacion, verificar]);
        const [objetoAlimento] = response.rows;
        if (!objetoAlimento)
            return res.status(404).jsonp({ message: 'Solicitud no registrada.' });
        const alimento = objetoAlimento;
        const { id_departamento } = req.query;
        const JefesDepartamentos = yield database_1.pool.query('SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc, ' +
            'cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, ' +
            'e.id AS empleado, (e.nombre || \' \' || e.apellido) as fullname , e.cedula, e.correo, c.comida_mail, c.comida_noti ' +
            'FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, ' +
            'sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c ' +
            'WHERE da.id_departamento = $1 AND ' +
            'da.id_empl_cargo = ecr.id AND ' +
            'da.id_departamento = cg.id AND ' +
            'da.estado = true AND ' +
            'cg.id_sucursal = s.id AND ' +
            'ecr.id_empl_contrato = ecn.id AND ' +
            'ecn.id_empleado = e.id AND ' +
            'e.id = c.id_empleado', [id_departamento]).then(result => { return result.rows; });
        console.log(JefesDepartamentos);
        if (JefesDepartamentos.length === 0)
            return res.status(400)
                .jsonp({ message: 'Ups !!! algo salio mal. Solicitud ingresada, pero es necesario verificar configuraciones jefes de departamento.' });
        const [obj] = JefesDepartamentos;
        let depa_padre = obj.depa_padre;
        let JefeDepaPadre;
        if (depa_padre !== null) {
            do {
                JefeDepaPadre = yield database_1.pool.query('SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, ' +
                    'cg.nivel, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ' +
                    'ecn.id AS contrato, e.id AS empleado, (e.nombre || \' \' || e.apellido) as fullname, e.cedula, e.correo, c.comida_mail, ' +
                    'c.comida_noti FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, ' +
                    'sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c ' +
                    'WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND ' +
                    'da.estado = true AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ' +
                    'ecn.id_empleado = e.id AND e.id = c.id_empleado', [depa_padre]);
                depa_padre = JefeDepaPadre.rows[0].depa_padre;
                JefesDepartamentos.push(JefeDepaPadre.rows[0]);
            } while (depa_padre !== null);
            alimento.EmpleadosSendNotiEmail = JefesDepartamentos;
            return res.status(200).jsonp(alimento);
        }
        else {
            alimento.EmpleadosSendNotiEmail = JefesDepartamentos;
            return res.status(200).jsonp(alimento);
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
        const { id, id_empleado, fecha, id_comida, observacion, fec_comida, extra, aprobada, verificar } = req.body;
        const response = yield database_1.pool.query(`
            UPDATE solicita_comidas SET id_empleado = $2 , fecha = $3, id_comida = $4, observacion = $5, 
            fec_comida = $6, extra = $7, aprobada = $8, verificar = $9 
            WHERE id = $1  RETURNING *
            `, [id, id_empleado, fecha, id_comida, observacion, fec_comida, extra, aprobada, verificar]);
        const [objetoAlimentacion] = response.rows;
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
        const { id, id_empleado, aprobada } = req.body;
        const response = yield database_1.pool.query(`
            UPDATE solicita_comidas SET aprobada = $2 WHERE id = $1 RETURNING id`, [id, aprobada]);
        const [objetoAlimentacion] = response.rows;
        if (objetoAlimentacion) {
            return res.status(200).jsonp(objetoAlimentacion);
        }
        else {
            return res.status(400).jsonp({ message: 'No se actualizo el registro.' });
        }
        // const [objetoAlimentacion] = response.rows;
        // if (!objetoAlimentacion) return res.status(404).jsonp({ message: 'Comida no solicitada' })
        // const alimento: Alimentacion = objetoAlimentacion
        // const JefesDepartamentos = await pool.query(
        //     'SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc, ' +
        //     'cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, ' +
        //     'e.id AS empleado, (e.nombre || \' \' || e.apellido) as fullname , e.cedula, e.correo, c.comida_mail, c.comida_noti ' +
        //     'FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, ' +
        //     'sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c ' +
        //     'WHERE da.id_empl_cargo = ecr.id AND ' +
        //     'da.id_departamento = cg.id AND ' +
        //     'da.estado = true AND ' +
        //     'cg.id_sucursal = s.id AND ' +
        //     'ecr.id_empl_contrato = ecn.id AND ' +
        //     'ecn.id_empleado = e.id AND ' +
        //     'e.id = c.id_empleado AND e.id = $1', [id_empleado]).then(result => { return result.rows });
        // console.log(JefesDepartamentos);
        // if (JefesDepartamentos.length === 0) return res.status(400).jsonp(alimento);
        // const [obj] = JefesDepartamentos;
        // let depa_padre = obj.depa_padre;
        // let JefeDepaPadre;
        // if (depa_padre !== null) {
        //     do {
        //         JefeDepaPadre = await pool.query('SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, ' +
        //             'cg.nivel, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ' +
        //             'ecn.id AS contrato, e.id AS empleado, (e.nombre || \' \' || e.apellido) as fullname, e.cedula, e.correo, c.comida_mail, ' +
        //             'c.comida_noti FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, ' +
        //             'sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c ' +
        //             'WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND ' +
        //             'da.estado = true AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ' +
        //             'ecn.id_empleado = e.id AND e.id = c.id_empleado', [depa_padre])
        //         depa_padre = JefeDepaPadre.rows[0].depa_padre;
        //         JefesDepartamentos.push(JefeDepaPadre.rows[0]);
        //     } while (depa_padre !== null);
        //     alimento.EmpleadosSendNotiEmail = JefesDepartamentos
        //     return res.status(200).jsonp(alimento);
        // } else {
        //     alimento.EmpleadosSendNotiEmail = JefesDepartamentos
        //     return res.status(200).jsonp(alimento);
        // }
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.putEstadoAlimentacion = putEstadoAlimentacion;
