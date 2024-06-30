"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../autenticacion/verificarToken");
const graficas_controller_1 = __importDefault(require("../controllers/graficas.controller"));
class GraficasRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // ADMINISTRADOR
        this.router.get('/hora-extra', verificarToken_1.verificarToken, graficas_controller_1.default.AdminHorasExtras);
        this.router.get('/marcaciones-emp', verificarToken_1.verificarToken, graficas_controller_1.default.AdminMarcacionesEmpleado);
    }
}
const GRAFICAS_RUTAS = new GraficasRutas();
exports.default = GRAFICAS_RUTAS.router;
