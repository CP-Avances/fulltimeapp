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
exports.GRAFICAS_CONTROLADOR = void 0;
const MetodosGraficas_1 = require("../libs/MetodosGraficas");
class GraficasControlador {
    AdminHorasExtras(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fechas = req.query;
            const { fec_inicio, fec_final } = fechas;
            const id_empresa = req.idEmpresa;
            let resultado = yield (0, MetodosGraficas_1.GraficaHorasExtras)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            res.status(200).jsonp(resultado);
        });
    }
    AdminMarcacionesEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fechas = req.query;
            const { fec_inicio, fec_final } = fechas;
            const id_empresa = req.idEmpresa;
            let resultado = yield (0, MetodosGraficas_1.GraficaMarcaciones)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            res.status(200).jsonp(resultado);
        });
    }
}
exports.GRAFICAS_CONTROLADOR = new GraficasControlador();
exports.default = exports.GRAFICAS_CONTROLADOR;
