import { Router } from 'express';
import * as EMPLEADO from '../controllers/empleados.controller';
import { verificarToken } from '../autenticacion/verificarToken'
class EmpleadoRoutes {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // RUTAS DE EMPLEADOS CONTROLADOR
        this.router.get('/lista', verificarToken, EMPLEADO.getListaEmpleados);
        this.router.get('/horarios', EMPLEADO.getListaHorariosEmpleadoByCodigo);
        this.router.get('/horariosEmpleado', EMPLEADO.getHorariosEmpleadoByCodigo);
        this.router.get('/horarioEmplefecha', EMPLEADO.BuscarPlanificacionHorarioEmple);
        this.router.get('/un-horario', EMPLEADO.getOneHorarioEmpleadoByCodigo);
        this.router.get('/ubicacion/:codigo', EMPLEADO.getUbicacion);
        this.router.get('/empleadoAutoriza/:id_empleado', EMPLEADO.getInformarEmpleadoAutoriza);
        this.router.get('/planificacionHorarioEmplCodigo', EMPLEADO.getPlanificacionMesesCodigoEmple);
        this.router.post('/horario-comida-horas-mismo-dia', EMPLEADO.ObtenerComidaHorarioHorasMD);
        this.router.post('/horario-comida-horas-dias-diferentes', EMPLEADO.ObtenerComidaHorarioHorasDD);

    }
}

const EMPLEADOS_Routes = new EmpleadoRoutes();

export default EMPLEADOS_Routes.router;