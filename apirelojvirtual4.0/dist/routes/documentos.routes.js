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
const DOCUMENTOS_CONTROLADOR = __importStar(require("../controllers/documentos.controller"));
const verificarToken_1 = require("../autenticacion/verificarToken");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './documentacion',
});
class DoumentosRutas {
    constructor() {
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.verificarToken, DOCUMENTOS_CONTROLADOR.ListarDocumentos);
        this.router.get('/carpetas/', DOCUMENTOS_CONTROLADOR.Carpetas);
        this.router.get('/lista-carpetas/:nom_carpeta', DOCUMENTOS_CONTROLADOR.listarArchivosCarpeta);
        this.router.get('/download/files/:nom_carpeta/:filename', DOCUMENTOS_CONTROLADOR.DownLoadFile);
        this.router.delete('/eliminar/files/:nom_carpeta/:filename', DOCUMENTOS_CONTROLADOR.EliminarDocumento);
        this.router.post('/documento', [verificarToken_1.verificarToken, multipartMiddleware], DOCUMENTOS_CONTROLADOR.GuardarDocumentos);
        this.router.get('/', DOCUMENTOS_CONTROLADOR.ListarDocumentos);
        this.router.get('/:id', verificarToken_1.verificarToken, DOCUMENTOS_CONTROLADOR.ObtenerUnDocumento);
        this.router.post('/', verificarToken_1.verificarToken, DOCUMENTOS_CONTROLADOR.CrearDocumento);
        this.router.put('/editar/:id', verificarToken_1.verificarToken, DOCUMENTOS_CONTROLADOR.EditarDocumento);
        this.router.get('/documentos/:docs', DOCUMENTOS_CONTROLADOR.ObtenerDocumento);
        this.router.delete('/eliminar/:id', verificarToken_1.verificarToken, DOCUMENTOS_CONTROLADOR.EliminarRegistros);
    }
}
const DOCUMENTOS_Rotes = new DoumentosRutas();
exports.default = DOCUMENTOS_Rotes.router;
