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
        const subquery3 = '( SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.codigo = h.codigo ) AS id_contrato '
        const subquery4 = '( SELECT da.id_departamento FROM datos_actuales_empleado AS da WHERE da.codigo = h.codigo ) AS id_departamento '
        const query = `SELECT h.*, ${subquery1}, ${subquery2}, ${subquery3}, ${subquery4}  FROM hora_extr_pedidos h ORDER BY h.fec_inicio DESC LIMIT 100`
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
        const subquery3 = '( SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.codigo = h.codigo ) AS id_contrato '
        const subquery4 = '( SELECT da.id_departamento FROM datos_actuales_empleado AS da WHERE da.codigo = h.codigo ) AS id_departamento '

        const query = `SELECT h.*, ${subquery1}, ${subquery2}, ${subquery3}, ${subquery4} 
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
        const subquery2 = '( SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.codigo = h.codigo ) AS id_contrato '

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

        const query = `SELECT h.* FROM hora_extr_pedidos h WHERE h.codigo = ${codigo} AND (
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
 * Metodo para obtener listado de HORAS EXTRAS por codigo y un rango de fechas del empleado filtrado por la id
 * @returns Retorna un array de HORAS EXTRAS
 */
export const getlistaHorasExtrasByFechasyCodigoEdit = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { fec_inicio, fec_final, codigo, id } = req.query;

        console.log('fec_inicio: ',fec_inicio)
        console.log('fec_final: ',fec_final)
        console.log('codigo: ',codigo)
        console.log('id: ',id)

        const HorasExtras = await pool.query(`SELECT h.* FROM hora_extr_pedidos h 
        WHERE h.codigo::varchar = $1 
        AND ((($2 BETWEEN h.fec_inicio AND h.fec_final ) OR ($3 BETWEEN h.fec_inicio AND h.fec_final)) OR ((h.fec_inicio BETWEEN $2 AND $3) OR (h.fec_final BETWEEN $2 AND $3))) 
        AND NOT h.id = $4 `
            , [codigo, fec_inicio, fec_final, id]);

        console.log('lista solicitudes: ',HorasExtras.rows)

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

        const JefesDepartamentos = await pool.query(
            `
            SELECT n.id_departamento, cg.nombre, n.id_dep_nivel, n.dep_nivel_nombre, n.nivel,
                da.estado, dae.id_contrato, da.id_empl_cargo, (dae.nombre || ' ' || dae.apellido) as fullname, 
                cg.id AS id_dep, cg.depa_padre, cg.nivel, dae.cedula, dae.correo, 
                c.hora_extra_mail, c.hora_extra_noti
            FROM nivel_jerarquicodep AS n, depa_autorizaciones AS da, datos_actuales_empleado AS dae,
                cg_departamentos AS cg, config_noti AS c 
            WHERE n.id_departamento = $1
                AND da.id_departamento = n.id_dep_nivel 
                AND dae.id_cargo = da.id_empl_cargo
                AND dae.id_contrato = c.id_empleado 
                AND cg.id = $1
                AND da.estado = true
            ORDER BY n.nivel ASC
            `, [id_departamento]).then(result => { return result.rows });
        
        if (JefesDepartamentos.length === 0) return res.status(400)
            .jsonp({ message: 'Ups !!! algo salio mal. Solicitud ingresada, pero es necesario verificar configuraciones jefes de departamento.' });

        const obj = JefesDepartamentos[JefesDepartamentos.length - 1];
        let depa_padre = obj.id_dep_nivel;
        var JefeDepaPadre: any = [];
        if (depa_padre !== null) {
            JefesDepartamentos.filter((item: any) => {
                JefeDepaPadre.push(item)
                hora_extra.EmpleadosSendNotiEmail = JefesDepartamentos
            })

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