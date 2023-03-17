import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';
import { Rol } from '../interfaces/Rol';


export const getRoles = async (req: Request, res: Response): Promise<Response> => {
    try {
        const response: QueryResult = await pool.query('SELECT * FROM rol');
        const roles: Rol[] = response.rows;
        return res.jsonp(roles);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};