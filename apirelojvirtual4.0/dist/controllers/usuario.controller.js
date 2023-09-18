"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObtenerDepartamentoUsuarios = exports.getidDispositivo = exports.ingresarIDdispositivo = exports.actualizarIDcelular = exports.getUserByIdEmpresa = exports.getEmpleadosActivos = exports.getUserAdmin = exports.loginUsuario = exports.getUserById = exports.getUsers = void 0;
const md5_typescript_1 = require("md5-typescript");
const database_1 = require("../database");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT * FROM usuarios ORDER BY usuario ASC');
        const usuarios = response.rows;
        return res.status(200).jsonp(usuarios);
    }
    catch (e) {
        console.log(e);
        return res.status(500).jsonp({
            message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 ' +
                'o https://casapazmino.com.ec'
        });
    }
});
exports.getUsers = getUsers;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const response = yield database_1.pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);
        const usuarios = response.rows;
        return res.jsonp(usuarios[0]);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({
            message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 ' +
                'o https://casapazmino.com.ec'
        });
    }
});
exports.getUserById = getUserById;
const loginUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let caducidad_licencia = new Date();
        const { usuario, contrasena } = req.body;
        const response = yield database_1.pool.query('SELECT e.id AS id_registro_empleado, e.codigo as idEmpleado, ' +
            'e.cedula, e.apellido, e.nombre, e.esta_civil, e.genero, e.correo, e.fec_nacimiento, ' +
            'e.estado as eestado, e.mail_alternativo, e.domicilio, e.telefono, e.id_nacionalidad, ' +
            'e.imagen, e.codigo, e.latitud, e.longitud, u.id as id, u.usuario, u.contrasena, ' +
            'u.estado as estado, u.id_rol, u.id_empleado, u.app_habilita, frase ' +
            'FROM usuarios as u inner join empleados as e on u.id_empleado = e.id WHERE usuario = $1;', [usuario]);
        const usuarios = response.rows;
        if (usuarios.length === 0)
            return res.status(401).jsonp({
                message: 'No existe el usuario ingresado'
            });
        const { id_registro_empleado, eestado } = usuarios[0];
        if (eestado === 2)
            return res.status(401).jsonp({
                message: 'Usuario desactivado del sistema.'
            });
        const [data_empresa] = yield database_1.pool.query('SELECT e.id as id_contrato, c.hora_trabaja, ' +
            'c.id_departamento, c.id_sucursal, s.id_empresa, c.id AS id_cargo, cg_e.acciones_timbres, ' +
            'cg_e.public_key, (SELECT id FROM peri_vacaciones pv WHERE pv.codigo = empl.codigo ' +
            'ORDER BY pv.fec_inicio DESC LIMIT 1 ) as id_peri_vacacion, ' +
            '(SELECT nombre FROM cg_departamentos cd WHERE cd.id = c.id_departamento ) AS ndepartamento ' +
            'FROM empl_contratos AS e, empl_cargos AS c, sucursales AS s, cg_empresa AS cg_e, ' +
            'empleados AS empl ' +
            'WHERE e.id_empleado = $1 AND e.id_empleado = empl.id AND ' +
            '(SELECT id_contrato FROM datos_actuales_empleado WHERE id = e.id_empleado) = e.id AND ' +
            '(SELECT id_cargo FROM datos_actuales_empleado WHERE id = e.id_empleado) = c.id AND ' +
            'c.id_sucursal = s.id AND ' +
            's.id_empresa = cg_e.id ORDER BY c.fec_inicio DESC LIMIT 1', [id_registro_empleado])
            .then(result => { return result.rows; });
        if (data_empresa === undefined)
            return res.status(401).jsonp({
                message: 'El usuario no tiene información de contrato, cargo, sucursal o empresa válida.'
            });
        const { public_key, id_empresa, acciones_timbres } = data_empresa;
        if (!public_key)
            return res.status(404).
                jsonp({ message: 'No tiene asignada una licencia de uso de la aplicacion.' });
        try {
            const data = fs_1.default.readFileSync('licencia.conf.json', 'utf8');
            const FileLicencias = JSON.parse(data);
            console.log(public_key);
            const ok_licencias = FileLicencias.filter((o) => {
                return o.public_key === public_key;
            }).map((o) => {
                o.fec_activacion = new Date(o.fec_activacion),
                    o.fec_desactivacion = new Date(o.fec_desactivacion);
                return o;
            });
            console.log(ok_licencias);
            if (ok_licencias.length === 0)
                return res.status(404).jsonp({
                    message: 'La licencia no existe, consulte a soporte técnico'
                });
            const hoy = new Date();
            const { fec_activacion, fec_desactivacion } = ok_licencias[0];
            if (hoy > fec_desactivacion)
                return res.status(404).jsonp({
                    message: 'La licencia a expirado.'
                });
            if (hoy < fec_activacion)
                return res.status(404).jsonp({
                    message: 'La licencia a expirado.'
                });
            caducidad_licencia = fec_desactivacion;
        }
        catch (error) {
            console.log(error);
            return res.status(404).jsonp({ message: 'No existe registro de licencias.' });
        }
        try {
            if (yield compararContraseña(contrasena, usuarios[0].contrasena)) {
                if (usuarios[0].app_habilita) {
                    const token = jsonwebtoken_1.default.sign({
                        _id: usuarios[0].usuario, _idEmpresa: id_empresa,
                        _licencia: public_key, _acciones_timbres: acciones_timbres
                    }, process.env.TOKEN_SECRETO || "masSeguridad");
                    usuarios[0].contrasena = '';
                    const [config_noti] = yield database_1.pool.query('SELECT * FROM config_noti WHERE id_empleado = $1', [id_registro_empleado]).then(result => { return result.rows; });
                    // CONSULTA DE VACUNA
                    const [vacuna] = yield database_1.pool.query(`
                    SELECT ev.id, ev.id_empleado, ev.id_tipo_vacuna, ev.carnet, ev.nom_carnet, ev.fecha, 
                    tv.nombre, ev.descripcion
                    FROM empl_vacunas AS ev, tipo_vacuna AS tv 
                    WHERE ev.id_tipo_vacuna = tv.id AND ev.id_empleado = $1
                    ORDER BY ev.id DESC LIMIT 1
                    `, [id_registro_empleado]).then(result => { return result.rows; });
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
                    });
                }
                else {
                    delete usuarios[0];
                    return res.status(401).jsonp({
                        message: 'Usuario inactivo para reloj virtual.',
                        body: {
                            usuario: usuarios[0]
                        }
                    });
                }
            }
            else {
                delete usuarios[0];
                return res.status(401).jsonp({
                    message: 'Usuario o Contraseña Incorrectos.',
                    body: {
                        usuario: usuarios[0]
                    }
                });
            }
        }
        catch (error) {
            console.log(error);
            return res.status(401).jsonp({ message: 'No existe el usuario ingresado' });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).
            jsonp({
            message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 ' +
                'o https://casapazmino.com.ec'
        });
    }
});
exports.loginUsuario = loginUsuario;
const getUserAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query("SELECT *, CASE when user_estado = true THEN 'Activo' when user_estado = false THEN 'Inactivo' ELSE 'other' END FROM usuario WHERE id_rol = 0");
        const empresa = response.rows;
        return res.jsonp(empresa);
    }
    catch (error) {
        console.log(error);
        return res.status(500).
            jsonp({
            message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 ' +
                'o https://casapazmino.com.ec'
        });
    }
});
exports.getUserAdmin = getUserAdmin;
const getEmpleadosActivos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT e.cedula, e.codigo, ' +
            '( e.apellido || \' \' || e.nombre) as fullname, e.id, u.id_rol, u.usuario ' +
            'FROM empleados AS e, usuarios AS u WHERE e.id = u.id_empleado AND e.estado = 1 ORDER BY fullname');
        const usuarios = response.rows;
        console.log(usuarios);
        return res.jsonp(usuarios);
    }
    catch (error) {
        console.log(error);
        return res.status(500).
            jsonp({
            message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 ' +
                'o https://casapazmino.com.ec'
        });
    }
});
exports.getEmpleadosActivos = getEmpleadosActivos;
const getUserByIdEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const response = yield database_1.pool.query("SELECT *, CASE WHEN user_estado =true THEN 'Activo' WHEN user_estado =false THEN 'Inactivo' ELSE 'other'END FROM usuario WHERE id_empresa = $1 order by apellido", [id]);
        const usuarios = response.rows;
        return res.jsonp(usuarios);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({
            message: 'Contactese con el Administrador del sistema ' +
                '(593) 2 – 252-7663 o https://casapazmino.com.ec'
        });
    }
});
exports.getUserByIdEmpresa = getUserByIdEmpresa;
const compararContraseña = function (contrasena_ingresada, contrasena_bdd) {
    return __awaiter(this, void 0, void 0, function* () {
        if (md5_typescript_1.Md5.init(contrasena_ingresada) === contrasena_bdd) {
            return true;
        }
        else {
            return false;
        }
    });
};
const actualizarIDcelular = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id_usuario = (req.params.id_usuario);
        const { id_celular } = req.body;
        const response = yield database_1.pool.query('UPDATE usuarios SET id_dispositivo = $1 WHERE id = $2', [id_celular, id_usuario]);
        res.status(200).jsonp({
            body: {
                mensaje: "Celular Registrado ",
                response: response.rowCount
            }
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Error para registrar el celular, Revise su conexion a la red.' });
    }
});
exports.actualizarIDcelular = actualizarIDcelular;
const ingresarIDdispositivo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_empleado, id_celular, modelo_dispositivo } = req.body;
        const [Response] = yield database_1.pool.query('INSERT INTO id_dispositivos(id_empleado, id_dispositivo, modelo_dispositivo)' +
            'VALUES ($1, $2, $3) RETURNING *', [id_empleado, id_celular, modelo_dispositivo]).then(res => {
            return res.rows;
        });
        if (!Response)
            return res.status(400).jsonp({ message: "El dispositivo no se Registro" });
        return res.status(200).jsonp({
            body: {
                mensaje: "Celular Registrado ",
                response: Response.rowCount
            }
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Error para registrar el celular, Revise su conexion a la red.' });
    }
});
exports.ingresarIDdispositivo = ingresarIDdispositivo;
const getidDispositivo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id_empleado = req.params.id_empleado;
        const response = yield database_1.pool.query(`SELECT * FROM id_dispositivos WHERE id_empleado = ${id_empleado} ORDER BY id ASC `);
        const IdDispositivos = response.rows;
        return res.jsonp(IdDispositivos);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({
            message: 'Ups! Problemas para conectar con el servidor' +
                '(593) 2 – 252-7663 o https://casapazmino.com.ec'
        });
    }
});
exports.getidDispositivo = getidDispositivo;
/**
 * BUSCAR DEPARTAMENTOS POR EL ID DEL USUARIOS.
 * @returns
 */
const ObtenerDepartamentoUsuarios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_empleado } = req.params;
        const EMPLEADO = yield database_1.pool.query(`
            SELECT e.id, e.id_departamento, e.id_contrato, cg_departamentos.nombre FROM datos_actuales_empleado AS e 
            INNER JOIN cg_departamentos ON e.id_departamento = cg_departamentos.id 
            WHERE id_contrato = $1
            `, [id_empleado]);
        if (EMPLEADO.rowCount > 0) {
            return res.status(200).jsonp(EMPLEADO.rows);
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados' });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.ObtenerDepartamentoUsuarios = ObtenerDepartamentoUsuarios;
