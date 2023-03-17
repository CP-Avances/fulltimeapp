import { Router } from 'express';
import * as PARAMETROS from '../controllers/parametros.controller';

class ParametrosRoutes {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/detalles/:id', PARAMETROS.VerDetalleParametro);
        this.router.get('/buscar-formatos', PARAMETROS.BuscarFechasHoras);
        this.router.post('/coordenadas', PARAMETROS.CompararCoordenadas);
        this.router.get('/ubicacion-usuario/:codigo', PARAMETROS.BuscarCoordenadasUsuario);
        this.router.get('/funciones', PARAMETROS.BuscarFunciones);
    }
}

const PARAMETROS_Routes = new ParametrosRoutes();

export default PARAMETROS_Routes.router;