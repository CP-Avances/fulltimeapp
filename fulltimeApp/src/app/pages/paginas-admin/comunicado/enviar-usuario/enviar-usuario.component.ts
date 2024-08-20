import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import moment from 'moment';

interface checkOptions {
  valor: number;
  nombre: string
}

@Component({
  selector: 'app-enviar-usuario',
  templateUrl: './enviar-usuario.component.html',
  styleUrls: ['./enviar-usuario.component.scss'],
})
export class EnviarUsuarioComponent implements OnInit {

  @Input() data: any;

  loadingEmpleado: boolean = true;
  listLoaded: boolean = false;
  opcion_sucursal: boolean = false;
  opcion_depa: boolean = false;
  opcion_empleado: boolean = false;

  idEmpleado: number;
  idEmpresa: number;

  solicitudes: checkOptions[] = [
    { valor: 1, nombre: 'Sucursal' },
    { valor: 2, nombre: 'Departamento' },
    { valor: 3, nombre: 'Empleado' },
  ];

  departamentos: any = [];
  sucursales: any = [];
  respuesta: any[];
  empleados: any = [];
  empleados_filtro: any = [];
  departamentos_filtro: any = [];
  sucursales_filtro: any = [];

  isChecked: boolean = true;

  constructor(
    public modalController: ModalController,
    public restN: NotificacionesService,
    public toastController: ToastController,
    public restP: ParametrosService,
    private dataUserServices: DataUserLoggedService,

  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleadoID'));
    this.idEmpresa = parseInt(localStorage.getItem('id_empresa'));
  }

  ngOnInit(): void {
    sessionStorage.removeItem('datos_comunicado');
    //this.BuscarInformacionGeneral();
    this.loadingEmpleado = true;
    console.log("Ver loadinEmpleado", this.loadingEmpleado)

  }

  /*
    BuscarInformacionGeneral() {
      // LIMPIAR DATOS DE ALMACENAMIENTO
      this.departamentos = [];
      this.sucursales = [];
      this.empleados = [];
      this.restN.BuscarDatosGenerales().subscribe((res: any[]) => {
        this.ProcesarDatos(res);
      }, err => {
        this.mostrarAlertas("No se ha encontrado información.", 1000, 'danger')
      })
    }
  
    ProcesarDatos(informacion: any) {
      informacion.forEach((obj: any) => {
        this.sucursales.push({
          id: obj.id_suc,
          sucursal: obj.name_suc
        })
  
        this.departamentos.push({
          id: obj.id_depa,
          departamento: obj.name_dep,
          sucursal: obj.name_suc,
          id_suc: obj.id_suc,
          id_regimen: obj.id_regimen,
        })
  
        this.empleados.push({
          id: obj.id,
          nombre: (obj.nombre).toUpperCase() + ' ' + (obj.apellido).toUpperCase(),
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
        })
      })
      this.empleados_filtro = [...this.empleados];
      this.OmitirDuplicados();
      this.listLoaded = true;
    }
  
  
    // METODO PARA RETIRAR DUPLICADOS SOLO EN LA VISTA DE DATOS
    OmitirDuplicados() {
  
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
  
    }
  
  */

  cargarListaSucursales() {
    this.restN.BuscarDatosGenerales().subscribe((res: any[]) => {
      console.log("VER BuscarDatosGenerales ", res)
      sessionStorage.setItem('datos_comunicado', JSON.stringify(res))
      res.forEach(obj => {
        this.sucursales.push({
          id: obj.id_suc,
          sucursal: obj.name_suc
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
      this.loadingEmpleado = true;
      this.departamentos = [];
      this.empleados = [];
      this.BuscarParametro();
    }, err => {
      this.mostrarAlertas("No se ha encontrado información.", 1000, 'danger')
    })
  }

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
      this.loadingEmpleado = true;
      this.sucursales = [];
      this.empleados = [];
      this.BuscarParametro();
    }, err => {
      this.mostrarAlertas("No se ha encontrado información.", 1000, 'danger')
    })
  }





  cargarEmpleados() {
    this.restN.BuscarDatosGenerales().subscribe((res: any[]) => {
      console.log("VER BuscarDatosGenerales ", res)
      sessionStorage.setItem('datos_comunicado', JSON.stringify(res))
      res.forEach(obj => {
        this.empleados.push({
          id: obj.id,
          nombre: (obj.nombre).toUpperCase() + ' ' + (obj.apellido).toUpperCase(),
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
        })
      })
      this.empleados_filtro = [...this.empleados];
      this.loadingEmpleado = true;
      this.sucursales = [];
      this.departamentos = [];

      this.BuscarParametro();
    }, err => {
      this.mostrarAlertas("No se ha encontrado información.", 1000, 'danger')
    })
  }



  changeSearchSucursales(e: any) {
    const query = e.detail.value;
    const filtro = this.sucursales.filter((o: any) => {
      return o.sucursal.toLowerCase().indexOf(query.toLowerCase()) > -1
    })
    this.sucursales_filtro = filtro
  }

  changeSearchDepartamento(e: any) {
    const query = e.detail.value;
    const filtro = this.departamentos.filter((o: any) => {
      return o.departamento.toLowerCase().indexOf(query.toLowerCase()) > -1
    })
    this.departamentos_filtro = filtro
  }

  changeSearch(e: any) {
    const query = e.detail.value;
    const filtro = this.empleados.filter((o: any) => {
      return o.nombre.toLowerCase().indexOf(query.toLowerCase()) > -1

    })
    this.empleados_filtro = filtro

  }


  closeModal() {
    console.log('CERRAR MODAL USUARIOS');
    this.modalController.dismiss({
      'refreshInfo': true
    });
  }

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


  selectedValue: any;

  checkValue(event) {
    console.log('Selected value: ', this.selectedValue);
  }

  print(event) {
    console.log(this.checkValue(event))
  }

  radioValue;
  showValue() {
    // 
    console.log(this.radioValue);

    if (this.radioValue === 1) {
      this.loadingEmpleado = false;
      this.opcion_sucursal = true;
      this.opcion_depa = false;
      this.opcion_empleado = false;
      this.cargarListaSucursales();
    }
    else if (this.radioValue === 2) {
      this.loadingEmpleado = false;
      this.opcion_sucursal = false;
      this.opcion_depa = true;
      this.opcion_empleado = false;
      this.cargarDepartamentos();
    }
    else if (this.radioValue === 3) {
      this.loadingEmpleado = false;
      this.opcion_sucursal = false;
      this.opcion_depa = false;
      this.opcion_empleado = true;
      this.cargarEmpleados();
    }
  }


  isAllCheck_sucu: boolean = false;
  checkedAll_sucu(isAllChecked_sucu) {
    this.isAllCheck_sucu = !isAllChecked_sucu;
    if (this.radioValue === 1) {
      this.sucursales.forEach(o => { o.isChecked_sucu = this.isAllCheck_sucu })

      return;
    }
  }

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


  isAllCheck_empl: boolean = false;
  checkedAll_empl(isAllChecked_empl) {
    this.isAllCheck_empl = !isAllChecked_empl;
    if (this.radioValue === 3) {
      this.empleados.forEach(o => { o.isChecked_empl = this.isAllCheck_empl });
      return;
    }

  }


  isChecked_sucu: boolean = true;
  EnviarSucursal() {
    console.log('ver sucu-------', this.sucursales);
    let sucu = [];

    this.sucursales.forEach(o => {
      if (o.isChecked_sucu === true) {
        sucu.push(o);
      }
    });
    console.log('ver depa-------', sucu);
    this.ModelarSucursal(sucu)
  }

  isChecked_depa: boolean = true;
  EnviarDepartamento() {
    let depa = [];

    this.departamentos.forEach(o => {
      if (o.isChecked_depa === true) {
        depa.push(o);

      }


    });
    console.log('ver depa-------', depa);
    this.ModelarDepartamentos(depa);
  }

  isChecked_empl: boolean = true;
  EnviarEmpleado() {
    let empl = [];

    this.empleados.forEach(o => {
      if (o.isChecked_empl === true) {
        empl.push(o);

      }


    });
    console.log('ver depa-------', empl);
    this.ModelarEmpleados(empl)
  }



  ModelarSucursal(dataSucursal) {
    let usuarios: any = [];
    let respuesta = JSON.parse(sessionStorage.getItem('datos_comunicado'))
    respuesta.forEach((obj: any) => {
      dataSucursal.find(obj1 => {
        if (obj.id_suc === obj1.id) {
          //if (obj3.comunicado_mail === true || obj3.comunicado_notificacion === true) {
          usuarios.push(obj)
          // }
        }
      })
    })
    console.log('ver usuario---------------------------', usuarios);
    this.EnviarNotificaciones(usuarios);
    this.closeModal();
  }

  ModelarDepartamentos(dataDepartamentos) {
    let usuarios: any = [];
    let respuesta = JSON.parse(sessionStorage.getItem('datos_comunicado'))
    respuesta.forEach((obj: any) => {
        dataDepartamentos.find(obj2 => {
          if (obj.id_depa === obj2.id) {
             // if (obj3.comunicado_mail === true || obj3.comunicado_notificacion === true) {
                usuarios.push(obj)
             // }
          }
        })
     
    })
    console.log('ver usuario---------------------------', usuarios);
    this.EnviarNotificaciones(usuarios);
    this.closeModal();

    console.log(' ver empleados de departamentos', respuesta)

  }

  ModelarEmpleados(dataEmpleados) {
    let respuesta: any = [];
    this.empleados.forEach((obj: any) => {
      dataEmpleados.find(obj1 => {
        if (obj1.id === obj.id) {
          respuesta.push(obj)
        }
      })
    })

    console.log('ver usuario---------------------------', respuesta);
    this.EnviarNotificaciones(respuesta);
    this.closeModal();
    console.log(' ver donde falla', respuesta)
  }


  envios: any = [];
  cont: number = 0;
  boton_enviar = false;
  EnviarNotificaciones(data: any) {

    if (data.length > 0) {



      this.ContarCorreos(data);
      console.log("cont_correo", this.cont_correo)
      console.log("this.correo", this.correos)

      if (this.cont_correo <= this.correos) {
        this.cont = 0;
        this.boton_enviar = true;

        data.forEach((obj: any) => {

          console.log("obj.comunicado_noti ", obj.comunicado_noti);
         // if (obj.comunicado_notificacion === true) {

            this.NotificarSistema(this.idEmpleado, obj.id);
         // }

          this.cont = this.cont + 1;
          if (this.cont === data.length) {
            if (this.info_correo === '') {
              this.mostrarAlertas("Mensaje enviado exitosamente.", 4000, 'success');
            }
            else {
              this.EnviarCorreo(this.info_correo);
            }
          }

        })
      }
      else {
        this.mostrarAlertas('Trata de enviar un total de ' + this.cont_correo +
          ' correos, sin embargo solo tiene permitido enviar un total de ' + this.correos +
          ' correos.', 3000, 'danger')
      }
    }
    else {
      this.mostrarAlertas("No ha seleccionado usuarios.", 3000, 'danger')
    }
  }


  verificador: number = 0;
  // MÉTODO USADO PARA ENVIAR COMUNICADO POR CORREO 
  EnviarCorreo(correos) {
    let datosCorreo = {
      id_envia: this.idEmpleado,
      correo: correos,
      mensaje: this.data.mensaje,
      asunto: this.data.asunto,
    }

    this.restN.EnviarCorreoComunicado(this.idEmpresa, datosCorreo).subscribe(envio => {
      if (envio.message === 'error') {
        this.mostrarAlertas("Ups !!! algo salio mal, revisa tu configuración de correo electrónico.",
          6000, 'danger');
        this.closeModal();
      }
      else {
        this.mostrarAlertas("Mensaje enviado exitosamente.", 6000, 'success');
        this.closeModal();
      }

    }, error => { });
  }

  cont_correo: number = 0;
  info_correo: string = '';
  ContarCorreos(data: any) {
    this.cont_correo = 0;
    this.info_correo = '';
    data.forEach((obj: any) => {
      if (obj.comunicado_mail === true) {
        this.cont_correo = this.cont_correo + 1
        if (this.info_correo === '') {
          this.info_correo = obj.correo;
        }
        else {
          this.info_correo = this.info_correo + ', ' + obj.correo;
        }

      }
    })
  }

  NotificarSistema(empleado_envia: any, empleado_recive: any) {
    let mensaje = {
      id_empl_envia: empleado_envia,
      id_empl_recive: empleado_recive,
      descripcion: this.data.asunto,
      mensaje: this.data.mensaje,
      tipo: 6,
      user_name: this.dataUserServices.username,
      ip: localStorage.getItem('ip')
    }
    console.log(mensaje);
    this.restN.EnviarMensajeComunicado(mensaje).subscribe(res => {
      console.log(res.respuesta);
      this.restN.RecibirNuevosAvisos(res.respuesta);
    })
  }

  correos: number;
  BuscarParametro() {
    // id_tipo_parametro PARA LIMITE DE CORREOS = 13
    let datos = [];
    this.restP.ObtenerDetallesParametros(33).subscribe(
      res => {
        datos = res;
        console.log('datos correo -----------')
        if (datos.length != 0) {
          this.correos = parseInt(datos[0].descripcion)
        }
        else {
          this.correos = 0
        }
      });
  }



}
