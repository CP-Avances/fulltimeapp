import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';
import { Vacacion } from '../interfaces/Vacaciones';

/**
 * Metodo para obtener listado de vacaciones por codigo del empleado
 * @returns Retorna un array de vacaciones
 */
export const getlistaVacacionesByCodigo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { codigo } = req.query;

        console.log('codigo: ',codigo);

        const subquery1 = '( SELECT i.descripcion FROM peri_vacaciones i WHERE i.id = v.id_peri_vacacion) AS nperivacacion '
        const subquery2 = '( SELECT t.cargo FROM empl_cargos i, tipo_cargo t WHERE i.id = v.id_empl_cargo AND i.cargo = t.id) AS ncargo '
        const subquery3 = '( SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.codigo::int = v.codigo) AS id_contrato '

        const query = `SELECT v.*, ${subquery1}, ${subquery2}, ${subquery3} FROM vacaciones v WHERE v.codigo = ${codigo} ORDER BY v.fec_inicio DESC LIMIT 100`
        const response: QueryResult = await pool.query(query);
        const vacaciones: Vacacion[] = response.rows;
        return res.status(200).jsonp(vacaciones);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Metodo para obtener listado de las primeras 100 vacaciones de empleados
 * @returns Retorna un array de vacaciones
 */
export const getlistaVacaciones = async (req: Request, res: Response): Promise<Response> => {
    try {
        const subquery1 = '( SELECT i.descripcion FROM peri_vacaciones i WHERE i.id = v.id_peri_vacacion) AS nperivacacion '
        const subquery2 = '( SELECT t.cargo FROM empl_cargos i, tipo_cargo t WHERE i.id = v.id_empl_cargo AND i.cargo = t.id) AS ncargo '
        const subquery3 = '( SELECT (nombre || \' \' || apellido) FROM empleados i WHERE i.codigo = CAST(v.codigo AS VARCHAR) ) AS nempleado '
        const subquery4 = '( SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.codigo::int = v.codigo) AS id_contrato '
        const subquery5 = '( SELECT da.id_departamento FROM datos_actuales_empleado AS da WHERE da.codigo::int = v.codigo ) AS id_departamento '

        const query = `SELECT v.*, ${subquery1}, ${subquery2}, ${subquery3}, ${subquery4}, ${subquery5} FROM vacaciones v ORDER BY v.fec_inicio DESC LIMIT 100`
        const response: QueryResult = await pool.query(query);
        const vacaciones: Vacacion[] = response.rows;
        return res.status(200).jsonp(vacaciones);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Metodo para obtener listado de vacaciones de empleados por rango de fechas.
 * @returns Retorna un array de vacaciones
 */
export const getlistaVacacionesByFechas = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { fec_inicio, fec_final } = req.query;
        const subquery1 = '( SELECT i.descripcion FROM peri_vacaciones i WHERE i.id = v.id_peri_vacacion) AS nperivacacion '
        const subquery2 = '( SELECT t.cargo FROM empl_cargos i, tipo_cargo t WHERE i.id = v.id_empl_cargo AND i.cargo = t.id) AS ncargo '
        const subquery3 = '( SELECT (nombre || \' \' || apellido) FROM empleados i WHERE i.codigo = CAST(v.codigo AS VARCHAR) ) AS nempleado '
        const subquery4 = '( SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.codigo::int = v.codigo) AS id_contrato '
        const subquery5 = '( SELECT da.id_departamento FROM datos_actuales_empleado AS da WHERE da.codigo::int = v.codigo ) AS id_departamento '

        const query = `SELECT v.*, ${subquery1}, ${subquery2}, ${subquery3}, ${subquery4}, ${subquery5} 
        FROM vacaciones v WHERE v.fec_inicio BETWEEN \'${fec_inicio}\' AND \'${fec_final}\' 
        ORDER BY v.fec_inicio DESC LIMIT 100`
        const response: QueryResult = await pool.query(query);
        const vacaciones: Vacacion[] = response.rows;
        return res.status(200).jsonp(vacaciones);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Metodo para obtener listado de Vacaciones por codigo y un rango de fechas del empleado
 * @returns Retorna un array de vacaciones
 */

 export const getlistaVacacionesByFechasyCodigo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { fec_inicio, fec_final, codigo } = req.query;

        const query = `SELECT v.* FROM vacaciones v WHERE v.codigo = \'${codigo}'\ AND (
            ((\'${fec_inicio}\' BETWEEN v.fec_inicio AND v.fec_final ) OR 
             (\'${fec_final}\' BETWEEN v.fec_inicio AND v.fec_final)) 
            OR
            ((v.fec_inicio BETWEEN \'${fec_inicio}\' AND \'${fec_final}\') OR 
             (v.fec_final BETWEEN \'${fec_inicio}\' AND \'${fec_final}\'))
            )`

            const response: QueryResult = await pool.query(query);
            const vacaciones: Vacacion[] = response.rows;
            return res.status(200).jsonp(vacaciones);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Metodo para obtener listado de Vacaciones por codigo y un rango de fechas del empleado sin tomar en cuenta la solicitud por la id
 * @returns Retorna un array de vacaciones
 */
export const getlistaVacacionesByFechasyCodigoEdit = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { fec_inicio, fec_final, codigo, id } = req.query;

        const VACACIONES = await pool.query(`SELECT v.* FROM vacaciones v 
        WHERE v.codigo::varchar = $1 
        AND ((($2 BETWEEN v.fec_inicio::date AND v.fec_final::date ) OR ($3 BETWEEN v.fec_inicio::date AND v.fec_final::date)) OR ((v.fec_inicio::date BETWEEN $2 AND $3) OR (v.fec_final::date BETWEEN $2 AND $3))) 
        AND NOT v.id = $4 `
            , [codigo, fec_inicio, fec_final, id]);

        return res.status(200).jsonp(VACACIONES.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * METODO PARA INSERTAR UNA VACACION
 * @returns RETORNA DATOS DE VACACION INGRESADA
 */
export const postNuevaVacacion = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { fec_inicio, fec_final, fec_ingreso, dia_libre, dia_laborable, legalizado, id_peri_vacacion,
            id_empl_cargo, estado, codigo } = req.body;

        console.log(req.body);

        const response: QueryResult = await pool.query(
            'INSERT INTO vacaciones (fec_inicio, fec_final, fec_ingreso, dia_libre, dia_laborable, ' +
            'legalizado, id_peri_vacacion, id_empl_cargo, estado, codigo) ' +
            'VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10 ) RETURNING *',
            [fec_inicio, fec_final, fec_ingreso, dia_libre, dia_laborable, legalizado, id_peri_vacacion,
                id_empl_cargo, estado, codigo]);
        const [objetoVacacion] = response.rows;

        if (!objetoVacacion) return res.status(400)
            .jsonp({ message: 'Upps !!! algo salio mal. Solicitud de vacación no ingresada' })

        const vacacion: Vacacion = objetoVacacion

        const { id_departamento } = req.query;

        const JefesDepartamentos = await pool.query(
            `
            SELECT n.id_departamento, cg.nombre, n.id_dep_nivel, n.dep_nivel_nombre, n.nivel,
                da.estado, dae.id_contrato, da.id_empl_cargo, (dae.nombre || ' ' || dae.apellido) as fullname,
                dae.cedula, dae.correo, c.vaca_mail, c.vaca_noti 
            FROM nivel_jerarquicodep AS n, depa_autorizaciones AS da, datos_actuales_empleado AS dae,
                config_noti AS c, cg_departamentos AS cg
            WHERE n.id_departamento = $1
                AND da.id_departamento = n.id_dep_nivel
                AND dae.id_cargo = da.id_empl_cargo
                AND dae.id_contrato = c.id_empleado
                AND cg.id = $1
            ORDER BY nivel ASC
            `, 
            [id_departamento]).then(result => { return result.rows });

        if (JefesDepartamentos.length === 0) return res.status(400)
            .jsonp({ message: 'Ups !!! algo salio mal. Solicitud ingresada, pero es necesario verificar configuraciones jefes de departamento.' });

        const obj = JefesDepartamentos[JefesDepartamentos.length - 1];
        let depa_padre = obj.id_dep_nivel;
        var JefeDepaPadre: any = [];
        if (depa_padre !== null) {
            JefesDepartamentos.filter((item: any) => {
                JefeDepaPadre.push(item)
                vacacion.EmpleadosSendNotiEmail = JefesDepartamentos
            })

            return res.status(200).jsonp(vacacion);

        } else {
            vacacion.EmpleadosSendNotiEmail = JefesDepartamentos
            return res.status(200).jsonp(vacacion);
        }

    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
}

/**
 * Metodo para actualizar registro de vacacion solo en estado pendiente
 * @returns Retorna mensaje actualizacion.
 */
export const putVacacion = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id, fec_inicio, fec_final, fec_ingreso, dia_libre, dia_laborable, legalizado, estado } = req.body;

        console.log(req.body);

        if (estado === 1) {
            const response: QueryResult = await pool.query(
                `
                UPDATE vacaciones SET fec_inicio = $2, fec_final = $3, fec_ingreso = $4, dia_libre = $5, 
                dia_laborable = $6, legalizado = $7
                WHERE id = $1 RETURNING *
                `
                , [id, fec_inicio, fec_final, fec_ingreso, dia_libre, dia_laborable, legalizado]);

            const [objetoVacacion] = response.rows;

            if (objetoVacacion) {

                return res.status(200).jsonp(objetoVacacion);
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

/**
 * Metodo para optener el listado de periodo vacaciones la tabla peri_vacaciones por el codigo del usuario
 * @returns Retorna mensaje actualizacion.
 */
export const listarPeriVacaciones = async (req: Request, res: Response): Promise<Response> => {
    try {

        const { codigo } = req.query;

        const query = `
            SELECT periv.* FROM peri_vacaciones AS periv WHERE periv.codigo = ${codigo} 
            `
        const response: QueryResult = await pool.query(query);
        const vacaciones: Vacacion[] = response.rows;
        return res.status(200).jsonp(vacaciones);
        
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
}
