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
exports.InsertarAuditoria = void 0;
const database_1 = require("../database");
// INSERTAR REGISTRO DE AUDITORIA
const InsertarAuditoria = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tabla, usuario, accion, datosOriginales, datosNuevos, ip, observacion } = data;
        let plataforma = "APLICACION MOVIL";
        yield database_1.pool.query(`
            INSERT INTO audit.auditoria (plataforma, table_name, user_name, fecha_hora,
                action, original_data, new_data, ip_address, observacion) 
            VALUES ($1, $2, $3, now(), $4, $5, $6, $7, $8)
            `, [plataforma, tabla, usuario, accion, datosOriginales, datosNuevos, ip, observacion]);
    }
    catch (error) {
        throw error;
    }
});
exports.InsertarAuditoria = InsertarAuditoria;
