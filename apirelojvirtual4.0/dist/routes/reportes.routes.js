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
const REPORTES = __importStar(require("../controllers/reportes.contoller"));
const verificarToken_1 = require("../autenticacion/verificarToken");
class ReportesRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/info-plantilla', REPORTES.getInfoPlantilla);
        // RUTAS DE REPORTES
        this.router.get('/timbres', [verificarToken_1.verificarToken], REPORTES.getInfoReporteTimbres);
        this.router.get('/timbresConNovedad', [verificarToken_1.verificarToken], REPORTES.getInfoReporteTimbresNovedad);
        this.router.get('/inasistencia', [verificarToken_1.verificarToken], REPORTES.getInfoReporteInasistencia);
        this.router.get('/atrasos', [verificarToken_1.verificarToken], REPORTES.getInfoReporteAtrasos);
        this.router.get('/horas-extras', [verificarToken_1.verificarToken], REPORTES.getInfoReporteHorasExtras);
        this.router.get('/solicitudes', [verificarToken_1.verificarToken], REPORTES.getInfoReporteSolicitudes);
        this.router.get('/vacaciones', [verificarToken_1.verificarToken], REPORTES.getInfoReporteVacaciones);
        this.router.get('/alimentacion', [verificarToken_1.verificarToken], REPORTES.getInfoReporteAlimentacion);
    }
}
const REPORTES_Routes = new ReportesRoutes();
exports.default = REPORTES_Routes.router;
