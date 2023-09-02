// //
import { Router } from 'express';
import * as HORAS_EXTRAS from '../controllers/horasExtras.controller';
import { verificarToken } from '../autenticacion/verificarToken';

class HorasExtrasRoutes {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // Table horas extras
        this.router.get('/all-horas-extras', HORAS_EXTRAS.getlistaHorasExtras)
        this.router.get('/rangofechas', HORAS_EXTRAS.getlistaByFechas)
        this.router.get('/lista-horas-extras', HORAS_EXTRAS.getlistaHorasExtrasByCodigo)
        this.router.get('/lista-horas-extrasfechas', HORAS_EXTRAS.getlistaHorasExtrasByFechasyCodigo);
        this.router.get('/lista-horas-extrasfechasedit', HORAS_EXTRAS.getlistaHorasExtrasByFechasyCodigoEdit);
        this.router.post('/insert-horas-extras', verificarToken, HORAS_EXTRAS.postNuevaHoraExtra)
        this.router.put('/update-horas-extras', HORAS_EXTRAS.putHoraExtra)
    }
}

const HORAS_EXTRAS_Routes = new HorasExtrasRoutes();

export default HORAS_EXTRAS_Routes.router;