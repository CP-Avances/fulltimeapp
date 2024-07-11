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
        const subquery1 = '( SELECT (nombre || \' \' || apellido) FROM eu_empleados i WHERE i.id = h.id_empleado_solicita) AS nempleado '
        const subquery2 = '( SELECT t.cargo FROM eu_empleado_cargos i, e_cat_tipo_cargo t WHERE i.id = h.id_empleado_cargo and i.id_tipo_cargo = t.id) AS ncargo '
        const subquery3 = '( SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.id = h.id_empleado_solicita ) AS id_contrato '
        const subquery4 = '( SELECT da.id_departamento FROM datos_actuales_empleado AS da WHERE da.id = h.id_empleado_solicita ) AS id_departamento '
        const query = `SELECT h.*, ${subquery1}, ${subquery2}, ${subquery3}, ${subquery4}  FROM mhe_solicitud_hora_extra h ORDER BY h.fecha_inicio DESC LIMIT 100`
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
        const { fecha_inicio, fecha_final } = req.query;
        const subquery1 = '( SELECT (nombre || \' \' || apellido) FROM eu_empleados i WHERE i.id = h.id_empleado_solicita) as nempleado '
        const subquery2 = '( SELECT t.cargo FROM eu_empleado_cargos i, e_cat_tipo_cargo t WHERE i.id = h.id_empleado_cargo and i.id_tipo_cargo = t.id) as ncargo '
        const subquery3 = '( SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.id = h.id_empleado_solicita ) AS id_contrato '
        const subquery4 = '( SELECT da.id_departamento FROM datos_actuales_empleado AS da WHERE da.id = h.id_empleado_solicita ) AS id_departamento '

        const query = `SELECT h.*, ${subquery1}, ${subquery2}, ${subquery3}, ${subquery4} 
        FROM mhe_solicitud_hora_extra h WHERE h.fecha_inicio BETWEEN \'${fecha_inicio}\' AND \'${fecha_final}\' 
        ORDER BY h.fecha_inicio DESC`
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
        const subquery1 = '( SELECT t.cargo FROM eu_empleado_cargos i, e_cat_tipo_cargo t WHERE i.id = h.id_empleado_cargo and i.id_tipo_cargo = t.id) as ncargo '
        const subquery2 = '( SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.id = h.id_empleado_solicita ) AS id_contrato '

        const query = `SELECT h.*, ${subquery1}, ${subquery2} 
        FROM mhe_solicitud_hora_extra h WHERE h.id_empleado_solicita = '${codigo}' 
        ORDER BY h.fecha_inicio DESC LIMIT 100`
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
        const { fecha_inicio, fecha_final, codigo } = req.query;

        const query = `SELECT h.* FROM mhe_solicitud_hora_extra h WHERE h.id_empleado_solicita = '${codigo}' AND (
            ((\'${fecha_inicio}\' BETWEEN h.fecha_inicio AND h.fecha_final ) OR 
             (\'${fecha_final}\' BETWEEN h.fecha_inicio AND h.fecha_final)) 
            OR
            ((h.fecha_inicio BETWEEN \'${fecha_inicio}\' AND \'${fecha_final}\') OR 
             (h.fecha_final BETWEEN \'${fecha_inicio}\' AND \'${fecha_final}\'))
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
 * Metodo para obtener listado de HORAS EXTRAS por codigo y un rango de fechas del empleado filtrado por la id
 * @returns Retorna un array de HORAS EXTRAS
 */
export const getlistaHorasExtrasByFechasyCodigoEdit = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { fecha_inicio, fecha_final, codigo, id } = req.query;

        console.log('fecha_inicio: ', fecha_inicio)
        console.log('fecha_final: ', fecha_final)
        console.log('codigo: ', codigo)
        console.log('id: ', id)

        const HorasExtras = await pool.query(`SELECT h.* FROM mhe_solicitud_hora_extra h 
        WHERE h.id_empleado_solicita::varchar = $1 
        AND ((($2 BETWEEN h.fecha_inicio AND h.fecha_final ) OR ($3 BETWEEN h.fecha_inicio AND h.fecha_final)) OR ((h.fecha_inicio BETWEEN $2 AND $3) OR (h.fecha_final BETWEEN $2 AND $3))) 
        AND NOT h.id = $4 `
            , [codigo, fecha_inicio, fecha_final, id]);

        console.log('lista solicitudes: ', HorasExtras.rows)

        return res.status(200).jsonp(HorasExtras.rows);
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

        const {  descripcion, estado, fecha_final, fecha_inicio, fecha_solicita, hora_ingreso, hora_salida,
            id_empleado_cargo, id_empleado_solicita, horas_solicitud, observacion, tiempo_autorizado } = req.body;

        console.log(req.body);

        const response: QueryResult = await pool.query(`
            INSERT INTO mhe_solicitud_hora_extra ( descripcion, estado, fecha_final, fecha_inicio, fecha_solicita,
            id_empleado_cargo, id_empleado_solicita, horas_solicitud, observacion, tiempo_autorizado)
            VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 ) RETURNING * 
            `, [ descripcion, estado, fecha_final, fecha_inicio, fecha_solicita,
            id_empleado_cargo, id_empleado_solicita, horas_solicitud, observacion, tiempo_autorizado]);
        const [objetoHoraExtra] = response.rows;

        if (!objetoHoraExtra) return res.status(404).jsonp({ message: 'Solicitud no registrada.' })

        const hora_extra: HoraExtra = objetoHoraExtra
        console.log(hora_extra);
        console.log(req.query);
        return res.status(200).jsonp(hora_extra);
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
        const { id, descripcion, fecha_final, fecha_inicio, horas_solicitud, observacion,
            tiempo_autorizado, documento, docu_nombre, estado } = req.body;

        console.log(req.body);

        if (estado === 1) {
            const response: QueryResult = await pool.query(
                `
                UPDATE mhe_solicitud_hora_extra SET descripcion = $2 , fecha_final = $3, fecha_inicio = $4,
                horas_solicitud = $5, observacion = $6, tiempo_autorizado = $7, documento = $8, docu_nombre = $9
                WHERE id = $1  RETURNING *
                `
                , [id, descripcion, fecha_final, fecha_inicio, horas_solicitud, observacion, tiempo_autorizado, documento, docu_nombre]);

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