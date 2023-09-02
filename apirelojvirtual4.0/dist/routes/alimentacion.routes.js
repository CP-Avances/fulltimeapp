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
// //
const express_1 = require("express");
const ALIMENTACION = __importStar(require("../controllers/alimentacion.controller"));
const verificarToken_1 = require("../autenticacion/verificarToken");
class AlimentacionRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // Table permisos
        this.router.get('/all-alimento', ALIMENTACION.getlistaAlimentacion);
        this.router.get('/lista-alimento', ALIMENTACION.getlistaAlimentacionByIdEmpleado);
        this.router.get('/rangofechas', ALIMENTACION.getlistaAlimentacionByFechas);
        this.router.get('/lista-alimentacionfechas', ALIMENTACION.getlistaAlimentacionByFechasyCodigo);
        this.router.post('/insert-alimento', verificarToken_1.verificarToken, ALIMENTACION.postNuevoAlimentacion);
        this.router.put('/update-alimento', ALIMENTACION.putAlimentacion);
        this.router.put('/update-estado-alimento', ALIMENTACION.putEstadoAlimentacion);
    }
}
const ALIMENTACION_Routes = new AlimentacionRoutes();
exports.default = ALIMENTACION_Routes.router;
