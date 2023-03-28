import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import moment from 'moment';
moment.locale('es');

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

  isChecked: boolean = true;

  constructor(
    public modalController: ModalController,
    public restN: NotificacionesService,
    public toastController: ToastController,
    public restP: ParametrosService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleadoID'));
    this.idEmpresa = parseInt(localStorage.getItem('id_empresa'));
  }

  tiempo: any;    
  ngOnInit(): void {
    this.tiempo = moment();
    sessionStorage.removeItem('datos_comunicado');
    this.restN.BuscarDatosGenerales().subscribe((res: any[]) => {
      sessionStorage.setItem('datos_comunicado', JSON.stringify(res))

      res.forEach(obj => {
        this.sucursales.push({
          id: obj.id_suc,
          nombre: obj.name_suc
        })
      })

      res.forEach(obj => {
        obj.departamentos.forEach(ele => {
          this.departamentos.push({
            id: ele.id_depa,
            nombre: ele.name_dep
          })
        })
      })

      res.forEach(obj => {
        obj.departamentos.forEach(ele => {
          ele.empleado.forEach(r => {
            if (r.comunicado_mail === true || r.comunicado_noti === true) {

              let elemento = {
                id: r.id,
                nombre: r.name_empleado,
                codigo: r.codigo,
                cedula: r.cedula,
                correo: r.correo,
                comunicado_mail: r.comunicado_mail,
                comunicado_noti: r.comunicado_noti,
              }
              this.empleados.push(elemento)
            }
          })
        })
      })
      this.BuscarParametro();

    }, err => {
      this.mostrarAlertas("No se ha encontrado información.", 1000, 'danger')
    })
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
      color: color
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
    console.log(this.radioValue);

    if (this.radioValue === 1) {
      this.opcion_sucursal = true;
      this.opcion_depa = false;
      this.opcion_empleado = false;

    }
    else if (this.radioValue === 2) {
      this.opcion_sucursal = false;
      this.opcion_depa = true;
      this.opcion_empleado = false;
    }
    else if (this.radioValue === 3) {
      this.opcion_sucursal = false;
      this.opcion_depa = false;
      this.opcion_empleado = true;
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
          obj.departamentos.forEach((obj2: any) => {
            obj2.empleado.forEach((obj3: any) => {
              if (obj3.comunicado_mail === true || obj3.comunicado_noti === true) {
                usuarios.push(obj3)
              }
            })
          })
        }
      })
    })
    console.log('ver usuario---------------------------', usuarios);
    this.EnviarNotificaciones(usuarios);
  }

  ModelarDepartamentos(dataDepartamentos) {
    let usuarios: any = [];
    let respuesta = JSON.parse(sessionStorage.getItem('datos_comunicado'))
    respuesta.forEach((obj: any) => {
      obj.departamentos.forEach((obj1: any) => {
        dataDepartamentos.find(obj2 => {
          if (obj1.id_depa === obj2.id) {
            obj1.empleado.forEach((obj3: any) => {
              if (obj3.comunicado_mail === true || obj3.comunicado_noti === true) {
                usuarios.push(obj3)
              }
            })
          }
        })
      })
    })
    console.log('ver usuario---------------------------', usuarios);
    this.EnviarNotificaciones(usuarios);
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
  }


  envios: any = [];
  cont: number = 0;
  boton_enviar = false;
  EnviarNotificaciones(data: any) {

    if (data.length > 0) {

      this.ContarCorreos(data);
      if (this.cont_correo <= this.correos) {
        this.cont = 0;
        this.boton_enviar = true;

        data.forEach((obj: any) => {
          if (obj.comunicado_noti === true) {
            this.NotificarSistema(this.idEmpleado, obj.id);
          }

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
          ' correos.', 1000, 'danger')
      }
    }
    else {
      this.mostrarAlertas("No ha seleccionado usuarios.", 1000, 'danger')
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
      create_at: this.tiempo.format('YYYY-MM-DD') + ' ' + this.tiempo.format('HH:mm:ss'),
      id_empl_envia: empleado_envia,
      id_empl_recive: empleado_recive,
      mensaje: this.data.asunto + '; ' + this.data.mensaje, 
      tipo: 6
    }
    console.log(mensaje);
    this.restN.EnviarMensajeComunicado(mensaje).subscribe(res => {
      console.log(res.message);
      this.restN.RecibirNuevosAvisos(res.respuesta);
    })
  }

  correos: number;
  BuscarParametro() {
    // id_tipo_parametro PARA RANGO DE UBICACIÓN = 24
    let datos = [];
    this.restP.ObtenerDetallesParametros(24).subscribe(
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
