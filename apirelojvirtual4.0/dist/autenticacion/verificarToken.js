"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
/* AQUI VA LA VERIFICACION DEL TOKEN, SI SE NECESITA EL VALOR QUE
 SE OBTIENE DEL TOKEN se debe enviar por el res al valor que se obtiene de jwt.verify*/
const verificarToken = (req, res, next) => {
    const token = req.header('autorizacion');
    if (!token)
        return res.status(401).send('No puede acceder sin autenticarse');
    const payload = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRETO || "masSeguridad");
    try {
        fs_1.default.readFile('licencia.conf.json', 'utf8', function (err, data) {
            const FileLicencias = JSON.parse(data);
            if (err)
                return res.status(401).send('No existe registro de licencias');
            const ok_licencias = FileLicencias.filter((o) => {
                return o.public_key === payload._licencia;
            }).map((o) => {
                o.fec_activacion = new Date(o.fec_activacion),
                    o.fec_desactivacion = new Date(o.fec_desactivacion);
                return o;
            });
            // console.log(ok_licencias);
            if (ok_licencias.lenght === 0)
                return res.status(401).send('La licencia no existe');
            const hoy = new Date();
            const { fec_activacion, fec_desactivacion } = ok_licencias[0];
            if (hoy <= fec_desactivacion && hoy >= fec_activacion) {
                req.idEmpresa = payload._idEmpresa;
                req.acciones_timbres = payload._acciones_timbres;
                // // TODO
                // const pool = new Pool({
                //     user: 'postgres',
                //     host: 'localhost',
                //     password: 'fulltime',
                //     database: 'fulltimeTimbres',
                //     // database: 'fulltimeVacuna',
                //     port: 5432
                // });
                // req.pool = pool as Pool
                next();
            }
            else {
                return res.status(401).send('La licencia a expirado');
            }
        });
    }
    catch (error) {
        console.log(error);
        return res.status(401).send('Error de lectura de archivo');
    }
};
exports.verificarToken = verificarToken;
