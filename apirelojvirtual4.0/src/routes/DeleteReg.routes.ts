import { Router } from 'express';
import * as DELETE from '../controllers/DeleteReg.controller';

class DeleteRoutes {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // RUTAS DE EMPLEADOS CONTROLADOR
        this.router.delete('/registro', DELETE.deleteMetodoGeneral);

    }
}

const DeleteRegister_Routes = new DeleteRoutes();

export default DeleteRegister_Routes.router;