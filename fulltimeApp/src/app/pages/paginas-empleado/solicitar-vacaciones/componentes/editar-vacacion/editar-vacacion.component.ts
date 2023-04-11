import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Vacacion } from 'src/app/interfaces/Vacacion';
import { NgForm } from '@angular/forms';
import moment from 'moment';
moment.locale('es');

import { AutorizacionesService } from 'src/app/services/autorizaciones.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { VacacionesService } from 'src/app/services/vacaciones.service';
import { CatalogosService } from 'src/app/services/catalogos.service';
import { EmpleadosService } from 'src/app/services/empleados.service';

import { Notificacion, notificacionValueDefault } from 'src/app/interfaces/Notificaciones';
import { estadoBoolean } from 'src/app/interfaces/Estados';
import { Cg_Feriados } from 'src/app/interfaces/Catalogos';
import { HorarioE } from 'src/app/interfaces/Horarios';
import { ParametrosService } from 'src/app/services/parametros.service';
import { HorasExtrasService } from 'src/app/services/horas-extras.service';
import { PermisosService } from 'src/app/services/permisos.service';

@Component({
  selector: 'app-editar-vacacion',
  templateUrl: './editar-vacacion.component.html',
  styleUrls: ['../../solicitar-vacaciones.page.scss']
})

export class EditarVacacionComponent implements OnInit {

  @Input() vacacion!: Vacacion;
  reg: Vacacion;

  @ViewChild('formRegistro', { static: true }) ngForm: NgForm;
  radioButton = estadoBoolean;
  loadingBtn: boolean = false;
  horarioEmpleado: HorarioE;

  //Variables para almacenar la fecha y la hora que se ingresa en el Form
  fecha_inicio: any;
  fecha_final: any;

  //Variables para mostrar en los inputs las fechas
  dia_inicio: string = "";
  dia_fianl: string = "";
  dia_ingreso: string = "";

  disabled_dia_fianl: boolean = false;
  disabled_dia_ingreso: boolean = false;

  private subscripted: Subscription;
  private subs_bool: boolean = false;

  //variable para ocultar el boton de calculos de acuerdo a la opcion que se ingresa
  btnOculto: boolean = true;
  //variable para ocultar el boton de guardar
  btnOcultoguardar: boolean = true;

  private get cg_feriados(): Cg_Feriados[] {
    return this.catalogoService.cg_feriados
  }

  idEmpresa: number;

  constructor(
    private empleadoService: EmpleadosService,
    private permisoService: PermisosService,
    private horasExtrasService: HorasExtrasService,
    private vacacionService: VacacionesService,
    private catalogoService: CatalogosService,
    public validar: ValidacionesService,
    private autoriza: AutorizacionesService,
    public modalController: ModalController,
    public parametro: ParametrosService,
    public alertCrtl: AlertController,
  ) {
    this.idEmpresa = parseInt(localStorage.getItem('id_empresa'));
  }

  tiempo: any;
  ngOnInit() {
    this.tiempo = moment();
    this.reg = this.vacacion;
    this.fecha_inicio = this.vacacion.fec_inicio;
    this.fecha_final = this.vacacion.fec_final;
    this.dia_inicio = moment(this.fecha_inicio).format('YYYY-MM-DD');
    this.dia_fianl = moment(this.fecha_final).format('YYYY-MM-DD');
    this.dia_ingreso = moment(this.vacacion.fec_ingreso).format('YYYY-MM-DD');
    this.catalogoService.getFeriadosAnual()

    this.btnOcultoguardar = true;

    this.obtenerInformacionEmpleado();
    this.BuscarFormatos();
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
    this.autoriza.getInfoEmpleadoByCodigo(this.reg.codigo).subscribe(
      res => {
        if (res.estado === 1) {
          var estado = true;
        }
        this.solInfo = [];
        this.solInfo = {
          vaca_mail: res.vaca_mail,
          vaca_noti: res.vaca_noti,
          empleado: res.id_empleado,
          id_suc: res.id_sucursal,
          id_dep: res.id_departamento,
          estado: estado,
          correo: res.correo,
        }
      })
  }

  valoresPorDefectoResultado(){
    this.reg.dia_laborable = undefined;
    this.reg.dia_libre = undefined;
    this.btnOcultoguardar = true;
  }

  //METODO VALIDADOR DE DIAS LIBRES
  DiaIniciolLibre(fecha_ingresada){
    let dia_retur; 
    if(fecha_ingresada != null && fecha_ingresada != ""){
      dia_retur = this.validar.validarDiaLaboral_Libre(fecha_ingresada.toString(),this.horarioEmpleado, this.cg_feriados);
      if(dia_retur == undefined){
        this.validar.showToast('Ups! No tiene horario para realizar solicitudes', 3500, 'warning');
      }
      
      if(dia_retur == 0){
        this.showAlert();
        return dia_retur;
      }
      return dia_retur;
    }
  }

  // Diseno de Mensaje de notificacion con logo 
  async showAlert(){
    let alert = await this.alertCrtl.create({
      message: `<div class="card-alert">
                  <img src="../../../assets/images/LOGOBLFT.png" class="img-alert">
                  <br>
                  <p> Ups! El dia que ingreso esta fuera de su calendario laboral </p>
                  <p> Por favor cambie a un dia dentro de su calendario </p>
                </div>`,
      buttons: [
        {
          text: 'OK',
          cssClass: 'alert-button-confirm'
        }],
      mode: "ios",
      backdropDismiss: false,
    });await alert.present();
  }

  // METODO VALIDAR EL INPUT DE DIA INICIAL, FINAL y INGRESO
  ChangeDiaInicio(e){
    if(!e.target.value){
      this.reg.fec_inicio = moment(new Date()).format('YYYY-MM-DD');

      const hoy = moment(this.reg.fec_inicio).format("DD/MM/YYYY, HH:mm:ss")
      this.empleadoService.ObtenerUnHorarioEmpleado(this.reg.codigo, hoy).subscribe(
        horario => { 
          this.horarioEmpleado = horario;
          
          if(this.DiaIniciolLibre(this.reg.fec_inicio) == 0){
            this.disabled_dia_fianl = true, this.disabled_dia_ingreso = true;
          }else{
            this.disabled_dia_fianl = false, this.disabled_dia_ingreso = false;
          }
          return this.dia_inicio = moment(this.reg.fec_inicio).format('YYYY-MM-DD');
        },
        err => { this.validar.showToast(err.error.message, 3000, 'danger') 
        this.reg.fec_inicio = undefined;
        return this.dia_inicio = '';
        },
        () => { }
      )

    }else{

      if(!(moment(e.target.value).format('YYYY-MM-DD') == moment(this.dia_inicio).format('YYYY-MM-DD'))){
        this.reg.fec_final = null;
        this.reg.fec_ingreso = null;
        this.reg.dia_laborable = null;
        this.reg.dia_libre = null;
        this.dia_fianl = '';
        this.dia_ingreso = '';
        this.btnOcultoguardar = true;
      }

      this.reg.fec_inicio = e.target.value;
      this.dia_inicio = moment(e.target.value).format('YYYY-MM-DD');

      if(this.reg.fec_inicio != '' || this.reg.fec_inicio != null){
        
        const hoy = moment(this.reg.fec_inicio).format("DD/MM/YYYY, HH:mm:ss")
        this.empleadoService.ObtenerUnHorarioEmpleado(this.reg.codigo, hoy).subscribe(
          horario => { 
            this.horarioEmpleado = horario 
            if(this.DiaIniciolLibre(this.reg.fec_inicio) == 0){
              return this.disabled_dia_fianl = true, this.disabled_dia_ingreso = true;
            }else{
              return this.disabled_dia_fianl = false, this.disabled_dia_ingreso = false;
            }
          },
          err => { 
            this.validar.showToast(err.error.message, 3000, 'danger') 
            return this.dia_inicio = '';  
          },
          () => { }
        )

        
      }

    }
  }

  ChangeDiaFinal(e){
    this.valoresPorDefectoResultado();
    if(!e.target.value){
      if(moment(this.reg.fec_inicio).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')){
        this.reg.fec_final = this.reg.fec_inicio;
        return this.dia_fianl = moment(e.target.value).format('YYYY-MM-DD');//Ajustamos el formato de la fecha para mostrar en el input
      }else{
        this.reg.fec_final = null;
        this.validar.showToast('Seleccione una Fecha Final', 3000, "warning");
        return this.dia_fianl = null
      }
    }else{
      this.dia_ingreso = "";
      this.dia_fianl = moment(e.target.value).format('YYYY-MM-DD');
      this.reg.fec_final = e.target.value;

      if(moment(this.reg.fec_final).format('YYYY-MM-DD') == moment(this.reg.fec_inicio).format('YYYY-MM-DD')){
        this.validar.showToast('Las fechas no pueden ser iguales', 3000, "warning");
        return this.disabled_dia_ingreso = true;
      }
      return this.disabled_dia_ingreso = false;
    }
  }

  ChangeDiaIngreso(e){
    this.valoresPorDefectoResultado();
    if(!e.target.value){
      if(moment(this.reg.fec_final).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')){
        this.reg.fec_ingreso = this.reg.fec_final;
        this.btnOculto = false;
        this.validar.showToast('Calcule el tiempo para actualizar.', 3000, 'warning')
        return this.dia_ingreso = moment(e.target.value).format('YYYY-MM-DD');//Ajustamos el formato de la fecha para mostrar en el input
      }else{
        this.reg.fec_ingreso = null;
        this.validar.showToast('Seleccione una Fecha Ingreso', 3000, "warning");
        return this.dia_ingreso = null
      }
    }else{
      this.btnOculto = false;
      this.reg.fec_ingreso = e.target.value;
      this.dia_ingreso = moment(e.target.value).format('YYYY-MM-DD');
    }
    
  }

  mostrarCalculos(){
    //variables para validar el dia de inicio completo y el dia final completo y buscar duplicidad.
    const minutosinicio = '00:00:00';
    const minutosfinal = '23:00:00';
    const fec_inicio = (moment(this.reg.fec_inicio).format('YYYY-MM-DD'))+' '+ minutosinicio;
    const fec_final = (moment(this.reg.fec_final).format('YYYY-MM-DD')) +' '+ minutosfinal;
    const codigo = parseInt(localStorage.getItem('codigo'));
    const id_solicitud = this.reg.id;


    if(moment(fec_inicio).format('YYYY-MM-DD') != moment(this.fecha_inicio).format('YYYY-MM-DD') || 
       moment(fec_final).format('YYYY-MM-DD') != moment(this.fecha_final).format('YYYY-MM-DD')){
      
      this.permisoService.getlistaPermisosByFechasyCodigoEdit(fec_inicio, fec_final, codigo, id_solicitud).subscribe(solicitados => {
        if(solicitados.length != 0){
          this.reg.dia_laborable = null;
          this.reg.dia_libre = null;
          this.validar.showToast('Ups! Ya existe permisos en esas fechas ', 3500, 'warning');
          return this.btnOcultoguardar = true;
        }
        else{
          this.horasExtrasService.getlistaHorasExtrasByFechasyCodigo(fec_inicio, fec_final, codigo).subscribe(solicitados => {
            if(solicitados.length != 0){
              this.reg.dia_laborable = null;
              this.reg.dia_libre = null;
              this.validar.showToast('Ups! Ya existe horas extras en esas fechas ', 3500, 'warning');
              return this.btnOcultoguardar = true;
            }
            else{
              this.vacacionService.getlistaVacacionesByFechasyCodigoEdit(fec_inicio, fec_final, codigo, id_solicitud).subscribe(solicitados => {
                if(solicitados.length != 0){
                  this.reg.dia_laborable = null;
                  this.reg.dia_libre = null;
                  this.validar.showToast('Ups! Ya existe vacaciones en esas fechas ', 3500, 'warning');
                  return this.btnOcultoguardar = true;
                }
                else{
                  this.calcularDiasVacaciones();
                  return this.btnOcultoguardar = false;
                }
              }, error => {
                this.validar.showToast('Lo sentimos tenemos problemas para verificar su permiso', 3500, 'warning');
              }); 
            }
          }, error => {
            this.validar.showToast('Lo sentimos tenemos problemas para verificar su permiso', 3500, 'warning');
          });
        }
      }, error => {
        this.validar.showToast('Lo sentimos tenemos problemas para verificar su permiso', 3500, 'warning');
      });
    }else{
      this.calcularDiasVacaciones();
    }
  }

  calcularDiasVacaciones() {
    if (
      this.reg.fec_inicio === undefined ||
      this.reg.fec_final === undefined ||
      this.reg.fec_ingreso === undefined) {

      this.loadingBtn = false;
      this.validar.showToast('Llenar todos los campos de fechas de vacación', 3000, 'warning')
      return false
    }

    const fechasValidas = this.validar.validarRangoFechasIngresa(this.reg.fec_inicio, this.reg.fec_final)
    if (!fechasValidas) return this.valoresDefectoValidacionFechas()

    const fechasValidasReingresa = this.validar.validarRangoFechasIngresa(this.reg.fec_final, this.reg.fec_ingreso, true)
    if (!fechasValidasReingresa) return this.valoresDefectoValidacionFechas()

    const { dia_laborable, dia_libre } = this.validar.vacacionesByFeriadoAndHorarioE(this.reg.fec_inicio.toString(), this.reg.fec_final.toString(), this.horarioEmpleado, this.cg_feriados)

    this.reg.dia_laborable = dia_laborable;
    this.reg.dia_libre = dia_libre;
    this.btnOcultoguardar = false;

    return true
  }

  valoresDefectoValidacionFechas() {
    this.reg.fec_inicio = undefined;
    this.reg.fec_final = undefined;
    this.reg.fec_ingreso = undefined;
    this.loadingBtn = false;
    return false
  }

  UpdateRegister() {
    this.loadingBtn = true;

    const validadionesFechas = this.calcularDiasVacaciones()
    if (!validadionesFechas) return

    console.log('PASO VALIDACIONES DE FECHAS Y HORAS');

    this.subscripted = this.vacacionService.putVacacion(this.reg).subscribe(
      resp => {
        this.NotificarEdicionVacacion(resp);
        this.validar.showToast('Registro actualizado.', 3000, 'success');
        this.closeModal(true)
      },
      err => { this.validar.showToast(err.error.message, 3000, 'danger') },
      () => { this.loadingBtn = false; this.ngForm.resetForm(); this.subs_bool = true }
    )

  }

  /** ************************************************************************************************** ** 
   ** **                           METODOS EDICION DE VACACIONES                                   ** ** 
   ** ************************************************************************************************** **/

  // METODO DE ENVIO DE NOTIFICACIONES RESPECTO A LA APROBACION
  NotificarEdicionVacacion(vacacion: any) {
    var datos = {
      depa_user_loggin: this.solInfo.id_dep,
      objeto: vacacion,
    }

    this.autoriza.BuscarJefes(datos).subscribe(vacacion => {
      vacacion.EmpleadosSendNotiEmail.push(this.solInfo);
      console.log(vacacion);
      this.EnviarCorreoVacacion(vacacion);
      this.EnviarNotificacionVacacion(vacacion);
      this.validar.showToast('Proceso realizado exitosamente.', 5000, 'success');
    });
  }

  // METODO PARA ENVIO DE NOTIFICACIONES DE VACACIONES
  EnviarCorreoVacacion(vacacion: any) {

    console.log('ver vacaciones..   ', vacacion)

    var cont = 0;
    var correo_usuarios = '';

    vacacion.EmpleadosSendNotiEmail.forEach(e => {
      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE VACACIÓN
      let desde = this.validar.FormatearFecha(vacacion.fec_inicio, this.formato_fecha, this.validar.dia_completo);
      let hasta = this.validar.FormatearFecha(vacacion.fec_final, this.formato_fecha, this.validar.dia_completo);

      // CAPTURANDO ESTADO DE LA SOLICITUD DE VACACIÓN
      if (vacacion.estado === 1) {
        var estado_v = 'Pendiente de autorización';
      }
      else if (vacacion.estado === 2) {
        var estado_v = 'Preautorizada';
      }
      else if (vacacion.estado === 3) {
        var estado_v = 'Autorizada';
      }
      else if (vacacion.estado === 1) {
        var estado_v = 'Negada';
      }

      // SI EL USUARIO SE ENCUENTRA ACTIVO Y TIENEN CONFIGURACIÓN RECIBIRA CORREO DE SOLICITUD DE VACACIÓN
      if (e.vaca_mail) {
        if (e.estado === true) {
          if (correo_usuarios === '') {
            correo_usuarios = e.correo;
          }
          else {
            correo_usuarios = correo_usuarios + ', ' + e.correo
          }
        }
      }

      // VERIFICACIÓN QUE TODOS LOS DATOS HAYAN SIDO LEIDOS PARA ENVIAR CORREO
      if (cont === vacacion.EmpleadosSendNotiEmail.length) {
        let datosVacacionCreada = {
          tipo_solicitud: 'Solicitud de vacaciones actualizada por',
          idContrato: parseInt(localStorage.getItem('ccontr')),
          estado_v: estado_v,
          proceso: 'actualizado',
          desde: desde,
          hasta: hasta,
          id_dep: e.id_dep, // VERIFICAR
          id_suc: e.id_suc, // VERIFICAR
          correo: correo_usuarios,
          asunto: 'ACTUALIZACION DE SOLICITUD DE VACACIONES',
          id: vacacion.id,
          solicitado_por: (localStorage.getItem('nom')) + ' ' + (localStorage.getItem('ap')),
        }

        if (correo_usuarios != '') {
          this.autoriza.EnviarCorreoVacacion(this.idEmpresa, datosVacacionCreada).subscribe(
            resp => {
              if (resp.message === 'ok') {
                this.validar.showToast('Correo de solicitud enviado exitosamente.', 5000, 'success');
              }
              else {
                this.validar.showToast('Ups algo salio mal !!! No fue posible enviar correo de solicitud.', 5000, 'warning');
              }
            },
            err => { this.validar.showToast(err.error.message, 5000, 'danger'); },
            () => { },
          )
        }
      }
    })
  }

  // METODO PARA ENVIAR NOTIFICACIONES
  EnviarNotificacionVacacion(vacaciones: any) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE VACACIÓN
    let desde = this.validar.FormatearFecha(vacaciones.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(vacaciones.fec_final, this.formato_fecha, this.validar.dia_completo);

    const noti: Notificacion = notificacionValueDefault;
    noti.id_vacaciones = vacaciones.id;
    noti.id_send_empl = parseInt(localStorage.getItem('empleadoID'));
    noti.id_permiso = noti.id_hora_extra = null;
    noti.create_at = this.tiempo.format('YYYY-MM-DD') + ' ' + this.tiempo.format('HH:mm:ss');
    noti.estado = 'Pendiente'
    noti.tipo = 1;
    noti.mensaje = 'Ha actualizado su solicitud de vacaciones desde ' +
      desde + ' hasta ' + hasta;

    
    //Listado para eliminar el usuario duplicado
    var allNotificaciones = [];
    //Ciclo por cada elemento del listado
    vacaciones.EmpleadosSendNotiEmail.forEach(function(elemento, indice, array) {
      // Discriminación de elementos iguales
      if(allNotificaciones.find(p=>p.empleado == elemento.empleado) == undefined)
      {
        // Nueva lista de empleados que reciben la notificacion
        allNotificaciones.push(elemento);
      }
    });

    allNotificaciones.forEach(e => {
      noti.id_receives_depa = e.id_dep;
      noti.id_receives_empl = e.empleado;
      if (e.vaca_noti) {
        this.autoriza.postNotificacion(noti).subscribe(
          resp => {
            this.vacacionService.sendNotiRealTime(resp.respuesta);
            //this.validar.showToast(resp.message, 3000, 'success') 
          },
          err => {
            this.validar.showToast(err.error.message, 3000, 'danger')
          },
          () => { },
        )
      }
    })
  }


  ngOnDestroy() {
    if (this.subs_bool) {
      this.subscripted.unsubscribe()
      console.log('Destroy unsubcribe');
    }
  }

  closeModal(refreshInfo: Boolean) {
    this.modalController.dismiss({
      'refreshInfo': refreshInfo
    });
  }

}
