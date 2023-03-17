import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';
import { Autorizacion } from '../interfaces/Autorizaciones';
import { Permiso } from '../interfaces/Permisos';

/**
 * Obtener registro de la tabla de Autorizaciones
 * @returns 
 */
export const getAutorizacion = async (req: Request, res: Response): Promise<Response> => {
    try {

        const { id_auto, campo } = req.query;
        const subquery1 = `( select i.nombre from cg_departamentos i where i.id = a.id_departamento ) AS ndepartamento `;
        const query = `SELECT a.*, ${subquery1} FROM autorizaciones a WHERE a.${campo} = ${id_auto}`

        const response: QueryResult = await pool.query(query);
        const [autorizacion]: Autorizacion[] = response.rows;
        if (!autorizacion) return res.status(400).jsonp({ message: 'No hay autorización' });
        return res.status(200).jsonp(autorizacion);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Insertar nuevo registro de la tabla de Autorizaciones
 * @returns 
 */
export const postAutorizacion = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { orden, estado, id_departamento, id_permiso, id_vacacion, id_hora_extra, id_documento, id_plan_hora_extra } = req.body;

        const response: QueryResult = await pool.query('INSERT INTO autorizaciones( orden, estado, id_departamento, id_permiso, id_vacacion, id_hora_extra, id_documento, id_plan_hora_extra ) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING * ', [orden, estado, id_departamento, id_permiso, id_vacacion, id_hora_extra, id_documento, id_plan_hora_extra]);
        const [autorizacion]: Autorizacion[] = response.rows;
        if (!autorizacion) return res.status(400).jsonp({ message: 'No se creo autorización' });
        return res.status(200).jsonp({ message: 'Autorización creada' });
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * Actualizar registro de la tabla de Autorizaciones
 * @returns 
 */
export const updateAutorizacion = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id_auto, campo } = req.query;
        const { estado, id_documento } = req.body;

        const query = `UPDATE autorizaciones SET estado = ${estado} , id_documento = \'${id_documento}\' WHERE ${campo} = ${id_auto} RETURNING *`;

        const response: QueryResult = await pool.query(query);
        const [autorizacion]: Autorizacion[] = response.rows;
        if (!autorizacion) return res.status(400).jsonp({ message: 'No hay autorización' });

        return res.status(200).jsonp(autorizacion);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};


/**
 * Actualizar registro de tablas de permisos, horas extras y vacaciones solo el estado de la solicitud. 
 * @returns 
 */
export const updateEstadoSolicitudes = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { nameTable } = req.query;
        const { estado, id_solicitud } = req.body;

        const query = `UPDATE ${nameTable} SET estado = ${estado} WHERE id = ${id_solicitud} RETURNING * `;

        const response: QueryResult = await pool.query(query);
        const [solicitud]: any[] = response.rows;
        if (!solicitud) return res.status(400).jsonp({ message: 'No se actualizo la solicitud' });

        return res.status(200).jsonp({ message: 'Solicitud actualizada' });
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

/**
 * BUSQUEDA DE DATOS DE JEFES DE DEPARTAMENTO. 
 * @returns 
 */

// METODO PARA BUSCAR JEFES
export const BuscarJefes = async (req: Request, res: Response): Promise<Response> => {

    const { objeto, depa_user_loggin } = req.body;

    const permiso = objeto
    console.log(permiso);

    const JefesDepartamentos = await pool.query(
        `
                    SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc,
                    cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato,
                    e.id AS empleado, (e.nombre || ' ' || e.apellido) as fullname , e.cedula, e.correo,
                    c.permiso_mail, c.permiso_noti, c.vaca_mail, c.vaca_noti, c.hora_extra_mail, 
                    c.hora_extra_noti, c.comida_mail, c.comida_noti
                    FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, 
                    sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c 
                    WHERE da.id_departamento = $1 AND 
                    da.id_empl_cargo = ecr.id AND 
                    da.id_departamento = cg.id AND
                    da.estado = true AND 
                    cg.id_sucursal = s.id AND
                    ecr.id_empl_contrato = ecn.id AND
                    ecn.id_empleado = e.id AND
                    e.id = c.id_empleado
                    `
        ,
        [depa_user_loggin]).then(result => { return result.rows });

    if (JefesDepartamentos.length === 0) return res.status(400)
        .jsonp({ message: 'Ups !!! algo salio mal. Solicitud ingresada, pero es necesario verificar configuraciones jefes de departamento.' });

    const [obj] = JefesDepartamentos;
    let depa_padre = obj.depa_padre;
    let JefeDepaPadre;

    if (depa_padre !== null) {
        do {
            JefeDepaPadre = await pool.query(
                `
                            SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, 
                            cg.nivel, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, 
                            ecr.id AS cargo, ecn.id AS contrato, e.id AS empleado, 
                            (e.nombre || ' ' || e.apellido) as fullname, e.cedula, e.correo, c.permiso_mail, 
                            c.permiso_noti, c.vaca_mail, c.vaca_noti, c.hora_extra_mail, 
                            c.hora_extra_noti, c.comida_mail, c.comida_noti
                            FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, 
                            sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c 
                            WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND 
                            da.id_departamento = cg.id AND 
                            da.estado = true AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND 
                            ecn.id_empleado = e.id AND e.id = c.id_empleado
                            `
                , [depa_padre]);

            depa_padre = JefeDepaPadre.rows[0].depa_padre;

            JefesDepartamentos.push(JefeDepaPadre.rows[0]);

        } while (depa_padre !== null);
        permiso.EmpleadosSendNotiEmail = JefesDepartamentos
        return res.status(200).jsonp(permiso);

    } else {
        permiso.EmpleadosSendNotiEmail = JefesDepartamentos
        return res.status(200).jsonp(permiso);
    }
}

