import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';
import { Auditoria } from '../interfaces/Auditoria'


// INSERTAR REGISTRO DE AUDITORIA
export const InsertarAuditoria = async (data: Auditoria) => {
    try {
        const { tabla, usuario, accion, datosOriginales, datosNuevos, ip, observacion } = data;
        let plataforma = "APLICACION MOVIL"
        await pool.query(
            `
            INSERT INTO audit.auditoria (plataforma, table_name, user_name, fecha_hora,
                action, original_data, new_data, ip_address, observacion) 
            VALUES ($1, $2, $3, now(), $4, $5, $6, $7, $8)
            `
            ,
            [plataforma, tabla, usuario, accion, datosOriginales, datosNuevos, ip, observacion]);
    } catch (error) {
        throw error;
    }
};
