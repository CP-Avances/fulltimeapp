import { Component, ViewChild } from '@angular/core';
import { LoadingController, ModalController, ToastController, IonDatetime } from '@ionic/angular';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { ReporteTimbreComponent } from 'src/app/modals/reporte-timbre/reporte-timbre.component';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { ParametrosService } from 'src/app/services/parametros.service';

import moment, { min } from 'moment';
moment.locale('es');
interface checkOptions {
  valor: number;
  nombre: string
}
@Component({
  selector: 'app-reporte-timbres',
  templateUrl: './reporte-timbres.page.html',
  styleUrls: ['./reporte-timbres.page.scss'],
})
export class ReporteTimbresPage {

  get fechaInicio(): string { return this.dataUserService.fechaRangoInicio }
  get fechaFinal(): string { return this.dataUserService.fechaRangoFinal }

  @ViewChild(IonDatetime) datetimeInicio: IonDatetime;
  @ViewChild(IonDatetime) datetimeFinal: IonDatetime;
  loadingEmpleado: boolean = true;

  fechaIn: string = "";
  fechaFi: string = "";


  listLoaded: boolean = false;
  opcion_sucursal: boolean = false;
  opcion_depa: boolean = false;
  opcion_empleado: boolean = false;

  departamentos: any = [];
  departamentos_filtro: any = [];
  sucursales_filtro: any = [];
  sucursales: any = [];
  ver: boolean = true;
  verDepartamento: boolean = true;
  verSucursal: boolean = true;
  empleados: any = [];
  empleados_filtro: any = [];
  solicitudes: checkOptions[] = [
    { valor: 1, nombre: 'Sucursal' },
    { valor: 2, nombre: 'Departamento' },
    { valor: 3, nombre: 'Empleado' },
  ];


  constructor(
    public modalController: ModalController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private dataUserService: DataUserLoggedService,
    public restN: NotificacionesService,
    public restP: ParametrosService,

  ) { }

  changeFechaInicio(e) {
    this.dataUserService.setFechaRangoFinal(null);
    this.fechaFi = null
    if (!e.target.value) {
      this.dataUserService.setFechaRangoInicio((moment(new Date()).format('YYYY-MM-DD')));
      return this.fechaIn = moment(e.target.value).format('YYYY-MM-DD');
    } else {
      this.dataUserService.setFechaRangoInicio(e.target.value);
      this.datetimeInicio.confirm(true);
      if (this.fechaInicio == null || this.fechaInicio == '') {
        this.fechaIn = null;
      } else {
        this.fechaIn = moment(this.fechaInicio).format('YYYY-MM-DD');
      }
    }
  }

  changeFechaFinal(e) {
    if (!e.target.value) {
      if (moment(this.fechaInicio).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')) {
        this.dataUserService.setFechaRangoFinal(this.fechaInicio);
        this.fechaFi = moment(e.target.value).format('YYYY-MM-DD');//Ajustamos el formato de la fecha para mostrar en el input
      } else {
        this.dataUserService.setFechaRangoFinal(null);
        this.fechaFi = null
        this.mostrarToas('Seleccione una Fecha Final', 3000, "warning");
      }
    } else {
      this.dataUserService.setFechaRangoFinal(e.target.value);
      this.datetimeFinal.confirm(true);
      if (this.fechaFinal == null || this.fechaFinal == '') {
        this.fechaFi = null;
      } else {
        this.fechaFi = moment(e.target.value).format('YYYY-MM-DD');
      }
    }
  }


  limpiarRango_fechas() {
    this.dataUserService.setFechaRangoInicio('');
    this.dataUserService.setFechaRangoFinal('');
    this.fechaIn = "";
    this.fechaFi = "";
  }

  //Pestalas de mensajes
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

  async presentModal(objeto: any) {
    console.log('entro a modal...');

    const modal = await this.modalController.create({
      component: ReporteTimbreComponent,
      componentProps: {
        'data': objeto,
      },
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  ionViewWillLeave() {
    console.log('Salio de reporte de Timbres');
    this.limpiarRango_fechas();
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

  BuscarParametro() {
    // id_tipo_parametro PARA LIMITE DE CORREOS = 13
    let datos = [];
    this.restP.ObtenerDetallesParametros(33).subscribe(
      res => {
        datos = res;
      });
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
    this.presentModal(usuarios)
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
    this.presentModal(usuarios)

    console.log(' ver empleados de departamentos', respuesta)

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

  ModelarEmpleados(dataEmpleados) {
    let respuesta: any = [];
    this.empleados.forEach((obj: any) => {
      dataEmpleados.find(obj1 => {
        if (obj1.id === obj.id) {
          respuesta.push(obj)
        }
      })
    })
    this.presentModal(respuesta)

    console.log('ver usuario---------------------------', respuesta);
    console.log(' ver donde falla', respuesta)
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

  pageActual: number = 1;
  pageActualDepartamento: number = 1;
  pageActualSucursal: number = 1;
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
