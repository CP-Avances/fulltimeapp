import { Request, Response } from 'express';
import { DetalleParametro } from '../interfaces/Parametros';
import { BuscarFecha, BuscarHora } from '../libs/metodos'
import { QueryResult } from 'pg';
import { pool } from '../database';

export const VerDetalleParametro = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const response: QueryResult = await pool.query('SELECT tp.id AS id_tipo, tp.descripcion AS tipo, ' +
            'dtp.id AS id_detalle, dtp.descripcion ' +
            'FROM tipo_parametro AS tp, detalle_tipo_parametro AS dtp ' +
            'WHERE tp.id = dtp.id_tipo_parametro AND tp.id = $1', [id]);
        const detalle: DetalleParametro[] = response.rows;
        console.log(detalle);
        return res.jsonp(detalle);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

export const CompararCoordenadas = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { lat1, lng1, lat2, lng2, valor } = req.body;
        console.log(lat1, lng1, lat2, lng2, valor);
        const response: QueryResult = await pool.query('SELECT CASE ( SELECT 1 ' +
            'WHERE ' +
            ' ($1::DOUBLE PRECISION  BETWEEN $3::DOUBLE PRECISION  - $5 AND $3::DOUBLE PRECISION  + $5) AND ' +
            ' ($2::DOUBLE PRECISION  BETWEEN $4::DOUBLE PRECISION  - $5 AND $4::DOUBLE PRECISION  + $5) ' +
            ') IS null WHEN true THEN \'vacio\' ELSE \'ok\' END AS verificar',
            [lat1, lng1, lat2, lng2, valor]);

        console.log(response.rows);
        return res.jsonp(response.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

export const BuscarCoordenadasUsuario = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { codigo } = req.params;

        const response: QueryResult = await pool.query('SELECT eu.id AS id_emplu, eu.codigo, eu.id_ubicacion, eu.id_empl, ' +
            'cu.latitud, cu.longitud, cu.descripcion ' +
            'FROM empl_ubicacion AS eu, cg_ubicaciones AS cu ' +
            'WHERE eu.id_ubicacion = cu.id AND eu.codigo = $1',
            [codigo]);

        console.log(response.rows);
        return res.jsonp(response.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

export const BuscarFechasHoras = async (req: Request, res: Response): Promise<Response> => {
    try {
        let formato_fecha = await BuscarFecha();
        let formato_hora = await BuscarHora();
        let formatos = {
            fecha: formato_fecha.fecha,
            hora: formato_hora.hora
        }
        return res.jsonp(formatos);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};


export const BuscarFunciones = async (req: Request, res: Response): Promise<Response> => {
    try {
        const response: QueryResult = await pool.query('SELECT * FROM funciones');

        console.log(response.rows);
        return res.jsonp(response.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};




