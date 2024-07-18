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
const deleteMetodoGeneral = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var { nametable, idreg, user_name, ip } = req.query;
        const solicitud = yield database_1.pool.query(`SELECT * FROM ${nametable} WHERE id =  ${idreg} `);
        const [datosOriginalesTabla] = solicitud.rows;
        if (!datosOriginalesTabla) {
            // AUDITORIA
            if (!user_name || !ip) {
                user_name = '';
                ip = '';
                yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: `${nametable}`,
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    observacion: `Error al eliminar el registro con id: ${idreg}. Registro no encontrado.`
                });
            }
            yield database_1.pool.query('COMMIT');
            return res.status(404).jsonp({ message: 'Registro no encontrado.' });
        }
        const response = yield database_1.pool.query(`
            DELETE FROM ${nametable} WHERE id = ${idreg} RETURNING *
            `);
        if (!user_name || !ip) {
            user_name = '';
            ip = '';
            yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: `${nametable}`,
                usuario: user_name,
                accion: 'D',
                datosOriginales: JSON.stringify(datosOriginalesTabla),
                datosNuevos: '',
                ip: ip,
                observacion: null
            });
        }
        console.log(response.rows);
        switch (nametable) {
            case 'mv_solicitud_vacacion':
                const datosVacacion = yield database_1.pool.query(`SELECT * FROM ecm_autorizaciones WHERE id_vacacion =  ${idreg} `);
                if (!datosVacacion) {
                    // AUDITORIA
                    if (!user_name || !ip) {
                        user_name = '';
                        ip = '';
                        yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                            tabla: `ecm_autorizaciones`,
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            observacion: `Error al eliminar el registro con id_vacacion: ${idreg}. Registro no encontrado.`
                        });
                    }
                    yield database_1.pool.query('COMMIT');
                }
                yield database_1.pool.query('DELETE FROM ecm_autorizaciones WHERE id_vacacion = $1', [idreg]);
                // AUDITORIA
                if (!user_name || !ip) {
                    user_name = '';
                    ip = '';
                    yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'ecm_autorizaciones',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: JSON.stringify(datosVacacion.rows),
                        datosNuevos: '',
                        ip: ip,
                        observacion: null
                    });
                }
                const datosNotificaciones = yield database_1.pool.query(`SELECT * FROM ecm_realtime_notificacion WHERE id_vacaciones =  ${idreg} `);
                if (!datosNotificaciones) {
                    // AUDITORIA
                    if (!user_name || !ip) {
                        user_name = '';
                        ip = '';
                        yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                            tabla: `ecm_realtime_notificacion`,
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            observacion: `Error al eliminar el registro con id_vacaciones: ${idreg}. Registro no encontrado.`
                        });
                    }
                    yield database_1.pool.query('COMMIT');
                }
                yield database_1.pool.query('DELETE FROM ecm_realtime_notificacion WHERE id_vacaciones = $1', [idreg]);
                if (!user_name || !ip) {
                    user_name = '';
                    ip = '';
                    yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: `ecm_realtime_notificacion`,
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: JSON.stringify(datosNotificaciones.rows),
                        datosNuevos: '',
                        ip: ip,
                        observacion: null
                    });
                }
                yield database_1.pool.query('COMMIT');
                break;
            case 'mhe_solicitud_hora_extra':
                const datosHE = yield database_1.pool.query(`SELECT * FROM ecm_autorizaciones WHERE id_hora_extra =  ${idreg} `);
                if (!datosHE) {
                    // AUDITORIA
                    if (!user_name || !ip) {
                        user_name = '';
                        ip = '';
                        yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                            tabla: `ecm_autorizaciones`,
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            observacion: `Error al eliminar el registro con id_hora_extra: ${idreg}. Registro no encontrado.`
                        });
                    }
                    yield database_1.pool.query('COMMIT');
                }
                yield database_1.pool.query('DELETE FROM ecm_autorizaciones WHERE id_hora_extra = $1', [idreg]);
                if (!user_name || !ip) {
                    user_name = '';
                    ip = '';
                    yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'ecm_autorizaciones',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: JSON.stringify(datosHE.rows),
                        datosNuevos: '',
                        ip: ip,
                        observacion: null
                    });
                }
                const datosNotificaciones2 = yield database_1.pool.query(`SELECT * FROM ecm_realtime_notificacion WHERE id_hora_extra =  ${idreg} `);
                if (!datosNotificaciones2) {
                    // AUDITORIA
                    if (!user_name || !ip) {
                        user_name = '';
                        ip = '';
                        yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                            tabla: `ecm_realtime_notificacion`,
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            observacion: `Error al eliminar el registro con id_vacaciones: ${idreg}. Registro no encontrado.`
                        });
                    }
                    yield database_1.pool.query('COMMIT');
                }
                yield database_1.pool.query('DELETE FROM ecm_realtime_notificacion WHERE id_hora_extra = $1', [idreg]);
                if (!user_name || !ip) {
                    user_name = '';
                    ip = '';
                    yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: `ecm_realtime_notificacion`,
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: JSON.stringify(datosNotificaciones2.rows),
                        datosNuevos: '',
                        ip: ip,
                        observacion: null
                    });
                }
                yield database_1.pool.query('COMMIT');
                break;
            case 'mp_solicitud_permiso':
                const datosPermiso = yield database_1.pool.query(`SELECT * FROM ecm_autorizaciones WHERE id_permiso =  ${idreg} `);
                if (!datosPermiso) {
                    // AUDITORIA
                    if (!user_name || !ip) {
                        user_name = '';
                        ip = '';
                        yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                            tabla: `ecm_autorizaciones`,
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            observacion: `Error al eliminar el registro con id_permiso: ${idreg}. Registro no encontrado.`
                        });
                    }
                    yield database_1.pool.query('COMMIT');
                }
                yield database_1.pool.query('DELETE FROM ecm_autorizaciones WHERE id_permiso = $1', [idreg]);
                if (!user_name || !ip) {
                    user_name = '';
                    ip = '';
                    yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'ecm_autorizaciones',
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: JSON.stringify(datosPermiso.rows),
                        datosNuevos: '',
                        ip: ip,
                        observacion: null
                    });
                }
                const datosNotificaciones3 = yield database_1.pool.query(`SELECT * FROM ecm_realtime_notificacion WHERE id_permiso =  ${idreg} `);
                if (!datosNotificaciones3) {
                    // AUDITORIA
                    if (!user_name || !ip) {
                        user_name = '';
                        ip = '';
                        yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                            tabla: `ecm_realtime_notificacion`,
                            usuario: user_name,
                            accion: 'D',
                            datosOriginales: '',
                            datosNuevos: '',
                            ip: ip,
                            observacion: `Error al eliminar el registro con id_permiso: ${idreg}. Registro no encontrado.`
                        });
                    }
                    yield database_1.pool.query('COMMIT');
                }
                yield database_1.pool.query('DELETE FROM ecm_realtime_notificacion where id_permiso = $1', [idreg]);
                if (!user_name || !ip) {
                    user_name = '';
                    ip = '';
                    yield AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: `ecm_realtime_notificacion`,
                        usuario: user_name,
                        accion: 'D',
                        datosOriginales: JSON.stringify(datosNotificaciones3.rows),
                        datosNuevos: '',
                        ip: ip,
                        observacion: null
                    });
                }
                yield database_1.pool.query('COMMIT');
                break;
            default:
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
