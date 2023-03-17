import { Router } from 'express';
import * as REPORTES from '../controllers/reportes.contoller';
import { verificarToken } from '../autenticacion/verificarToken';

class ReportesRoutes {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        this.router.get('/info-plantilla', REPORTES.getInfoPlantilla);

        // RUTAS DE REPORTES
        this.router.get('/timbres', [verificarToken], REPORTES.getInfoReporteTimbres);
        this.router.get('/timbresConNovedad',[verificarToken],REPORTES.getInfoReporteTimbresNovedad);
        this.router.get('/inasistencia', [verificarToken], REPORTES.getInfoReporteInasistencia);
        this.router.get('/atrasos', [verificarToken], REPORTES.getInfoReporteAtrasos);
        this.router.get('/horas-extras', [verificarToken], REPORTES.getInfoReporteHorasExtras);
        this.router.get('/solicitudes', [verificarToken], REPORTES.getInfoReporteSolicitudes);
        this.router.get('/vacaciones', [verificarToken], REPORTES.getInfoReporteVacaciones);
        this.router.get('/alimentacion', [verificarToken], REPORTES.getInfoReporteAlimentacion);

    }
}

const REPORTES_Routes = new ReportesRoutes();

export default REPORTES_Routes.router;