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
        this.router.get('/asistencia', verificarToken_1.verificarToken, graficas_controller_1.default.AdminAsistencia);
        this.router.get('/inasistencia', verificarToken_1.verificarToken, graficas_controller_1.default.AdminInasistencia);
        this.router.get('/retrasos', verificarToken_1.verificarToken, graficas_controller_1.default.AdminAtrasos);
        this.router.get('/jornada-vs-hora-extra', verificarToken_1.verificarToken, graficas_controller_1.default.AdminJornadaHorasExtras);
        this.router.get('/tiempo-jornada-vs-hora-ext', verificarToken_1.verificarToken, graficas_controller_1.default.AdminTiempoJornadaHorasExtras);
        this.router.get('/marcaciones-emp', verificarToken_1.verificarToken, graficas_controller_1.default.AdminMarcacionesEmpleado);
        this.router.get('/salidas-anticipadas', verificarToken_1.verificarToken, graficas_controller_1.default.AdminSalidasAnticipadas);
    }
}
const GRAFICAS_RUTAS = new GraficasRutas();
exports.default = GRAFICAS_RUTAS.router;
