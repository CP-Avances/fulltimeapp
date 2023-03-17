// //
import { Router } from 'express';
import * as ALIMENTACION from '../controllers/alimentacion.controller';
import { verificarToken } from '../autenticacion/verificarToken';

class AlimentacionRoutes {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // Table permisos
        this.router.get('/all-alimento', ALIMENTACION.getlistaAlimentacion)
        this.router.get('/lista-alimento', ALIMENTACION.getlistaAlimentacionByIdEmpleado)
        this.router.get('/rangofechas', ALIMENTACION.getlistaAlimentacionByFechas)
        this.router.get('/lista-alimentacionfechas', ALIMENTACION.getlistaAlimentacionByFechasyCodigo)
        this.router.post('/insert-alimento', verificarToken, ALIMENTACION.postNuevoAlimentacion)
        this.router.put('/update-alimento', ALIMENTACION.putAlimentacion)
        this.router.put('/update-estado-alimento', ALIMENTACION.putEstadoAlimentacion)

    }
}

const ALIMENTACION_Routes = new AlimentacionRoutes();

export default ALIMENTACION_Routes.router;