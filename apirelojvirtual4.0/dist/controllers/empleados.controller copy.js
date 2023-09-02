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
exports.getListaHorariosEmpleadoByCodigo = exports.getListaEmpleados = void 0;
const database_1 = require("../database");
const getListaEmpleados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT id, cedula, codigo, (nombre || \' \' || apellido) as fullname FROM empleados ORDER BY fullname ASC');
        const empleados = response.rows;
        console.log(empleados);
        return res.status(200).json(empleados);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json('Error al conectarse con la BDD');
    }
});
exports.getListaEmpleados = getListaEmpleados;
const getListaHorariosEmpleadoByCodigo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codigo } = req.query;
        console.log(codigo);
        const response = yield database_1.pool.query('SELECT id, codigo, CAST(fec_inicio AS VARCHAR), CAST(fec_final AS VARCHAR), lunes, martes, miercoles, jueves, viernes, sabado, domingo, id_horarios FROM empl_horarios WHERE codigo = $1', [codigo]);
        const horarios = response.rows;
        if (horarios.length === 0)
            return res.status(200).json([]);
        const deta_horarios = yield Promise.all(horarios.map((o) => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield database_1.pool.query('SELECT hora, minu_espera, orden, tipo_accion FROM deta_horarios WHERE id_horario = $1 ORDER BY orden ASC', [o.id_horarios]);
            console.log(result.rows);
            o.detalle_horario = result.rows;
            return o;
        })));
        console.log(deta_horarios);
        return res.status(200).json(deta_horarios);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json('Error al conectarse con la BDD');
    }
});
exports.getListaHorariosEmpleadoByCodigo = getListaHorariosEmpleadoByCodigo;
