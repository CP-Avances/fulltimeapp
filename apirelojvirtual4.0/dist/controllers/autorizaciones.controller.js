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
exports.BuscarJefes = exports.updateEstadoSolicitudes = exports.updateAutorizacion = exports.postAutorizacion = exports.ObtenerListaAutorizaDepa = exports.EncontrarAutorizacionUsuario = exports.getAutorizacion = void 0;
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
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getAutorizacion = getAutorizacion;
/**
 * Buscar registro si el usuario esta configurado en uno o varios departamentos para preautorizar o autorizar
 * @returns
 */
const EncontrarAutorizacionUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_empleado } = req.params;
    console.log('id_empleado: ', id_empleado);
    const AUTORIZA = yield database_1.pool.query(`
        SELECT cd.id AS id_depa_confi, n.id_departamento, n.departamento AS depa_autoriza, n.nivel, da.estado, da.autorizar, da.preautorizar, 
            da.id_empl_cargo, e.id_contrato, da.id_empleado, e.id_departamento AS depa_pertenece, cd.nombre, 
            ce.id AS id_empresa, ce.nombre AS nom_empresa, s.id AS id_sucursal, s.nombre AS nom_sucursal 
            FROM depa_autorizaciones AS da, cg_departamentos AS cd, cg_empresa AS ce, 
            sucursales AS s, datos_actuales_empleado AS e, nivel_jerarquicodep AS n 
        WHERE da.id_departamento = cd.id 
            AND cd.id_sucursal = s.id 
            AND ce.id = s.id_empresa 
            AND da.id_empleado = $1 
            AND e.id_cargo = da.id_empl_cargo
            AND n.id_dep_nivel = cd.id
        `, [id_empleado]);
    if ((AUTORIZA.rowCount > 0)) {
        return res.jsonp(AUTORIZA.rows);
    }
    else {
        return res.status(404).jsonp({ text: 'No se encuentra registros' });
    }
});
exports.EncontrarAutorizacionUsuario = EncontrarAutorizacionUsuario;
/**
 * Buscar registro lista de Usuarios que Autoricen en un departamento por niveles
 * @returns
 */
const ObtenerListaAutorizaDepa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_depar } = req.params;
        const EMPLEADOS = yield database_1.pool.query(`
            SELECT n.id_departamento, cg.nombre, n.id_dep_nivel, n.dep_nivel_nombre, n.nivel,
                n.id_establecimiento AS id_suc, s.nombre AS sucursal,
                da.estado, dae.id_contrato, da.id_empl_cargo, c.id_empleado, (dae.nombre || ' ' || dae.apellido) as fullname, 
                dae.cedula, dae.correo, c.permiso_mail, c.permiso_noti, c.vaca_mail, c.vaca_noti, c.hora_extra_mail, 
                c.hora_extra_noti  
            FROM nivel_jerarquicodep AS n, depa_autorizaciones AS da, datos_actuales_empleado AS dae, 
                config_noti AS c, cg_departamentos AS cg, sucursales AS s 
            WHERE n.id_departamento = $1 
                AND da.id_departamento = n.id_dep_nivel 
                AND dae.id_cargo = da.id_empl_cargo 
                AND dae.id = c.id_empleado 
                AND cg.id = $1
                AND s.id = n.id_establecimiento 
            ORDER BY nivel ASC
            `, [id_depar]);
        if (EMPLEADOS.rowCount > 0) {
            return res.jsonp(EMPLEADOS.rows);
        }
        else {
            return res.status(404).jsonp({ message: 'Registros no encontrados' });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.ObtenerListaAutorizaDepa = ObtenerListaAutorizaDepa;
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
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
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
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
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
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.updateEstadoSolicitudes = updateEstadoSolicitudes;
/**
 * BUSQUEDA DE DATOS DE JEFES DE DEPARTAMENTO.
 * @returns
 */
// METODO PARA BUSCAR JEFES
const BuscarJefes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { objeto, depa_user_loggin } = req.body;
    const permiso = objeto;
    console.log(permiso);
    const JefesDepartamentos = yield database_1.pool.query(`
        SELECT da.id, da.estado, n.id_departamento as id_dep, n.id_dep_nivel, n.dep_nivel_nombre, n.nivel, 
            n.id_establecimiento AS id_suc, n.departamento, s.nombre AS sucursal, da.id_empl_cargo as cargo, 
            dae.id_contrato as contrato, da.id_empleado AS empleado, (dae.nombre || ' ' || dae.apellido) as fullname,
            dae.cedula, dae.correo, c.permiso_mail, c.permiso_noti, c.vaca_mail, c.vaca_noti, c.hora_extra_mail, 
            c.hora_extra_noti, c.comida_mail, c.comida_noti 
        FROM nivel_jerarquicodep AS n, depa_autorizaciones AS da, datos_actuales_empleado AS dae,
            config_noti AS c, cg_departamentos AS cg, sucursales AS s
        WHERE n.id_departamento = $1
            AND da.id_departamento = n.id_dep_nivel
            AND dae.id_cargo = da.id_empl_cargo
            AND dae.id_contrato = c.id_empleado
            AND cg.id = $1
            AND s.id = n.id_establecimiento
        ORDER BY nivel ASC
        `, [depa_user_loggin]).then(result => { return result.rows; });
    if (JefesDepartamentos.length === 0)
        return res.status(400)
            .jsonp({ message: 'Ups !!! algo salio mal. Solicitud ingresada, pero es necesario verificar configuraciones jefes de departamento.' });
    const obj = JefesDepartamentos[JefesDepartamentos.length - 1];
    let depa_padre = obj.id_dep_nivel;
    let JefeDepaPadre;
    if (depa_padre !== null) {
        /*
        do {
            JefeDepaPadre = await pool.query(
                `
                            SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre,
                            cg.nivel, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal,
                            ecr.id AS cargo, ecn.id AS contrato, e.id AS empleado,
                            (e.nombre || ' ' || e.apellido) as fullname, e.cedula, e.correo, c.permiso_mail,
                            c.permiso_noti, c.vaca_mail, c.vaca_noti, c.hora_extra_mail,
                            c.hora_extra_noti, c.comida_mail, c.comida_noti
                            FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg,
                            sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c
                            WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND
                            da.id_departamento = cg.id AND
                            da.estado = true AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND
                            ecn.id_empleado = e.id AND e.id = c.id_empleado
                            `
                , [depa_padre]);

            depa_padre = JefeDepaPadre.rows[0].depa_padre;

            JefesDepartamentos.push(JefeDepaPadre.rows[0]);

        } while (depa_padre !== null);
        */
        permiso.EmpleadosSendNotiEmail = JefesDepartamentos;
        return res.status(200).jsonp(permiso);
    }
    else {
        permiso.EmpleadosSendNotiEmail = JefesDepartamentos;
        return res.status(200).jsonp(permiso);
    }
});
exports.BuscarJefes = BuscarJefes;
