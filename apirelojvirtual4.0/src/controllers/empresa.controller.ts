import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';
import { Empresa } from '../interfaces/Empresa'

export const getEmpresaPorId = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const response: QueryResult = await pool.query('SELECT id, nombre, ruc, direccion, telefono, correo, representante, tipo_empresa, establecimiento, logo, color_p, color_s, dias_cambio, cambios, password_correo, seg_contrasena, seg_frase, seg_ninguna, acciones_timbres, num_partida, public_key FROM cg_empresa WHERE id = $1', [id]);
        const empresa: Empresa[] = response.rows;
        console.log(empresa);
        return res.jsonp(empresa[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};