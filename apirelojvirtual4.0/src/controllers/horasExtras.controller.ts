import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';
import { HoraExtra } from '../interfaces/HorasExtras';

/**
 * Metodo para obtener listado de las primeras 100 horas extras de empleados
 * @returns Retorna un array de horas extras
 */
export const getlistaHorasExtras = async (req: Request, res: Response): Promise<Response> => {
    try {
        const subquery1 = '( SELECT (nombre || \' \' || apellido) FROM empleados i WHERE i.id = h.id_usua_solicita) AS nempleado '
        const subquery2 = '( SELECT t.cargo FROM empl_cargos i, tipo_cargo t WHERE i.id = h.id_empl_cargo and i.cargo = t.id) AS ncargo '
        const subquery3 = '( SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.codigo::int = h.codigo ) AS id_contrato '
        const query = `SELECT h.*, ${subquery1}, ${subquery2}, ${subquery3} FROM hora_extr_pedidos h ORDER BY h.fec_inicio DESC LIMIT 100`
        const response: QueryResult = await pool.query(query);
        const horas_extras: HoraExtra[] = response.rows;
        return res.status(200).jsonp(horas_extras);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Metodo para obtener listado de horas extras de empleados segun rango de fechas.
 * @returns Retorna un array de horas extras
 */
export const getlistaByFechas = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { fec_inicio, fec_final } = req.query;
        const subquery1 = '( SELECT (nombre || \' \' || apellido) FROM empleados i WHERE i.id = h.id_usua_solicita) as nempleado '
        const subquery2 = '( SELECT t.cargo FROM empl_cargos i, tipo_cargo t WHERE i.id = h.id_empl_cargo and i.cargo = t.id) as ncargo '
        const subquery3 = '( SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.codigo::int = h.codigo ) AS id_contrato '

        const query = `SELECT h.*, ${subquery1}, ${subquery2}, ${subquery3} 
        FROM hora_extr_pedidos h WHERE h.fec_inicio BETWEEN \'${fec_inicio}\' AND \'${fec_final}\' 
        ORDER BY h.fec_inicio DESC`
        const response: QueryResult = await pool.query(query);
        const horas_extras: HoraExtra[] = response.rows;
        return res.status(200).jsonp(horas_extras);
    } catch (error) {
        console.log(error);
        return res.status(500)
            .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Metodo para obtener listado de HORAS EXTRAS por codigo del empleado
 * @returns Retorna un array de HORAS EXTRAS
 */
export const getlistaHorasExtrasByCodigo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { codigo } = req.query;
        const subquery1 = '( SELECT t.cargo FROM empl_cargos i, tipo_cargo t WHERE i.id = h.id_empl_cargo and i.cargo = t.id) as ncargo '
        const subquery2 = '( SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.codigo::int = h.codigo ) AS id_contrato '

        const query = `SELECT h.*, ${subquery1}, ${subquery2} 
        FROM hora_extr_pedidos h WHERE h.codigo = ${codigo} 
        ORDER BY h.fec_inicio DESC LIMIT 100`
        const response: QueryResult = await pool.query(query);
        const horas_extras: HoraExtra[] = response.rows;
        return res.status(200).jsonp(horas_extras);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};


/**
 * Metodo para obtener listado de HORAS EXTRAS por codigo y un rango de fechas del empleado
 * @returns Retorna un array de HORAS EXTRAS
 */

 export const getlistaHorasExtrasByFechasyCodigo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { fec_inicio, fec_final, codigo } = req.query;

        const query = `SELECT h.* FROM hora_extr_pedidos h WHERE h.codigo = \'${codigo}'\ AND (
            ((\'${fec_inicio}\' BETWEEN h.fec_inicio AND h.fec_final ) OR 
             (\'${fec_final}\' BETWEEN h.fec_inicio AND h.fec_final)) 
            OR
            ((h.fec_inicio BETWEEN \'${fec_inicio}\' AND \'${fec_final}\') OR 
             (h.fec_final BETWEEN \'${fec_inicio}\' AND \'${fec_final}\'))
            )`

        const response: QueryResult = await pool.query(query);
        const horas_extras: HoraExtra[] = response.rows;
        return res.status(200).jsonp(horas_extras);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};




/**
 * Metodo para insertar una hora extra
 * @returns Retorna datos hora extra ingresado
 */
export const postNuevaHoraExtra = async (req: Request, res: Response): Promise<Response> => {
    try {

        const { codigo, descripcion, estado, fec_final, fec_inicio, fec_solicita, hora_ingreso, hora_salida,
            id_empl_cargo, id_usua_solicita, num_hora, observacion, tiempo_autorizado } = req.body;

        console.log(req.body);

        const response: QueryResult = await pool.query(`
            INSERT INTO hora_extr_pedidos (codigo, descripcion, estado, fec_final, fec_inicio, fec_solicita,
            id_empl_cargo, id_usua_solicita, num_hora, observacion, tiempo_autorizado)
            VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 ) RETURNING * 
            `, [codigo, descripcion, estado, fec_final, fec_inicio, fec_solicita,
            id_empl_cargo, id_usua_solicita, num_hora, observacion, tiempo_autorizado]);
        const [objetoHoraExtra] = response.rows;

        if (!objetoHoraExtra) return res.status(404).jsonp({ message: 'Solicitud no registrada.' })

        const hora_extra: HoraExtra = objetoHoraExtra
        console.log(hora_extra);
        console.log(req.query);

        const { id_departamento } = req.query;

        const JefesDepartamentos = await pool.query(`
            SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc,
            cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato,
            e.id AS empleado, (e.nombre || \' \' || e.apellido) as fullname , e.cedula, e.correo, c.hora_extra_mail, c.hora_extra_noti
            FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, 
            sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c 
            WHERE da.id_departamento = $1 AND 
            da.id_empl_cargo = ecr.id AND 
            da.id_departamento = cg.id AND 
            da.estado = true AND 
            cg.id_sucursal = s.id AND 
            ecr.id_empl_contrato = ecn.id AND 
            ecn.id_empleado = e.id AND 
            e.id = c.id_empleado
            `, [id_departamento]).then(result => { return result.rows });
        console.log(JefesDepartamentos);

        if (JefesDepartamentos.length === 0) return res.status(400)
            .jsonp({ message: 'Ups !!! algo salio mal. Solicitud ingresada, pero es necesario verificar configuraciones jefes de departamento.' });

        const [obj] = JefesDepartamentos;
        let depa_padre = obj.depa_padre;
        let JefeDepaPadre;

        if (depa_padre !== null) {
            do {
                JefeDepaPadre = await pool.query('SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, ' +
                    'cg.nivel, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ' +
                    'ecn.id AS contrato, e.id AS empleado, (e.nombre || \' \' || e.apellido) as fullname, ' +
                    'e.cedula, e.correo, c.hora_extra_mail, c.hora_extra_noti ' +
                    'FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, ' +
                    'sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c ' +
                    'WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND ' +
                    'da.estado = true AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ' +
                    'ecn.id_empleado = e.id AND e.id = c.id_empleado', [depa_padre])
                depa_padre = JefeDepaPadre.rows[0].depa_padre;
                JefesDepartamentos.push(JefeDepaPadre.rows[0]);
            } while (depa_padre !== null);
            hora_extra.EmpleadosSendNotiEmail = JefesDepartamentos
            return res.status(200).jsonp(hora_extra);
        } else {
            hora_extra.EmpleadosSendNotiEmail = JefesDepartamentos
            return res.status(200).jsonp(hora_extra);
        }

    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
}

/**
 * METODO PARA ACTUALIZAR REGISTRO DE HORA EXTRA SOLO EN ESTADO PENDIENTE
 * @returns RETORNA MENSAJE ACTUALIZACION.
 */
export const putHoraExtra = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id, descripcion, fec_final, fec_inicio, num_hora, observacion,
            tiempo_autorizado, documento, docu_nombre, estado } = req.body;

        console.log(req.body);

        if (estado === 1) {
            const response: QueryResult = await pool.query(
                `
                UPDATE hora_extr_pedidos SET descripcion = $2 , fec_final = $3, fec_inicio = $4,
                num_hora = $5, observacion = $6, tiempo_autorizado = $7, documento = $8, docu_nombre = $9
                WHERE id = $1  RETURNING *
                `
                , [id, descripcion, fec_final, fec_inicio, num_hora, observacion, tiempo_autorizado, documento, docu_nombre]);

            const [objetoHora_extra] = response.rows;

            if (objetoHora_extra) {

                return res.status(200).jsonp(objetoHora_extra);
            } else {

                return res.status(400).jsonp({ message: 'No se actualizo el registro.' });
            }
        }

        return res.status(400)
            .jsonp({ message: 'El estado debe ser pendiente para editar la solicitud.' });
    } catch (error) {
        console.log(error);
        return res.status(500)
            .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
}