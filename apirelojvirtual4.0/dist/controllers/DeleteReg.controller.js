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
exports.deleteMetodoGeneral = void 0;
const database_1 = require("../database");
const AUDITORIA_CONTROLADOR = __importStar(require("../controllers/auditotia.controller"));
const metodos_1 = require("../libs/metodos");
const deleteMetodoGeneral = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var { nametable, idreg, user_name, ip } = req.query;
        const solicitud = yield database_1.pool.query(`SELECT * FROM ${nametable} WHERE id =  ${idreg} `);
        const [datosOriginalesTabla] = solicitud.rows;
        if (!datosOriginalesTabla) {
            // AUDITORIA
            yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: `${nametable}`,
                usuario: `${user_name}`,
                accion: 'D',
                datosOriginales: '',
                datosNuevos: '',
                ip: `${ip}`,
                observacion: `Error al eliminar el registro con id: ${idreg}. Registro no encontrado.`
            });
            yield database_1.pool.query('COMMIT');
            return res.status(404).jsonp({ message: 'Registro no encontrado.' });
        }
        const response = yield database_1.pool.query(`
            DELETE FROM ${nametable} WHERE id = ${idreg} RETURNING *
            `);
        switch (nametable) {
            case 'mv_solicitud_vacacion':
                const fechaIngresoO = yield (0, metodos_1.FormatearFecha2)(datosOriginalesTabla.fecha_ingreso, 'ddd');
                const fechaInicioO = yield (0, metodos_1.FormatearFecha2)(datosOriginalesTabla.fecha_inicio, 'ddd');
                const fechaFinO = yield (0, metodos_1.FormatearFecha2)(datosOriginalesTabla.fecha_final, 'ddd');
                yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: `mv_solicitud_vacacion`,
                    usuario: `${user_name}`,
                    accion: 'D',
                    datosOriginales: `{id_empleado_cargo: ${datosOriginalesTabla.id_empleado_cargo}, id_periodo_vacacion: ${datosOriginalesTabla.id_periodo_vacacion}, fecha_inicio: ${fechaInicioO}, fecha_final: ${fechaFinO}, fecha_ingreso: ${fechaIngresoO}, dia_libre: ${datosOriginalesTabla.dia_libre}, dia_laborable: ${datosOriginalesTabla.dia_laborable}, legalizado: ${datosOriginalesTabla.legalizado}, estado: ${datosOriginalesTabla.estado}, id_empleado: ${datosOriginalesTabla.id_empleado}}`,
                    datosNuevos: '',
                    ip: `${ip}`,
                    observacion: null
                });
                const datosVacacion = yield database_1.pool.query(`SELECT * FROM ecm_autorizaciones WHERE id_vacacion =  ${idreg} `);
                if (!datosVacacion) {
                    // AUDITORIA
                    yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: `ecm_autorizaciones`,
                        usuario: `${user_name}`,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: `${ip}`,
                        observacion: `Error al eliminar el registro con id_vacacion: ${idreg}. Registro no encontrado.`
                    });
                    yield database_1.pool.query('COMMIT');
                }
                yield database_1.pool.query('DELETE FROM ecm_autorizaciones WHERE id_vacacion = $1', [idreg]);
                // AUDITORIA
                yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ecm_autorizaciones',
                    usuario: `${user_name}`,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosVacacion.rows),
                    datosNuevos: '',
                    ip: `${ip}`,
                    observacion: null
                });
                const datosNotificaciones = yield database_1.pool.query(`SELECT * FROM ecm_realtime_notificacion WHERE id_vacaciones =  ${idreg} `);
                const [notificacionTablaVacacion] = datosNotificaciones.rows;
                if (!datosNotificaciones) {
                    // AUDITORIA
                    yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: `ecm_realtime_notificacion`,
                        usuario: `${user_name}`,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: `${ip}`,
                        observacion: `Error al eliminar el registro con id_vacaciones: ${idreg}. Registro no encontrado.`
                    });
                    yield database_1.pool.query('COMMIT');
                }
                yield database_1.pool.query('DELETE FROM ecm_realtime_notificacion WHERE id_vacaciones = $1', [idreg]);
                const fechaNotificacionVacacion = yield (0, metodos_1.FormatearFecha2)(notificacionTablaVacacion.fecha_hora, 'ddd');
                yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: `ecm_realtime_notificacion`,
                    usuario: `${user_name}`,
                    accion: 'D',
                    datosOriginales: `id_empleado_envia: ${notificacionTablaVacacion.id_empleado_envia}, id_empleado_recibe: ${notificacionTablaVacacion.id_empleado_recibe}, id_departamento_recibe: ${notificacionTablaVacacion.id_departamento_recibe}, fecha_hora: ${fechaNotificacionVacacion}, mensaje: ${notificacionTablaVacacion.mensaje}, id_permiso: ${notificacionTablaVacacion.id_permiso}, id_vacaciones: ${notificacionTablaVacacion.id_vacaciones}, id_hora_extra: ${notificacionTablaVacacion.id_hora_extra}, estado: ${notificacionTablaVacacion.estado}, visto: ${notificacionTablaVacacion.visto}, tipo: ${notificacionTablaVacacion.tipo}`,
                    datosNuevos: '',
                    ip: `${ip}`,
                    observacion: null
                });
                yield database_1.pool.query('COMMIT');
                break;
            case 'mhe_solicitud_hora_extra':
                const fechaSolicitaFechaO = yield (0, metodos_1.FormatearFecha2)(datosOriginalesTabla.fechaSolicita, 'ddd');
                const fechaHoraInicioO = yield (0, metodos_1.FormatearHora)(datosOriginalesTabla.fecha_inicio.toLocaleString().split(' ')[1]);
                const fechaTimbreInicioO = yield (0, metodos_1.FormatearFecha2)(datosOriginalesTabla.fecha_inicio, 'ddd');
                const fechaHoraFinO = yield (0, metodos_1.FormatearHora)(datosOriginalesTabla.fecha_final.toLocaleString().split(' ')[1]);
                const fechaTimbreFinO = yield (0, metodos_1.FormatearFecha2)(datosOriginalesTabla.fecha_final, 'ddd');
                yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: `mhe_solicitud_hora_extra`,
                    usuario: `${user_name}`,
                    accion: 'D',
                    datosOriginales: `{id_empleado_solicita: ${datosOriginalesTabla.id_empleado_solicita}, id_empleado_cargo: ${datosOriginalesTabla.id_empleado_cargo}, fecha_solicita: ${fechaSolicitaFechaO}, fecha_inicio: ${fechaTimbreInicioO + ' ' + fechaHoraInicioO}, fecha_final: ${fechaTimbreFinO + ' ' + fechaHoraFinO}, descripcion: ${datosOriginalesTabla.descripcion}, estado: ${datosOriginalesTabla.estado}, horas_solicitud: ${datosOriginalesTabla.horas_solicitud}, tiempo_autorizado: ${datosOriginalesTabla.tiempo_autorizado}, observacion: ${datosOriginalesTabla.observacion}, documento: ${datosOriginalesTabla.documento}, docu_nombre: ${datosOriginalesTabla.docu_nombre}}`,
                    datosNuevos: '',
                    ip: `${ip}`,
                    observacion: null
                });
                const datosHE = yield database_1.pool.query(`SELECT * FROM ecm_autorizaciones WHERE id_hora_extra =  ${idreg} `);
                if (!datosHE) {
                    // AUDITORIA
                    yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: `ecm_autorizaciones`,
                        usuario: `${user_name}`,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: `${ip}`,
                        observacion: `Error al eliminar el registro con id_hora_extra: ${idreg}. Registro no encontrado.`
                    });
                    yield database_1.pool.query('COMMIT');
                }
                yield database_1.pool.query('DELETE FROM ecm_autorizaciones WHERE id_hora_extra = $1', [idreg]);
                yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ecm_autorizaciones',
                    usuario: `${user_name}`,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosHE.rows),
                    datosNuevos: '',
                    ip: `${ip}`,
                    observacion: null
                });
                const datosNotificaciones2 = yield database_1.pool.query(`SELECT * FROM ecm_realtime_notificacion WHERE id_hora_extra =  ${idreg} `);
                const [notificacionTablaVacacionHoraExtra] = datosNotificaciones2.rows;
                if (!datosNotificaciones2) {
                    // AUDITORIA
                    yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: `ecm_realtime_notificacion`,
                        usuario: `${user_name}`,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: `${ip}`,
                        observacion: `Error al eliminar el registro con id_vacaciones: ${idreg}. Registro no encontrado.`
                    });
                    yield database_1.pool.query('COMMIT');
                }
                yield database_1.pool.query('DELETE FROM ecm_realtime_notificacion WHERE id_hora_extra = $1', [idreg]);
                const fechaNotificacionHoraExtra = yield (0, metodos_1.FormatearFecha2)(notificacionTablaVacacionHoraExtra.fecha_hora, 'ddd');
                yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: `ecm_realtime_notificacion`,
                    usuario: `${user_name}`,
                    accion: 'D',
                    datosOriginales: `id_empleado_envia: ${notificacionTablaVacacionHoraExtra.id_empleado_envia}, id_empleado_recibe: ${notificacionTablaVacacionHoraExtra.id_empleado_recibe}, id_departamento_recibe: ${notificacionTablaVacacionHoraExtra.id_departamento_recibe}, fecha_hora: ${fechaNotificacionHoraExtra}, mensaje: ${notificacionTablaVacacionHoraExtra.mensaje}, id_permiso: ${notificacionTablaVacacionHoraExtra.id_permiso}, id_vacaciones: ${notificacionTablaVacacionHoraExtra.id_vacaciones}, id_hora_extra: ${notificacionTablaVacacionHoraExtra.id_hora_extra}, estado: ${notificacionTablaVacacionHoraExtra.estado}, visto: ${notificacionTablaVacacionHoraExtra.visto}, tipo: ${notificacionTablaVacacionHoraExtra.tipo}`,
                    datosNuevos: '',
                    ip: `${ip}`,
                    observacion: null
                });
                yield database_1.pool.query('COMMIT');
                break;
            case 'mp_solicitud_permiso':
                const fechaCreacionPermisoO = yield (0, metodos_1.FormatearFecha2)(datosOriginalesTabla.fecha_creacion, 'ddd');
                const fechaInicioPermisoO = yield (0, metodos_1.FormatearFecha2)(datosOriginalesTabla.fecha_inicio, 'ddd');
                const fechaFinPermisoO = yield (0, metodos_1.FormatearFecha2)(datosOriginalesTabla.fecha_final, 'ddd');
                const horaIngresoO = yield (0, metodos_1.FormatearHora)(datosOriginalesTabla.hora_ingreso);
                const horaSalidaO = yield (0, metodos_1.FormatearHora)(datosOriginalesTabla.hora_salida);
                const horasPermisoO = yield (0, metodos_1.FormatearHora)(datosOriginalesTabla.horas_permiso);
                yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'mp_solicitud_permiso',
                    usuario: `${user_name}`,
                    accion: 'D',
                    datosOriginales: `{id_empleado_contrato: ${datosOriginalesTabla.id_empleado_contrato}, id_empleado_cargo: ${datosOriginalesTabla.id_empleado_cargo}, id_periodo_vacacion: ${datosOriginalesTabla.id_periodo_vacacion}, fecha_creacion: ${fechaCreacionPermisoO}, fecha_edicion: null, numero_permiso: ${datosOriginalesTabla.numero_permiso}, descripcion: ${datosOriginalesTabla.descripcion}, id_tipo_permiso: ${datosOriginalesTabla.id_tipo_permiso}, fecha_inicio: ${fechaInicioPermisoO}, fecha_final: ${fechaFinPermisoO}, hora_salida: ${horaSalidaO}, hora_ingreso: ${horaIngresoO}, dias_permiso: ${datosOriginalesTabla.dias_permiso}, dia_libre: ${datosOriginalesTabla.dia_libre}, horas_permiso: ${horasPermisoO}, documento: ${datosOriginalesTabla.documento}, legalizado: ${datosOriginalesTabla.legalizado}, estado: ${datosOriginalesTabla.estado}, id_empleado: ${datosOriginalesTabla.id_empleado}}`,
                    datosNuevos: ``,
                    ip: `${ip}`,
                    observacion: null
                });
                const datosPermiso = yield database_1.pool.query(`SELECT * FROM ecm_autorizaciones WHERE id_permiso =  ${idreg} `);
                if (!datosPermiso) {
                    // AUDITORIA
                    yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: `ecm_autorizaciones`,
                        usuario: `${user_name}`,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: `${ip}`,
                        observacion: `Error al eliminar el registro con id_permiso: ${idreg}. Registro no encontrado.`
                    });
                    yield database_1.pool.query('COMMIT');
                }
                yield database_1.pool.query('DELETE FROM ecm_autorizaciones WHERE id_permiso = $1', [idreg]);
                yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ecm_autorizaciones',
                    usuario: `${user_name}`,
                    accion: 'D',
                    datosOriginales: JSON.stringify(datosPermiso.rows),
                    datosNuevos: '',
                    ip: `${ip}`,
                    observacion: null
                });
                const datosNotificaciones3 = yield database_1.pool.query(`SELECT * FROM ecm_realtime_notificacion WHERE id_permiso =  ${idreg} `);
                const [notificacionTablaPermiso] = datosNotificaciones3.rows;
                if (!datosNotificaciones3) {
                    // AUDITORIA
                    yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: `ecm_realtime_notificacion`,
                        usuario: `${user_name}`,
                        accion: 'D',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: `${ip}`,
                        observacion: `Error al eliminar el registro con id_permiso: ${idreg}. Registro no encontrado.`
                    });
                    yield database_1.pool.query('COMMIT');
                }
                yield database_1.pool.query('DELETE FROM ecm_realtime_notificacion where id_permiso = $1', [idreg]);
                const fechaNotificacionPermiso = yield (0, metodos_1.FormatearFecha2)(notificacionTablaPermiso.fecha_hora, 'ddd');
                yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: `ecm_realtime_notificacion`,
                    usuario: `${user_name}`,
                    accion: 'D',
                    datosOriginales: `id_empleado_envia: ${notificacionTablaPermiso.id_empleado_envia}, id_empleado_recibe: ${notificacionTablaPermiso.id_empleado_recibe}, id_departamento_recibe: ${notificacionTablaPermiso.id_departamento_recibe}, fecha_hora: ${fechaNotificacionPermiso}, mensaje: ${notificacionTablaPermiso.mensaje}, id_permiso: ${notificacionTablaPermiso.id_permiso}, id_vacaciones: ${notificacionTablaPermiso.id_vacaciones}, id_hora_extra: ${notificacionTablaPermiso.id_hora_extra}, estado: ${notificacionTablaPermiso.estado}, visto: ${notificacionTablaPermiso.visto}, tipo: ${notificacionTablaPermiso.tipo}`,
                    datosNuevos: '',
                    ip: `${ip}`,
                    observacion: null
                });
                yield database_1.pool.query('COMMIT');
                break;
            default:
                var fechaO = yield (0, metodos_1.FormatearFecha2)(datosOriginalesTabla.fecha, 'ddd');
                var fechaComidaO = yield (0, metodos_1.FormatearFecha2)(datosOriginalesTabla.fecha_comida, 'ddd');
                var horaInicioO = yield (0, metodos_1.FormatearHora)(datosOriginalesTabla.hora_inicio);
                var horaFinO = yield (0, metodos_1.FormatearHora)(datosOriginalesTabla.hora_fin);
                yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ma_solicitud_comida',
                    usuario: `${user_name}`,
                    accion: 'D',
                    datosOriginales: `{id_empleado: ${datosOriginalesTabla.id_empleado}, id_detalle_comida: ${datosOriginalesTabla.id_detalle_comida}, fecha: ${fechaO}, fecha_comida: ${fechaComidaO}, hora_inicio: ${horaInicioO}, hora_fin: ${horaFinO}, observacion: ${datosOriginalesTabla.observacion}, extra: ${datosOriginalesTabla.extra}, verificar: ${datosOriginalesTabla.verificar}, aprobada: ${datosOriginalesTabla.aprobada}}`,
                    datosNuevos: ``,
                    ip: `${ip}`,
                    observacion: null
                });
                break;
        }
        const [objeto] = response.rows;
        if (objeto) {
            return res.status(200).jsonp(objeto);
        }
        else {
            return res.status(404).jsonp({ message: 'Solicitud no eliminada.' });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.deleteMetodoGeneral = deleteMetodoGeneral;
