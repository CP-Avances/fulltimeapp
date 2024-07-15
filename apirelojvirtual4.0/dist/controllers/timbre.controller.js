"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.justificarAtraso = exports.FiltrarTimbre = exports.crearTimbreJustificadoAdmin = exports.crearTimbreDesconectado = exports.crearTimbre = exports.getTimbreById = void 0;
const database_1 = require("../database");
const AUDITORIA_CONTROLADOR = __importStar(require("../controllers/auditotia.controller"));
const metodos_1 = require("../libs/metodos");
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
const getTimbreById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.idUsuario);
        const response = yield database_1.pool.query('SELECT * FROM eu_timbres WHERE codigo = $1 ORDER BY fecha_hora_timbre DESC LIMIT 100', [id]);
        const timbres = response.rows;
        return res.jsonp(timbres);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getTimbreById = getTimbreById;
const crearTimbre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hoy = new Date();
        const timbre = req.body;
        yield database_1.pool.query('BEGIN');
        // Verificar el contenido de req.body
        console.log('Contenido de req.body:', timbre);
        timbre.fecha_hora_timbre_servidor = hoy.getFullYear() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getDate() + " " + hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getSeconds();
        const timbreRV = new Date(timbre.fecha_hora_timbre || '');
        const restaTimbresHoras = timbreRV.getHours() - hoy.getHours();
        const restaTimbresMinutos = timbreRV.getMinutes() - hoy.getMinutes();
        const restaTimbresDias = timbreRV.getDate() - hoy.getDate();
        if (restaTimbresDias != 0 || restaTimbresHoras != 0 || restaTimbresMinutos > 3 || restaTimbresMinutos < -3) {
            if (restaTimbresHoras == 1 && restaTimbresMinutos > 58 && restaTimbresMinutos < -58) {
                timbre.hora_timbre_diferente = false;
            }
            else if (restaTimbresDias == 1 && restaTimbresHoras == 23 || restaTimbresHoras == -23 && restaTimbresMinutos > 58 && restaTimbresMinutos < -58) {
                timbre.hora_timbre_diferente = false;
            }
            else {
                timbre.hora_timbre_diferente = true;
            }
        }
        else {
            timbre.hora_timbre_diferente = false;
        }
        // Verificar el valor de timbre.accion antes de la consulta
        console.log('Valor de timbre.accion:', timbre.accion);
        const response = yield database_1.pool.query('INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, ' +
            'observacion, latitud, longitud, codigo, id_reloj, tipo_autenticacion, ' +
            'dispositivo_timbre, fecha_hora_timbre_servidor, hora_timbre_diferente, ubicacion, conexion, fecha_subida_servidor, novedades_conexion, id_empleado) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17);', [timbre.fecha_hora_timbre, timbre.accion, timbre.tecla_funcion, timbre.observacion,
            timbre.latitud, timbre.longitud, timbre.codigo, timbre.id_reloj,
            timbre.tipo_autenticacion, timbre.dispositivo_timbre, timbre.fecha_hora_timbre_servidor,
            timbre.hora_timbre_diferente, timbre.ubicacion, timbre.conexion, timbre.fecha_subida_servidor, timbre.novedades_conexion, timbre.id_empleado]);
        const fechaHora = yield (0, metodos_1.FormatearHora)(timbre.fecha_hora_timbre.toLocaleString().split(' ')[1]);
        const fechaTimbre = yield (0, metodos_1.FormatearFecha2)(timbre.fecha_hora_timbre.toLocaleString(), 'ddd');
        const fechaHoraServidor = yield (0, metodos_1.FormatearHora)(timbre.fecha_hora_timbre_servidor.toLocaleString().split(' ')[1]);
        const fechaTimbreServidor = yield (0, metodos_1.FormatearFecha2)(timbre.fecha_hora_timbre_servidor.toLocaleString(), 'ddd');
        yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_timbres',
            usuario: timbre.user_name,
            accion: 'I',
            datosOriginales: '',
            datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${timbre.accion}, tecla_funcion: ${timbre.tecla_funcion}, observacion: ${timbre.observacion}, latitud: ${timbre.latitud}, longitud: ${timbre.longitud}, codigo: ${timbre.codigo}, fecha_hora_timbre_servidor: ${fechaTimbreServidor + ' ' + fechaHoraServidor}, id_reloj: ${timbre.id_reloj}, ubicacion: ${timbre.ubicacion}, dispositivo_timbre: ${timbre.dispositivo_timbre}, id_empleado, ${timbre.id_empleado} }`,
            ip: timbre.ip,
            observacion: null
        });
        // FINALIZAR TRANSACCION
        yield database_1.pool.query('COMMIT');
        res.jsonp({
            message: 'Timbre creado con éxito',
            respuestaBDD: response
        });
    }
    catch (error) {
        console.log("ver el error", error);
        return res.status(500).jsonp({ message: 'Error al crear Timbre' });
    }
});
exports.crearTimbre = crearTimbre;
const crearTimbreDesconectado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hoy = new Date();
        const timbre = req.body;
        yield database_1.pool.query('BEGIN');
        timbre.fecha_subida_servidor = hoy.getFullYear() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getDate() + " " + hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getSeconds();
        const timbreRV = new Date(timbre.fecha_hora_timbre || '');
        const restaTimbresHoras = timbreRV.getHours() - hoy.getHours();
        const restaTimbresMinutos = timbreRV.getMinutes() - hoy.getMinutes();
        const restaTimbresDias = timbreRV.getDate() - hoy.getDate();
        if (restaTimbresDias != 0 || restaTimbresHoras != 0 || restaTimbresMinutos > 3 || restaTimbresMinutos < -3) {
            if (restaTimbresHoras == 1 && restaTimbresMinutos > 58 && restaTimbresMinutos < -58) {
                timbre.hora_timbre_diferente = false;
            }
            else if (restaTimbresDias == 1 && restaTimbresHoras == 23 || restaTimbresHoras == -23 && restaTimbresMinutos > 58 && restaTimbresMinutos < -58) {
                timbre.hora_timbre_diferente = false;
            }
            else {
                timbre.hora_timbre_diferente = true;
            }
        }
        else {
            timbre.hora_timbre_diferente = false;
        }
        const response = yield database_1.pool.query('INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, ' +
            'observacion, latitud, longitud, codigo, id_reloj, tipo_autenticacion, ' +
            'dispositivo_timbre, fecha_hora_timbre_servidor, hora_timbre_diferente, ubicacion, conexion, fecha_subida_servidor, novedades_conexion, id_empleado) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);', [timbre.fecha_hora_timbre, 'dd', timbre.tecla_funcion, timbre.observacion,
            timbre.latitud, timbre.longitud, timbre.codigo, timbre.id_reloj,
            timbre.tipo_autenticacion, timbre.dispositivo_timbre, timbre.fecha_hora_timbre_servidor,
            timbre.hora_timbre_diferente, timbre.ubicacion, timbre.conexion, timbre.fecha_subida_servidor, timbre.novedades_conexion, timbre.id_empleado]);
        const fechaHora = yield (0, metodos_1.FormatearHora)(timbre.fecha_hora_timbre.toLocaleString().split('T')[1]);
        const fechaTimbre = yield (0, metodos_1.FormatearFecha2)(timbre.fecha_hora_timbre.toLocaleString(), 'ddd');
        const fechaHoraServidor = yield (0, metodos_1.FormatearHora)(timbre.fecha_hora_timbre_servidor.toLocaleString().split('T')[1]);
        const fechaTimbreServidor = yield (0, metodos_1.FormatearFecha2)(timbre.fecha_hora_timbre_servidor.toLocaleString(), 'ddd');
        yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_timbres',
            usuario: timbre.user_name,
            accion: 'I',
            datosOriginales: '',
            datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${timbre.accion}, tecla_funcion: ${timbre.tecla_funcion}, observacion: ${timbre.observacion}, latitud: ${timbre.latitud}, longitud: ${timbre.longitud}, codigo: ${timbre.codigo}, fecha_hora_timbre_servidor: ${fechaTimbreServidor + ' ' + fechaHoraServidor}, id_reloj: ${timbre.id_reloj}, ubicacion: ${timbre.ubicacion}, dispositivo_timbre: ${timbre.dispositivo_timbre}, id_empleado: ${timbre.id_empleado} }`,
            ip: timbre.ip,
            observacion: null
        });
        // FINALIZAR TRANSACCION
        yield database_1.pool.query('COMMIT');
        res.jsonp({
            message: 'Timbre creado con éxito',
            respuestaBDD: response
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Error al crear Timbre' });
    }
});
exports.crearTimbreDesconectado = crearTimbreDesconectado;
const crearTimbreJustificadoAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, codigo, id_reloj, user_name, ip, id } = req.body;
        console.log(req.body);
        yield database_1.pool.query('BEGIN');
        const [timbre] = yield database_1.pool.query('INSERT INTO eu_timbres (fecha_hora_timbre, accion, tecla_funcion, observacion, latitud, longitud, codigo, id_reloj, id_empleado) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id', [fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, codigo, id_reloj, id])
            .then(result => {
            return result.rows;
        });
        const fechaHora = yield (0, metodos_1.FormatearHora)(fec_hora_timbre.toLocaleString().split('T')[1]);
        const fechaTimbre = yield (0, metodos_1.FormatearFecha2)(fec_hora_timbre.toLocaleString(), 'ddd');
        yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_timbres',
            usuario: user_name,
            accion: 'I',
            datosOriginales: '',
            datosNuevos: `{fecha_hora_timbre: ${fechaTimbre + ' ' + fechaHora}, accion: ${accion}, tecla_funcion: ${tecl_funcion}, observacion: ${observacion}, latitud: ${latitud}, longitud: ${longitud}, codigo: ${codigo}, fecha_hora_timbre_servidor:'null', id_reloj: ${id_reloj}, ubicacion: 'null', dispositivo_timbre: 'null', id_empleado: ${id} }`,
            ip: ip,
            observacion: null
        });
        // FINALIZAR TRANSACCION
        yield database_1.pool.query('COMMIT');
        if (!timbre)
            return res.status(400).jsonp({ message: "No se inserto timbre" });
        return res.status(200).jsonp({ message: "Timbre Creado exitosamente" });
    }
    catch (error) {
        return res.status(400).jsonp({ message: error });
    }
});
exports.crearTimbreJustificadoAdmin = crearTimbreJustificadoAdmin;
const FiltrarTimbre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fecInicio, fecFinal, codigo } = req.body;
        console.log(req.body);
        const response = yield database_1.pool.query('SELECT * FROM eu_timbres WHERE codigo = $3 AND fecha_hora_timbre BETWEEN $1 AND $2 ORDER BY fecha_hora_timbre DESC ', [fecInicio, fecFinal, codigo]);
        const timbres = response.rows;
        return res.jsonp(timbres);
    }
    catch (error) {
        return res.status(400).jsonp({ message: error });
    }
});
exports.FiltrarTimbre = FiltrarTimbre;
const justificarAtraso = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { descripcion, fec_justifica, codigo, create_time, codigo_create_user, user_name, ip } = req.body;
        yield database_1.pool.query('BEGIN');
        const [atraso] = yield database_1.pool.query('INSERT INTO eu_empleado_justificacion_atraso(descripcion, fecha_justifica, id_empleado, fecha_hora, id_empleado_justifica) ' +
            'VALUES($1, $2, $3, $4, $5) RETURNING id', [descripcion, fec_justifica, codigo, create_time, codigo_create_user])
            .then(res => {
            return res.rows;
        });
        const fechaHora = yield (0, metodos_1.FormatearHora)(create_time.toLocaleString().split('T')[1]);
        const fechaTimbre = yield (0, metodos_1.FormatearFecha2)(create_time.toLocaleString(), 'ddd');
        const fechaHoraJustificacion = yield (0, metodos_1.FormatearHora)(fec_justifica.toLocaleString().split('T')[1]);
        const fechaTimbreJustificacion = yield (0, metodos_1.FormatearFecha2)(fec_justifica.toLocaleString(), 'ddd');
        yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
            tabla: 'eu_empleado_justificacion_atraso',
            usuario: user_name,
            accion: 'I',
            datosOriginales: '',
            datosNuevos: `{fecha_hora: ${fechaTimbre + ' ' + fechaHora}, fecha_justifica: ${fechaTimbreJustificacion + ' ' + fechaHoraJustificacion}, descripcion: ${descripcion}, id_empleado: ${codigo}, id_empleado_justifica: ${codigo_create_user} }`,
            ip: ip,
            observacion: null
        });
        // FINALIZAR TRANSACCION
        yield database_1.pool.query('COMMIT');
        if (!atraso)
            return res.status(400).jsonp({ message: "Atraso no insertado" });
        return res.status(200).jsonp({
            body: {
                mensaje: "Atraso justificado",
                response: atraso.rows
            }
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Error al crear justificación' });
    }
});
exports.justificarAtraso = justificarAtraso;
