import { Request, Response } from 'express';
import {
    GraficaHorasExtras,
    GraficaMarcaciones, 
} from '../libs/MetodosGraficas';

interface rangoF {
    fec_inicio: string,
    fec_final: string
}
class GraficasControlador {

    public async AdminHorasExtras(req: Request, res: Response): Promise<void> {
        const fechas: rangoF = req.query as unknown as rangoF;
        const { fec_inicio, fec_final } = fechas
        const id_empresa = req.idEmpresa

        let resultado = await GraficaHorasExtras(id_empresa, new Date(fec_inicio), new Date(fec_final))
        res.status(200).jsonp(resultado);
    }

    public async AdminMarcacionesEmpleado(req: Request, res: Response): Promise<void> {
        const fechas: rangoF = req.query as unknown as rangoF;
        const { fec_inicio, fec_final } = fechas

        const id_empresa = req.idEmpresa;

        let resultado = await GraficaMarcaciones(id_empresa, new Date(fec_inicio), new Date(fec_final))
        res.status(200).jsonp(resultado);
    }




}

export const GRAFICAS_CONTROLADOR = new GraficasControlador();

export default GRAFICAS_CONTROLADOR;