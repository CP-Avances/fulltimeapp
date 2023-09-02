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
exports.putPermiso = exports.postNuevoPermiso = exports.getlistaPermisos = exports.getlistaPermisosByCodigo = void 0;
const database_1 = require("../database");
/**
 * Metodo para obtener listado de permisos por codigo del empleado
 * @returns Retorna un array de Permisos
 */
const getlistaPermisosByCodigo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codigo } = req.query;
        const subquery = '( select i.descripcion from cg_tipo_permisos i where i.id = p.id_tipo_permiso) as ntipopermiso ';
        const query = `SELECT p.*, ${subquery} FROM permisos p WHERE p.codigo = ${codigo} ORDER BY p.num_permiso DESC LIMIT 100`;
        const response = yield database_1.pool.query(query);
        const permisos = response.rows;
        return res.status(200).json(permisos);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error al conectarse con la BDD' });
    }
});
exports.getlistaPermisosByCodigo = getlistaPermisosByCodigo;
/**
 * Metodo para obtener listado de los primeros 100 permisos de empleados
 * @returns Retorna un array de Permisos
 */
const getlistaPermisos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT p.*, ( select i.descripcion from cg_tipo_permisos i where i.id = p.id_tipo_permiso) as ntipopermiso FROM permisos p ORDER BY p.fec_inicio DESC LIMIT 100');
        const permisos = response.rows;
        return res.status(200).json(permisos);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error al conectarse con la BDD' });
    }
});
exports.getlistaPermisos = getlistaPermisos;
/**
 * Metodo para insertar un permiso
 * @returns Retorna datos permiso ingresado
 */
const postNuevoPermiso = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, dia_libre, id_tipo_permiso, id_empl_contrato, id_peri_vacacion, hora_numero, num_permiso, documento, docu_nombre, estado, id_empl_cargo, hora_salida, hora_ingreso, codigo } = req.body;
        console.log(req.body);
        const response = yield database_1.pool.query('INSERT INTO permisos (fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, dia_libre, ' +
            'id_tipo_permiso, id_empl_contrato, id_peri_vacacion, hora_numero, num_permiso, ' +
            'documento, docu_nombre, estado, id_empl_cargo, hora_salida, hora_ingreso, codigo) ' +
            'VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19 ) RETURNING * ', [fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, dia_libre,
            id_tipo_permiso, id_empl_contrato, id_peri_vacacion, hora_numero, num_permiso,
            documento, docu_nombre, estado, id_empl_cargo, hora_salida, hora_ingreso, codigo]);
        const [objetoPermiso] = response.rows;
        if (!objetoPermiso)
            return res.status(404).jsonp({ message: 'Permiso no solicitado' });
        const permiso = objetoPermiso;
        console.log(permiso);
        console.log(req.query);
        const { id_departamento } = req.query;
        const JefesDepartamentos = yield database_1.pool.query('SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc, ' +
            'cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, ' +
            'e.id AS empleado, (e.nombre || \' \' || e.apellido) as fullname , e.cedula, e.correo, c.permiso_mail, c.permiso_noti ' +
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
            return res.status(400).jsonp(permiso);
        const [obj] = JefesDepartamentos;
        let depa_padre = obj.depa_padre;
        let JefeDepaPadre;
        if (depa_padre !== null) {
            do {
                JefeDepaPadre = yield database_1.pool.query('SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, ' +
                    'cg.nivel, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ' +
                    'ecn.id AS contrato, e.id AS empleado, (e.nombre || \' \' || e.apellido) as fullname, e.cedula, e.correo, c.permiso_mail, ' +
                    'c.permiso_noti FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, ' +
                    'sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c ' +
                    'WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND ' +
                    'da.estado = true AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ' +
                    'ecn.id_empleado = e.id AND e.id = c.id_empleado', [depa_padre]);
                depa_padre = JefeDepaPadre.rows[0].depa_padre;
                JefesDepartamentos.push(JefeDepaPadre.rows[0]);
            } while (depa_padre !== null);
            permiso.EmpleadosSendNotiEmail = JefesDepartamentos;
            return res.status(200).json(permiso);
        }
        else {
            permiso.EmpleadosSendNotiEmail = JefesDepartamentos;
            return res.status(200).json(permiso);
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error al conectarse con la BDD' });
    }
});
exports.postNuevoPermiso = postNuevoPermiso;
/**
 * Metodo para actualizar registro de permiso solo en estado pendiente
 * @returns Retorna mensaje actualizacion.
 */
const putPermiso = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, dia_libre, hora_numero, documento, docu_nombre, estado, hora_salida, hora_ingreso } = req.body;
        console.log(req.body);
        if (estado === 1) {
            const response = yield database_1.pool.query(`
                UPDATE permisos SET fec_creacion = $1 , descripcion = $2, fec_inicio = $3, fec_final = $4, dia = $5, legalizado = $6, dia_libre = $7, 
                hora_numero = $8, documento = $9, docu_nombre = $10, estado = $11, hora_salida = $12, hora_ingreso = $13
                WHERE id = $1  RETURNING id`, [id, fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, dia_libre, hora_numero,
                documento, docu_nombre, estado, hora_salida, hora_ingreso]);
            const [objetoPermiso] = response.rows;
            if (objetoPermiso) {
                return res.status(200).jsonp(objetoPermiso);
            }
            else {
                return res.status(400).jsonp({ message: 'No se actualizo el registro.' });
            }
        }
        return res.status(400).json({ message: 'El estado debe ser pendiente para editar la solicitud.' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error al conectarse con la BDD' });
    }
});
exports.putPermiso = putPermiso;
