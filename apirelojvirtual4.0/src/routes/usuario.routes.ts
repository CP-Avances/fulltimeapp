import { Router } from 'express';
import * as USUARIO from '../controllers/usuario.controller';

class UserRoutes {
    public router: Router = Router();
    
    constructor() {
        this.configuracion();
    }
    
    configuracion(): void {
        // RUTAS DE EMPLEADOS CONTROLADOR
        this.router.get('/usuario', USUARIO.getUsers);
        this.router.get('/usuario/:id', USUARIO.getUserById);
        this.router.post('/loginUsuario', USUARIO.loginUsuario);
        this.router.get('/usuarioId/:id', USUARIO.getUserByIdEmpresa);
        this.router.get('/usuariosT/:id', USUARIO.getUserById);
        this.router.get('/usuarioEmpresa', USUARIO.getEmpleadosActivos);
        this.router.get('/usuarioA', USUARIO.getUserAdmin);
        this.router.put('/actualizarIDcelular/:id_usuario', USUARIO.actualizarIDcelular);
        this.router.post('/ingresarIDdispositivo', USUARIO.ingresarIDdispositivo);
        this.router.get('/IDdispositivos/:id_empleado', USUARIO.getidDispositivo);
        this.router.get('/dato/:id_empleado', USUARIO.ObtenerDepartamentoUsuarios);
        
    }
}

const USUARIO_Routes = new UserRoutes();

export default USUARIO_Routes.router;