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
exports.AtrasosTimbres = void 0;
const database_1 = require("../database");
const metodos_1 = require("./metodos");
const AtrasosTimbres = function (fec_inicio, fec_final, codigo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const orden = 1;
            let horarioEntrada = yield database_1.pool.query('SELECT dt.hora, dt.minu_espera, CAST(eh.fec_inicio AS VARCHAR), CAST(eh.fec_final AS VARCHAR), ' +
                'eh.lunes, eh.martes, eh.miercoles, eh.jueves, eh.viernes, eh.sabado, eh.domingo ' +
                'FROM empl_horarios AS eh, cg_horarios AS ch, deta_horarios AS dt ' +
                'WHERE dt.orden = $1 AND eh.fec_inicio BETWEEN $2 AND $3 AND eh.fec_final BETWEEN $2 AND $3 AND eh.codigo = $4 ' +
                'AND eh.id_horarios = ch.id AND ch.id = dt.id_horario', [orden, new Date(fec_inicio), new Date(fec_final), codigo])
                .then(result => { return result.rows; });
            if (horarioEntrada.length === 0)
                return { error: 'No hay atrasos en el rango de fecha seleccionado' };
            console.log('HORARIOS: ', horarioEntrada);
            let nuevo = [];
            let aux = yield Promise.all(horarioEntrada.map((obj) => __awaiter(this, void 0, void 0, function* () {
                let fechas = (0, metodos_1.ModelarFechas)(obj.fec_inicio, obj.fec_final, obj);
                const hora_seg = (0, metodos_1.HHMMtoSegundos)(obj.hora) + (obj.minu_espera * 60);
                let timbres = yield Promise.all(fechas.map((o) => __awaiter(this, void 0, void 0, function* () {
                    var f_inicio = o.fecha + ' ' + (0, metodos_1.SegundosToHHMM)(hora_seg);
                    var f_final = o.fecha + ' ' + (0, metodos_1.SegundosToHHMM)(hora_seg + (0, metodos_1.HHMMtoSegundos)('02:00:00'));
                    // console.log( f_inicio, ' || ', f_final, ' || ', codigo);
                    const query = 'SELECT CAST(fec_hora_timbre AS VARCHAR) from timbres where fec_hora_timbre >= TO_TIMESTAMP(\'' + f_inicio + '\'' + ', \'YYYY-MM-DD HH24:MI:SS\') ' +
                        'and fec_hora_timbre <= TO_TIMESTAMP(\'' + f_final + '\'' + ', \'YYYY-MM-DD HH24:MI:SS\') and codigo = ' + codigo + ' order by fec_hora_timbre';
                    return yield database_1.pool.query(query)
                        .then(res => {
                        if (res.rowCount === 0) {
                            return 0;
                        }
                        else {
                            const f_timbre = res.rows[0].fec_hora_timbre.split(' ')[0];
                            const h_timbre = res.rows[0].fec_hora_timbre.split(' ')[1];
                            const t_tim = (0, metodos_1.HHMMtoSegundos)(h_timbre);
                            console.log(f_timbre);
                            let diferencia = (t_tim - hora_seg) / 3600;
                            return {
                                fecha: (0, metodos_1.DiaSemana)(new Date(f_timbre)) + ' ' + f_timbre,
                                horario: obj.hora,
                                timbre: h_timbre,
                                atraso_dec: diferencia.toFixed(2),
                                atraso_HHMM: (0, metodos_1.SegundosToHHMM)(t_tim - hora_seg),
                            };
                        }
                    });
                })));
                return timbres;
            })));
            aux.forEach(obj => {
                if (obj.length > 0) {
                    obj.forEach(o => {
                        if (o !== 0) {
                            nuevo.push(o);
                        }
                    });
                }
            });
            // console.log('Este es el resul: ',nuevo);
            return nuevo;
        }
        catch (error) {
            console.log(error);
            return { error: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' };
        }
    });
};
exports.AtrasosTimbres = AtrasosTimbres;
