"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const empleados_routes_1 = __importDefault(require("./routes/empleados.routes"));
const empresa_routes_1 = __importDefault(require("./routes/empresa.routes"));
const reportes_routes_1 = __importDefault(require("./routes/reportes.routes"));
const rol_routes_1 = __importDefault(require("./routes/rol.routes"));
const timbre_routes_1 = __importDefault(require("./routes/timbre.routes"));
const tipoTimbre_routes_1 = __importDefault(require("./routes/tipoTimbre.routes"));
const usuario_routes_1 = __importDefault(require("./routes/usuario.routes"));
const permisos_routes_1 = __importDefault(require("./routes/permisos.routes"));
const horasExtras_routes_1 = __importDefault(require("./routes/horasExtras.routes"));
const vacaciones_routes_1 = __importDefault(require("./routes/vacaciones.routes"));
const alimentacion_routes_1 = __importDefault(require("./routes/alimentacion.routes"));
const autorizaciones_routes_1 = __importDefault(require("./routes/autorizaciones.routes"));
const notificaciones_routes_1 = __importDefault(require("./routes/notificaciones.routes"));
const DeleteReg_routes_1 = __importDefault(require("./routes/DeleteReg.routes"));
const catalogos_routes_1 = __importDefault(require("./routes/catalogos.routes"));
const graficas_routes_1 = __importDefault(require("./routes/graficas.routes"));
const parametros_routes_1 = __importDefault(require("./routes/parametros.routes"));
const http_1 = require("http");
var io;
class Servidor {
    constructor() {
        this.app = (0, express_1.default)();
        this.configuracion();
        this.rutas();
        this.server = (0, http_1.createServer)(this.app);
        this.app.use((0, cors_1.default)());
        io = require('socket.io')(this.server, {
            cors: {
                origins: '*',
                methods: ['GET, DELETE, HEAD, OPTIONS'],
            }
        });
    }
    configuracion() {
        this.app.set('puerto', process.env.PORT || 3003);
        this.app.use((0, morgan_1.default)('dev'));
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: false }));
        this.app.use(express_1.default.raw({ type: 'image/*', limit: '2Mb' }));
        this.app.set('trust proxy', true);
        this.app.get('/', (req, res) => {
            res.status(200).json({
                status: 'success'
            });
        });
    }
    rutas() {
        this.app.use('/api/user', usuario_routes_1.default);
        this.app.use('/api/empleado', empleados_routes_1.default);
        this.app.use('/api/enterprise', empresa_routes_1.default);
        this.app.use('/api/ring', timbre_routes_1.default);
        this.app.use('/api/reportes', reportes_routes_1.default);
        this.app.use('/api/roles', rol_routes_1.default);
        this.app.use('/api/tipoTimbre', tipoTimbre_routes_1.default);
        this.app.use('/api/permisos', permisos_routes_1.default);
        this.app.use('/api/horasextras', horasExtras_routes_1.default);
        this.app.use('/api/vacaciones', vacaciones_routes_1.default);
        this.app.use('/api/alimentacion', alimentacion_routes_1.default);
        this.app.use('/api/catalogos', catalogos_routes_1.default);
        this.app.use('/api/autorizaciones', autorizaciones_routes_1.default);
        this.app.use('/api/notificaciones', notificaciones_routes_1.default);
        this.app.use('/api/graficas', graficas_routes_1.default);
        this.app.use('/api/delete', DeleteReg_routes_1.default);
        this.app.use('/api/parametros', parametros_routes_1.default);
    }
    start() {
        this.server.listen(this.app.get('puerto'), () => {
            console.log('Servidor en el puerto', this.app.get('puerto'));
        });
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            next();
        });
        io.on('connection', (socket) => {
            console.log('Connected client on port %s.', this.app.get('puerto'));
            socket.on("nueva_notificacion", (data) => {
                let data_llega = {
                    id: data.id,
                    id_send_empl: data.id_send_empl,
                    id_receives_empl: data.id_receives_empl,
                    id_receives_depa: data.id_receives_depa,
                    estado: data.estado,
                    create_at: data.create_at,
                    id_permiso: data.id_permiso,
                    id_vacaciones: data.id_vacaciones,
                    id_hora_extra: data.id_hora_extra,
                    mensaje: data.mensaje,
                    tipo: data.tipo,
                    usuario: data.usuario
                };
                console.log('server', data_llega);
                socket.broadcast.emit('recibir_notificacion', data_llega);
                socket.emit('recibir_notificacion', data_llega);
            });
            socket.on("nuevo_aviso", (data) => {
                let data_llega = {
                    id: data.id,
                    create_at: data.create_at,
                    id_send_empl: data.id_send_empl,
                    id_receives_empl: data.id_receives_empl,
                    visto: data.visto,
                    descripcion: data.descripcion,
                    id_timbre: data.id_timbre,
                    tipo: data.tipo,
                    usuario: data.usuario
                };
                console.log('server aviso .......', data_llega);
                socket.broadcast.emit('recibir_aviso', data_llega);
                socket.emit('recibir_aviso', data_llega);
            });
        });
    }
}
const SERVIDOR = new Servidor();
SERVIDOR.start();
