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
exports.deleteMetodoGeneral = void 0;
const database_1 = require("../database");
const deleteMetodoGeneral = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nametable, idreg } = req.query;
        const response = yield database_1.pool.query(`
            DELETE FROM ${nametable} WHERE id = ${idreg} RETURNING *
            `);
        console.log(response.rows);
        switch (nametable) {
            case 'vacaciones':
                yield database_1.pool.query('DELETE FROM autorizaciones WHERE id_vacacion = $1', [idreg]);
                yield database_1.pool.query('DELETE FROM realtime_noti WHERE id_vacaciones = $1', [idreg]);
                break;
            case 'hora_extr_pedidos':
                yield database_1.pool.query('DELETE FROM autorizaciones WHERE id_hora_extra = $1', [idreg]);
                yield database_1.pool.query('DELETE FROM realtime_noti WHERE id_hora_extra = $1', [idreg]);
                break;
            case 'permisos':
                yield database_1.pool.query('DELETE FROM autorizaciones WHERE id_permiso = $1', [idreg]);
                yield database_1.pool.query('DELETE FROM realtime_noti where id_permiso = $1', [idreg]);
                break;
            default:
                break;
        }
        const [objeto] = response.rows;
        if (objeto) {
            return res.status(200).jsonp(objeto);
        }
        else {
            return res.status(404).jsonp({ message: 'Solicitud no eliminada.' });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.deleteMetodoGeneral = deleteMetodoGeneral;
