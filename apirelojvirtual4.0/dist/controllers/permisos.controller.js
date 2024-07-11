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
exports.pruebaConsulta = exports.putPermiso = exports.postNuevoPermiso = exports.getlistaPermisosByHorasyCodigoEdit = exports.getlistaPermisosByHorasyCodigo = exports.getlistaPermisosByFechasyCodigoEdit = exports.getlistaPermisosByFechasyCodigo = exports.getlistaPermisosByFechas = exports.getlistaPermisos = exports.getlistaPermisosByCodigo = exports.getPermisoByIdyCodigo = void 0;
const database_1 = require("../database");
/**
 * Metodo para obtener listado de permisos por codigo del empleado
 * @returns Retorna un array de Permisos
 */
const getPermisoByIdyCodigo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codigo, id } = req.query;
        const query = `SELECT p.* FROM mp_solicitud_permiso p WHERE p.id_empleado = '${codigo}' AND p.id = ${id}`;
        const response = yield database_1.pool.query(query);
        const permisos = response.rows;
        return res.status(200).jsonp(permisos);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getPermisoByIdyCodigo = getPermisoByIdyCodigo;
/**
 * Metodo para obtener listado de permisos por codigo del empleado
 * @returns Retorna un array de Permisos
 */
const getlistaPermisosByCodigo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codigo } = req.query;
        const subquery = '( select i.descripcion from mp_cat_tipo_permisos i where i.id = p.id_tipo_permiso) as tipo_permiso ';
        const subquery1 = '( select (nombre || \' \' || apellido) from eu_empleados i where i.id = p.id_empleado) as nempleado ';
        const query = `SELECT p.*, ${subquery}, ${subquery1} FROM mp_solicitud_permiso p WHERE p.id_empleado = '${codigo}' ORDER BY p.numero_permiso DESC LIMIT 100`;
        const response = yield database_1.pool.query(query);
        const permisos = response.rows;
        return res.status(200).jsonp(permisos);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getlistaPermisosByCodigo = getlistaPermisosByCodigo;
/**
 * Metodo para obtener listado de los primeros 100 permisos de empleados
 * @returns Retorna un array de Permisos
 */
const getlistaPermisos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = `
        SELECT p.*, e.id AS id_empleado, (e.nombre || \' \' || e.apellido) AS nempleado, da.cedula, i.descripcion AS tipo_permiso, da.id_departamento,
		    da.correo AS correo, depa.nombre AS nombre_depa
        FROM mp_solicitud_permiso AS p, eu_empleados AS e, mp_cat_tipo_permisos AS i, datos_actuales_empleado AS da,
	        ed_departamentos AS depa
        WHERE e.id = p.id_empleado 
	        AND da.id = p.id_empleado
	        AND i.id = p.id_tipo_permiso
	        AND depa.id = da.id_departamento
        ORDER BY p.fecha_inicio DESC
        `;
        const response = yield database_1.pool.query(query);
        const permisos = response.rows;
        return res.status(200).jsonp(permisos);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getlistaPermisos = getlistaPermisos;
/**
 * Metodo para obtener listado de permisos de empleados por rango de fecha
 * @returns Retorna un array de Permisos
 */
const getlistaPermisosByFechas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fec_inicio, fec_final } = req.query;
        const subquery = '( select (nombre || \' \' || apellido) from eu_empleados i where i.id = p.id_empleado ) as nempleado ';
        const subquery1 = '( select i.descripcion from mp_cat_tipo_permisos i where i.id = p.id_tipo_permiso) as tipo_permiso ';
        const subquery2 = '( select da.id_departamento FROM datos_actuales_empleado AS da WHERE da.id = p.id_empleado ) AS id_departamento ';
        const query = `SELECT p.*, ${subquery}, ${subquery1}, ${subquery2} FROM mp_solicitud_permiso p WHERE p.fecha_inicio BETWEEN \'${fec_inicio}\' AND \'${fec_final}\' ORDER BY p.fecha_inicio DESC`;
        const response = yield database_1.pool.query(query);
        const permisos = response.rows;
        return res.status(200).jsonp(permisos);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getlistaPermisosByFechas = getlistaPermisosByFechas;
/**
 * Metodo para obtener listado de permisos de empleado por rango de fecha
 * @returns Retorna un array de Permisos
 */
const getlistaPermisosByFechasyCodigo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fec_inicio, fec_final, codigo } = req.query;
        const PERMISO = yield database_1.pool.query(`SELECT * FROM mp_solicitud_permiso p 
        WHERE p.id_empleado::varchar = $1 
        AND ((($2 BETWEEN p.fecha_inicio::date AND p.fecha_final::date ) OR ($3 BETWEEN p.fecha_inicio::date AND p.fecha_final::date)) OR ((p.fecha_inicio::date BETWEEN $2 AND $3) OR (p.fecha_final::date BETWEEN $2 AND $3)))
         `, [codigo, fec_inicio, fec_final]);
        return res.status(200).jsonp(PERMISO.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getlistaPermisosByFechasyCodigo = getlistaPermisosByFechasyCodigo;
/**
 * Metodo para obtener listado de permisos de empleado por rango de fecha
 * @returns Retorna un array de Permisos
 */
const getlistaPermisosByFechasyCodigoEdit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fec_inicio, fec_final, codigo, id } = req.query;
        const PERMISO = yield database_1.pool.query(`SELECT * FROM mp_solicitud_permiso p 
        WHERE p.id_empleado::varchar = $1 
        AND ((($2 BETWEEN p.fecha_inicio::date AND p.fecha_final::date ) OR ($3 BETWEEN p.fecha_inicio::date AND p.fecha_final::date)) OR ((p.fecha_inicio::date BETWEEN $2 AND $3) OR (p.fecha_final::date BETWEEN $2 AND $3))) 
        AND NOT p.id = $4 `, [codigo, fec_inicio, fec_final, id]);
        return res.status(200).jsonp(PERMISO.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getlistaPermisosByFechasyCodigoEdit = getlistaPermisosByFechasyCodigoEdit;
/**
 * Metodo para obtener listado de permisos de empleado por rango de fecha
 * @returns Retorna un array de Permisos
 */
const getlistaPermisosByHorasyCodigo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fec_inicio, fec_final, hora_inicio, hora_final, codigo } = req.query;
        console.log("fecha Inicio: ", fec_inicio);
        console.log("fecha Inicio: ", fec_final);
        console.log('hora inicio: ', hora_inicio);
        console.log('hora final: ', hora_final);
        const PERMISO = yield database_1.pool.query(`SELECT id FROM mp_solicitud_permiso p 
        WHERE p.id_empleado::varchar = $1 
        AND ((($2 BETWEEN p.fecha_inicio::date AND p.fecha_final::date ) OR ($3 BETWEEN p.fecha_inicio::date AND p.fecha_final::date)) OR ((p.fecha_inicio::date BETWEEN $2 AND $3) OR (p.fecha_final::date BETWEEN $2 AND $3))) 
        AND ((($4 BETWEEN p.hora_salida AND p.hora_ingreso) OR ($5 BETWEEN p.hora_salida AND p.hora_ingreso)) OR ((p.hora_salida BETWEEN $4 AND $5) OR (p.hora_ingreso BETWEEN $4 AND $5))) `, [codigo, fec_inicio, fec_final, hora_inicio, hora_final]);
        return res.status(200).jsonp(PERMISO.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getlistaPermisosByHorasyCodigo = getlistaPermisosByHorasyCodigo;
/**
 * Metodo para obtener listado de permisos de empleado por rango de fecha
 * @returns Retorna un array de Permisos
 */
const getlistaPermisosByHorasyCodigoEdit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fec_inicio, fec_final, hora_inicio, hora_final, codigo, id } = req.query;
        const PERMISO = yield database_1.pool.query(`SELECT id FROM mp_solicitud_permiso p 
        WHERE p.id_empleado::varchar = $1 
        AND ((($2 BETWEEN p.fecha_inicio::date AND p.fecha_final::date ) OR ($3 BETWEEN p.fecha_inicio::date AND p.fecha_final::date)) OR ((p.fecha_inicio::date BETWEEN $2 AND $3) OR (p.fecha_final::date BETWEEN $2 AND $3))) 
        AND ((($4 BETWEEN p.hora_salida AND p.hora_ingreso) OR ($5 BETWEEN p.hora_salida AND p.hora_ingreso)) OR ((p.hora_salida BETWEEN $4 AND $5) OR (p.hora_ingreso BETWEEN $4 AND $5)))
        AND NOT p.id = $6 `, [codigo, fec_inicio, fec_final, hora_inicio, hora_final, id]);
        return res.status(200).jsonp(PERMISO.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getlistaPermisosByHorasyCodigoEdit = getlistaPermisosByHorasyCodigoEdit;
/**
 * METODO PARA INSERTAR UN PERMISO
 * @returns RETORNA DATOS PERMISO INGRESADO
 */
const postNuevoPermiso = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fecha_creacion, descripcion, fecha_inicio, fecha_final, dias_permiso, legalizado, dia_libre, id_tipo_permiso, id_empleado_contrato, id_periodo_vacacion, horas_permiso, numero_permiso, documento, estado, id_empleado_cargo, hora_salida, hora_ingreso, codigo } = req.body;
        const response = yield database_1.pool.query('INSERT INTO mp_solicitud_permiso (fecha_creacion, descripcion, fecha_inicio, fecha_final, dias_permiso, legalizado, ' +
            'dia_libre, id_tipo_permiso, id_empleado_contrato, id_periodo_vacacion, horas_permiso, numero_permiso, ' +
            'documento, estado, id_empleado_cargo, hora_salida, hora_ingreso, id_empleado) ' +
            'VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) ' +
            'RETURNING * ', [fecha_creacion, descripcion, fecha_inicio, fecha_final, dias_permiso, legalizado, dia_libre,
            id_tipo_permiso, id_empleado_contrato, id_periodo_vacacion, horas_permiso, numero_permiso,
            documento, estado, id_empleado_cargo, hora_salida, hora_ingreso, codigo]);
        const [objetoPermiso] = response.rows;
        if (!objetoPermiso)
            return res.status(404).jsonp({ message: 'Solicitud no registrada.' });
        const permiso = objetoPermiso;
        return res.status(200).jsonp(permiso);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.postNuevoPermiso = postNuevoPermiso;
/**
 * Metodo para REGISTRAR DOCUMENTO DE RESPALDO DE PERMISO
 * @returns Retorna mensaje actualizacion.
 
 export const GuardarDocumentoPermiso = async (req: Request, res: Response): Promise<void> => {
    let list: any = req.body;

    console.log('documento: ',list);
    let doc = list.uploads[0].path.split("\\")[1];
    console.log('ver path ... ', list.uploads[0].path)
        let { doc_nombre } = req.params;
    await pool.query(
        `
        INSERT INTO docmentacion (doc, doc_nombre) VALUES ($1, $2)
        `
        , [doc, doc_nombre]);
    res.jsonp({ message: 'Documento Actualizado' });
}*/
/**
 * Metodo para actualizar registro de permiso solo en estado pendiente
 * @returns Retorna mensaje actualizacion.
 */
const putPermiso = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, fecha_creacion, descripcion, fecha_inicio, fecha_final, dias_permiso, legalizado, dia_libre, id_tipo_permiso, horas_permiso, documento, estado, hora_salida, hora_ingreso } = req.body;
        console.log(req.body);
        if (estado === 1) {
            const response = yield database_1.pool.query(`
                UPDATE mp_solicitud_permiso SET fecha_creacion = $2 , descripcion = $3, fecha_inicio = $4, fecha_final = $5, 
                dias_permiso = $6, legalizado = $7, dia_libre = $8, id_tipo_permiso = $9, horas_permiso = $10, documento = $11, 
                estado = $12, hora_salida = $13, hora_ingreso = $14
                WHERE id = $1  RETURNING *
                `, [id, fecha_creacion, descripcion, fecha_inicio, fecha_final, dias_permiso, legalizado, dia_libre, id_tipo_permiso,
                horas_permiso,
                documento, estado, hora_salida, hora_ingreso]);
            const [objetoPermiso] = response.rows;
            if (objetoPermiso) {
                return res.status(200).jsonp(objetoPermiso);
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
exports.putPermiso = putPermiso;
const pruebaConsulta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `SELECT p.* FROM mp_solicitud_permiso p`;
    const response = yield database_1.pool.query(query);
    const permisos = response.rows;
    return res.status(200).jsonp(permisos);
    //return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
});
exports.pruebaConsulta = pruebaConsulta;
