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
const HORAS_EXTRAS = __importStar(require("../controllers/horasExtras.controller"));
const verificarToken_1 = require("../autenticacion/verificarToken");
class HorasExtrasRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // Table horas extras
        this.router.get('/all-horas-extras', HORAS_EXTRAS.getlistaHorasExtras);
        this.router.get('/rangofechas', HORAS_EXTRAS.getlistaByFechas);
        this.router.get('/lista-horas-extras', HORAS_EXTRAS.getlistaHorasExtrasByCodigo);
        this.router.get('/lista-horas-extrasfechas', HORAS_EXTRAS.getlistaHorasExtrasByFechasyCodigo);
        this.router.get('/lista-horas-extrasfechasedit', HORAS_EXTRAS.getlistaHorasExtrasByFechasyCodigoEdit);
        this.router.post('/insert-horas-extras', verificarToken_1.verificarToken, HORAS_EXTRAS.postNuevaHoraExtra);
        this.router.put('/update-horas-extras', HORAS_EXTRAS.putHoraExtra);
    }
}
const HORAS_EXTRAS_Routes = new HorasExtrasRoutes();
exports.default = HORAS_EXTRAS_Routes.router;
