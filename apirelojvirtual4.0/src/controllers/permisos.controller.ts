import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';
import { Permiso } from '../interfaces/Permisos'

/**
 * Metodo para obtener listado de permisos por codigo del empleado
 * @returns Retorna un array de Permisos
 */
export const getlistaPermisosByCodigo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { codigo } = req.query;
        const subquery = '( select i.descripcion from cg_tipo_permisos i where i.id = p.id_tipo_permiso) as ntipopermiso ';
        const subquery1 = '( select (nombre || \' \' || apellido) from empleados i where i.codigo = CAST(p.codigo AS VARCHAR) ) as nempleado ';
        const query = `SELECT p.*, ${subquery}, ${subquery1} FROM permisos p WHERE p.codigo = ${codigo} ORDER BY p.num_permiso DESC LIMIT 100`
        const response: QueryResult = await pool.query(query);
        const permisos: Permiso[] = response.rows;
        return res.status(200).jsonp(permisos);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Metodo para obtener listado de los primeros 100 permisos de empleados
 * @returns Retorna un array de Permisos
 */
export const getlistaPermisos = async (req: Request, res: Response): Promise<Response> => {
    try {
        const subquery = '( select (nombre || \' \' || apellido) from empleados i where i.codigo = CAST(p.codigo AS VARCHAR) ) as nempleado ';
        const subquery1 = '( select i.descripcion from cg_tipo_permisos i where i.id = p.id_tipo_permiso) as ntipopermiso ';
        const query = `SELECT p.*, ${subquery}, ${subquery1} FROM permisos p ORDER BY p.fec_inicio DESC`
        const response: QueryResult = await pool.query(query);
        const permisos: Permiso[] = response.rows;
        return res.status(200).jsonp(permisos);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Metodo para obtener listado de permisos de empleados por rango de fecha
 * @returns Retorna un array de Permisos
 */
export const getlistaPermisosByFechas = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { fec_inicio, fec_final } = req.query;
        const subquery = '( select (nombre || \' \' || apellido) from empleados i where i.codigo = CAST(p.codigo AS VARCHAR) ) as nempleado ';
        const subquery1 = '( select i.descripcion from cg_tipo_permisos i where i.id = p.id_tipo_permiso) as ntipopermiso '
        const query = `SELECT p.*, ${subquery}, ${subquery1} FROM permisos p WHERE p.fec_inicio BETWEEN \'${fec_inicio}\' AND \'${fec_final}\' ORDER BY p.fec_inicio DESC`
        const response: QueryResult = await pool.query(query);
        const permisos: Permiso[] = response.rows;
        return res.status(200).jsonp(permisos);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Metodo para obtener listado de permisos de empleado por rango de fecha
 * @returns Retorna un array de Permisos
 */
export const getlistaPermisosByFechasyCodigo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { fec_inicio, fec_final, codigo} = req.query;
        const PERMISO = await pool.query(`SELECT * FROM permisos p 
        WHERE p.codigo::varchar = $1 
        AND ((($2 BETWEEN p.fec_inicio::date AND p.fec_final::date ) OR ($3 BETWEEN p.fec_inicio::date AND p.fec_final::date)) OR ((p.fec_inicio::date BETWEEN $2 AND $3) OR (p.fec_final::date BETWEEN $2 AND $3)))
         `
         , [codigo, fec_inicio, fec_final]);

        return res.status(200).jsonp(PERMISO.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Metodo para obtener listado de permisos de empleado por rango de fecha
 * @returns Retorna un array de Permisos
 */
 export const getlistaPermisosByFechasyCodigoEdit = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { fec_inicio, fec_final, codigo, id } = req.query;
        const PERMISO = await pool.query(`SELECT * FROM permisos p 
        WHERE p.codigo::varchar = $1 
        AND ((($2 BETWEEN p.fec_inicio::date AND p.fec_final::date ) OR ($3 BETWEEN p.fec_inicio::date AND p.fec_final::date)) OR ((p.fec_inicio::date BETWEEN $2 AND $3) OR (p.fec_final::date BETWEEN $2 AND $3))) 
        AND NOT p.id = $4 `
            , [codigo, fec_inicio, fec_final, id]);

        return res.status(200).jsonp(PERMISO.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * METODO PARA INSERTAR UN PERMISO
 * @returns RETORNA DATOS PERMISO INGRESADO
 */
export const postNuevoPermiso = async (req: Request, res: Response): Promise<Response> => {
    try {

        const { fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, dia_libre,
            id_tipo_permiso, id_empl_contrato, id_peri_vacacion, hora_numero, num_permiso,
            documento, docu_nombre, estado, id_empl_cargo, hora_salida, hora_ingreso, codigo } = req.body;

        console.log(req.body);

        const response: QueryResult = await pool.query(
            'INSERT INTO permisos (fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, ' +
            'dia_libre, id_tipo_permiso, id_empl_contrato, id_peri_vacacion, hora_numero, num_permiso, ' +
            'documento, docu_nombre, estado, id_empl_cargo, hora_salida, hora_ingreso, codigo) ' +
            'VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19 ) ' +
            'RETURNING * ',
            [fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, dia_libre,
                id_tipo_permiso, id_empl_contrato, id_peri_vacacion, hora_numero, num_permiso,
                documento, docu_nombre, estado, id_empl_cargo, hora_salida, hora_ingreso, codigo]);
        const [objetoPermiso] = response.rows;

        if (!objetoPermiso) return res.status(404).jsonp({ message: 'Solicitud no registrada.' })

        const permiso: Permiso = objetoPermiso
        console.log(permiso);
        console.log(req.query);

        const { id_departamento } = req.query;

        const JefesDepartamentos = await pool.query(
            'SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc, ' +
            'cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, ' +
            'e.id AS empleado, (e.nombre || \' \' || e.apellido) as fullname , e.cedula, e.correo, ' +
            'c.permiso_mail, c.permiso_noti ' +
            'FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, ' +
            'sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c ' +
            'WHERE da.id_departamento = $1 AND ' +
            'da.id_empl_cargo = ecr.id AND ' +
            'da.id_departamento = cg.id AND ' +
            'da.estado = true AND ' +
            'cg.id_sucursal = s.id AND ' +
            'ecr.id_empl_contrato = ecn.id AND ' +
            'ecn.id_empleado = e.id AND ' +
            'e.id = c.id_empleado', [id_departamento]).then(result => { return result.rows });
        console.log(JefesDepartamentos);

        if (JefesDepartamentos.length === 0) return res.status(400)
            .jsonp({ message: 'Ups!!! algo salio mal. Solicitud ingresada, pero es necesario verificar configuraciones "jefes de departamento".' });

        const [obj] = JefesDepartamentos;
        let depa_padre = obj.depa_padre;
        let JefeDepaPadre;

        if (depa_padre !== null) {
            do {
                JefeDepaPadre = await pool.query('SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, ' +
                    'cg.nivel, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, ' +
                    'ecr.id AS cargo, ecn.id AS contrato, e.id AS empleado, ' +
                    '(e.nombre || \' \' || e.apellido) as fullname, e.cedula, e.correo, c.permiso_mail, ' +
                    'c.permiso_noti ' +
                    'FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, ' +
                    'sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c ' +
                    'WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND ' +
                    'da.id_departamento = cg.id AND ' +
                    'da.estado = true AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ' +
                    'ecn.id_empleado = e.id AND e.id = c.id_empleado', [depa_padre]);

                depa_padre = JefeDepaPadre.rows[0].depa_padre;
                JefesDepartamentos.push(JefeDepaPadre.rows[0]);

            } while (depa_padre !== null);
            permiso.EmpleadosSendNotiEmail = JefesDepartamentos
            return res.status(200).jsonp(permiso);

        } else {
            permiso.EmpleadosSendNotiEmail = JefesDepartamentos
            return res.status(200).jsonp(permiso);
        }

    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
}

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
export const putPermiso = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id, fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, dia_libre, id_tipo_permiso,
            hora_numero,
            documento, docu_nombre, estado, hora_salida, hora_ingreso } = req.body;
        console.log(req.body);

        if (estado === 1) {
            const response: QueryResult = await pool.query(
                `
                UPDATE permisos SET fec_creacion = $2 , descripcion = $3, fec_inicio = $4, fec_final = $5, 
                dia = $6, legalizado = $7, dia_libre = $8, id_tipo_permiso = $9, hora_numero = $10, documento = $11, 
                docu_nombre = $12, estado = $13, hora_salida = $14, hora_ingreso = $15
                WHERE id = $1  RETURNING *
                `,
                [id, fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, dia_libre, id_tipo_permiso, 
                    hora_numero,
                    documento, docu_nombre, estado, hora_salida, hora_ingreso]);

            const [objetoPermiso] = response.rows;

            if (objetoPermiso) {
                return res.status(200).jsonp(objetoPermiso);
            } else {

                return res.status(400).jsonp({ message: 'No se actualizo el registro.' });
            }


        }

        return res.status(400).jsonp({ message: 'El estado debe ser pendiente para editar la solicitud.' });
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
}