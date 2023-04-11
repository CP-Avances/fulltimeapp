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
const VACACIONES = __importStar(require("../controllers/vacaciones.controller"));
const verificarToken_1 = require("../autenticacion/verificarToken");
class VacacionesRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // Table vacaciones
        this.router.get('/all-vacaciones', VACACIONES.getlistaVacaciones);
        this.router.get('/rangofechas', VACACIONES.getlistaVacacionesByFechas);
        this.router.get('/lista-vacaciones', VACACIONES.getlistaVacacionesByCodigo);
        this.router.get('/lista-vacacionesfechas', VACACIONES.getlistaVacacionesByFechasyCodigo);
        this.router.get('/lista-vacacionesfechasedit', VACACIONES.getlistaVacacionesByFechasyCodigoEdit);
        this.router.post('/insert-vacacion', verificarToken_1.verificarToken, VACACIONES.postNuevaVacacion);
        this.router.put('/update-vacacion', VACACIONES.putVacacion);
    }
}
const VACACIONES_Routes = new VacacionesRoutes();
exports.default = VACACIONES_Routes.router;
