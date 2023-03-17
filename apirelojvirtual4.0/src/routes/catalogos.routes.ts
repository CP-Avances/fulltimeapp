import { Router } from 'express';
import * as CATALOGOS from '../controllers/catalogos.controller';

class CatalogosRoutes {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // Table cg_feriados
        this.router.get('/cg-feriados', CATALOGOS.getCgFeriados)
        // Table cg_tipo_permisos
        this.router.get('/cg-permisos', CATALOGOS.getCgTipoPermisos)
        // Table detalle_menu
        this.router.get('/cg-det-menu', CATALOGOS.getDetalleMenu)
        // TABLA tipo_comidas
        this.router.get('/servicio-comida', CATALOGOS.getServiciosComida)
        // TABLA cg_tipo_comidas
        this.router.get('/servicio-menu', CATALOGOS.getServiciosMenu)
    }
}

const CATALOGOS_Routes = new CatalogosRoutes();

export default CATALOGOS_Routes.router;