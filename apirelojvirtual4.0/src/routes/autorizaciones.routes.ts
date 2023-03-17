import { Router } from 'express';
import * as AUTORIZACIONES from '../controllers/autorizaciones.controller';
import { verificarToken } from '../autenticacion/verificarToken'
class AutorizacionesRoutes {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // RUTAS DE EMPLEADOS CONTROLADOR
        this.router.get('/', AUTORIZACIONES.getAutorizacion);
        this.router.post('/insert', AUTORIZACIONES.postAutorizacion);
        this.router.put('/estado', AUTORIZACIONES.updateAutorizacion);
        // RUTA DE ACTUALIZACION DE ESTADO DE SOLICITUDES
        this.router.put('/solicitud', AUTORIZACIONES.updateEstadoSolicitudes);

        // RUTA DE BUSQUEDA DE JEFES DE DEPARTAMENTOS
        this.router.post('/buscar-jefes', AUTORIZACIONES.BuscarJefes);


    }
}

const AUTORIZACIONES_Routes = new AutorizacionesRoutes();

export default AUTORIZACIONES_Routes.router;