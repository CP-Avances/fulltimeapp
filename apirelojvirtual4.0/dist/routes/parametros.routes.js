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
const PARAMETROS = __importStar(require("../controllers/parametros.controller"));
class ParametrosRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/detalles/:id', PARAMETROS.VerDetalleParametro);
        this.router.get('/buscar-formatos', PARAMETROS.BuscarFechasHoras);
        this.router.post('/coordenadas', PARAMETROS.CompararCoordenadas);
        this.router.get('/ubicacion-usuario/:codigo', PARAMETROS.BuscarCoordenadasUsuario);
        this.router.get('/funciones', PARAMETROS.BuscarFunciones);
    }
}
const PARAMETROS_Routes = new ParametrosRoutes();
exports.default = PARAMETROS_Routes.router;
