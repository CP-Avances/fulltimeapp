import { Router } from 'express';
import * as EMPRESA from '../controllers/empresa.controller';

class EmpresaRoutes {
    public router: Router = Router();
    
    constructor() {
        this.configuracion();
    }
    
    configuracion(): void {
        this.router.get('/empresaId/:id', EMPRESA.getEmpresaPorId)
    }
}

const EMPRESA_Routes = new EmpresaRoutes();

export default EMPRESA_Routes.router;