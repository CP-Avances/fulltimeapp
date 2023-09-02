"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOCUMENTOS_CONTROLADOR = void 0;
const database_1 = require("../database");
const listarArchivos_1 = require("../libs/listarArchivos");
class DocumentosControlador {
    Carpetas(req, res) {
        let carpetas = [
            { nombre: 'Contratos', filename: 'contratos' },
            { nombre: 'Respaldos Horarios', filename: 'docRespaldosHorarios' },
            { nombre: 'Respaldos Permisos', filename: 'docRespaldosPermisos' },
            { nombre: 'Documentacion', filename: 'documentacion' }
        ];
        res.status(200).jsonp(carpetas);
    }
    listarArchivosCarpeta(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let nombre = req.params.nom_carpeta;
            res.status(200).jsonp(yield listarArchivos_1.listaCarpetas(nombre));
        });
    }
    DownLoadFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let nombre = req.params.nom_carpeta;
            let filename = req.params.filename;
            console.log(nombre, '==========', filename);
            const path = listarArchivos_1.DescargarArchivo(nombre, filename);
            console.log(path);
            res.status(200).sendFile(path);
        });
    }
    EliminarDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let nombre = req.params.nom_carpeta;
            let filename = req.params.filename;
            console.log(nombre, '==========', filename);
            const path = listarArchivos_1.EliminarArchivo(nombre, filename);
            console.log(path);
            res.jsonp({ message: 'Documento eliminado' });
        });
    }
    ListarDocumentos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const DOCUMENTOS = yield database_1.pool.query('SELECT * FROM documentacion ORDER BY id');
            if (DOCUMENTOS.rowCount > 0) {
                return res.jsonp(DOCUMENTOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerUnDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const UN_DOCUMENTO = yield database_1.pool.query('SELECT * FROM documentacion WHERE id = $1', [id]);
            if (UN_DOCUMENTO.rowCount > 0) {
                return res.jsonp(UN_DOCUMENTO.rows);
            }
            else {
                res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    CrearDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { doc_nombre } = req.body;
            yield database_1.pool.query('INSERT INTO documentacion (doc_nombre) VALUES ($1)', [doc_nombre]);
            const ultimo = yield database_1.pool.query('SELECT MAX(id) AS id FROM documentacion');
            res.jsonp({ message: 'Documento cargado', id: ultimo.rows[0].id });
        });
    }
    EditarDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { doc_nombre } = req.body;
            yield database_1.pool.query('UPDATE documentacion SET doc_nombre = $1 WHERE id = $2', [doc_nombre, id]);
            res.jsonp({ message: 'Documento actualizado' });
        });
    }
    ObtenerDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = req.params.docs;
            let filePath = `servidor\\documentacion\\${docs}`;
            res.sendFile(__dirname.split("servidor")[0] + filePath);
        });
    }
    GuardarDocumentos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.jsonp({ message: 'Documento Guardado' });
        });
    }
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.pool.query('DELETE FROM documentacion WHERE id = $1', [id]);
            res.jsonp({ message: 'Registro eliminado' });
        });
    }
}
exports.DOCUMENTOS_CONTROLADOR = new DocumentosControlador();
exports.default = exports.DOCUMENTOS_CONTROLADOR;
