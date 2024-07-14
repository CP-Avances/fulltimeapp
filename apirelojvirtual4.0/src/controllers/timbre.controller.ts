import e, { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';
import { Timbre } from '../interfaces/Timbre';
import * as AUDITORIA_CONTROLADOR from '../controllers/auditotia.controller';
import { FormatearFecha2, FormatearHora } from '../libs/metodos';



/*
export const getTimbreByIEmdpresa = async (req: Request, res: Response): Promise<Response> => {
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

*/


export const getTimbreById = async (req: Request, res: Response): Promise<Response> => {
    try {

        const id = parseInt(req.params.idUsuario);
        const response: QueryResult = await pool.query('SELECT * FROM eu_timbres WHERE codigo = $1 ORDER BY fecha_hora_timbre DESC LIMIT 100', [id]);
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
        await pool.query('BEGIN');

        // Verificar el contenido de req.body
        console.log('Contenido de req.body:', timbre);

        timbre.fecha_hora_timbre_servidor = hoy.getFullYear() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getDate() + " " + hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getSeconds();
        const timbreRV: Date = new Date(timbre.fecha_hora_timbre || '');
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

        // Verificar el valor de timbre.accion antes de la consulta
        console.log('Valor de timbre.accion:', timbre.accion);

        const response = await pool.query('INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, ' +
            'observacion, latitud, longitud, codigo, id_reloj, tipo_autenticacion, ' +
            'dispositivo_timbre, fecha_hora_timbre_servidor, hora_timbre_diferente, ubicacion, conexion, fecha_subida_servidor, novedades_conexion, id_empleado) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17);',
            [timbre.fecha_hora_timbre, timbre.accion, timbre.tecla_funcion, timbre.observacion,
            timbre.latitud, timbre.longitud, timbre.codigo, timbre.id_reloj,
            timbre.tipo_autenticacion, timbre.dispositivo_timbre, timbre.fecha_hora_timbre_servidor,
            timbre.hora_timbre_diferente, timbre.ubicacion, timbre.conexion, timbre.fecha_subida_servidor, timbre.novedades_conexion, timbre.id_empleado]);


        const fechaHora = await FormatearHora(timbre.fecha_hora_timbre.toLocaleString().split('T')[1]);
        const fechaTimbre = await FormatearFecha2(timbre.fecha_hora_timbre.toLocaleString(), 'ddd');
        const fechaHoraServidor = await FormatearHora(timbre.fecha_hora_timbre_servidor.toLocaleString().split('T')[1]);
        const fechaTimbreServidor = await FormatearFecha2(timbre.fecha_hora_timbre_servidor.toLocaleString(), 'ddd');

        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_timbres',
            usuario: timbre.user_name,
            accion: 'I',
            datosOriginales: '',
            datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${timbre.accion}, tecla_funcion: ${timbre.tecla_funcion}, observacion: ${timbre.observacion}, latitud: ${timbre.latitud}, longitud: ${timbre.longitud}, codigo: ${timbre.codigo}, fecha_hora_timbre_servidor: ${fechaTimbreServidor + ' ' + fechaHoraServidor}, id_reloj: ${timbre.id_reloj}, ubicacion: ${timbre.ubicacion}, dispositivo_timbre: ${timbre.dispositivo_timbre}, id_empleado, ${timbre.id_empleado} }`,
            ip: timbre.ip,
            observacion: null
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

        res.jsonp({
            message: 'Timbre creado con éxito',
            respuestaBDD: response
        });
    } catch (error) {
        console.log("ver el error", error);
        return res.status(500).jsonp({ message: 'Error al crear Timbre' });
    }
};

export const crearTimbreDesconectado = async (req: Request, res: Response) => {
    try {
        const hoy: Date = new Date();
        const timbre: Timbre = req.body;
        await pool.query('BEGIN');

        timbre.fecha_subida_servidor = hoy.getFullYear() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getDate() + " " + hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getSeconds();
        const timbreRV: Date = new Date(timbre.fecha_hora_timbre || '');
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

        const response = await pool.query('INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, ' +
            'observacion, latitud, longitud, codigo, id_reloj, tipo_autenticacion, ' +
            'dispositivo_timbre, fecha_hora_timbre_servidor, hora_timbre_diferente, ubicacion, conexion, fecha_subida_servidor, novedades_conexion, id_empleado) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);',
            [timbre.fecha_hora_timbre, 'dd', timbre.tecla_funcion, timbre.observacion,
            timbre.latitud, timbre.longitud, timbre.codigo, timbre.id_reloj,
            timbre.tipo_autenticacion, timbre.dispositivo_timbre, timbre.fecha_hora_timbre_servidor,
            timbre.hora_timbre_diferente, timbre.ubicacion, timbre.conexion, timbre.fecha_subida_servidor, timbre.novedades_conexion, timbre.id_empleado]);

        const fechaHora = await FormatearHora(timbre.fecha_hora_timbre.toLocaleString().split('T')[1]);
        const fechaTimbre = await FormatearFecha2(timbre.fecha_hora_timbre.toLocaleString(), 'ddd');
        const fechaHoraServidor = await FormatearHora(timbre.fecha_hora_timbre_servidor.toLocaleString().split('T')[1]);
        const fechaTimbreServidor = await FormatearFecha2(timbre.fecha_hora_timbre_servidor.toLocaleString(), 'ddd');

        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_timbres',
            usuario: timbre.user_name,
            accion: 'I',
            datosOriginales: '',
            datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${timbre.accion}, tecla_funcion: ${timbre.tecla_funcion}, observacion: ${timbre.observacion}, latitud: ${timbre.latitud}, longitud: ${timbre.longitud}, codigo: ${timbre.codigo}, fecha_hora_timbre_servidor: ${fechaTimbreServidor + ' ' + fechaHoraServidor}, id_reloj: ${timbre.id_reloj}, ubicacion: ${timbre.ubicacion}, dispositivo_timbre: ${timbre.dispositivo_timbre}, id_empleado: ${timbre.id_empleado} }`,
            ip: timbre.ip,
            observacion: null
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

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
        const { fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, codigo, id_reloj,user_name, ip, id} = req.body
        console.log(req.body);
        await pool.query('BEGIN');


        const [timbre] = await pool.query('INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, observacion, latitud, longitud, codigo, id_reloj, id_empleado) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
            [fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, codigo, id_reloj, id])
            .then(result => {
                return result.rows;
            });
        const fechaHora = await FormatearHora(fec_hora_timbre.toLocaleString().split('T')[1]);
        const fechaTimbre = await FormatearFecha2(fec_hora_timbre.toLocaleString(), 'ddd');


        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_timbres',
            usuario: user_name,
            accion: 'I',
            datosOriginales: '',
            datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${accion}, tecla_funcion: ${tecl_funcion}, observacion: ${observacion}, latitud: ${latitud}, longitud: ${longitud}, codigo: ${codigo}, fecha_hora_timbre_servidor:'null', id_reloj: ${id_reloj}, ubicacion: 'null', dispositivo_timbre: 'null', id_empleado: ${id} }`,
            ip: ip,
            observacion: null
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

        if (!timbre) return res.status(400).jsonp({ message: "No se inserto timbre" });

        return res.status(200).jsonp({ message: "Timbre Creado exitosamente" });
    } catch (error) {
        return res.status(400).jsonp({ message: error });
    }
}

export const FiltrarTimbre = async (req: Request, res: Response) => {
    try {
        const { fecInicio, fecFinal, codigo } = req.body
        console.log(req.body);
        const response: QueryResult = await pool.query('SELECT * FROM eu_timbres WHERE codigo = $3 AND fecha_hora_timbre BETWEEN $1 AND $2 ORDER BY fecha_hora_timbre DESC ',
            [fecInicio, fecFinal, codigo])
        const timbres: Timbre[] = response.rows;
        return res.jsonp(timbres);
    } catch (error) {
        return res.status(400).jsonp({ message: error });
    }
}

export const justificarAtraso = async (req: Request, res: Response) => {
    try {
        const { descripcion, fec_justifica, codigo, create_time, codigo_create_user, user_name, ip } = req.body;
        await pool.query('BEGIN');
        const [atraso] = await pool.query(
            'INSERT INTO eu_empleado_justificacion_atraso(descripcion, fecha_justifica, id_empleado, fecha_hora, id_empleado_justifica) ' +
            'VALUES($1, $2, $3, $4, $5) RETURNING id',
            [descripcion, fec_justifica, codigo, create_time, codigo_create_user])
            .then(res => {
                return res.rows;
            });

        const fechaHora = await FormatearHora(create_time.toLocaleString().split('T')[1]);
        const fechaTimbre = await FormatearFecha2(create_time.toLocaleString(), 'ddd');

        const fechaHoraJustificacion = await FormatearHora(fec_justifica.toLocaleString().split('T')[1]);
        const fechaTimbreJustificacion = await FormatearFecha2(fec_justifica.toLocaleString(), 'ddd');
        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_empleado_justificacion_atraso',
            usuario: user_name,
            accion: 'I',
            datosOriginales: '',
            datosNuevos: `{fecha_hora: ${fechaTimbre + ' ' + fechaHora}, fecha_justifica: ${fechaTimbreJustificacion + ' ' + fechaHoraJustificacion}, descripcion: ${descripcion}, id_empleado: ${codigo}, id_empleado_justifica: ${codigo_create_user} }`,
            ip: ip,
            observacion: null
        });

        // FINALIZAR TRANSACCION
        await pool.query('COMMIT');

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