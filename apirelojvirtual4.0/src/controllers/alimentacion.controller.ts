import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';
import { Alimentacion } from '../interfaces/Alimentacion'

/**
 * Metodo para obtener listado de solicitudes de alimentacion por id_empleado
 * @returns Retorna un array de solicitudes de alimentacion.
 */
export const getlistaAlimentacionByIdEmpleado = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { idEmpleado } = req.query;

        const subquery = '( SELECT (nombre || \' \' || apellido) from eu_empleados i where i.id = a.id_empleado) as nempleado '
        const subquery1 = '( SELECT i.nombre from ma_detalle_comida i where i.id = a.id_detalle_comida ) as ncomida '
        const subquery2 = '( SELECT i.valor from ma_detalle_comida i where i.id = a.id_detalle_comida )  as nvalor '
        const subquery3 = '( SELECT i.observacion from ma_detalle_comida i where i.id = a.id_detalle_comida )  as ndetallecomida '
        const subquery4 = '( SELECT t.nombre from ma_cat_comidas t, ma_horario_comidas ct, ma_detalle_comida i where i.id = a.id_detalle_comida AND i.id_horario_comida = ct.id AND ct.id_comida = t.id )  as nservicio '
        const subquery5 = '( SELECT t.id from ma_cat_comidas t, ma_horario_comidas ct, ma_detalle_comida i where i.id = a.id_detalle_comida AND i.id_horario_comida = ct.id AND ct.id_comida = t.id )  as id_servicio '
        const subquery6 = '( SELECT i.id_horario_comida  from ma_detalle_comida i where i.id = a.id_detalle_comida )  as id_plato '
        const subquery7 = `(SELECT e.codigo FROM eu_empleados AS e WHERE e.id = a.id_empleado) AS codigo`

        const query = `SELECT a.*, ${subquery}, ${subquery1}, ${subquery2}, ${subquery3}, ${subquery4}, 
        ${subquery5}, ${subquery6}, ${subquery7} FROM ma_solicitud_comida a WHERE a.id_empleado = ${idEmpleado} 
        ORDER BY a.fecha DESC LIMIT 100`
        const response: QueryResult = await pool.query(query);
        const alimentacion: Alimentacion[] = response.rows;
        console.log('consulta comida', alimentacion)
        return res.status(200).jsonp(alimentacion);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};


/**
 * Metodo para obtener listado de los primeros 100 solicitudes de alimentacion de empleados
 * @returns Retorna un array de solicitudes de alimentacion.
 */
export const getlistaAlimentacion = async (req: Request, res: Response): Promise<Response> => {
    try {
        const subquery = '( SELECT (i.nombre || \' \' || i.apellido) from eu_empleados i where i.id = a.id_empleado) as nempleado '
        const subquery1 = '( SELECT i.nombre from ma_detalle_comida i where i.id = a.id_detalle_comida ) as ncomida '
        const subquery2 = '( SELECT i.valor from ma_detalle_comida i where i.id = a.id_detalle_comida )  as nvalor '
        const subquery3 = '( SELECT i.observacion from ma_detalle_comida i where i.id = a.id_detalle_comida )  as ndetallecomida '
        const subquery4 = '( SELECT t.nombre from ma_cat_comidas t, ma_horario_comidas ct, ma_detalle_comida i where i.id = a.id_detalle_comida AND i.id_horario_comida = ct.id AND ct.id_comida = t.id )  as nservicio '
        const subquery5 = `(SELECT e.codigo FROM eu_empleados AS e WHERE e.id = a.id_empleado) AS codigo`
        const query = `SELECT a.*, ${subquery}, ${subquery1}, ${subquery2}, ${subquery3}, ${subquery4}, ${subquery5} FROM ma_solicitud_comida a ORDER BY a.fecha DESC LIMIT 100`
        const response: QueryResult = await pool.query(query);
        const alimentacion: Alimentacion[] = response.rows;
        return res.status(200).jsonp(alimentacion);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Metodo para obtener listado de alimentacion de empleados por rango de fecha
 * @returns Retorna un array de Permisos
 */
export const getlistaAlimentacionByFechas = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { fec_inicio, fec_final } = req.query;

        const subquery = '( SELECT (i.nombre || \' \' || i.apellido) from eu_empleados i where i.id = a.id_empleado) as nempleado '
        const subquery1 = '( SELECT i.nombre from ma_detalle_comida i where i.id = a.id_detalle_comida ) as ncomida '
        const subquery2 = '( SELECT i.valor from ma_detalle_comida i where i.id = a.id_detalle_comida )  as nvalor '
        const subquery3 = '( SELECT i.observacion from ma_detalle_comida i where i.id = a.id_detalle_comida )  as ndetallecomida '
        const subquery4 = '( SELECT t.nombre from ma_cat_comidas t, ma_horario_comidas ct, ma_detalle_comida i where i.id = a.id_detalle_comida AND i.id_horario_comida = ct.id AND ct.id_comida = t.id )  as nservicio '
        const subquery5 = `(SELECT e.codigo FROM eu_empleados AS e WHERE e.id = a.id_empleado) AS codigo`
        
        const query = `SELECT a.*, ${subquery}, ${subquery1}, ${subquery2}, ${subquery3}, ${subquery4}, ${subquery5} 
        FROM ma_solicitud_comida a WHERE a.fecha_comida BETWEEN \'${fec_inicio}\' AND \'${fec_final}\' 
        ORDER BY a.fecha_comida DESC LIMIT 100`
        
        const response: QueryResult = await pool.query(query);
        const alimentacion: Alimentacion[] = response.rows;
        return res.status(200).jsonp(alimentacion);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Metodo para obtener listado de Vacaciones por codigo y un rango de fechas del empleado
 * @returns Retorna un array de vacaciones
 */
 export const getlistaAlimentacionByFechasyCodigo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { fec_comida, id_empleado } = req.query;

        const query = `SELECT a.* FROM ma_solicitud_comida a 
                        WHERE a.id_empleado = \'${id_empleado}'\ 
                        AND ((\'${fec_comida}\' =  a.fecha_comida))`

            const response: QueryResult = await pool.query(query);
            const vacaciones: Alimentacion[] = response.rows;
            return res.status(200).jsonp(vacaciones);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Metodo para insertar una solicitud de comida
 * @returns Retorna datos comida ingresado
 */
export const postNuevoAlimentacion = async (req: Request, res: Response): Promise<Response> => {
    try {

        const { extra, fecha_comida, fecha, hora_fin, hora_inicio, id_detalle_comida, id_empleado,
            observacion, verificar } = req.body;

        console.log(req.body);

        const response: QueryResult = await pool.query(
            'INSERT INTO ma_solicitud_comida (extra, fecha_comida, fecha, hora_fin, hora_inicio, id_detalle_comida, ' +
            'id_empleado, observacion, verificar) ' +
            'VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [extra, fecha_comida, fecha, hora_fin, hora_inicio, id_detalle_comida, id_empleado, observacion, verificar]);
        const [objetoAlimento] = response.rows;

        if (!objetoAlimento) {
            return res.status(404).jsonp({ message: 'Solicitud no registrada.' })

        }else{
            return res.status(200).jsonp(objetoAlimento);
        }



    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
}

/**
 * METODO PARA ACTUALIZAR REGISTRO DE SOLICITUD DE ALIMENTACION
 * @returns RETORNA MENSAJE ACTUALIZACION.
 */
export const putAlimentacion = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id, id_empleado, fecha, id_detalle_comida, observacion, fecha_comida, extra, aprobada, verificar } = req.body;

        const response: QueryResult = await pool.query(
            `
            UPDATE ma_solicitud_comida SET id_empleado = $2 , fecha = $3, id_detalle_comida = $4, observacion = $5, 
            fecha_comida = $6, extra = $7, aprobada = $8, verificar = $9 
            WHERE id = $1  RETURNING *
            `
            , [id, id_empleado, fecha, id_detalle_comida, observacion, fecha_comida, extra, aprobada, verificar]);

        const [objetoAlimentacion] = response.rows;

        if (objetoAlimentacion) {

            return res.status(200).jsonp(objetoAlimentacion);
        } else {

            return res.status(400)
                .jsonp({ message: 'No se actualizo el registro.' });
        }

    } catch (error) {
        console.log(error);
        return res.status(500)
            .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
}

/**
 * Metodo para actualizar registro de estado de la solicitud de alimentacion
 * @returns Retorna Array de solicitudes.
 */
export const putEstadoAlimentacion = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id, id_empleado, aprobada } = req.body;

        const response: QueryResult = await pool.query(`
            UPDATE ma_solicitud_comida SET aprobada = $2 WHERE id = $1 RETURNING id`,
            [id, aprobada]);
        const [objetoAlimentacion] = response.rows;

        if (objetoAlimentacion) {

            return res.status(200).jsonp(objetoAlimentacion);
        } else {

            return res.status(400).jsonp({ message: 'No se actualizo el registro.' });
        }
     

    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
}