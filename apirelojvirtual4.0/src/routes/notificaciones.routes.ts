import { Router } from 'express';
import * as NOTIFICACIONES from '../controllers/notificaciones.controller';

class NotificacionesRoutes {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // RUTAS DE NOTIFICACIONES
        this.router.get('/all-noti', NOTIFICACIONES.getNotificacion);
        this.router.post('/', NOTIFICACIONES.postNotificacion);
        // RUTAS DE NOTIFICACIONES TIMBRES
        this.router.get('/noti-tim/all-noti', NOTIFICACIONES.getNotificacionTimbres);
        this.router.post('/noti-tim', NOTIFICACIONES.postAvisosGenerales);
        // INFO NECESARIA DE EMPLEADO
        this.router.get('/info-empl-recieve', NOTIFICACIONES.getInfoEmpleadoByCodigo);
        this.router.get('/id-info-empl', NOTIFICACIONES.getInfoEmpleadoById);
        // RUTA PARA ENVIO DE EMAIL
        this.router.post('/send-email', NOTIFICACIONES.sendCorreoEmpleados);
        // RUTA PARA ENVIO DE COMUNICADOS
        this.router.get('/datos_generales/:estado', NOTIFICACIONES.DatosGenerales);
        //RUTA PARA ENVIO DE VISTO NOTIFICACION
        this.router.put('/notifica_visto/', NOTIFICACIONES.NotificaVisto);
        //RUTA PARA ENVIO DE VISTO NOTIFICACION_TIMBRES
        this.router.put('/notifiTimbre_visto/', NOTIFICACIONES.NotifiTimbreVisto);
        // METODO DE ENVIO DE NOTIFICACIONES DE SOLICITUDES
        this.router.post('/send/comida/', NOTIFICACIONES.EnviarNotificacionComidas);
        // METODO DE ENVIO DE NOTIFICACIONES DE COMUNICADOS
        this.router.post('/noti-comunicado-movil/', NOTIFICACIONES.EnviarNotificacionGeneral);
        // METODO PARA BUSCAR LA CONFIGURACION DEL USUARIO PARA RECIBIR CORREOS
        this.router.get('/config/:id', NOTIFICACIONES.ObtenerConfigEmpleado);

    }
}

const NOTIFICACIONES_Routes = new NotificacionesRoutes();

export default NOTIFICACIONES_Routes.router;