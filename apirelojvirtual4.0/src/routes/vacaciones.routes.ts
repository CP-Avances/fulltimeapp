// //
import { Router } from 'express';
import * as VACACIONES from '../controllers/vacaciones.controller';
import { verificarToken } from '../autenticacion/verificarToken';

class VacacionesRoutes {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // Table vacaciones
        this.router.get('/all-vacaciones', VACACIONES.getlistaVacaciones)
        this.router.get('/rangofechas', VACACIONES.getlistaVacacionesByFechas)
        this.router.get('/lista-vacaciones', VACACIONES.getlistaVacacionesByCodigo)
        this.router.get('/lista-vacacionesfechas', VACACIONES.getlistaVacacionesByFechasyCodigo)
        this.router.post('/insert-vacacion', verificarToken, VACACIONES.postNuevaVacacion)
        this.router.put('/update-vacacion', VACACIONES.putVacacion)
    }
}

const VACACIONES_Routes = new VacacionesRoutes();

export default VACACIONES_Routes.router;