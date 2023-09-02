"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
const EMPLEADO = __importStar(require("../controllers/empleados.controller"));
const verificarToken_1 = require("../autenticacion/verificarToken");
class EmpleadoRoutes {
    constructor() {
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        // RUTAS DE EMPLEADOS CONTROLADOR
        this.router.get('/lista', verificarToken_1.verificarToken, EMPLEADO.getListaEmpleados);
        this.router.get('/horarios', EMPLEADO.getListaHorariosEmpleadoByCodigo);
    }
}
const EMPLEADOS_Routes = new EmpleadoRoutes();
exports.default = EMPLEADOS_Routes.router;
