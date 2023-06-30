import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';
import { Cg_DetalleMenu, Cg_Feriados, Servicios_Comida, Menu_Servicios } from '../interfaces/Catalogos';
import { Cg_TipoPermiso } from '../interfaces/Catalogos';

/**
 * Metodo para obtener listado de los feriados del año para llenar en un selectItem o combobox.
 * @returns Retorna un array de catalogos de feriados
 */
export const getCgFeriados = async (req: Request, res: Response): Promise<Response> => {
    try {
        const fecha = new Date();
        const response: QueryResult = await pool.query('SELECT id, descripcion, CAST(fecha AS VARCHAR),CAST(fec_recuperacion AS VARCHAR) FROM cg_feriados WHERE CAST(fecha AS VARCHAR) LIKE $1 || \'%\' ORDER BY descripcion ASC', [fecha.toJSON().split("-")[0]]);
        const cg_feriados: Cg_Feriados[] = response.rows;
        console.log('cg_feriados: ',cg_feriados);
        return res.status(200).jsonp(cg_feriados);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};


/**
 * Metodo para obtener listado de los tipos de permisos para llenar en un selectItem o combobox.
 * @returns Retorna un array de Permisos
 */
export const getCgTipoPermisos = async (req: Request, res: Response): Promise<Response> => {
    try {
        const response: QueryResult = await pool.query('SELECT cg.* FROM cg_tipo_permisos cg ORDER BY cg.descripcion ASC');
        const cg_permisos: Cg_TipoPermiso[] = response.rows;
        return res.status(200).jsonp(cg_permisos);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Metodo para obtener listado del detalle de comidas llenar en un selectItem o combobox.
 * @returns Retorna un array de Detalle de comidas
 */

export const getServiciosComida = async (req: Request, res: Response): Promise<Response> => {
    try {
        const response: QueryResult = await pool.query('SELECT * FROM tipo_comida');
        const servicios_comida: Servicios_Comida[] = response.rows;
        return res.status(200).jsonp(servicios_comida);
    } catch (error) {
        console.log(error);
        return res.status(500).
            jsonp({
                message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 ' +
                    'o https://casapazmino.com.ec'
            });
    }
};

export const getServiciosMenu = async (req: Request, res: Response): Promise<Response> => {
    try {
        const response: QueryResult = await pool.query('SELECT * FROM cg_tipo_comidas');
        const menu: Menu_Servicios[] = response.rows;
        return res.status(200).jsonp(menu);
    } catch (error) {
        console.log(error);
        return res.status(500).
            jsonp({
                message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 ' +
                    'o https://casapazmino.com.ec'
            });
    }
};

export const getDetalleMenu = async (req: Request, res: Response): Promise<Response> => {
    try {
        const response: QueryResult = await pool.query('SELECT cg.* FROM detalle_menu cg ORDER BY cg.valor ASC');
        const cg_detalle_menu: Cg_DetalleMenu[] = response.rows;
        return res.status(200).jsonp(cg_detalle_menu);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};