import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';
import * as AUDITORIA_CONTROLADOR from '../controllers/auditotia.controller';


export const deleteMetodoGeneral = async (req: Request, res: Response): Promise<Response> => {
    try {
        var { nametable, idreg, user_name, ip } = req.query;



        const solicitud = await pool.query(`SELECT * FROM ${nametable} WHERE id =  ${idreg} `);
        const [datosOriginalesTabla] = solicitud.rows;

        if (!datosOriginalesTabla) {
            // AUDITORIA
            if (!user_name || !ip) {
                user_name = '';
                ip = '';
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: `${nametable}`,
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    observacion: `Error al eliminar el registro con id: ${idreg}. Registro no encontrado.`
                });
            }
            await pool.query('COMMIT');
            return res.status(404).jsonp({ message: 'Registro no encontrado.' });
        }


        const response: QueryResult = await pool.query(
            `
            DELETE FROM ${nametable} WHERE id = ${idreg} RETURNING *
            `
        )

        if (!user_name || !ip) {
            user_name = '';
            ip = '';
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: `${nametable}`,
                usuario: user_name,
                accion: 'D',
                datosOriginales:  JSON.stringify(datosOriginalesTabla),
                datosNuevos:'',
                ip: ip,
                observacion: null
            });
        }

        console.log(response.rows);

        switch (nametable) {
            case 'mv_solicitud_vacacion':
                const datosVacacion = await pool.query(`SELECT * FROM mv_solicitud_vacacion WHERE id =  ${idreg} `);

                if (!datosVacacion) {
                    // AUDITORIA
                    if (!user_name || !ip) {
                        user_name = '';
                        ip = '';
                        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                            tabla: `mv_solicitud_vacacion`,
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            observacion: `Error al eliminar el registro con id: ${idreg}. Registro no encontrado.`
                        });
                    }
                    await pool.query('COMMIT');
                }

                await pool.query('DELETE FROM ecm_autorizaciones WHERE id_vacacion = $1', [idreg]);
                // AUDITORIA

                if (!user_name || !ip) {
                    user_name = '';
                    ip = '';
                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'ecm_autorizaciones',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: JSON.stringify(datosVacacion),
                        datosNuevos: '',
                        ip: ip,
                        observacion: null
                    });
                }
                const datosNotificaciones = await pool.query(`SELECT * FROM ecm_realtime_notificacion WHERE id_vacaciones =  ${idreg} `);
                if (!datosNotificaciones) {
                    // AUDITORIA
                    if (!user_name || !ip) {
                        user_name = '';
                        ip = '';
                        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                            tabla: `ecm_realtime_notificacion`,
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            observacion: `Error al eliminar el registro con id_vacaciones: ${idreg}. Registro no encontrado.`
                        });
                    }
                    await pool.query('COMMIT');

                }

                await pool.query('DELETE FROM ecm_realtime_notificacion WHERE id_vacaciones = $1', [idreg]);

                if (!user_name || !ip) {
                    user_name = '';
                    ip = '';
                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: `ecm_realtime_notificacion`,
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: JSON.stringify(datosNotificaciones),
                        datosNuevos:'' ,
                        ip: ip,
                        observacion: null
                    });
                }
                await pool.query('COMMIT');

                break;
            case 'mhe_solicitud_hora_extra':

                const datosHE = await pool.query(`SELECT * FROM mhe_solicitud_hora_extra WHERE id =  ${idreg} `);


                if (!datosHE) {
                    // AUDITORIA
                    if (!user_name || !ip) {
                        user_name = '';
                        ip = '';
                        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                            tabla: `mhe_solicitud_hora_extra`,
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            observacion: `Error al eliminar el registro con id: ${idreg}. Registro no encontrado.`
                        });
                    }
                    await pool.query('COMMIT');
                }
                await pool.query('DELETE FROM ecm_autorizaciones WHERE id_hora_extra = $1', [idreg]);
                if (!user_name || !ip) {
                    user_name = '';
                    ip = '';
                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'ecm_autorizaciones',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: JSON.stringify(datosHE),
                        datosNuevos: '',
                        ip: ip,
                        observacion: null
                    });
                }
                const datosNotificaciones2 = await pool.query(`SELECT * FROM ecm_realtime_notificacion WHERE id_hora_extra =  ${idreg} `);
                if (!datosNotificaciones2) {
                    // AUDITORIA
                    if (!user_name || !ip) {
                        user_name = '';
                        ip = '';
                        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                            tabla: `ecm_realtime_notificacion`,
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            observacion: `Error al eliminar el registro con id_vacaciones: ${idreg}. Registro no encontrado.`
                        });
                    }
                    await pool.query('COMMIT');
                }
                await pool.query('DELETE FROM ecm_realtime_notificacion WHERE id_hora_extra = $1', [idreg]);
                if (!user_name || !ip) {
                    user_name = '';
                    ip = '';
                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: `ecm_realtime_notificacion`,
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: JSON.stringify(datosNotificaciones2),
                        datosNuevos: '',
                        ip: ip,
                        observacion: null
                    });
                }
                await pool.query('COMMIT');

                break;
            case 'mp_solicitud_permiso':
                const datosPermiso = await pool.query(`SELECT * FROM mp_solicitud_permiso WHERE id =  ${idreg} `);


                if (!datosPermiso) {
                    // AUDITORIA
                    if (!user_name || !ip) {
                        user_name = '';
                        ip = '';
                        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                            tabla: `mp_solicitud_permiso`,
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            observacion: `Error al eliminar el registro con id: ${idreg}. Registro no encontrado.`
                        });
                    }
                    await pool.query('COMMIT');
                }


                await pool.query('DELETE FROM ecm_autorizaciones WHERE id_permiso = $1', [idreg]);


                if (!user_name || !ip) {
                    user_name = '';
                    ip = '';
                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'ecm_autorizaciones',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: JSON.stringify(datosPermiso),
                        datosNuevos: '',
                        ip: ip,
                        observacion: null
                    });
                }


                const datosNotificaciones3 = await pool.query(`SELECT * FROM ecm_realtime_notificacion WHERE id_permiso =  ${idreg} `);
                if (!datosNotificaciones3) {
                    // AUDITORIA
                    if (!user_name || !ip) {
                        user_name = '';
                        ip = '';
                        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                            tabla: `ecm_realtime_notificacion`,
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            observacion: `Error al eliminar el registro con id_permiso: ${idreg}. Registro no encontrado.`
                        });
                    }
                    await pool.query('COMMIT');

                }
                await pool.query('DELETE FROM ecm_realtime_notificacion where id_permiso = $1', [idreg]);

                if (!user_name || !ip) {
                    user_name = '';
                    ip = '';
                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: `ecm_realtime_notificacion`,
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: JSON.stringify(datosNotificaciones3),
                        datosNuevos: '',
                        ip: ip,
                        observacion: null
                    });
                }
                await pool.query('COMMIT');
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