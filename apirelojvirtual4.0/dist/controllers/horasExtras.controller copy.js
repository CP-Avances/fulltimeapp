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
exports.getlistaHorasExtras = void 0;
const database_1 = require("../database");
/**
 * Metodo para obtener listado de horas extras por codigo del empleado
 * @returns Retorna un array de horas extras
 */
// export const getlistaHorasExtrasByCodigo = async (req: Request, res: Response): Promise<Response> => {
//     try {
//         const { codigo } = req.query;
//         const response: QueryResult = await pool.query('SELECT p.*, ( select i.descripcion from cg_tipo_permisos i where i.id = p.id_tipo_permiso) as ntipopermiso FROM permisos p WHERE p.codigo = $1 ORDER BY p.num_permiso DESC LIMIT 100', [codigo]);
//         const permisos: Permiso[] = response.rows;
//         return res.status(200).json(permisos);
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ message: 'Error al conectarse con la BDD' });
//     }
// };
/**
 * Metodo para obtener listado de las primeras 100 horas extras de empleados
 * @returns Retorna un array de horas extras
 */
const getlistaHorasExtras = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subquery1 = '( select (nombre || \' \' || apellido) from empleados i where i.id = h.id_usua_solicita) as nempleado ';
        const subquery2 = '( select t.cargo from empl_cargos i, tipo_cargo t where i.id = h.id_empl_cargo and i.cargo = t.id) as ncargo ';
        const query = `SELECT h.*, ${subquery1}, ${subquery2} FROM hora_extr_pedidos h ORDER BY h.fec_inicio DESC LIMIT 100`;
        const response = yield database_1.pool.query(query);
        const horas_extras = response.rows;
        return res.status(200).json(horas_extras);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error al conectarse con la BDD' });
    }
});
exports.getlistaHorasExtras = getlistaHorasExtras;
// /**
//  * Metodo para insertar un permiso
//  * @returns Retorna datos permiso ingresado
//  */
// export const postNuevoPermiso = async (req: Request, res: Response): Promise<Response> => {
//     try {
//         const { fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, dia_libre,
//             id_tipo_permiso, id_empl_contrato, id_peri_vacacion, hora_numero, num_permiso,
//             documento, docu_nombre, estado, id_empl_cargo, hora_salida, hora_ingreso, codigo } = req.body;
//         console.log(req.body);
//         return res.status(200).json(req.body);
//         // return res.status(404).json({ message: 'mensaje de error' });
//         // const response: QueryResult = await pool.query('INSERT INTO permisos () VALUES() RETURNING id, estado', []);
//         // const [ objetoPermiso ] = response.rows;
//         // if (!objetoPermiso) return res.status(404).jsonp({ message: 'Permisos no solicitado'}) 
//         // const permiso: Permiso = objetoPermiso
//         // console.log(permiso);
//         // return res.status(200).json(permiso);
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ message: 'Error al conectarse con la BDD' });
//     }
// }
// /**
//  * Metodo para obtener listado de los tipos de permisos para llenar en un selectItem o combobox.
//  * @returns Retorna un array de Permisos
//  */
// export const getCgTipoPermisos = async (req: Request, res: Response): Promise<Response> => {
//     try {
//         const response: QueryResult = await pool.query('SELECT cg.* FROM cg_tipo_permisos cg ORDER BY cg.descripcion ASC');
//         const cg_permisos: Cg_TipoPermiso[] = response.rows;
//         return res.status(200).json(cg_permisos);
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ message: 'Error al conectarse con la BDD' });
//     }
// };
