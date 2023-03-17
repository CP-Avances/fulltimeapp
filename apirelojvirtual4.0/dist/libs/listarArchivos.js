"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EliminarArchivo = exports.DescargarArchivo = exports.listaCarpetas = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const listaCarpetas = function (nombre_carpeta) {
    const ruta = path_1.default.resolve(nombre_carpeta);
    let Lista_Archivos = fs_1.default.readdirSync(ruta);
    return Lista_Archivos.map((obj) => {
        return {
            file: obj,
            extencion: obj.split('.')[1]
        };
    });
};
exports.listaCarpetas = listaCarpetas;
const DescargarArchivo = function (dir, filename) {
    const ruta = path_1.default.resolve(dir);
    return ruta + '\\' + filename;
};
exports.DescargarArchivo = DescargarArchivo;
const EliminarArchivo = function (dir, filename) {
    const ruta = path_1.default.resolve(dir);
    const directorio = ruta + '\\' + filename;
    fs_1.default.unlinkSync(directorio);
};
exports.EliminarArchivo = EliminarArchivo;
