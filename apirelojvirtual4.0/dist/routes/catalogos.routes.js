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
const CATALOGOS = __importStar(require("../controllers/catalogos.controller"));
class CatalogosRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // Table cg_feriados
        this.router.get('/cg-feriados', CATALOGOS.getCgFeriados);
        // Table cg_tipo_permisos
        this.router.get('/cg-permisos', CATALOGOS.getCgTipoPermisos);
        // Table detalle_menu
        this.router.get('/cg-det-menu', CATALOGOS.getDetalleMenu);
        // TABLA tipo_comidas
        this.router.get('/servicio-comida', CATALOGOS.getServiciosComida);
        // TABLA cg_tipo_comidas
        this.router.get('/servicio-menu', CATALOGOS.getServiciosMenu);
    }
}
const CATALOGOS_Routes = new CatalogosRoutes();
exports.default = CATALOGOS_Routes.router;
