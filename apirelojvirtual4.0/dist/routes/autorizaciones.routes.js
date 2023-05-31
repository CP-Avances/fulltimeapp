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
const AUTORIZACIONES = __importStar(require("../controllers/autorizaciones.controller"));
class AutorizacionesRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // RUTAS DE EMPLEADOS CONTROLADOR
        this.router.get('/', AUTORIZACIONES.getAutorizacion);
        this.router.post('/insert', AUTORIZACIONES.postAutorizacion);
        this.router.put('/estado', AUTORIZACIONES.updateAutorizacion);
        // RUTA DE ACTUALIZACION DE ESTADO DE SOLICITUDES
        this.router.put('/solicitud', AUTORIZACIONES.updateEstadoSolicitudes);
        //RUTA BUSQUEDA AUTORIZACION POR DEPARTAMENTO
        this.router.get('/autorizaUsuarioDepa/:id_empleado', AUTORIZACIONES.EncontrarAutorizacionUsuario);
        this.router.get('/listaDepaAutoriza/:id_depar', AUTORIZACIONES.ObtenerListaAutorizaDepa);
        // RUTA DE BUSQUEDA DE JEFES DE DEPARTAMENTOS
        this.router.post('/buscar-jefes', AUTORIZACIONES.BuscarJefes);
    }
}
const AUTORIZACIONES_Routes = new AutorizacionesRoutes();
exports.default = AUTORIZACIONES_Routes.router;
