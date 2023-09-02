// IMPORTAR LIBRERIAS
import { Licencias } from '../interfaces/Licencia';
import { Usuario } from '../interfaces/Usuario'
import { IdDispositivos } from '../interfaces/Usuario';
import { Request, Response } from 'express';
import { Md5 } from "md5-typescript";
import { pool } from '../database';
import { QueryResult } from 'pg';
import jwt from 'jsonwebtoken';
import fs from 'fs';


export const getUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
        const response: QueryResult = await
            pool.query('SELECT * FROM usuarios ORDER BY usuario ASC');
        const usuarios: Usuario[] = response.rows;
        return res.status(200).jsonp(usuarios);
    } catch (e) {
        console.log(e);
        return res.status(500).jsonp(
            {
                message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 ' +
                    'o https://casapazmino.com.ec'
            });
    }
};

export const getUserById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const response: QueryResult = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);
        const usuarios: Usuario[] = response.rows;
        return res.jsonp(usuarios[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({
            message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 ' +
                'o https://casapazmino.com.ec'
        });
    }
};

export const loginUsuario = async (req: Request, res: Response) => {
    try {
        let caducidad_licencia: Date = new Date();
        const { usuario, contrasena} = req.body;

        const response = await pool.query('SELECT e.id AS id_registro_empleado, e.codigo as idEmpleado, ' +
            'e.cedula, e.apellido, e.nombre, e.esta_civil, e.genero, e.correo, e.fec_nacimiento, ' +
            'e.estado as eestado, e.mail_alternativo, e.domicilio, e.telefono, e.id_nacionalidad, ' +
            'e.imagen, e.codigo, e.latitud, e.longitud, u.id as id, u.usuario, u.contrasena, ' +
            'u.estado as estado, u.id_rol, u.id_empleado, u.app_habilita, frase ' +
            'FROM usuarios as u inner join empleados as e on u.id_empleado = e.id WHERE usuario = $1;',
            [usuario]);

        const usuarios: Usuario[] = response.rows;

        if (usuarios.length === 0) return res.status(401).jsonp({ // NO EXISTE USUARIO CON ESE NOMBRE.
            message: 'No existe el usuario ingresado'
        })

        const { id_registro_empleado, eestado } = usuarios[0];

        if (eestado === 2) return res.status(401).jsonp({ // ESTADO DEL EMPLEADO DESACTIVADO DEL SISTEMA.
            message: 'Usuario desactivado del sistema.'
        })

        const [data_empresa] = await pool.query('SELECT e.id as id_contrato, c.hora_trabaja, ' +
            'c.id_departamento, c.id_sucursal, s.id_empresa, c.id AS id_cargo, cg_e.acciones_timbres, ' +
            'cg_e.public_key, (SELECT id FROM peri_vacaciones pv WHERE pv.codigo = empl.codigo::int ' +
            'ORDER BY pv.fec_inicio DESC LIMIT 1 ) as id_peri_vacacion, ' +
            '(SELECT nombre FROM cg_departamentos cd WHERE cd.id = c.id_departamento ) AS ndepartamento ' +
            'FROM empl_contratos AS e, empl_cargos AS c, sucursales AS s, cg_empresa AS cg_e, ' +
            'empleados AS empl ' +
            'WHERE e.id_empleado = $1 AND e.id_empleado = empl.id AND ' +
            '(SELECT id_contrato FROM datos_actuales_empleado WHERE id = e.id_empleado) = e.id AND ' +
            '(SELECT id_cargo FROM datos_actuales_empleado WHERE id = e.id_empleado) = c.id AND ' +
            'c.id_sucursal = s.id AND ' +
            's.id_empresa = cg_e.id ORDER BY c.fec_inicio DESC LIMIT 1',
            [id_registro_empleado])
            .then(result => { return result.rows })

        if (data_empresa === undefined) return res.status(401).jsonp({
            message: 'El usuario no tiene información de contrato, cargo, sucursal o empresa válida.'
        })

        const { public_key, id_empresa, acciones_timbres } = data_empresa;

        if (!public_key) return res.status(404).
            jsonp({ message: 'No tiene asignada una licencia de uso de la aplicacion.' })

        try {
            const data = fs.readFileSync('licencia.conf.json', 'utf8')
            const FileLicencias = JSON.parse(data);
            console.log(public_key);
            const ok_licencias = FileLicencias.filter((o: Licencias) => {
                return o.public_key === public_key
            }).map((o: Licencias) => {
                o.fec_activacion = new Date(o.fec_activacion),
                    o.fec_desactivacion = new Date(o.fec_desactivacion)
                return o
            })
            console.log(ok_licencias);
            if (ok_licencias.length === 0) return res.status(404).jsonp({ 
                message: 'La licencia no existe, consulte a soporte técnico'
            });

            const hoy = new Date();

            const { fec_activacion, fec_desactivacion } = ok_licencias[0];
            if (hoy > fec_desactivacion) return res.status(404).jsonp({
                message: 'La licencia a expirado.'
            });
            if (hoy < fec_activacion) return res.status(404).jsonp({
                message: 'La licencia a expirado.'
            });

            caducidad_licencia = fec_desactivacion
        } catch (error) {
            console.log(error);
            return res.status(404).jsonp({ message: 'No existe registro de licencias.' });
        }

        try {

            if (await compararContraseña(contrasena, usuarios[0].contrasena)) {
                if (usuarios[0].app_habilita) {
                    const token: string = jwt.sign({
                        _id: usuarios[0].usuario, _idEmpresa: id_empresa,
                        _licencia: public_key, _acciones_timbres: acciones_timbres
                    },
                    process.env.TOKEN_SECRETO || "masSeguridad")
                    usuarios[0].contrasena = '';
                    const [config_noti] = await pool.query('SELECT * FROM config_noti WHERE id_empleado = $1',
                    [id_registro_empleado]).then(result => { return result.rows })
        
                    // CONSULTA DE VACUNA
                    const [vacuna] = await pool.query(
                    `
                    SELECT ev.id, ev.id_empleado, ev.id_tipo_vacuna, ev.carnet, ev.nom_carnet, ev.fecha, 
                    tv.nombre, ev.descripcion
                    FROM empl_vacunas AS ev, tipo_vacuna AS tv 
                    WHERE ev.id_tipo_vacuna = tv.id AND ev.id_empleado = $1
                    ORDER BY ev.id DESC LIMIT 1
                    `,
                    [id_registro_empleado]).then(result => { return result.rows })
                    //const vacuna = 'undefined'
                    return res.status(200).jsonp({
                        message: 'Ingreso exitoso',
                        body: {
                                autorizacion: token,
                                usuario: usuarios[0],
                                empresa: data_empresa,
                                config_noti,
                                app: {
                                    caducidad_licencia,
                                    version: '4.0.0'
                                },
                                vacuna: vacuna
                            }
                        })

                } else {
                    delete usuarios[0]
                    return res.status(401).jsonp({
                        message: 'Usuario inactivo para reloj virtual.',
                        body: {
                            usuario: usuarios[0]
                        }
                    })
                }

            } else {
                delete usuarios[0]
                return res.status(401).jsonp({
                    message: 'Usuario o Contraseña Incorrectos.',
                    body: {
                        usuario: usuarios[0]
                    }
                })
            }

        } catch (error) {
            console.log(error);
            return res.status(401).jsonp({ message: 'No existe el usuario ingresado' });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).
            jsonp({
                message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 ' +
                    'o https://casapazmino.com.ec'
            });
    }

};


export const getUserAdmin = async (req: Request, res: Response): Promise<Response> => {
    try {
        const response: QueryResult = await pool.query("SELECT *, CASE when user_estado = true THEN 'Activo' when user_estado = false THEN 'Inactivo' ELSE 'other' END FROM usuario WHERE id_rol = 0");
        const empresa: Usuario[] = response.rows;
        return res.jsonp(empresa)
    } catch (error) {
        console.log(error);
        return res.status(500).
            jsonp({
                message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 ' +
                    'o https://casapazmino.com.ec'
            })
    }
}

export const getEmpleadosActivos = async (req: Request, res: Response): Promise<Response> => {
    try {
        const response: QueryResult = await pool.query('SELECT e.cedula, e.codigo, ' +
            '( e.apellido || \' \' || e.nombre) as fullname, e.id, u.id_rol, u.usuario ' +
            'FROM empleados AS e, usuarios AS u WHERE e.id = u.id_empleado AND e.estado = 1 ORDER BY fullname');
        const usuarios = response.rows;
        console.log(usuarios);
        return res.jsonp(usuarios);
    } catch (error) {
        console.log(error);
        return res.status(500).
            jsonp({
                message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 ' +
                    'o https://casapazmino.com.ec'
            });
    }
};


export const getUserByIdEmpresa = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const response: QueryResult = await pool.query("SELECT *, CASE WHEN user_estado =true THEN 'Activo' WHEN user_estado =false THEN 'Inactivo' ELSE 'other'END FROM usuario WHERE id_empresa = $1 order by apellido", [id]);
        const usuarios: Usuario[] = response.rows;
        return res.jsonp(usuarios);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({
            message: 'Contactese con el Administrador del sistema ' +
                '(593) 2 – 252-7663 o https://casapazmino.com.ec'
        });
    }
};

const compararContraseña = async function (contrasena_ingresada: string, contrasena_bdd: string): Promise<boolean> {
    if (Md5.init(contrasena_ingresada) === contrasena_bdd) {
        return true;
    } else {
        return false;
    }
};


export const actualizarIDcelular = async (req: Request, res: Response) => {
    try {
        const id_usuario = (req.params.id_usuario);
        const { id_celular } = req.body;
        const response = await pool.query(
            'UPDATE usuarios SET id_dispositivo = $1 WHERE id = $2',
            [id_celular, id_usuario]
        )
        res.status(200).jsonp({
            body: {
                mensaje: "Celular Registrado ",
                response: response.rowCount
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Error para registrar el celular, Revise su conexion a la red.' });
    }
};

export const ingresarIDdispositivo = async (req: Request, res: Response) => {
    try {
        const { id_empleado, id_celular, modelo_dispositivo } = req.body;
        const [Response] = await pool.query(
            'INSERT INTO id_dispositivos(id_empleado, id_dispositivo, modelo_dispositivo)' + 
            'VALUES ($1, $2, $3) RETURNING *',
            [id_empleado, id_celular, modelo_dispositivo]
        ).then(res => {
            return res.rows;
        });

        if(!Response) return res.status(400).jsonp({message: "El dispositivo no se Registro"});

        return res.status(200).jsonp({
            body: {
                mensaje: "Celular Registrado ",
                response: Response.rowCount
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Error para registrar el celular, Revise su conexion a la red.' });
    }
};

export const getidDispositivo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id_empleado = req.params.id_empleado;
        const response: QueryResult = await pool.query(`SELECT * FROM id_dispositivos WHERE id_empleado = ${id_empleado} ORDER BY id ASC `);
        const IdDispositivos: IdDispositivos[] = response.rows;
        return res.jsonp(IdDispositivos);
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({
            message: 'Ups! Problemas para conectar con el servidor' +
                '(593) 2 – 252-7663 o https://casapazmino.com.ec'
        });
    }
};


/**
 * BUSCAR DEPARTAMENTOS POR EL ID DEL USUARIOS. 
 * @returns 
 */
export const ObtenerDepartamentoUsuarios = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id_empleado } = req.params;
        const EMPLEADO = await pool.query(
            `
            SELECT e.id, e.id_departamento, e.id_contrato, cg_departamentos.nombre FROM datos_actuales_empleado AS e 
            INNER JOIN cg_departamentos ON e.id_departamento = cg_departamentos.id 
            WHERE id_contrato = $1
            `
            ,[id_empleado]);

        if (EMPLEADO.rowCount > 0){
            return res.status(200).jsonp(EMPLEADO.rows);
        }else{
            return res.status(404).jsonp({ text: 'Registros no encontrados' });
        } 
    } catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
};












