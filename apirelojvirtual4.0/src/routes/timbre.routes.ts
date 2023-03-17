import { Router } from 'express';
import * as TIMBRES from '../controllers/timbre.controller';

class TimbresRoutes {
    public router: Router = Router();
    
    constructor() {
        this.configuracion();
    }
    
    configuracion(): void {
        this.router.post('/timbre/admin', TIMBRES.crearTimbreJustificadoAdmin);
        this.router.get('/timbreEmpleado/:idUsuario', TIMBRES.getTimbreById);
        this.router.post('/timbre', TIMBRES.crearTimbre);
        this.router.post('/timbreSinConexion', TIMBRES.crearTimbreDesconectado);
        this.router.post('/filtroTimbre', TIMBRES.FiltrarTimbre);
        this.router.get('/filtrotimbre/:idUsuario', TIMBRES.FiltrarTimbre);
        this.router.post('/atraso', TIMBRES.justificarAtraso);
    }
}

const TIMBRES_Routes = new TimbresRoutes();

export default TIMBRES_Routes.router;