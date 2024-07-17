import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';
import { Permiso } from '../interfaces/Permisos'
import { FormatearFecha2, FormatearHora } from '../libs/metodos';
import * as AUDITORIA_CONTROLADOR from '../controllers/auditotia.controller';

/**
 * Metodo para obtener listado de permisos por codigo del empleado
 * @returns Retorna un array de Permisos
 */
export const getPermisoByIdyCodigo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { codigo, id } = req.query;
        const query = `SELECT p.* FROM mp_solicitud_permiso p WHERE p.id_empleado = '${codigo}' AND p.id = ${id}`
        const response: QueryResult = await pool.query(query);
        const permisos: Permiso[] = response.rows;
        return res.status(200).jsonp(permisos);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Metodo para obtener listado de permisos por codigo del empleado
 * @returns Retorna un array de Permisos
 */
export const getlistaPermisosByCodigo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { codigo } = req.query;
        const subquery = '( select i.descripcion from mp_cat_tipo_permisos i where i.id = p.id_tipo_permiso) as tipo_permiso ';
        const subquery1 = '( select (nombre || \' \' || apellido) from eu_empleados i where i.id = p.id_empleado) as nempleado ';
        const query = `SELECT p.*, ${subquery}, ${subquery1} FROM mp_solicitud_permiso p WHERE p.id_empleado = '${codigo}' ORDER BY p.numero_permiso DESC LIMIT 100`
        const response: QueryResult = await pool.query(query);
        const permisos: Permiso[] = response.rows;
        return res.status(200).jsonp(permisos);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Metodo para obtener listado de los primeros 100 permisos de empleados
 * @returns Retorna un array de Permisos
 */
export const getlistaPermisos = async (req: Request, res: Response): Promise<Response> => {
    try {
        const query = `
        SELECT p.*, e.id AS id_empleado, (e.nombre || \' \' || e.apellido) AS nempleado, da.cedula, i.descripcion AS tipo_permiso, da.id_departamento,
		    da.correo AS correo, depa.nombre AS nombre_depa
        FROM mp_solicitud_permiso AS p, eu_empleados AS e, mp_cat_tipo_permisos AS i, datos_actuales_empleado AS da,
	        ed_departamentos AS depa
        WHERE e.id = p.id_empleado 
	        AND da.id = p.id_empleado
	        AND i.id = p.id_tipo_permiso
	        AND depa.id = da.id_departamento
        ORDER BY p.fecha_inicio DESC
        `
        const response: QueryResult = await pool.query(query);
        const permisos: Permiso[] = response.rows;
        return res.status(200).jsonp(permisos);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Metodo para obtener listado de permisos de empleados por rango de fecha
 * @returns Retorna un array de Permisos
 */
export const getlistaPermisosByFechas = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { fec_inicio, fec_final } = req.query;
        const subquery = '( select (nombre || \' \' || apellido) from eu_empleados i where i.id = p.id_empleado ) as nempleado ';
        const subquery1 = '( select i.descripcion from mp_cat_tipo_permisos i where i.id = p.id_tipo_permiso) as tipo_permiso '
        const subquery2 = '( select da.id_departamento FROM datos_actuales_empleado AS da WHERE da.id = p.id_empleado ) AS id_departamento '
        const query = `SELECT p.*, ${subquery}, ${subquery1}, ${subquery2} FROM mp_solicitud_permiso p WHERE p.fecha_inicio BETWEEN \'${fec_inicio}\' AND \'${fec_final}\' ORDER BY p.fecha_inicio DESC`
        const response: QueryResult = await pool.query(query);
        const permisos: Permiso[] = response.rows;
        return res.status(200).jsonp(permisos);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Metodo para obtener listado de permisos de empleado por rango de fecha
 * @returns Retorna un array de Permisos
 */
export const getlistaPermisosByFechasyCodigo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { fec_inicio, fec_final, codigo } = req.query;
        const PERMISO = await pool.query(`SELECT * FROM mp_solicitud_permiso p 
        WHERE p.id_empleado::varchar = $1 
        AND ((($2 BETWEEN p.fecha_inicio::date AND p.fecha_final::date ) OR ($3 BETWEEN p.fecha_inicio::date AND p.fecha_final::date)) OR ((p.fecha_inicio::date BETWEEN $2 AND $3) OR (p.fecha_final::date BETWEEN $2 AND $3)))
         `
            , [codigo, fec_inicio, fec_final]);

        return res.status(200).jsonp(PERMISO.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Metodo para obtener listado de permisos de empleado por rango de fecha
 * @returns Retorna un array de Permisos
 */
export const getlistaPermisosByFechasyCodigoEdit = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { fec_inicio, fec_final, codigo, id } = req.query;
        const PERMISO = await pool.query(`SELECT * FROM mp_solicitud_permiso p 
        WHERE p.id_empleado::varchar = $1 
        AND ((($2 BETWEEN p.fecha_inicio::date AND p.fecha_final::date ) OR ($3 BETWEEN p.fecha_inicio::date AND p.fecha_final::date)) OR ((p.fecha_inicio::date BETWEEN $2 AND $3) OR (p.fecha_final::date BETWEEN $2 AND $3))) 
        AND NOT p.id = $4 `
            , [codigo, fec_inicio, fec_final, id]);

        return res.status(200).jsonp(PERMISO.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Metodo para obtener listado de permisos de empleado por rango de fecha
 * @returns Retorna un array de Permisos
 */
export const getlistaPermisosByHorasyCodigo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { fec_inicio, fec_final, hora_inicio, hora_final, codigo } = req.query;

        console.log("fecha Inicio: ", fec_inicio,)
        console.log("fecha Inicio: ", fec_final,)
        console.log('hora inicio: ', hora_inicio)
        console.log('hora final: ', hora_final)

        const PERMISO = await pool.query(`SELECT id FROM mp_solicitud_permiso p 
        WHERE p.id_empleado::varchar = $1 
        AND ((($2 BETWEEN p.fecha_inicio::date AND p.fecha_final::date ) OR ($3 BETWEEN p.fecha_inicio::date AND p.fecha_final::date)) OR ((p.fecha_inicio::date BETWEEN $2 AND $3) OR (p.fecha_final::date BETWEEN $2 AND $3))) 
        AND ((($4 BETWEEN p.hora_salida AND p.hora_ingreso) OR ($5 BETWEEN p.hora_salida AND p.hora_ingreso)) OR ((p.hora_salida BETWEEN $4 AND $5) OR (p.hora_ingreso BETWEEN $4 AND $5))) `
            , [codigo, fec_inicio, fec_final, hora_inicio, hora_final]);

        return res.status(200).jsonp(PERMISO.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Metodo para obtener listado de permisos de empleado por rango de fecha
 * @returns Retorna un array de Permisos
 */
export const getlistaPermisosByHorasyCodigoEdit = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { fec_inicio, fec_final, hora_inicio, hora_final, codigo, id } = req.query;
        const PERMISO = await pool.query(`SELECT id FROM mp_solicitud_permiso p 
        WHERE p.id_empleado::varchar = $1 
        AND ((($2 BETWEEN p.fecha_inicio::date AND p.fecha_final::date ) OR ($3 BETWEEN p.fecha_inicio::date AND p.fecha_final::date)) OR ((p.fecha_inicio::date BETWEEN $2 AND $3) OR (p.fecha_final::date BETWEEN $2 AND $3))) 
        AND ((($4 BETWEEN p.hora_salida AND p.hora_ingreso) OR ($5 BETWEEN p.hora_salida AND p.hora_ingreso)) OR ((p.hora_salida BETWEEN $4 AND $5) OR (p.hora_ingreso BETWEEN $4 AND $5)))
        AND NOT p.id = $6 `
            , [codigo, fec_inicio, fec_final, hora_inicio, hora_final, id]);

        return res.status(200).jsonp(PERMISO.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * METODO PARA INSERTAR UN PERMISO
 * @returns RETORNA DATOS PERMISO INGRESADO
 */
export const postNuevoPermiso = async (req: Request, res: Response): Promise<Response> => {
    try {

        const { fecha_creacion, descripcion, fecha_inicio, fecha_final, dias_permiso, legalizado, dia_libre,
            id_tipo_permiso, id_empleado_contrato, id_periodo_vacacion, horas_permiso, numero_permiso,
            documento, estado, id_empleado_cargo, hora_salida, hora_ingreso, id_empleado, user_name, ip } = req.body;

        await pool.query('BEGIN');



        const response: QueryResult = await pool.query(
            'INSERT INTO mp_solicitud_permiso (fecha_creacion, descripcion, fecha_inicio, fecha_final, dias_permiso, legalizado, ' +
            'dia_libre, id_tipo_permiso, id_empleado_contrato, id_periodo_vacacion, horas_permiso, numero_permiso, ' +
            'documento, estado, id_empleado_cargo, hora_salida, hora_ingreso, id_empleado) ' +
            'VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) ' +
            'RETURNING * ',
            [fecha_creacion, descripcion, fecha_inicio, fecha_final, dias_permiso, legalizado, dia_libre,
                id_tipo_permiso, id_empleado_contrato, id_periodo_vacacion, horas_permiso, numero_permiso,
                documento, estado, id_empleado_cargo, hora_salida, hora_ingreso, id_empleado]);
        const fechaCreacionN = await FormatearFecha2(fecha_creacion.toLocaleString(), 'ddd');
        const fechaInicioN = await FormatearFecha2(fecha_inicio.toLocaleString(), 'ddd');
        const fechaFinN = await FormatearFecha2(fecha_final.toLocaleString(), 'ddd');
        const horaIngresoN = await FormatearHora(hora_ingreso);
        const horaSalidaN = await FormatearHora(hora_salida);
        const horasPermisoN = await FormatearHora(horas_permiso);

        await AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'mp_solicitud_permiso',
            usuario: user_name,
            accion: 'I',
            datosOriginales: '',
            datosNuevos: `{id_empleado_contrato: ${id_empleado_contrato}, id_empleado_cargo: ${id_empleado_cargo}, id_periodo_vacacion: ${id_periodo_vacacion}, fecha_creacion: ${fechaCreacionN}, fecha_edicion: null, numero_permiso: ${numero_permiso}, descripcion: ${descripcion}, id_tipo_permiso: ${id_tipo_permiso}, fecha_inicio: ${fechaInicioN}, fecha_final: ${fechaFinN}, hora_salida: ${horaSalidaN}, hora_ingreso: ${horaIngresoN}, dias_permiso: ${dias_permiso}, dia_libre: ${dia_libre}, horas_permiso: ${horasPermisoN}, documento: ${documento}, legalizado: ${legalizado}, estado: ${estado}, id_empleado: ${id_empleado}}`,
            ip: ip,
            observacion: null
        });


        await pool.query('COMMIT');


        const [objetoPermiso] = response.rows;

        if (!objetoPermiso) return res.status(404).jsonp({ message: 'Solicitud no registrada.' })

        const permiso: Permiso = objetoPermiso
        return res.status(200).jsonp(permiso);

    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
}

/**
 * Metodo para REGISTRAR DOCUMENTO DE RESPALDO DE PERMISO 
 * @returns Retorna mensaje actualizacion.
 
 export const GuardarDocumentoPermiso = async (req: Request, res: Response): Promise<void> => {
    let list: any = req.body;

    console.log('documento: ',list);
    let doc = list.uploads[0].path.split("\\")[1];
    console.log('ver path ... ', list.uploads[0].path)
        let { doc_nombre } = req.params;
    await pool.query(
        `
        INSERT INTO docmentacion (doc, doc_nombre) VALUES ($1, $2)
        `
        , [doc, doc_nombre]);
    res.jsonp({ message: 'Documento Actualizado' });
}*/

/**
 * Metodo para actualizar registro de permiso solo en estado pendiente
 * @returns Retorna mensaje actualizacion.
 */
export const putPermiso = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id, fecha_creacion, descripcion, fecha_inicio, fecha_final, dias_permiso, legalizado, dia_libre, id_tipo_permiso,
            horas_permiso,
            documento, estado, hora_salida, hora_ingreso, user_name, ip } = req.body;
        console.log(req.body);

        await pool.query('BEGIN');

        const solicitudPermisoBuscada = await pool.query('SELECT * FROM mp_solicitud_permiso WHERE id = $1', [id]);
        const [datosOriginales] = solicitudPermisoBuscada.rows;

        if (!datosOriginales) {
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'mp_solicitud_permiso',
                usuario: user_name,
                accion: 'U',
                datosOriginales: '',
                datosNuevos: '',
                ip: ip,
                observacion: `Error al actualizar el permiso con id: ${id}. Registro no encontrado`
            });
            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.status(404).jsonp({ message: 'Registro no encontrado' });
        }


        if (estado === 1) {
            const response: QueryResult = await pool.query(
                `
                UPDATE mp_solicitud_permiso SET fecha_creacion = $2 , descripcion = $3, fecha_inicio = $4, fecha_final = $5, 
                dias_permiso = $6, legalizado = $7, dia_libre = $8, id_tipo_permiso = $9, horas_permiso = $10, documento = $11, 
                estado = $12, hora_salida = $13, hora_ingreso = $14
                WHERE id = $1  RETURNING *
                `,
                [id, fecha_creacion, descripcion, fecha_inicio, fecha_final, dias_permiso, legalizado, dia_libre, id_tipo_permiso,
                    horas_permiso,
                    documento, estado, hora_salida, hora_ingreso]);


            const fechaCreacionO = await FormatearFecha2(datosOriginales.fecha_creacion.toLocaleString(), 'ddd');
            const fechaInicioO = await FormatearFecha2(datosOriginales.fecha_inicio.toLocaleString(), 'ddd');
            const fechaFinO = await FormatearFecha2(datosOriginales.fecha_final.toLocaleString(), 'ddd');
            const horaIngresoO = await FormatearHora(datosOriginales.hora_ingreso);
            const horaSalidaO = await FormatearHora(datosOriginales.hora_salida);
            const horasPermisoO = await FormatearHora(datosOriginales.horas_permiso);

            const fechaCreacionN = await FormatearFecha2(fecha_creacion.toLocaleString(), 'ddd');
            const fechaInicioN = await FormatearFecha2(fecha_inicio.toLocaleString(), 'ddd');
            const fechaFinN = await FormatearFecha2(fecha_final.toLocaleString(), 'ddd');
            const horaIngresoN = await FormatearHora(hora_ingreso);
            const horaSalidaN = await FormatearHora(hora_salida);
            const horasPermisoN = await FormatearHora(horas_permiso);

            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'mp_solicitud_permiso',
                usuario: user_name,
                accion: 'U',
                datosOriginales: `{id_empleado_contrato: ${datosOriginales.id_empleado_contrato}, id_empleado_cargo: ${datosOriginales.id_empleado_cargo}, id_periodo_vacacion: ${datosOriginales.id_periodo_vacacion}, fecha_creacion: ${fechaCreacionO}, fecha_edicion: null, numero_permiso: ${datosOriginales.numero_permiso}, descripcion: ${datosOriginales.descripcion}, id_tipo_permiso: ${datosOriginales.id_tipo_permiso}, fecha_inicio: ${fechaInicioO}, fecha_final: ${fechaFinO}, hora_salida: ${horaSalidaO}, hora_ingreso: ${horaIngresoO}, dias_permiso: ${datosOriginales.dias_permiso}, dia_libre: ${datosOriginales.dia_libre}, horas_permiso: ${datosOriginales.horasPermisoN}, documento: ${datosOriginales.documento}, legalizado: ${datosOriginales.legalizado}, estado: ${datosOriginales.estado}, id_empleado: ${datosOriginales.id_empleado}}`,
                datosNuevos: `{id_empleado_contrato: ${datosOriginales.id_empleado_contrato}, id_empleado_cargo: ${datosOriginales.id_empleado_cargo}, id_periodo_vacacion: ${datosOriginales.id_periodo_vacacion}, fecha_creacion: ${fechaCreacionN}, fecha_edicion: null, numero_permiso: ${datosOriginales.numero_permiso}, descripcion: ${datosOriginales.descripcion}, id_tipo_permiso: ${datosOriginales.id_tipo_permiso}, fecha_inicio: ${fechaInicioN}, fecha_final: ${fechaFinN}, hora_salida: ${horaSalidaN}, hora_ingreso: ${horaIngresoN}, dias_permiso: ${dias_permiso}, dia_libre: ${dia_libre}, horas_permiso: ${horasPermisoN}, documento: ${documento}, legalizado: ${legalizado}, estado: ${estado}, id_empleado: ${datosOriginales.id_empleado}}`,
                ip: ip,
                observacion: null
            });

            await pool.query('COMMIT');
            const [objetoPermiso] = response.rows;

            if (objetoPermiso) {
                return res.status(200).jsonp(objetoPermiso);
            } else {

                return res.status(400).jsonp({ message: 'No se actualizo el registro.' });
            }
        }

        return res.status(400).jsonp({ message: 'El estado debe ser pendiente para editar la solicitud.' });
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
}

export const pruebaConsulta = async (req: Request, res: Response): Promise<Response> => {
    const query = `SELECT p.* FROM mp_solicitud_permiso p`
    const response = await pool.query(query);
    const permisos = response.rows;
    return res.status(200).jsonp(permisos);

    //return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
}