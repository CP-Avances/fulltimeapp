import { Router } from 'express';
import { verificarToken } from '../autenticacion/verificarToken'
import GRAFICAS_CONTROLADOR from '../controllers/graficas.controller';

class GraficasRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // ADMINISTRADOR
        this.router.get('/hora-extra', verificarToken, GRAFICAS_CONTROLADOR.AdminHorasExtras);

        

        this.router.get('/marcaciones-emp', verificarToken, GRAFICAS_CONTROLADOR.AdminMarcacionesEmpleado);


    }
}

const GRAFICAS_RUTAS = new GraficasRutas();

export default GRAFICAS_RUTAS.router;
