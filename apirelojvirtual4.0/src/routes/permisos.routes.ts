// //
import { Router } from 'express';
import * as PERMISOS from '../controllers/permisos.controller';
import { verificarToken } from '../autenticacion/verificarToken';

class PermisoRoutes {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // Table permisos
        this.router.get('/all-permisos', PERMISOS.getlistaPermisos)
        this.router.get('/rangofechas', PERMISOS.getlistaPermisosByFechas)
        this.router.get('/lista-permisos', PERMISOS.getlistaPermisosByCodigo)
        this.router.get('/lista-permisosfechas', PERMISOS.getlistaPermisosByFechasyCodigo)
        this.router.post('/insert-permiso', verificarToken, PERMISOS.postNuevoPermiso)
        this.router.put('/update-permiso', PERMISOS.putPermiso)

    }
}

const PERMISO_Routes = new PermisoRoutes();

export default PERMISO_Routes.router;