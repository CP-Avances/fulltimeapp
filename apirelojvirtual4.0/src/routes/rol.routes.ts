import { Router } from 'express';
import * as ROL from '../controllers/rol.controller';

class RolRoutes {
    public router: Router = Router();
    
    constructor() {
        this.configuracion();
    }
    
    configuracion(): void {
        // RUTAS DE ROLES
        this.router.get('/rol', ROL.getRoles);
        
    }
}

const ROL_Routes = new RolRoutes();

export default ROL_Routes.router;