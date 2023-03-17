import { Router } from 'express';
import * as TIPO_TIMBRE from '../controllers/tipoTimbre.controller';

class TipoTimbreRoutes {
    public router: Router = Router();
    
    constructor() {
        this.configuracion();
    }
    
    configuracion(): void {
        // RUTAS DE TIPOS TIMBRES
        this.router.get('/', TIPO_TIMBRE.getTipoTimbre);
    }
}

const TIPO_TIMBRE_Routes = new TipoTimbreRoutes();

export default TIPO_TIMBRE_Routes.router;