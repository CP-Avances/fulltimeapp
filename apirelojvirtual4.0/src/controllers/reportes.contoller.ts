import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';
import { Timbre } from '../interfaces/Timbre';
import { ImagenBase64LogosEmpresas } from '../libs/metodos';
import { CalcularHoraExtra } from '../libs/CalcularHorasExtras';

export const getInfoReporteTimbres = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { codigo, fec_inicio, fec_final } = req.query;
        const response: QueryResult = await pool.query('SELECT t.*, CAST(t.fecha_hora_timbre AS VARCHAR) AS stimbre, CAST(t.fecha_hora_timbre_servidor AS VARCHAR) AS stimbre_servidor FROM eu_timbres as t WHERE codigo = $3 AND fecha_hora_timbre BETWEEN $1 AND $2 ORDER BY fecha_hora_timbre DESC LIMIT 100', [fec_inicio, fec_final, codigo]);
        const timbres: Timbre[] = response.rows;
        // console.log(timbres);
        if (timbres.length === 0) return res.status(400).jsonp({ message: 'No hay timbres resgistrados' })

        return res.status(200).jsonp(timbres);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

export const getInfoReporteTimbresNovedad = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { codigo, fec_inicio, fec_final, conexion} = req.query;
        const response: QueryResult = await pool.query('SELECT t.*, CAST(t.fecha_hora_timbre AS VARCHAR) AS stimbre, CAST(t.fecha_subida_servidor AS VARCHAR) AS stimbre_servidor FROM eu_timbres as t WHERE codigo = $3 AND fecha_hora_timbre BETWEEN $1 AND $2 AND conexion = $4 ORDER BY fecha_hora_timbre DESC LIMIT 100', [fec_inicio, fec_final, codigo, conexion]);
        const timbres: Timbre[] = response.rows;
        // console.log(timbres);
        if (timbres.length === 0) return res.status(400).jsonp({ message: 'No hay timbres resgistrados' })

        return res.status(200).jsonp(timbres);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

//TODO Revisar query incompleto
export const getInfoReporteInasistencia = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { codigo, fec_inicio, fec_final } = req.query;
        const response: QueryResult = await pool.query('SELECT t.* ', [fec_inicio, fec_final, codigo]);
        const inasistencia: any[] = response.rows;
        if (inasistencia.length === 0) return res.status(400).jsonp({ message: 'No hay inasistencias resgistradas' })

        return res.status(200).jsonp(inasistencia);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};



export const getInfoReporteHorasExtras = async (req: Request, res: Response): Promise<Response> => {
    try {
        const qReport: any = req.query;
        const { id_empleado, codigo, fec_inicio, fec_final } = qReport;

        //TODO CalcularHoraExtra
        const horasExtras = await CalcularHoraExtra(parseInt(id_empleado), codigo, new Date(fec_inicio), new Date(fec_final));
        console.log(horasExtras);

        if (horasExtras.message) {
            return res.status(400).jsonp(horasExtras)
        }

        if (horasExtras.length === 0) return res.status(400).jsonp({ message: 'No hay horas extras resgistradas' })

        return res.status(200).jsonp(horasExtras);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

//TODO revisar query
export const getInfoReporteSolicitudes = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { codigo, fec_inicio, fec_final } = req.query;
        const response: QueryResult = await pool.query('SELECT t.* ', [fec_inicio, fec_final, codigo]);
        const solicitudes: any[] = response.rows;
        if (solicitudes.length === 0) return res.status(400).jsonp({ message: 'No hay solicitudes resgistradas' })

        return res.status(200).jsonp(solicitudes);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

export const getInfoReporteVacaciones = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { codigo, fec_inicio, fec_final } = req.query;
        const response: QueryResult = await pool.query('SELECT t.* ', [fec_inicio, fec_final, codigo]);
        const vacaciones: any[] = response.rows;
        if (vacaciones.length === 0) return res.status(400).jsonp({ message: 'No hay vacaciones resgistradas' })

        return res.status(200).jsonp(vacaciones);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

export const getInfoReporteAlimentacion = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { codigo, fec_inicio, fec_final } = req.query;
        const response: QueryResult = await pool.query('SELECT t.* ', [fec_inicio, fec_final, codigo]);
        const alimentacion: any[] = response.rows;
        if (alimentacion.length === 0) return res.status(400).jsonp({ message: 'No hay alimentacion resgistradas' })

        return res.status(200).jsonp(alimentacion);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * 
 * @returns 
 */
export const getInfoPlantilla = async (req: Request, res: Response): Promise<Response> => {

    try {
        const { id_empresa } = req.query;

        const [file_name] = await pool.query('select nombre, logo, color_principal, color_secundario from e_empresa where id = $1', [id_empresa])
            .then(result => {
                return result.rows;
            });
        if (!file_name) return res.status(400).jsonp({ message: 'No hay información de la empresa' })

        const { nombre: nom_empresa, logo, color_principal, color_secundario } = file_name;

        const codificado = await ImagenBase64LogosEmpresas(logo);
        if (codificado === 0) {
            return res.status(200).jsonp({ imagen: '', nom_empresa, color_principal, color_secundario })
        } else {
            return res.status(200).jsonp({ imagen: codificado, nom_empresa, color_principal, color_secundario })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
}
