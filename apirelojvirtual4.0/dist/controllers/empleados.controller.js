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
exports.getInformarEmpleadoAutoriza = exports.getOneHorarioEmpleadoByCodigo = exports.getListaHorariosEmpleadoByCodigo = exports.getUbicacion = exports.getListaEmpleados = void 0;
const database_1 = require("../database");
const getListaEmpleados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT id, cedula, codigo, (nombre || \' \' || apellido) as fullname FROM empleados ORDER BY fullname ASC');
        const empleados = response.rows;
        console.log(empleados);
        return res.status(200).jsonp(empleados);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getListaEmpleados = getListaEmpleados;
const getUbicacion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const codigo = parseInt(req.params.codigo);
        const response = yield database_1.pool.query('SELECT longitud, latitud FROM empleados WHERE codigo = $1', [codigo]);
        const ubicacion = response.rows;
        console.log(ubicacion);
        return res.status(200).jsonp(ubicacion);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getUbicacion = getUbicacion;
const getListaHorariosEmpleadoByCodigo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codigo } = req.query;
        console.log(codigo);
        const response = yield database_1.pool.query('SELECT id, codigo, CAST(fec_inicio AS VARCHAR), CAST(fec_final AS VARCHAR), lunes, martes, miercoles, jueves, viernes, sabado, domingo, id_horarios FROM empl_horarios WHERE codigo = $1', [codigo]);
        const horarios = response.rows;
        if (horarios.length === 0)
            return res.status(200).jsonp([]);
        const deta_horarios = yield Promise.all(horarios.map((o) => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield database_1.pool.query('SELECT hora, minu_espera, orden, tipo_accion FROM deta_horarios WHERE id_horario = $1 ORDER BY orden ASC', [o.id_horarios]);
            console.log(result.rows);
            o.detalle_horario = result.rows;
            return o;
        })));
        console.log(deta_horarios);
        return res.status(200).jsonp(deta_horarios);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getListaHorariosEmpleadoByCodigo = getListaHorariosEmpleadoByCodigo;
const getOneHorarioEmpleadoByCodigo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codigo, fecha_hoy } = req.query;
        const response = yield database_1.pool.query('SELECT id, codigo, CAST(fec_inicio AS VARCHAR), CAST(fec_final AS VARCHAR), lunes, martes, miercoles, jueves, viernes, sabado, domingo, id_horarios FROM empl_horarios WHERE codigo = $1 AND fec_inicio <= $2 AND fec_final >= $2 ', [codigo, fecha_hoy]);
        const horarios = response.rows;
        if (horarios.length === 0)
            return res.status(400).jsonp({ message: 'No hay horario para realizar solicitudes' });
        const [deta_horarios] = yield Promise.all(horarios.map((o) => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield database_1.pool.query('SELECT hora, minu_espera, orden, tipo_accion FROM deta_horarios WHERE id_horario = $1 ORDER BY orden ASC', [o.id_horarios]);
            console.log(result.rows);
            o.detalle_horario = result.rows;
            return o;
        })));
        return res.status(200).jsonp(deta_horarios);
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getOneHorarioEmpleadoByCodigo = getOneHorarioEmpleadoByCodigo;
const getInformarEmpleadoAutoriza = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_empleado } = req.params;
        const DATOS = yield database_1.pool.query(`
            SELECT (da.nombre ||' '|| da.apellido) AS fullname, da.cedula, tc.cargo, 
                cd.nombre AS departamento
            FROM datos_actuales_empleado AS da, empl_cargos AS ec, tipo_cargo AS tc,
                cg_departamentos AS cd
            WHERE da.id_cargo = ec.id AND ec.cargo = tc.id AND cd.id = da.id_departamento AND 
            da.id = $1
            `, [id_empleado]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows);
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
});
exports.getInformarEmpleadoAutoriza = getInformarEmpleadoAutoriza;
