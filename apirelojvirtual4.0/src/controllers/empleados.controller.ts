import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';
import { Empleado, Ubicacion } from '../interfaces/Empleados';
import { HorarioE } from '../interfaces/Horarios';

export const getListaEmpleados = async (req: Request, res: Response): Promise<Response> => {
    try {
        const response: QueryResult = await pool.query('SELECT id, cedula, codigo, (nombre || \' \' || apellido) as fullname FROM empleados ORDER BY fullname ASC');
        const empleados: Empleado[] = response.rows;
        console.log(empleados);

        return res.status(200).jsonp(empleados);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

export const getUbicacion = async (req: Request, res: Response): Promise<Response> => {
    try {
        const codigo = parseInt(req.params.codigo);
        const response: QueryResult = await pool.query('SELECT longitud, latitud FROM empleados WHERE codigo = $1', [codigo]);
        const ubicacion: Ubicacion[] = response.rows;
        console.log(ubicacion);

        return res.status(200).jsonp(ubicacion);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

export const getListaHorariosEmpleadoByCodigo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { codigo } = req.query;
        console.log(codigo);

        const response: QueryResult = await pool.query('SELECT id, codigo, CAST(fec_inicio AS VARCHAR), CAST(fec_final AS VARCHAR), lunes, martes, miercoles, jueves, viernes, sabado, domingo, id_horarios FROM empl_horarios WHERE codigo = $1', [codigo]);
        const horarios: HorarioE[] = response.rows;

        if (horarios.length === 0) return res.status(200).jsonp([]);
        const deta_horarios = await Promise.all(horarios.map(async (o) => {
            const result: QueryResult = await pool.query('SELECT hora, minu_espera, orden, tipo_accion FROM deta_horarios WHERE id_horario = $1 ORDER BY orden ASC', [o.id_horarios])
            console.log(result.rows);
            o.detalle_horario = result.rows
            return o
        }))

        console.log(deta_horarios);

        return res.status(200).jsonp(deta_horarios);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

export const getOneHorarioEmpleadoByCodigo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { codigo, fecha_hoy } = req.query;

        const response: QueryResult = await pool.query('SELECT id, codigo, CAST(fec_inicio AS VARCHAR), CAST(fec_final AS VARCHAR), lunes, martes, miercoles, jueves, viernes, sabado, domingo, id_horarios FROM empl_horarios WHERE codigo = $1 AND fec_inicio <= $2 AND fec_final >= $2 ', [codigo, fecha_hoy]);
        const horarios: HorarioE[] = response.rows;

        if (horarios.length === 0) return res.status(400).jsonp({ message: 'No hay horario para realizar solicitudes' });

        const [deta_horarios] = await Promise.all(horarios.map(async (o) => {
            const result: QueryResult = await pool.query('SELECT hora, minu_espera, orden, tipo_accion FROM deta_horarios WHERE id_horario = $1 ORDER BY orden ASC', [o.id_horarios])
            console.log(result.rows);
            o.detalle_horario = result.rows
            return o
        }))

        return res.status(200).jsonp(deta_horarios);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};

export const getInformarEmpleadoAutoriza = async (req: Request, res: Response): Promise<Response> => {
    try{
        const { id_empleado } = req.params;
        const DATOS = await pool.query(
            `
            SELECT (da.nombre ||' '|| da.apellido) AS fullname, da.cedula, tc.cargo, 
                cd.nombre AS departamento
            FROM datos_actuales_empleado AS da, empl_cargos AS ec, tipo_cargo AS tc,
                cg_departamentos AS cd
            WHERE da.id_cargo = ec.id AND ec.cargo = tc.id AND cd.id = da.id_departamento AND 
            da.id = $1
            `
            , [id_empleado]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }

    }catch(error){
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
}