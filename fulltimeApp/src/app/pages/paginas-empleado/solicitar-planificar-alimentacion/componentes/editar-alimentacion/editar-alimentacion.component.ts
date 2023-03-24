import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import moment from 'moment';
moment.locale('es');

import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { AlimentacionService } from 'src/app/services/alimentacion.service';
import { CatalogosService } from 'src/app/services/catalogos.service';

import { Cg_DetalleMenu, Servicios_Comida, Menu_Servicios } from 'src/app/interfaces/Catalogos';
import { estadoBoolean } from 'src/app/interfaces/Estados';
import { Alimentacion } from 'src/app/interfaces/Alimentacion';
import { AutorizacionesService } from 'src/app/services/autorizaciones.service';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { ParametrosService } from 'src/app/services/parametros.service';

@Component({
  selector: 'app-editar-alimentacion',
  templateUrl: './editar-alimentacion.component.html',
  styleUrls: ['../../solicitar-planificar-alimentacion.page.scss']
})

export class EditarAlimentacionComponent implements OnInit {

  @ViewChild('formRegistro', { static: true }) ngForm: NgForm;
  @Input() alimentacion!: Alimentacion;
  reg: Alimentacion;
  radioButton = estadoBoolean;
  loadingBtn: boolean = false;
  fec_actual: Date;
  fec_actual_formato: string;
  detalle_menu_selected: any = {};

  menu_selected: any = [];

  plato_selected: any = [];

   //Variables para almacenar la fecha y la hora que se ingresa en el Form
   fecha_comida: any;

   //Variable para mostrar la fecha en el input de fecha de consumo
   fecha_consumo: string = "";

  //variable para ocultar el boton de guardar
  btnOcultoguardar: boolean = false;

  public get cg_detalle_menu(): Cg_DetalleMenu[] {
    return this.catalogos.detalle_menu
  }

  public get servicios(): Servicios_Comida[] {
    return this.catalogos.servicios_comida_lista;
  }

  public get menus(): Menu_Servicios[] {
    return this.catalogos.lista_menu;
  }

  private subscripted: Subscription;
  private subs_bool: boolean = false;

  // VARIABLES DE ACTIVACIÓN
  activar_menu: boolean = true;
  activar_plato: boolean = true;

  idEmpresa: number;

  constructor(
    private alimentacionService: AlimentacionService,
    private validar: ValidacionesService,
    private catalogos: CatalogosService,
    private autoriza: AutorizacionesService,
    private notifica: NotificacionesService,
    public modalController: ModalController,
    public parametro: ParametrosService,
  ) {
    this.idEmpresa = parseInt(localStorage.getItem('id_empresa'));
  }

  tiempo: any;

  ngOnInit() {
    this.tiempo = moment();
    this.catalogos.getDetalleMenu();
    this.catalogos.getServicioComida();
    this.catalogos.getMenuServicios();
    this.reg = this.alimentacion;
    this.fecha_comida = this.alimentacion.fec_comida;
    this.fecha_consumo = moment(this.fecha_comida).format('YYYY-MM-DD');

    this.LecturaDatos();
    this.obtenerInformacionEmpleado();
    console.log('ver datos', this.reg)
    this.BuscarFormatos();
    this.fec_actual = new Date();
    this.fec_actual_formato = moment(this.fec_actual).format('YYYY-MM-DD');
  }

  // BUSQUEDA DE PARAMETROS DE FECHAS Y HORAS
  formato_fecha: string;
  formato_hora: string;
  BuscarFormatos() {
    this.parametro.ObtenerFormatos().subscribe(
      resp => {
        this.formato_fecha = resp.fecha;
        this.formato_hora = resp.hora;
      }
    )
  }

  solInfo: any;
  obtenerInformacionEmpleado() {
    var id_empleado = localStorage.getItem('empleadoID');
    this.autoriza.getInfoEmpleadoByIdEmpleado(id_empleado).subscribe(
      res => {
        if (res.estado === 1) {
          var estado = true;
        }
        this.solInfo = [];
        this.solInfo = {
          comida_mail: res.comida_mail,
          comida_noti: res.comida_noti,
          empleado: res.id_empleado,
          estado: estado,
          correo: res.correo,
          id_dep: res.id_departamento,
        }
      })
  }

  calcularhoras() {
    if (
      this.reg.fec_comida === undefined ||
      this.reg.fecha === undefined) {

      this.loadingBtn = false;
      this.validar.showToast('Llenar todos los campos de fechas y horas del permiso', 3000, 'warning')
      return false
    }

    const fechasValidas = this.validar.validarRangoFechasIngresa(this.reg.fecha, this.reg.fec_comida, true)
    if (!fechasValidas) return this.valoresDefectoValidacionFecha()

    const hora_inicio = this.validar.TiempoFormatoHHMMSS(this.reg.hora_inicio)
    const hora_fin = this.validar.TiempoFormatoHHMMSS(this.reg.hora_fin)

    const fec_comp_inicio = this.validar.Unir_Fecha_Hora(this.reg.fec_comida, hora_inicio);
    const fec_comp_final = this.validar.Unir_Fecha_Hora(this.reg.fec_comida, hora_fin);

    return true
  }

  valoresDefectoValidacionFecha() {
    this.reg.fec_comida = undefined;
    this.loadingBtn = false;
    return false
  }

  valoresDefectoValidacionHoras(message = '', showToast = false) {
    this.reg.hora_inicio = undefined;
    this.reg.hora_fin = undefined;
    this.loadingBtn = false;
    if (showToast) return this.validar.showToast(message, 3000, 'danger');
    return false
  }

  plato: any = [];
  detalle_horario: any = {};
  ChangePlatoMenu() {
    this.LimpiarFormularioPlato();
    this.plato = this.cg_detalle_menu.filter(o => {
      return o.id_menu === this.reg.id_plato
    })
    this.plato_selected = this.plato;
    if (this.plato_selected.length != 0) {
      this.activar_plato = false;
    }
    else {
      this.activar_plato = true;
    }
    this.DetalleHorario();
  }

  ChangeDetalleComida() {
    this.detalle_menu_selected = {};
    const [cg_det_comida] = this.cg_detalle_menu.filter(o => {
      return o.id === this.reg.id_comida
    })
    if (cg_det_comida != undefined) {
      this.detalle_menu_selected = cg_det_comida;
    }
  }

  menu: any = [];
  ChangeServiciosMenu() {
    this.LimpiarFormularioMenu();
    this.LimpiarFormularioPlato();
    this.menu = this.menus.filter(o => {
      return o.tipo_comida === this.reg.id_servicio
    })
    this.menu_selected = this.menu;
    if (this.menu_selected.length != 0) {
      this.activar_menu = false;
    }
    else {
      this.activar_menu = true;
    }
  }

  DetalleHorario() {
    const [horario] = this.menu_selected.filter(o => {
      return o.id === this.reg.id_plato
    })
    if (horario != undefined) {
      this.reg.hora_inicio = horario.hora_inicio;
      this.reg.hora_fin = horario.hora_fin
    }

  }

     /* ********************************************************************************** *
     *                 METODO PARA VALIDAR DUPLICIDAD EN LA SOLICITUD                  *
   * ********************************************************************************** */
     mostrarCalculos(e){
      if(!e.target.value){
        this.reg.fec_comida = moment(new Date()).format('YYYY-MM-DD');
        return this.fecha_comida = moment(this.reg.fec_comida).format('YYYY-MM-DD');
      }else{
        this.reg.fec_comida = e.target.value;
        const fec_comida = (moment(this.reg.fec_comida).format('YYYY-MM-DD'));
        this.fecha_consumo = fec_comida;

        const codigo = parseInt(localStorage.getItem('empleadoID'));

        console.log("Fecha ingresada: ",fec_comida)
        if(fec_comida != moment(this.fecha_comida).format('YYYY-MM-DD')){
          this.alimentacionService.getlistaAlimentacionByFechasyCodigo(fec_comida, codigo).subscribe(solicitados => {
            if(solicitados.length != 0){
              this.validar.showToast('Ups! tiene una solicitud de Alimentacion en esa fecha', 3500, 'warning');
              return this.btnOcultoguardar = true;
            }
            else{
              return this.btnOcultoguardar = false;
            }
            }, err => {
            this.validar.showToast('Lo sentimos tenemos problemas para verificar su solicitud', 3500, 'warning');
            return this.btnOcultoguardar = true;
          }); 
        }

      }
    }

  UpdateRegister() {
    this.loadingBtn = true;

    const validadionesFechasHoras = this.calcularhoras()
    if (!validadionesFechasHoras) return

    console.log('PASO VALIDACIONES DE FECHAS Y HORAS');
    this.reg.hora_inicio = this.validar.TiempoFormatoHHMMSS(this.reg.hora_inicio);
    this.reg.hora_fin = this.validar.TiempoFormatoHHMMSS(this.reg.hora_fin);

    this.subscripted = this.alimentacionService.putAlimentacion(this.reg).subscribe(
      resp => {
        this.NotificarEdicionComida(resp);
        this.validar.showToast('Registro actualizado.', 3000, 'success');
        this.closeModal(true)
      },
      err => { this.validar.showToast(err.error.message, 3000, 'danger') },
      () => { this.loadingBtn = false; this.ngForm.resetForm(); this.subs_bool = true }
    )

  }

  // METODO DE ENVIO DE NOTIFICACIONES RESPECTO A LA APROBACION
  NotificarEdicionComida(comida: any) {
    var datos = {
      depa_user_loggin: this.solInfo.id_dep,
      objeto: comida,
    }
    this.autoriza.BuscarJefes(datos).subscribe(alimentacion => {
      alimentacion.EmpleadosSendNotiEmail.push(this.solInfo);
      console.log(alimentacion);
      this.EnviarCorreo(alimentacion);
      this.NotificarEvento(alimentacion);

    });
  }

  // METODO PARA ENVIO DE CORREO
  EnviarCorreo(alimentacion: any) {
    var cont = 0;
    var correo_usuarios = '';

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE ALIMENTACIÓN
    let solicitud = this.validar.FormatearFecha(alimentacion.fec_comida, this.formato_fecha, this.validar.dia_completo);

    alimentacion.EmpleadosSendNotiEmail.forEach(e => {

      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      // SI EL USUARIO SE ENCUENTRA ACTIVO Y TIENEN CONFIGURACIÓN RECIBIRA CORREO DE SOLICITUD DE ALIMENTACIÓN
      if (e.comida_mail) {
        if (e.estado === true) {
          if (correo_usuarios === '') {
            correo_usuarios = e.correo;
          }
          else {
            correo_usuarios = correo_usuarios + ', ' + e.correo
          }
        }
      }

      if (cont === alimentacion.EmpleadosSendNotiEmail.length) {
        let comida = {
          id_usua_solicita: alimentacion.id_empleado,
          tipo_solicitud: 'Servicio de alimentación actualizado por',
          fec_solicitud: solicitud,
          observacion: alimentacion.observacion,
          id_comida: alimentacion.id_comida,
          proceso: 'actualizado',
          estadoc: 'Pendiente de autorización',
          correo: correo_usuarios,
          asunto: 'ACTUALIZACION DE SOLICITUD DE SERVICIO DE ALIMENTACION',
          inicio: this.validar.FormatearHora(alimentacion.hora_inicio, this.formato_hora),
          final: this.validar.FormatearHora(alimentacion.hora_fin, this.formato_hora),
          extra: alimentacion.extra,
          id: alimentacion.id,
          solicitado_por: (localStorage.getItem('nom')) + ' ' + (localStorage.getItem('ap')),
        }

        if (correo_usuarios != '') {
          this.autoriza.EnviarCorreoSolAlimentacion(this.idEmpresa, comida).subscribe(
            resp => {
              if (resp.message === 'ok') {
                this.validar.showToast('Correo de solicitud enviado exitosamente.', 5000, 'success');
              }
              else {
                this.validar.showToast('Ups algo salio mal !!! No fue posible enviar correo de solicitud.', 5000, 'warning');
              }
            },
            err => {
              this.validar.showToast(err.error.message, 5000, 'danger');
            },
            () => { },
          )
        }
      }
    })
  }

  // METODO PARA ENVIO DE NOTIFICACION
  NotificarEvento(alimentacion: any) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE ALIMENTACIÓN
    let desde = this.validar.FormatearFecha(alimentacion.fec_comida, this.formato_fecha, this.validar.dia_completo);

    let inicio = this.validar.FormatearHora(alimentacion.hora_inicio, this.formato_hora);
    let final = this.validar.FormatearHora(alimentacion.hora_fin, this.formato_hora);

    let mensaje = {
      create_at: this.tiempo.format('YYYY-MM-DD') + ' ' + this.tiempo.format('HH:mm:ss'),
      id_empl_envia: parseInt(localStorage.getItem('empleadoID')),
      id_empl_recive: '',
      tipo: 1, // SOLICITUD SERVICIO DE ALIMENTACIÓN 
      mensaje: 'Ha actualizado su solicitud de alimentación desde ' +
        desde +
        ' horario de ' + inicio + ' a ' + final + ' servicio ',
      id_comida: alimentacion.id_comida
    }

    //Listado para eliminar el usuario duplicado
    var allNotificaciones = [];
    //Ciclo por cada elemento del listado
    alimentacion.EmpleadosSendNotiEmail.forEach(function(elemento, indice, array) {
      // Discriminación de elementos iguales
      if(allNotificaciones.find(p=>p.empleado == elemento.empleado) == undefined)
      {
        // Nueva lista de empleados que reciben la notificacion
        allNotificaciones.push(elemento);
      }
    });

    console.log("Usuarios que reciben la notificacion: ",allNotificaciones);

    allNotificaciones.forEach(e => {
      mensaje.id_empl_recive = e.empleado;
      if (e.comida_noti) {
        this.notifica.EnviarMensajePlanComida(mensaje).subscribe(res => {
          console.log(res.message);
          this.alimentacionService.sendNotiRealTime(res.respuesta);
        },
          err => {
            this.validar.showToast(err.error.message, 3000, 'danger')
          },
          () => { })
      }

    })

  }

  ngOnDestroy() {
    if (this.subs_bool) {
      this.subscripted.unsubscribe()
    }
  }

  closeModal(refreshInfo: Boolean) {
    this.modalController.dismiss({
      'refreshInfo': refreshInfo
    });
  }

  LimpiarFormularioMenu() {
    this.reg.id_plato = undefined;
    this.reg.hora_inicio = undefined;
    this.reg.hora_fin = undefined;
  }

  LimpiarFormularioPlato() {
    this.reg.id_comida = undefined;
  }

  LecturaDatos() {
    this.menu = this.menus.filter(o => {
      return o.tipo_comida === this.reg.id_servicio
    })
    this.menu_selected = this.menu;
    if (this.menu_selected.length != 0) {
      this.activar_menu = false;
    }
    else {
      this.activar_menu = true;
    }

    this.plato = this.cg_detalle_menu.filter(o => {
      return o.id_menu === this.reg.id_plato
    })
    this.plato_selected = this.plato;
    if (this.plato_selected.length != 0) {
      this.activar_plato = false;
    }
    else {
      this.activar_plato = true;
    }

    this.DetalleHorario();

    this.detalle_menu_selected = {};
    const [cg_det_comida] = this.cg_detalle_menu.filter(o => {
      return o.id === this.reg.id_comida
    })
    if (cg_det_comida != undefined) {
      this.detalle_menu_selected = cg_det_comida;
    }
  }

}
