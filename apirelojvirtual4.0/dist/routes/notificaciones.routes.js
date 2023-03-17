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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const NOTIFICACIONES = __importStar(require("../controllers/notificaciones.controller"));
class NotificacionesRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // RUTAS DE NOTIFICACIONES
        this.router.get('/all-noti', NOTIFICACIONES.getNotificacion);
        this.router.post('/', NOTIFICACIONES.postNotificacion);
        // RUTAS DE NOTIFICACIONES TIMBRES
        this.router.get('/noti-tim/all-noti', NOTIFICACIONES.getNotificacionTimbres);
        this.router.post('/noti-tim', NOTIFICACIONES.postAvisosGenerales);
        // INFO NECESARIA DE EMPLEADO
        this.router.get('/info-empl-recieve', NOTIFICACIONES.getInfoEmpleadoByCodigo);
        this.router.get('/id-info-empl', NOTIFICACIONES.getInfoEmpleadoById);
        // RUTA PARA ENVIO DE EMAIL
        this.router.post('/send-email', NOTIFICACIONES.sendCorreoEmpleados);
        // RUTA PARA ENVIO DE COMUNICADOS
        this.router.get('/datos_generales/:estado', NOTIFICACIONES.DatosGenerales);
        //RUTA PARA ENVIO DE VISTO NOTIFICACION
        this.router.put('/notifica_visto/', NOTIFICACIONES.NotificaVisto);
        //RUTA PARA ENVIO DE VISTO NOTIFICACION_TIMBRES
        this.router.put('/notifiTimbre_visto/', NOTIFICACIONES.NotifiTimbreVisto);
        // METODO DE ENVIO DE NOTIFICACIONES DE SOLICITUDES
        this.router.post('/send/comida/', NOTIFICACIONES.EnviarNotificacionComidas);
        // METODO DE ENVIO DE NOTIFICACIONES DE COMUNICADOS
        this.router.post('/noti-comunicado-movil/', NOTIFICACIONES.EnviarNotificacionGeneral);
    }
}
const NOTIFICACIONES_Routes = new NotificacionesRoutes();
exports.default = NOTIFICACIONES_Routes.router;
