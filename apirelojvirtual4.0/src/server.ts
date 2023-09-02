require('dotenv').config();
import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';

import EMPLEADOS_Routes from './routes/empleados.routes';
import EMPRESA_Routes from './routes/empresa.routes';
import REPORTES_Routes from './routes/reportes.routes';
import ROL_Routes from './routes/rol.routes';
import TIMBRES_Routes from './routes/timbre.routes';
import TIPO_TIMBRE_Routes from './routes/tipoTimbre.routes';
import USUARIO_Routes from './routes/usuario.routes';
import PERMISOS_Routes from './routes/permisos.routes';
import HORAS_EXTRAS_Routes from './routes/horasExtras.routes';
import VACACIONES_Routes from './routes/vacaciones.routes';
import ALIMENTACION_Routes from './routes/alimentacion.routes';
import AUTORIZACIONES_Routes from './routes/autorizaciones.routes';
import NOTIFICACIONES_Routes from './routes/notificaciones.routes';
import DELETE_REG_Routes from './routes/DeleteReg.routes';
import CATALOGOS_Routes from './routes/catalogos.routes';
import GRAFICAS_Routes from './routes/graficas.routes';
import PARAMETROS_Routes from './routes/parametros.routes';

import { createServer, Server } from 'http';

var io: any;

class Servidor {

    public app: Application;
    public server: Server;

    constructor() {
        
        this.app = express();
        this.configuracion();
        this.rutas();
        this.server = createServer(this.app);
        this.app.use(cors());
        io = require('socket.io')(this.server,{
            cors: {
                origins: '*',
                methods: ['GET, DELETE, POST, PUT'],
            }
        });
    }
    

    configuracion(): void{

        this.app.set('puerto', process.env.PORT || 3003 );
        this.app.use(morgan('dev'));
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(express.raw({ type: 'image/*', limit: '2Mb' }));
        this.app.set('trust proxy', true);

        this.app.get('/', (req, res) => {
            res.status(200).json({
                status: 'success'
            });
        });

    }

    rutas(): void {

        this.app.use('/api/user', USUARIO_Routes);
        this.app.use('/api/empleado', EMPLEADOS_Routes);
        this.app.use('/api/enterprise', EMPRESA_Routes);
        this.app.use('/api/ring', TIMBRES_Routes);
        this.app.use('/api/reportes', REPORTES_Routes);
        this.app.use('/api/roles', ROL_Routes);
        this.app.use('/api/tipoTimbre', TIPO_TIMBRE_Routes);
        this.app.use('/api/permisos', PERMISOS_Routes);
        this.app.use('/api/horasextras', HORAS_EXTRAS_Routes);
        this.app.use('/api/vacaciones', VACACIONES_Routes);
        this.app.use('/api/alimentacion', ALIMENTACION_Routes);
        this.app.use('/api/catalogos', CATALOGOS_Routes);
        this.app.use('/api/autorizaciones', AUTORIZACIONES_Routes);
        this.app.use('/api/notificaciones', NOTIFICACIONES_Routes);
        this.app.use('/api/graficas', GRAFICAS_Routes);
        this.app.use('/api/delete', DELETE_REG_Routes);
        this.app.use('/api/parametros', PARAMETROS_Routes);

    }

    start(): void {

        this.server.listen(this.app.get('puerto'), () => {
            console.log('Servidor en el puerto', this.app.get('puerto'));
        });


        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            next();
        });


        io.on('connection', (socket: any) => {
            console.log('Connected client on port %s.', this.app.get('puerto'));

            socket.on("nueva_notificacion", (data: any) => {
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
                }
                console.log('server', data_llega);
                socket.broadcast.emit('recibir_notificacion', data_llega);
                socket.emit('recibir_notificacion', data_llega);
            });

            socket.on("nuevo_aviso", (data: any) => {
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
                }
                console.log('server aviso .......', data_llega);
                socket.broadcast.emit('recibir_aviso', data_llega);
                socket.emit('recibir_aviso', data_llega);

            });
        });
       
    }
  
}

const SERVIDOR = new Servidor();
SERVIDOR.start();
