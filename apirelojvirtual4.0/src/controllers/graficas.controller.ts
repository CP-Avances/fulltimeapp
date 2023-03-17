import { Request, Response } from 'express';
import {
    GraficaAsistencia, GraficaHorasExtras, GraficaInasistencia, GraficaJornada_VS_HorasExtras, GraficaT_Jor_VS_HorExtTimbresSinAcciones,
    GraficaMarcaciones, GraficaTiempoJornada_VS_HorasExtras, GraficaAtrasosSinAcciones, GraficaSalidasAnticipadasSinAcciones,
    GraficaSalidasAnticipadas, GraficaAtrasos, GraficaJ_VS_H_E_SinAcciones
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

    public async AdminAtrasos(req: Request, res: Response): Promise<void> {
        const fechas: rangoF = req.query as unknown as rangoF;
        const { fec_inicio, fec_final } = fechas
        const id_empresa = req.idEmpresa;

        let resultado: any;
        //false sin acciones || true con acciones
        if (req.acciones_timbres === true) {
            // Resultados de timbres con 6 y 3 acciones 
            resultado = await GraficaAtrasos(id_empresa, new Date(fec_inicio), new Date(fec_final))
        } else {
            // Resultados de timbres sin acciones
            resultado = await GraficaAtrasosSinAcciones(id_empresa, new Date(fec_inicio), new Date(fec_final))
        }

        res.status(200).jsonp(resultado);
    }

    public async AdminAsistencia(req: Request, res: Response): Promise<void> {
        const fechas: rangoF = req.query as unknown as rangoF;
        const { fec_inicio, fec_final } = fechas

        const id_empresa = req.idEmpresa

        //El metodo GraficaAsistencia funciona para timbres de 6 y 3 acciones, y timbres sin acciones.
        let resultado = await GraficaAsistencia(id_empresa, new Date(fec_inicio), new Date(fec_final))
        res.status(200).jsonp(resultado);
    }

    public async AdminJornadaHorasExtras(req: Request, res: Response): Promise<void> {
        const fechas: rangoF = req.query as unknown as rangoF;
        const { fec_inicio, fec_final } = fechas

        const id_empresa = req.idEmpresa;

        let resultado: any;
        //false sin acciones || true con acciones
        if (req.acciones_timbres === true) {
            // Resultados de timbres con 6 y 3 acciones 
            resultado = await GraficaJornada_VS_HorasExtras(id_empresa, new Date(fec_inicio), new Date(fec_final))
        } else {
            // Resultados de timbres sin acciones
            resultado = await GraficaJ_VS_H_E_SinAcciones(id_empresa, new Date(fec_inicio), new Date(fec_final))
        }

        res.status(200).jsonp(resultado);
    }

    public async AdminTiempoJornadaHorasExtras(req: Request, res: Response): Promise<void> {
        const fechas: rangoF = req.query as unknown as rangoF;
        const { fec_inicio, fec_final } = fechas

        const id_empresa = req.idEmpresa;

        let resultado: any;
        //false sin acciones || true con acciones
        if (req.acciones_timbres === true) {
            // Resultados de timbres con 6 y 3 acciones 
            resultado = await GraficaTiempoJornada_VS_HorasExtras(id_empresa, new Date(fec_inicio), new Date(fec_final))
        } else {
            // Resultados de timbres sin acciones
            resultado = await GraficaT_Jor_VS_HorExtTimbresSinAcciones(id_empresa, new Date(fec_inicio), new Date(fec_final))
        }

        res.status(200).jsonp(resultado);
    }

    public async AdminInasistencia(req: Request, res: Response): Promise<void> {
        const fechas: rangoF = req.query as unknown as rangoF;
        const { fec_inicio, fec_final } = fechas

        const id_empresa = req.idEmpresa;

        //El metodo GraficaInasistencia funciona para timbres de 6 y 3 acciones, y timbres sin acciones.
        let resultado = await GraficaInasistencia(id_empresa, new Date(fec_inicio), new Date(fec_final))
        res.status(200).jsonp(resultado);
    }

    public async AdminMarcacionesEmpleado(req: Request, res: Response): Promise<void> {
        const fechas: rangoF = req.query as unknown as rangoF;
        const { fec_inicio, fec_final } = fechas

        const id_empresa = req.idEmpresa;

        let resultado = await GraficaMarcaciones(id_empresa, new Date(fec_inicio), new Date(fec_final))
        res.status(200).jsonp(resultado);
    }

    public async AdminSalidasAnticipadas(req: Request, res: Response): Promise<void> {
        const fechas: rangoF = req.query as unknown as rangoF;
        const { fec_inicio, fec_final } = fechas

        const id_empresa = req.idEmpresa;

        let resultado: any;

        //false sin acciones || true con acciones
        if (req.acciones_timbres === true) {
            // Resultados de timbres con 6 y 3 acciones 
            resultado = await GraficaSalidasAnticipadas(id_empresa, new Date(fec_inicio), new Date(fec_final));
        } else {
            // Resultados de timbres sin acciones
            resultado = await GraficaSalidasAnticipadasSinAcciones(id_empresa, new Date(fec_inicio), new Date(fec_final))
        }

        res.status(200).jsonp(resultado);
    }


}

export const GRAFICAS_CONTROLADOR = new GraficasControlador();

export default GRAFICAS_CONTROLADOR;