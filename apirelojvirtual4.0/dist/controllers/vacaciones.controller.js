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
exports.putVacacion = exports.postNuevaVacacion = exports.getlistaVacacionesByFechasyCodigoEdit = exports.getlistaVacacionesByFechasyCodigo = exports.getlistaVacacionesByFechas = exports.getlistaVacaciones = exports.getlistaVacacionesByCodigo = void 0;
const database_1 = require("../database");
/**
 * Metodo para obtener listado de vacaciones por codigo del empleado
 * @returns Retorna un array de vacaciones
 */
const getlistaVacacionesByCodigo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codigo } = req.query;
        const subquery1 = '( SELECT i.descripcion FROM peri_vacaciones i WHERE i.id = v.id_peri_vacacion) AS nperivacacion ';
        const subquery2 = '( SELECT t.cargo FROM empl_cargos i, tipo_cargo t WHERE i.id = v.id_empl_cargo AND i.cargo = t.id) AS ncargo ';
        const subquery3 = '( SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.codigo::int = v.codigo) AS id_contrato ';
        const query = `SELECT v.*, ${subquery1}, ${subquery2}, ${subquery3} FROM vacaciones v WHERE v.codigo = ${codigo} ORDER BY v.fec_inicio DESC LIMIT 100`;
        const response = yield database_1.pool.query(query);
        const vacaciones = response.rows;
        return res.status(200).jsonp(vacaciones);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getlistaVacacionesByCodigo = getlistaVacacionesByCodigo;
/**
 * Metodo para obtener listado de las primeras 100 vacaciones de empleados
 * @returns Retorna un array de vacaciones
 */
const getlistaVacaciones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subquery1 = '( SELECT i.descripcion FROM peri_vacaciones i WHERE i.id = v.id_peri_vacacion) AS nperivacacion ';
        const subquery2 = '( SELECT t.cargo FROM empl_cargos i, tipo_cargo t WHERE i.id = v.id_empl_cargo AND i.cargo = t.id) AS ncargo ';
        const subquery3 = '( SELECT (nombre || \' \' || apellido) FROM empleados i WHERE i.codigo = CAST(v.codigo AS VARCHAR) ) AS nempleado ';
        const subquery4 = '( SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.codigo::int = v.codigo) AS id_contrato ';
        const query = `SELECT v.*, ${subquery1}, ${subquery2}, ${subquery3}, ${subquery4} FROM vacaciones v ORDER BY v.fec_inicio DESC LIMIT 100`;
        const response = yield database_1.pool.query(query);
        const vacaciones = response.rows;
        return res.status(200).jsonp(vacaciones);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getlistaVacaciones = getlistaVacaciones;
/**
 * Metodo para obtener listado de vacaciones de empleados por rango de fechas.
 * @returns Retorna un array de vacaciones
 */
const getlistaVacacionesByFechas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fec_inicio, fec_final } = req.query;
        const subquery1 = '( SELECT i.descripcion FROM peri_vacaciones i WHERE i.id = v.id_peri_vacacion) AS nperivacacion ';
        const subquery2 = '( SELECT t.cargo FROM empl_cargos i, tipo_cargo t WHERE i.id = v.id_empl_cargo AND i.cargo = t.id) AS ncargo ';
        const subquery3 = '( SELECT (nombre || \' \' || apellido) FROM empleados i WHERE i.codigo = CAST(v.codigo AS VARCHAR) ) AS nempleado ';
        const subquery4 = '( SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.codigo::int = v.codigo) AS id_contrato ';
        const query = `SELECT v.*, ${subquery1}, ${subquery2}, ${subquery3}, ${subquery4} 
        FROM vacaciones v WHERE v.fec_inicio BETWEEN \'${fec_inicio}\' AND \'${fec_final}\' 
        ORDER BY v.fec_inicio DESC LIMIT 100`;
        const response = yield database_1.pool.query(query);
        const vacaciones = response.rows;
        return res.status(200).jsonp(vacaciones);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getlistaVacacionesByFechas = getlistaVacacionesByFechas;
/**
 * Metodo para obtener listado de Vacaciones por codigo y un rango de fechas del empleado
 * @returns Retorna un array de vacaciones
 */
const getlistaVacacionesByFechasyCodigo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fec_inicio, fec_final, codigo } = req.query;
        const query = `SELECT v.* FROM vacaciones v WHERE v.codigo = \'${codigo}'\ AND (
            ((\'${fec_inicio}\' BETWEEN v.fec_inicio AND v.fec_final ) OR 
             (\'${fec_final}\' BETWEEN v.fec_inicio AND v.fec_final)) 
            OR
            ((v.fec_inicio BETWEEN \'${fec_inicio}\' AND \'${fec_final}\') OR 
             (v.fec_final BETWEEN \'${fec_inicio}\' AND \'${fec_final}\'))
            )`;
        const response = yield database_1.pool.query(query);
        const vacaciones = response.rows;
        return res.status(200).jsonp(vacaciones);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getlistaVacacionesByFechasyCodigo = getlistaVacacionesByFechasyCodigo;
/**
 * Metodo para obtener listado de Vacaciones por codigo y un rango de fechas del empleado sin tomar en cuenta la solicitud por la id
 * @returns Retorna un array de vacaciones
 */
const getlistaVacacionesByFechasyCodigoEdit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fec_inicio, fec_final, codigo, id } = req.query;
        const VACACIONES = yield database_1.pool.query(`SELECT v.* FROM vacaciones v 
        WHERE v.codigo::varchar = $1 
        AND ((($2 BETWEEN p.fec_inicio::date AND p.fec_final::date ) OR ($3 BETWEEN p.fec_inicio::date AND p.fec_final::date)) OR ((p.fec_inicio::date BETWEEN $2 AND $3) OR (p.fec_final::date BETWEEN $2 AND $3))) 
        AND NOT v.id = $4 `, [codigo, fec_inicio, fec_final, id]);
        return res.status(200).jsonp(VACACIONES.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getlistaVacacionesByFechasyCodigoEdit = getlistaVacacionesByFechasyCodigoEdit;
/**
 * METODO PARA INSERTAR UNA VACACION
 * @returns RETORNA DATOS DE VACACION INGRESADA
 */
const postNuevaVacacion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fec_inicio, fec_final, fec_ingreso, dia_libre, dia_laborable, legalizado, id_peri_vacacion, id_empl_cargo, estado, codigo } = req.body;
        console.log(req.body);
        const response = yield database_1.pool.query('INSERT INTO vacaciones (fec_inicio, fec_final, fec_ingreso, dia_libre, dia_laborable, ' +
            'legalizado, id_peri_vacacion, id_empl_cargo, estado, codigo) ' +
            'VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10 ) RETURNING *', [fec_inicio, fec_final, fec_ingreso, dia_libre, dia_laborable, legalizado, id_peri_vacacion,
            id_empl_cargo, estado, codigo]);
        const [objetoVacacion] = response.rows;
        if (!objetoVacacion)
            return res.status(400)
                .jsonp({ message: 'Upps !!! algo salio mal. Solicitud de vacación no ingresada' });
        const vacacion = objetoVacacion;
        const { id_departamento } = req.query;
        const JefesDepartamentos = yield database_1.pool.query('SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc, ' +
            'cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, ' +
            'e.id AS empleado, (e.nombre || \' \' || e.apellido) as fullname , e.cedula, e.correo, ' +
            'c.vaca_mail, c.vaca_noti ' +
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
                JefeDepaPadre = yield database_1.pool.query(`
                    SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc,
                    cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato,
                    e.id AS empleado, (e.nombre || \' \' || e.apellido) as fullname , e.cedula, e.correo, c.vaca_mail, c.vaca_noti
                    FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, 
                    sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c 
                    WHERE da.id_departamento = $1 AND 
                    da.id_empl_cargo = ecr.id AND 
                    da.id_departamento = cg.id AND 
                    da.estado = true AND 
                    cg.id_sucursal = s.id AND 
                    ecr.id_empl_contrato = ecn.id AND 
                    ecn.id_empleado = e.id AND 
                    e.id = c.id_empleado `, [depa_padre]);
                depa_padre = JefeDepaPadre.rows[0].depa_padre;
                JefesDepartamentos.push(JefeDepaPadre.rows[0]);
            } while (depa_padre !== null);
            vacacion.EmpleadosSendNotiEmail = JefesDepartamentos;
            return res.status(200).jsonp(vacacion);
        }
        else {
            vacacion.EmpleadosSendNotiEmail = JefesDepartamentos;
            return res.status(200).jsonp(vacacion);
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.postNuevaVacacion = postNuevaVacacion;
/**
 * Metodo para actualizar registro de vacacion solo en estado pendiente
 * @returns Retorna mensaje actualizacion.
 */
const putVacacion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, fec_inicio, fec_final, fec_ingreso, dia_libre, dia_laborable, legalizado, estado } = req.body;
        console.log(req.body);
        if (estado === 1) {
            const response = yield database_1.pool.query(`
                UPDATE vacaciones SET fec_inicio = $2, fec_final = $3, fec_ingreso = $4, dia_libre = $5, 
                dia_laborable = $6, legalizado = $7
                WHERE id = $1 RETURNING *
                `, [id, fec_inicio, fec_final, fec_ingreso, dia_libre, dia_laborable, legalizado]);
            const [objetoVacacion] = response.rows;
            if (objetoVacacion) {
                return res.status(200).jsonp(objetoVacacion);
            }
            else {
                return res.status(400).jsonp({ message: 'No se actualizo el registro.' });
            }
        }
        return res.status(400).jsonp({ message: 'El estado debe ser pendiente para editar la solicitud.' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.putVacacion = putVacacion;
