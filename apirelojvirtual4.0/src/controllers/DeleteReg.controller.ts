import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';

export const deleteMetodoGeneral = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { nametable, idreg } = req.query;
        const response: QueryResult = await pool.query(
            `
            DELETE FROM ${nametable} WHERE id = ${idreg} RETURNING *
            `
        )

        console.log(response.rows);

        switch (nametable) {
            case 'mv_solicitud_vacacion':
                await pool.query('DELETE FROM ecm_autorizaciones WHERE id_vacacion = $1', [idreg]);
                await pool.query('DELETE FROM ecm_realtime_notificacion WHERE id_vacaciones = $1', [idreg]);
                break;
            case 'mhe_solicitud_hora_extra':
                await pool.query('DELETE FROM ecm_autorizaciones WHERE id_hora_extra = $1', [idreg]);
                await pool.query('DELETE FROM ecm_realtime_notificacion WHERE id_hora_extra = $1', [idreg]);
                break;
            case 'mp_solicitud_permiso':
                await pool.query('DELETE FROM ecm_autorizaciones WHERE id_permiso = $1', [idreg]);
                await pool.query('DELETE FROM ecm_realtime_notificacion where id_permiso = $1', [idreg]);
                break;

            default:
                break;
        }

        const [objeto] = response.rows;

        if (objeto) {
            return res.status(200).jsonp(objeto)
        }
        else {
            return res.status(404).jsonp({ message: 'Solicitud no eliminada.' })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};