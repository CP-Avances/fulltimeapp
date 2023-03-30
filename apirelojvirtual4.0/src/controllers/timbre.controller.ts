import e, { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';
import { Timbre } from '../interfaces/Timbre';


export const getTimbreByIdEmpresa = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = req.params.idEmpresa;
        const response: QueryResult = await pool.query('select timbre.id_usuario,tipo_timbre.descrip_tipo_timbre,tipo_timbre.id_tipo,nombre,usuario.apellido,fecha_timbre,hora_timbre,hora_timbre_app,observacion,latitud,longitud,timbre.tipo_identificacion,timbre.dispositivo_timbre,usuario.id_celular,timbre.tipo_autenticacion,timbre.dispositivo_timbre,timbre.fec_hora_timbre_servidor from timbre inner join usuario on timbre.id_usuario=usuario.id_usuario inner join tipo_timbre on timbre.id_tipo=tipo_timbre.id_tipo where id_empresa=$1 ORDER BY fecha_timbre DESC', [id]);
        const timbres: Timbre[] = response.rows;
        return res.status(200).jsonp(timbres);
    } catch (e) {
        console.log(e);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};


export const getTimbreById = async (req: Request, res: Response): Promise<Response> => {
    try {

        const id = parseInt(req.params.idUsuario);
        const response: QueryResult = await pool.query('SELECT * FROM timbres WHERE id_empleado = $1 ORDER BY fec_hora_timbre DESC LIMIT 100', [id]);
        const timbres: Timbre[] = response.rows;
        return res.jsonp(timbres);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};


export const crearTimbre = async (req: Request, res: Response) => {
    try {
        const hoy: Date = new Date();
        const timbre: Timbre = req.body;
        timbre.fec_hora_timbre_servidor = hoy.getFullYear() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getDate() + " " + hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getSeconds();
        const timbreRV: Date = new Date(timbre.fec_hora_timbre || '');
        const restaTimbresHoras = timbreRV.getHours() - hoy.getHours();
        const restaTimbresMinutos = timbreRV.getMinutes() - hoy.getMinutes();
        const restaTimbresDias = timbreRV.getDate() - hoy.getDate();
        if (restaTimbresDias != 0 || restaTimbresHoras != 0 || restaTimbresMinutos > 3 || restaTimbresMinutos < -3) {
            if (restaTimbresHoras == 1 && restaTimbresMinutos > 58 && restaTimbresMinutos < -58) {
                timbre.hora_timbre_diferente = false;
            } else if (restaTimbresDias == 1 && restaTimbresHoras == 23 || restaTimbresHoras == -23 && restaTimbresMinutos > 58 && restaTimbresMinutos < -58) {
                timbre.hora_timbre_diferente = false;
            } else {
                timbre.hora_timbre_diferente = true;
            }
        } else {
            timbre.hora_timbre_diferente = false;
        }
        const response = await pool.query('INSERT INTO timbres (fec_hora_timbre, accion, tecl_funcion, ' +
            'observacion, latitud, longitud, id_empleado, id_reloj, tipo_autenticacion, ' +
            'dispositivo_timbre, fec_hora_timbre_servidor, hora_timbre_diferente, ubicacion, conexion, fecha_subida_servidor, novedades_conexion) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);',
            [timbre.fec_hora_timbre, timbre.accion, timbre.tecl_funcion, timbre.observacion,
            timbre.latitud, timbre.longitud, timbre.id_empleado, timbre.id_reloj,
            timbre.tipo_autenticacion, timbre.dispositivo_timbre, timbre.fec_hora_timbre_servidor,
            timbre.hora_timbre_diferente, timbre.ubicacion, timbre.conexion, timbre.fecha_subida_servidor, timbre.novedades_conexion]);
        res.jsonp({
            message: 'Timbre creado con éxito',
            respuestaBDD: response
        })
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Error al crear Timbre' });
    }

};

export const crearTimbreDesconectado = async (req: Request, res: Response) => {
    try {
        const hoy: Date = new Date();
        const timbre: Timbre = req.body;
        timbre.fecha_subida_servidor = hoy.getFullYear() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getDate() + " " + hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getSeconds();
        const timbreRV: Date = new Date(timbre.fec_hora_timbre || '');
        const restaTimbresHoras = timbreRV.getHours() - hoy.getHours();
        const restaTimbresMinutos = timbreRV.getMinutes() - hoy.getMinutes();
        const restaTimbresDias = timbreRV.getDate() - hoy.getDate();
        if (restaTimbresDias != 0 || restaTimbresHoras != 0 || restaTimbresMinutos > 3 || restaTimbresMinutos < -3) {
            if (restaTimbresHoras == 1 && restaTimbresMinutos > 58 && restaTimbresMinutos < -58) {
                timbre.hora_timbre_diferente = false;
            } else if (restaTimbresDias == 1 && restaTimbresHoras == 23 || restaTimbresHoras == -23 && restaTimbresMinutos > 58 && restaTimbresMinutos < -58) {
                timbre.hora_timbre_diferente = false;
            } else {
                timbre.hora_timbre_diferente = true;
            }
        } else {
            timbre.hora_timbre_diferente = false;
        }

        const response = await pool.query('INSERT INTO timbres (fec_hora_timbre, accion, tecl_funcion, ' +
            'observacion, latitud, longitud, id_empleado, id_reloj, tipo_autenticacion, ' +
            'dispositivo_timbre, fec_hora_timbre_servidor, hora_timbre_diferente, ubicacion, conexion, fecha_subida_servidor, novedades_conexion) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);',
            [timbre.fec_hora_timbre, timbre.accion, timbre.tecl_funcion, timbre.observacion,
            timbre.latitud, timbre.longitud, timbre.id_empleado, timbre.id_reloj,
            timbre.tipo_autenticacion, timbre.dispositivo_timbre, timbre.fec_hora_timbre_servidor,
            timbre.hora_timbre_diferente, timbre.ubicacion, timbre.conexion, timbre.fecha_subida_servidor, timbre.novedades_conexion]);
        
            console.log('Timbre guardado :) => ',timbre);
        
        res.jsonp({
            message: 'Timbre creado con éxito',
            respuestaBDD: response
        })
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Error al crear Timbre' });
    }

};


export const crearTimbreJustificadoAdmin = async (req: Request, res: Response) => {
    try {
        const { fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, id_empleado,id_reloj } = req.body
        console.log(req.body);

        const [timbre] = await pool.query('INSERT INTO timbres (fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, id_empleado, id_reloj) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id', [fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, id_empleado, id_reloj])
            .then(result => {
                return result.rows;
            });

        if (!timbre) return res.status(400).jsonp({ message: "No se inserto timbre" });

        return res.status(200).jsonp({ message: "Timbre Creado exitosamente" });
    } catch (error) {
        return res.status(400).jsonp({ message: error });
    }
}

export const FiltrarTimbre = async (req: Request, res: Response) => {
    try {
        const { fecInicio, fecFinal, id_empleado} = req.body
        console.log(req.body);
        const response: QueryResult = await pool.query('SELECT * FROM timbres WHERE id_empleado = $3 AND fec_hora_timbre BETWEEN $1 AND $2 ORDER BY fec_hora_timbre DESC ',
            [fecInicio, fecFinal, id_empleado])
            const timbres: Timbre[] = response.rows;
            return res.jsonp(timbres);
    } catch (error) {
        return res.status(400).jsonp({ message: error });
    }
}

export const justificarAtraso = async (req: Request, res: Response) => {
    try {
        const { descripcion, fec_justifica , codigo, create_time, codigo_create_user } = req.body;
        const [atraso] = await pool.query(
            'INSERT INTO atrasos(descripcion, fec_justifica, codigo, create_time, codigo_create_user) ' +
            'VALUES($1, $2, $3, $4, $5) RETURNING id',
            [descripcion, fec_justifica, codigo, create_time, codigo_create_user])
            .then(res => {
                return res.rows;
            });

        if (!atraso) return res.status(400).jsonp({ message: "Atraso no insertado" });

        return res.status(200).jsonp({
            body: {
                mensaje: "Atraso justificado",
                response: atraso.rows
            }
        })

    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Error al crear justificación' });
    }
};