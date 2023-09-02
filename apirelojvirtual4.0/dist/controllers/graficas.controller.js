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
    AdminAtrasos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fechas = req.query;
            const { fec_inicio, fec_final } = fechas;
            const id_empresa = req.idEmpresa;
            let resultado;
            //false sin acciones || true con acciones
            if (req.acciones_timbres === true) {
                // Resultados de timbres con 6 y 3 acciones 
                resultado = yield (0, MetodosGraficas_1.GraficaAtrasos)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            }
            else {
                // Resultados de timbres sin acciones
                resultado = yield (0, MetodosGraficas_1.GraficaAtrasosSinAcciones)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            }
            res.status(200).jsonp(resultado);
        });
    }
    AdminAsistencia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fechas = req.query;
            const { fec_inicio, fec_final } = fechas;
            const id_empresa = req.idEmpresa;
            //El metodo GraficaAsistencia funciona para timbres de 6 y 3 acciones, y timbres sin acciones.
            let resultado = yield (0, MetodosGraficas_1.GraficaAsistencia)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            res.status(200).jsonp(resultado);
        });
    }
    AdminJornadaHorasExtras(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fechas = req.query;
            const { fec_inicio, fec_final } = fechas;
            const id_empresa = req.idEmpresa;
            let resultado;
            //false sin acciones || true con acciones
            if (req.acciones_timbres === true) {
                // Resultados de timbres con 6 y 3 acciones 
                resultado = yield (0, MetodosGraficas_1.GraficaJornada_VS_HorasExtras)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            }
            else {
                // Resultados de timbres sin acciones
                resultado = yield (0, MetodosGraficas_1.GraficaJ_VS_H_E_SinAcciones)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            }
            res.status(200).jsonp(resultado);
        });
    }
    AdminTiempoJornadaHorasExtras(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fechas = req.query;
            const { fec_inicio, fec_final } = fechas;
            const id_empresa = req.idEmpresa;
            let resultado;
            //false sin acciones || true con acciones
            if (req.acciones_timbres === true) {
                // Resultados de timbres con 6 y 3 acciones 
                resultado = yield (0, MetodosGraficas_1.GraficaTiempoJornada_VS_HorasExtras)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            }
            else {
                // Resultados de timbres sin acciones
                resultado = yield (0, MetodosGraficas_1.GraficaT_Jor_VS_HorExtTimbresSinAcciones)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            }
            res.status(200).jsonp(resultado);
        });
    }
    AdminInasistencia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fechas = req.query;
            const { fec_inicio, fec_final } = fechas;
            const id_empresa = req.idEmpresa;
            //El metodo GraficaInasistencia funciona para timbres de 6 y 3 acciones, y timbres sin acciones.
            let resultado = yield (0, MetodosGraficas_1.GraficaInasistencia)(id_empresa, new Date(fec_inicio), new Date(fec_final));
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
    AdminSalidasAnticipadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fechas = req.query;
            const { fec_inicio, fec_final } = fechas;
            const id_empresa = req.idEmpresa;
            let resultado;
            //false sin acciones || true con acciones
            if (req.acciones_timbres === true) {
                // Resultados de timbres con 6 y 3 acciones 
                resultado = yield (0, MetodosGraficas_1.GraficaSalidasAnticipadas)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            }
            else {
                // Resultados de timbres sin acciones
                resultado = yield (0, MetodosGraficas_1.GraficaSalidasAnticipadasSinAcciones)(id_empresa, new Date(fec_inicio), new Date(fec_final));
            }
            res.status(200).jsonp(resultado);
        });
    }
}
exports.GRAFICAS_CONTROLADOR = new GraficasControlador();
exports.default = exports.GRAFICAS_CONTROLADOR;
