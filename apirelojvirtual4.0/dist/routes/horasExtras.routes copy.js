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
// //
const express_1 = require("express");
const PERMISOS = __importStar(require("../controllers/permisos.controller"));
class EmpresaRoutes {
    constructor() {
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        // Table permisos
        this.router.get('/all-permisos', PERMISOS.getlistaPermisos);
        this.router.get('/lista-permisos', PERMISOS.getlistaPermisosByCodigo);
        this.router.post('/insert-permiso', PERMISOS.postNuevoPermiso);
        // Tabel cg_tipo_permisos
        this.router.get('/cg-permisos', PERMISOS.getCgTipoPermisos);
    }
}
const EMPRESA_Routes = new EmpresaRoutes();
exports.default = EMPRESA_Routes.router;
