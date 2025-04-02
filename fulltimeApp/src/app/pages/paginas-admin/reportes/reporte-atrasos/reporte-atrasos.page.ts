import { Component, ViewChild } from '@angular/core';
import { LoadingController, ModalController, ToastController, IonDatetime } from '@ionic/angular';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { ReporteAtrasoComponent } from '../../../../modals/reporte-atraso/reporte-atraso.component';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { DateTime } from 'luxon';


interface checkOptions {
  valor: number;
  nombre: string
}

@Component({
  selector: 'app-reporte-atrasos',
  templateUrl: './reporte-atrasos.page.html',
  styleUrls: ['./reporte-atrasos.page.scss'],
})
export class ReporteAtrasosPage {

  get fechaInicio(): string { return this.dataUserService.fechaRangoInicio }
  get fechaFinal(): string { return this.dataUserService.fechaRangoFinal }
  @ViewChild(IonDatetime) datetimeInicio: IonDatetime;
  @ViewChild(IonDatetime) datetimeFinal: IonDatetime;
  fechaIn: string = "";
  fechaFi: string = "";
  maxDate: string = new Date().toISOString().split('T')[0];
  loadingEmpleado: boolean = true;
  listLoaded: boolean = false;
  opcion_sucursal: boolean = false;
  opcion_depa: boolean = false;
  opcion_empleado: boolean = false;
  opcion_rol: boolean = false;
  departamentos: any = [];
  departamentos_filtro: any = [];
  sucursales_filtro: any = [];
  sucursales: any = [];
  roles: any = [];
  roles_filtro: any = [];
  ver: boolean = true;
  verDepartamento: boolean = true;
  verSucursal: boolean = true;
  verRol: boolean = true;
  empleados: any = [];
  empleados_filtro: any = [];
  solicitudes: checkOptions[] = [
    { valor: 1, nombre: 'Sucursal' },
    { valor: 2, nombre: 'Departamento' },
    { valor: 3, nombre: 'Empleado' },
    { valor: 4, nombre: 'Rol' },
  ];

  radioValue = 0;
  ngOnInit() {
    sessionStorage.removeItem('datos_comunicado');
    this.radioValue = 0;
  }

  ionViewWillEnter() {
    sessionStorage.removeItem('datos_comunicado');
    this.radioValue = 0;
  }


  constructor(
    public modalController: ModalController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private dataUserService: DataUserLoggedService,
    public restN: NotificacionesService,
    public restP: ParametrosService,
  ) { }

  // METODO PARA ALMACENAR EN UNA VARIABLE LA FECHA DE INICIO SELECCIONADA
  changeFechaInicio(e) {
    this.dataUserService.setFechaRangoInicio(e.target.value);
    this.datetimeInicio.confirm(true);
    if (this.fechaInicio == null || this.fechaInicio == '') {
      this.fechaIn = null;
    } else {
      this.fechaIn = DateTime.fromISO(this.fechaInicio).toFormat('yyyy-MM-dd');
    }

  }

  // METODO PARA ALMACENAR EN UNA VARIABLE LA FECHA FIN SELECCIONADA
  changeFechaFinal(e) {

    this.dataUserService.setFechaRangoFinal(e.target.value);
    this.datetimeFinal.confirm(true);
    if (this.fechaFinal == null || this.fechaFinal == '') {
      this.fechaFi = null;
    } else {
      this.fechaFi = DateTime.fromISO(this.fechaFinal).toFormat('yyyy-MM-dd');
    }

  }

  // METODO PARA LIMPIAR LAS VARIBLES DE FECHA FINAL E INICIAL
  limpiarRango_fechas() {
    this.dataUserService.setFechaRangoInicio('');
    this.dataUserService.setFechaRangoFinal('');
    this.fechaIn = "";
    this.fechaFi = "";
  }

  //METODO DE CONFIGURACION DEL TOAST
  async mostrarToas(mensaje: string, duracion: number, color: string) {

    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      mode: "ios",
    });
    toast.present();
    this.dismissLoading();
  }

  async dismissLoading() {
    while (await this.loadingController.getTop() !== undefined) {
      await this.loadingController.dismiss();
    }
  }

  //METODO PARA ABRIR EL MODAL DEL REPORTE DE ATRASOS 
  async presentModal(objeto: any) {
    console.log('entro a modal...');

    const modal = await this.modalController.create({
      component: ReporteAtrasoComponent,
      componentProps: {
        'data': objeto,
      },
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  ionViewWillLeave() {
    console.log('Salo de reporte de Atrasos');
    this.limpiarRango_fechas();
  }

  // METODO PARA CARGAR LOS REGISTROS DE SUCURSALES, DEPARTAMENTOS O EMPLEADOS SEGUN SEA LA ELECCION DEL ITEM
  showValue() {
    if (this.radioValue === 1) {
      this.loadingEmpleado = false;
      this.opcion_sucursal = true;
      this.opcion_depa = false;
      this.opcion_empleado = false;
      this.opcion_rol = false;
      this.cargarListaSucursales();
    }
    else if (this.radioValue === 2) {
      this.loadingEmpleado = false;
      this.opcion_sucursal = false;
      this.opcion_depa = true;
      this.opcion_empleado = false;
      this.opcion_rol = false;
      this.cargarDepartamentos();
    }
    else if (this.radioValue === 3) {
      this.loadingEmpleado = false;
      this.opcion_sucursal = false;
      this.opcion_depa = false;
      this.opcion_empleado = true;
      this.opcion_rol = false;
      this.cargarEmpleados();
    } 
    else if (this.radioValue === 4) {
      this.loadingEmpleado = false;
      this.opcion_sucursal = false;
      this.opcion_depa = false;
      this.opcion_empleado = false;
      this.opcion_rol = true;
      this.cargarRoles();
    }   
    else if (this.radioValue === 0) {
      this.loadingEmpleado = true;
      this.opcion_sucursal = false;
      this.opcion_depa = false;
      this.opcion_empleado = false;
      sessionStorage.removeItem('datos_comunicado');
      this.sucursales = [];
      this.departamentos = [];
      this.empleados = [];
    }
  }

  // METODO PARA CARGAR LOS REGISTROS DE SUCURSALES
  cargarListaSucursales() {
    this.restN.BuscarDatosGenerales().subscribe((res: any[]) => {
      console.log("VER BuscarDatosGenerales ", res)
      sessionStorage.setItem('datos_comunicado', JSON.stringify(res))
      res.forEach(obj => {
        this.sucursales.push({
          id: obj.id_suc,
          sucursal: obj.name_suc,
          ciudad: obj.ciudad,
        })
      })
      // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION SUCURSALES
      let verificados_suc = this.sucursales.filter((objeto: any, indice: any, valor: any) => {
        // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
        for (let i = 0; i < indice; i++) {
          if (valor[i].id === objeto.id) {
            return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
          }
        }
        return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
      });
      this.sucursales = verificados_suc;
      this.sucursales_filtro = [...this.sucursales]
      console.log("ver suscurslaes: ", this.sucursales_filtro)
      if (this.sucursales_filtro.length < 11) {
        this.verSucursal = true;
      } else {
        this.verSucursal = false;
      }
      this.loadingEmpleado = true;
      this.departamentos = [];
      this.empleados = [];
      this.BuscarParametro();
    }, err => {
      this.mostrarAlertas("No se ha encontrado información.", 1000, 'danger')
    })
  }

  // METODO PARA CARGAR LOS REGISTROS DE DEPARTAMENTOS
  cargarDepartamentos() {
    this.restN.BuscarDatosGenerales().subscribe((res: any[]) => {
      sessionStorage.setItem('datos_comunicado', JSON.stringify(res))

      res.forEach(obj => {
        this.departamentos.push({
          id: obj.id_depa,
          departamento: obj.name_dep,
          sucursal: obj.name_suc,
          id_suc: obj.id_suc,
          id_regimen: obj.id_regimen,
          ciudad: obj.ciudad,
        })
      })

      // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION DEPARTAMENTOS
      let verificados_dep = this.departamentos.filter((objeto: any, indice: any, valor: any) => {
        // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
        for (let i = 0; i < indice; i++) {
          if (valor[i].id === objeto.id && valor[i].id_suc === objeto.id_suc) {
            return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
          }
        }
        return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
      });
      this.departamentos = verificados_dep;
      this.departamentos_filtro = [...this.departamentos]

      if (this.departamentos_filtro.length < 11) {
        this.verDepartamento = true;
      } else {
        this.verDepartamento = false;
      }
      this.loadingEmpleado = true;
      this.sucursales = [];
      this.empleados = [];
      this.BuscarParametro();
    }, err => {
      this.mostrarAlertas("No se ha encontrado información.", 1000, 'danger')
    })
  }

  // METODO PARA OBTENER EL PARAMETRO DE LIMITE DE CORREOS
  BuscarParametro() {
    let datos = [];
    this.restP.ObtenerDetallesParametros(33).subscribe(
      res => {
        datos = res;
      });
  }

  // METODO PARA CARGAR LOS REGISTROS DE EMPLEADOS
  cargarEmpleados() {
    this.restN.BuscarDatosGenerales().subscribe((res: any[]) => {
      console.log("VER BuscarDatosGenerales ", res)
      sessionStorage.setItem('datos_comunicado', JSON.stringify(res))
      res.forEach(obj => {
        this.empleados.push({
          id: obj.id,
          nombre: obj.nombre,
          apellido: obj.apellido,
          codigo: obj.codigo,
          cedula: obj.cedula,
          correo: obj.correo,
          id_cargo: obj.id_cargo,
          id_contrato: obj.id_contrato,
          sucursal: obj.name_suc,
          id_suc: obj.id_suc,
          id_regimen: obj.id_regimen,
          id_depa: obj.id_depa,
          id_cargo_: obj.id_cargo_, // TIPO DE CARGO
          hora_trabaja: obj.hora_trabaja,
          name_cargo: obj.name_cargo,
          name_dep: obj.name_dep,
          name_regimen: obj.name_regimen,
          ciudad: obj.ciudad,
          name_suc: obj.name_suc,
        })
      })
      this.empleados_filtro = [...this.empleados];
      if (this.empleados_filtro.length < 11) {
        this.ver = true;
      } else {
        this.ver = false;
      }

      this.loadingEmpleado = true;
      this.sucursales = [];
      this.departamentos = [];

      this.BuscarParametro();
    }, err => {
      this.mostrarAlertas("No se ha encontrado información.", 1000, 'danger')
    })
  }

  // METODO PARA CARGAR LOS REGISTROS DE SUCURSALES
  cargarRoles() {
    this.restN.BuscarDatosGenerales().subscribe((res: any[]) => {
      console.log("VER BuscarDatosGenerales ", res)
      sessionStorage.setItem('datos_comunicado', JSON.stringify(res))
      res.forEach(obj => {
        this.roles.push({
          id: obj.id_rol,
          rol: obj.name_rol,
          cedula: obj.cedula,
          correo: obj.correo,
          id_cargo: obj.id_cargo,
          id_contrato: obj.id_contrato,
          ciudad: obj.ciudad,
          sucursal: obj.name_suc,
          departemento: obj.name_dep,
          regimen: obj.name_regimen,
          nombre1: obj.apellido + ' ' + obj.nombre,
          id_suc: obj.id_suc,
          id_regimen: obj.id_regimen,
          id_depa: obj.id_depa,
          id_cargo_: obj.id_cargo_, // TIPO DE CARGO
          hora_trabaja: obj.hora_trabaja,
          app_habilita: obj.app_habilita,
          web_habilita: obj.web_habilita,
          comunicado_mail: obj.comunicado_mail,
          comunicado_noti: obj.comunicado_notificacion  
        })
      })
      // OMITIR DATOS DUPLICADOS EN LA VISTA DE SELECCION SUCURSALES
      let verificados_rol = this.roles.filter((objeto: any, indice: any, valor: any) => {
        // COMPARA EL OBJETO ACTUAL CON LOS OBJETOS ANTERIORES EN EL ARRAY
        for (let i = 0; i < indice; i++) {
          if (valor[i].id === objeto.id) {
            return false; // SI ES UN DUPLICADO, RETORNA FALSO PARA EXCLUIRLO DEL RESULTADO
          }
        }
        return true; // SI ES UNICO, RETORNA VERDADERO PARA INCLUIRLO EN EL RESULTADO
      });
      this.roles = verificados_rol;
      this.roles_filtro = [...this.roles]
      console.log("ver roles: ", this.roles_filtro)
      if (this.roles_filtro.length < 11) {
        this.verRol = true;
      } else {
        this.verRol = false;
      }
      this.loadingEmpleado = true;
      this.departamentos = [];
      this.sucursales = [];
      this.BuscarParametro();
    }, err => {
      this.mostrarAlertas("No se ha encontrado información.", 1000, 'danger')
    })
  }    

  // METODO DE CONFIGURACION DE LAS ALERTAS
  async mostrarAlertas(mensaje: string, duracion: number, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      mode: 'ios',
      cssClass: 'showtoast-custom-class'
    });
    toast.present();
  }

  // METODO DE VERIFICACION DE MARCACION DE TODOS LOS REGISTROS DE SUCURSALES
  isAllCheck_sucu: boolean = false;
  checkedAll_sucu(isAllChecked_sucu) {
    this.isAllCheck_sucu = !isAllChecked_sucu;
    if (this.radioValue === 1) {
      this.sucursales.forEach(o => { o.isChecked_sucu = this.isAllCheck_sucu })
      return;
    }
  }

  // METODO DE VERIFICACION DE MARCACION DE TODOS LOS REGISTROS DE DEPARTAMENTOS
  isAllCheck_depa: boolean = false;
  checkedAll_depa(isAllChecked_depa) {
    this.isAllCheck_depa = !isAllChecked_depa;
    //console.log('..............depa............', this.departamentos)
    if (this.radioValue === 2) {
      this.departamentos.forEach(o => { o.isChecked_depa = this.isAllCheck_depa });
      console.log('..............departamentos............', this.departamentos)
      return;
    }
  }

  // METODO DE VERIFICACION DE MARCACION DE TODOS LOS REGISTROS DE EMPLEADOS
  isAllCheck_empl: boolean = false;
  checkedAll_empl(isAllChecked_empl) {
    this.isAllCheck_empl = !isAllChecked_empl;
    if (this.radioValue === 3) {
      this.empleados.forEach(o => { o.isChecked_empl = this.isAllCheck_empl });
      return;
    }
  }

  // METODO DE VERIFICACION DE MARCACION DE TODOS LOS REGISTROS DE SUCURSALES
  isAllCheck_rol: boolean = false;
  checkedAll_rol(isAllChecked_rol) {
    this.isAllCheck_rol = !isAllChecked_rol;
    if (this.radioValue === 1) {
      this.roles.forEach(o => { o.isChecked_rol = this.isAllCheck_rol })
      return;
    }
  }  

  isChecked_sucu: boolean = true;
  // METODO QUE ALMACENA LOS REGISTROS DE SUCURSALES EN UN ARREGLO
  EnviarSucursal() {
    console.log('ver sucu-------', this.sucursales);

    if (!this.fechaFi || !this.fechaIn) {
      this.mostrarToas('Seleccione Fechas', 3000, "warning");
    } else {
      let sucu = [];
      this.sucursales.forEach(o => {
        if (o.isChecked_sucu === true) {
          sucu.push(o);
        }
      });
      console.log('ver depa-------', sucu);
      this.ModelarSucursal(sucu)
    }
  }

  // METODO QUE OBTIENE LOS EMPLEADOS DE LAS SUCURSALES Y LOS ENVIA EN EL MODAL
  ModelarSucursal(dataSucursal) {
    let seleccionados: any = [];
    dataSucursal.forEach((sucursales: any) => {
      seleccionados.push(sucursales);
    })
    let respuesta = JSON.parse(sessionStorage.getItem('datos_comunicado'))
    seleccionados.forEach((sucursales: any) => {
      sucursales.opcion = 1
      sucursales.empleados = respuesta.filter((selec: any) => {
        if (selec.id_suc === sucursales.id) {
          return true;
        }
        return false;
      });
    });
    this.presentModal(seleccionados)
  }

  // METODO QUE ALMACENA LOS REGISTROS DE DEPARTAMENTO EN UN ARREGLO
  isChecked_depa: boolean = true;
  EnviarDepartamento() {
    if (!this.fechaFi || !this.fechaIn) {
      this.mostrarToas('Seleccione Fechas', 3000, "warning");
    } else {
      let depa = [];
      this.departamentos.forEach(o => {
        if (o.isChecked_depa === true) {
          depa.push(o);
        }
      });
      console.log('ver depa-------', depa);
      this.ModelarDepartamentos(depa);
    }
  }

  // METODO QUE OBTIENE LOS EMPLEADOS DE LOS DEPARTAMENTOS Y LOS ENVIA EN EL MODAL
  ModelarDepartamentos(dataDepartamentos) {
    let seleccionados: any = [];
    dataDepartamentos.forEach((departamento: any) => {
      seleccionados.push(departamento);
    })
    let respuesta = JSON.parse(sessionStorage.getItem('datos_comunicado'))
    seleccionados.forEach((departamentos: any) => {
      departamentos.opcion = 2
      departamentos.empleados = respuesta.filter((selec: any) => {

        if (selec.id_depa === departamentos.id) {
          return true;
        }
        return false;
      });
    });
    this.presentModal(seleccionados)
  }

  // METODO QUE ALMACENA LOS REGISTROS DE EMPLEADOS EN UN ARREGLO
  isChecked_empl: boolean = true;
  EnviarEmpleado() {
    if (!this.fechaFi || !this.fechaIn) {
      this.mostrarToas('Seleccione Fechas', 3000, "warning");
    } else {
      let empl = [];
      this.empleados.forEach(o => {
        if (o.isChecked_empl === true) {
          empl.push(o);
        }
      });
      console.log('ver depa-------', empl);
      this.ModelarEmpleados(empl)
    }
  }

  // METODO QUE OBTIENE LOS EMPLEADOS Y LOS ENVIA EN EL MODAL
  ModelarEmpleados(dataEmpleados) {
    let seleccionados: any = [{ nombre: 'Empleados', opcion: 3 }];
    seleccionados[0].empleados = dataEmpleados;
    this.presentModal(seleccionados)
  }

  // METODO QUE ALMACENA LOS REGISTROS DE SUCURSALES EN UN ARREGLO
  isChecked_rol: boolean = true;
  EnviarRoles() {
    if (!this.fechaFi || !this.fechaIn) {
      this.mostrarToas('Seleccione Fechas', 3000, "warning");

    } else {
      console.log('ver sucu-------', this.roles);
      let role = [];
      this.roles.forEach(o => {
        if (o.isChecked_rol === true) {
          role.push(o);
        }
      });
      console.log('ver depa-------', role);
      this.ModelarRol(role)
    }
  }

  // METODO QUE OBTIENE LOS EMPLEADOS DE LOS ROLES Y LOS ENVIA EN EL MODAL
  ModelarRol(dataRol) {
    let seleccionados: any = [];

    dataRol.forEach((roles: any) => {
      seleccionados.push(roles);
    })

    let respuesta = JSON.parse(sessionStorage.getItem('datos_comunicado'))
    seleccionados.forEach((roles: any) => {
      roles.opcion = 4
      roles.empleados = respuesta.filter((selec: any) => {
        if (selec.id_rol === roles.id) {
          return true;
        }
        return false;
      });
    });
    this.presentModal(seleccionados)
  }    

  // METODOS PARA BUSCAR LOS REGISTROS DE SUCURSALES, DEPARTAMENTOS, EMPLEADOS
  changeSearchSucursales(e: any) {
    console.log("entra a busqueda", e.detail.value)
    const palabrasBusqueda = e.detail.value.toLowerCase().split(' ');  // DIVIDE EL ARGUMENTO EN PALABRAS
    console.log("ver las palabra de busqueda ", palabrasBusqueda)
    const filtro = this.sucursales.filter((o: any) => {
      const nombreCompleto = `${o.sucursal}`.toLowerCase();
      console.log("ver el nombre de empleado: ", o.nombre)
      return palabrasBusqueda.every(palabra => nombreCompleto.includes(palabra))
    })
    this.sucursales_filtro = filtro
  }

  changeSearchDepartamento(e: any) {
    console.log("entra a busqueda", e.detail.value)
    const palabrasBusqueda = e.detail.value.toLowerCase().split(' ');  // DIVIDE EL ARGUMENTO EN PALABRAS
    console.log("ver las palabra de busqueda ", palabrasBusqueda)
    const filtro = this.departamentos.filter((o: any) => {
      const nombreCompleto = `${o.departamento}`.toLowerCase();
      console.log("ver el nombre de empleado: ", o.nombre)
      return palabrasBusqueda.every(palabra => nombreCompleto.includes(palabra))
    })
    this.departamentos_filtro = filtro
  }

  changeSearch(e: any) {
    console.log("entra a busqueda", e.detail.value)
    const palabrasBusqueda = e.detail.value.toLowerCase().split(' ');  // DIVIDE EL ARGUMENTO EN PALABRAS
    console.log("ver las palabra de busqueda ", palabrasBusqueda)
    const filtro = this.empleados.filter((o: any) => {
      const nombreCompleto = `${o.nombre || ''} ${o.apellido || ''}`.toLowerCase();

      console.log("ver el nombre de empleado: ", o.nombre)
      return palabrasBusqueda.every(palabra => nombreCompleto.includes(palabra))
    })
    this.empleados_filtro = filtro
  }

  // METODO PARA DEFINIR EL BUSCADOR DE ROLES
  changeSearchRoles(e: any) {
    console.log("entra a busqueda", e.detail.value)
    const palabrasBusqueda = e.detail.value.toLowerCase().split(' ');  // DIVIDE EL ARGUMENTO EN PALABRAS
    console.log("ver las palabra de busqueda ", palabrasBusqueda)
    const filtro = this.roles.filter((o: any) => {
      const nombreCompleto = `${o.rol}`.toLowerCase();
      console.log("ver el nombre de empleado: ", o.nombre)
      return palabrasBusqueda.every(palabra => nombreCompleto.includes(palabra))
    })
    this.roles_filtro = filtro
  }     

  pageActual: number = 1;
  pageActualDepartamento: number = 1;
  pageActualSucursal: number = 1;
  pageActualRol: number = 1;
  public maxSize: number = 5;
  public directionLinks: boolean = true;
  public autoHide: boolean = false;
  public responsive: boolean = true;
  public labels: any = {
    previousLabel: 'ante..',
    nextLabel: 'sigui..',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };


}
