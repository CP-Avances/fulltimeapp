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

        this.router.get('/asistencia', verificarToken, GRAFICAS_CONTROLADOR.AdminAsistencia);

        this.router.get('/inasistencia', verificarToken, GRAFICAS_CONTROLADOR.AdminInasistencia);

        this.router.get('/retrasos', verificarToken, GRAFICAS_CONTROLADOR.AdminAtrasos);

        this.router.get('/jornada-vs-hora-extra', verificarToken, GRAFICAS_CONTROLADOR.AdminJornadaHorasExtras);

        this.router.get('/tiempo-jornada-vs-hora-ext', verificarToken, GRAFICAS_CONTROLADOR.AdminTiempoJornadaHorasExtras);

        this.router.get('/marcaciones-emp', verificarToken, GRAFICAS_CONTROLADOR.AdminMarcacionesEmpleado);

        this.router.get('/salidas-anticipadas', verificarToken, GRAFICAS_CONTROLADOR.AdminSalidasAnticipadas);

    }
}

const GRAFICAS_RUTAS = new GraficasRutas();

export default GRAFICAS_RUTAS.router;
