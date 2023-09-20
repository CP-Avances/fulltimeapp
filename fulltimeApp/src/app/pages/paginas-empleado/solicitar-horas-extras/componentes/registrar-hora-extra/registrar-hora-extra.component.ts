import { Component, Input, OnInit, ViewChild, OnDestroy,  } from '@angular/core';
import { NgForm, FormControl } from '@angular/forms';
import { IonDatetime } from '@ionic/angular';
import { Subscription } from 'rxjs';
import moment from 'moment';

import { Autorizacion, autorizacionValueDefault } from 'src/app/interfaces/Autorizaciones';
import { Notificacion, notificacionValueDefault } from 'src/app/interfaces/Notificaciones';
import { HoraExtra, horaExtraDefaultValue } from 'src/app/interfaces/HoraExtra';

import { HorasExtrasService } from 'src/app/services/horas-extras.service';
import { AutorizacionesService } from 'src/app/services/autorizaciones.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { PermisosService } from 'src/app/services/permisos.service';

import { CloseModalComponent } from 'src/app/componentes/close-modal/close-modal.component';
import { ValidacionesService } from 'src/app/libs/validaciones.service';

@Component({
  selector: 'app-registrar-hora-extra',
  templateUrl: './registrar-hora-extra.component.html',
  styleUrls: ['../../solicitar-horas-extras.page.scss'],
})

export class RegistrarHoraExtraComponent implements OnInit, OnDestroy {

  @ViewChild('formRegistro', { static: true }) formRegistro: NgForm;
  @ViewChild(CloseModalComponent, { static: true })
  private closeModalComponent: CloseModalComponent;

  @Input() id_hora_extra: number;
  @ViewChild(IonDatetime) datetimeInicio: IonDatetime;
  @ViewChild(IonDatetime) datetimeFinal: IonDatetime;

  reg: HoraExtra = horaExtraDefaultValue;
  loadingBtn: boolean = false;
  nameFile: string;
  mensajeFile: string | null;
  archivoSubido: Array<File> | null;
  required: boolean = false;

  private subscripted: Subscription;
  private subs_bool: boolean = false;

  idEmpresa: number;

  dia_inicio: string = "";
  dia_fianl: string = "";
  hora_inicio: string = "";
  hora_final: string = "";

  hora_iniHor: any;

  //Campo de validacion de documento
  CetificadoName = new FormControl('');

  constructor(
    public validar: ValidacionesService,
    private horasExtrasService: HorasExtrasService,
    private autorizaciones: AutorizacionesService,
    public parametro: ParametrosService,
    private permisoService: PermisosService,
  ) {
    this.idEmpresa = parseInt(localStorage.getItem('id_empresa'));
  }

  tiempo: any;
  ngOnInit() {
    this.tiempo = moment();
    this.reg.estado = 1;
    this.reg.codigo = localStorage.getItem('codigo');
    this.reg.fec_solicita = this.tiempo.format('YYYY-MM-DD');
    this.reg.id_empl_cargo = parseInt(localStorage.getItem('ccargo'));
    this.reg.id_usua_solicita = parseInt(localStorage.getItem('empleadoID'));
    this.reg.tipo_funcion = 1;
    this.reg.observacion = false;
    this.reg.num_hora = null;

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
    this.autorizaciones.getInfoEmpleadoByCodigo(this.reg.codigo).subscribe(
      res => {
        if (res.estado === 1) {
          var estado = true;
        }
        this.solInfo = [];
        this.solInfo = {
          hora_extra_mail: res.hora_extra_mail,
          hora_extra_noti: res.hora_extra_noti,
          empleado: res.id_empleado,
          id_suc: res.id_sucursal,
          id_dep: res.id_departamento,
          estado: estado,
          correo: res.correo,
        }
      })
  }

  valoresDefectoValidacionFechas() {
    this.reg.fec_inicio = '';
    this.reg.fec_final = '';
    this.dia_inicio = "";
    this.dia_fianl = "";
    this.loadingBtn = false;
    return false
  }

  valoresDefectoValidacionHoras() {
    this.reg.hora_salida = null;
    this.reg.hora_ingreso = null;
    this.hora_inicio = "";
    this.hora_final = "";
    this.loadingBtn = false;
    return false
  }

  valoresDefectoValidacionResultados(){
    this.reg.num_hora = null;
    this.reg.tiempo_autorizado = null;
  }

  /* ********************************************************************************** *
     *                 METODO PARA MOSTRAR EL TIEMPO EN LOS INPUTS                   *
   * ********************************************************************************** */
  ChangeDiaInicio(e){
    //Enceramos el resto de los Inputs
    this.reg.fec_final = '';
    this.dia_fianl = '';
    this.valoresDefectoValidacionResultados();
    this.valoresDefectoValidacionHoras();
    //Validamos si hay un cambio en el ingreso de la Fecha.
    if(!e.target.value){//Si no cambia nada en el ingreso de la fecha y pone ok directamente, se ingresa la hora actual que indica el componente
      return this.validar.showToast('Selecciones una fecha', 3500, 'warning');
    }else{
      this.reg.fec_inicio = e.target.value;//Igualamos la variable a la fecha ingresada
      this.dia_inicio = moment(e.target.value).format('YYYY-MM-DD');//Ajustamos el formato de la fecha para mostrar en el input
      return this.datetimeInicio.confirm(true);
    }
  }

  ChangeDiaFinal(e){
    //Enceramos el resto de los Inputs
    this.valoresDefectoValidacionHoras();
    this.valoresDefectoValidacionResultados();
     //Validamos si hay un cambio en el ingreso de la Fecha.
    if(!e.target.value){//Si no cambia nada en el ingreso de la fecha y pone ok directamente, se ingresa la hora actual que indica el componente
      return this.validar.showToast('Selecciones una fecha', 3500, 'warning');
    }else{
      this.reg.fec_final = e.target.value; //Igualamos la variable a la fecha ingresada
      this.dia_fianl = moment(e.target.value).format('YYYY-MM-DD');//Ajustamos el formato de la fecha para mostrar en el input
      return this.datetimeFinal.confirm(true);
    }
  }

  // METODO ALIDAR Y CAMBIAR EL INPUT DE HORA INICAL Y FINAL
  ChangeHoraInicio(e){
    this.valoresDefectoValidacionResultados();
    //Validamos si hay un cambio en el ingreso de la Hora.
    if(!e.target.value){//Si no cambia nada en el ingreso de la hora y pone ok directamente, se ingresa la hora actual que indica el componente
      this.reg.hora_salida = moment(new Date()).format();
      this.hora_inicio = moment(this.reg.hora_salida).format('h:mm a');
    }else{//Si hay un cambion en la seleccion de la hora en el componente ingresa la hora seleccionada
      this.reg.hora_salida = e.target.value;
      this.hora_inicio = moment(e.target.value).format('h:mm a');
      
    }
  }

  ChangeHoraFinal(e){
    this.valoresDefectoValidacionResultados();
    //Validamos si hay un cambio en el ingreso de la Hora.
    if(!e.target.value){//Si no cambia nada en el ingreso de la hora y pone ok directamente, se ingresa la hora actual que indica el componente
      this.reg.hora_ingreso = moment(new Date()).format();
      this.hora_final = moment(this.reg.hora_ingreso).format('h:mm a');
    }else{//Si hay un cambion en la seleccion de la hora en el componente ingresa la hora seleccionada
      this.reg.hora_ingreso = e.target.value;
      this.hora_final = moment(e.target.value).format('h:mm a');
      
    }
  }


   /* ********************************************************************************** *
     *                 METODO PARA MOSTRAR EL CALCULO EN LOS INPUTS                   *
   * ********************************************************************************** */
   mostrarCalculos(){
    //variables para validar el dia de inicio completo y el dia final completo y buscar duplicidad.
    const minutosinicio = moment(this.reg.hora_salida).format('HH:mm');
    const minutosfinal = moment(this.reg.hora_ingreso).format('HH:mm');
    const fec_inicio = (moment(this.reg.fec_inicio).format('YYYY-MM-DD')) + ' ' + minutosinicio;
    const fec_final = (moment(this.reg.fec_final).format('YYYY-MM-DD')) + ' ' + minutosfinal;
    const codigo = localStorage.getItem('codigo');

    this.horasExtrasService.getlistaHorasExtrasByFechasyCodigo(fec_inicio, fec_final, codigo).subscribe(solicitados => {
      if(solicitados.length != 0){
        this.reg.num_hora = null;
        this.reg.tiempo_autorizado = null;
        this.validar.showToast('Ups! Ya existe horas extras en esas fechas ', 3500, 'warning');
        return false
      }else{
        this.permisoService.getlistaPermisosByHorasyCodigo(fec_inicio, fec_final, minutosinicio, minutosfinal, codigo).subscribe(solicitados => {
          if(solicitados.length != 0){
            this.reg.num_hora = null;
            this.reg.tiempo_autorizado = null;
            this.validar.showToast('Ups! Ya existe permisos en esas fecha y hora ', 3500, 'warning');
            return false
          }
          else{
            this.calcularTiempo();
          }
        },err => {
          this.validar.showToast('Lo sentimos tenemos problemas para verificar su solicitud\n Contactese con el administrador', 3500, 'warning');
        }); 
      }
    }, error => {
      this.validar.showToast('Lo sentimos tenemos problemas para verificar su Solicitud\n Contactese con el administrador', 3500, 'danger');
      //this.calcularhoras();
    });
  }

  //Metodo que realiza el calculo de las fechas ingresdas
  calcularTiempo(registrarFechas = false) {

    const fechasValidas = this.validar.validarRangoFechasIngresa(this.reg.fec_inicio, this.reg.fec_final, true)
    if (!fechasValidas) return this.valoresDefectoValidacionFechas();

    const hora_salida = this.validar.TiempoFormatoHHMMSS(this.reg.hora_salida)
    const hora_ingreso = this.validar.TiempoFormatoHHMMSS(this.reg.hora_ingreso)
    const fec_comp_inicio = this.validar.Unir_Fecha_Hora_HE(this.reg.fec_inicio, hora_salida);
    const fec_comp_final = this.validar.Unir_Fecha_Hora_HE(this.reg.fec_final, hora_ingreso);

    const horasValidas = this.validar.validarHorasIngresadas(fec_comp_inicio, fec_comp_final) // evaluacion de fechas completas 
    if (!horasValidas) {return this.valoresDefectoValidacionResultados()}
    const total = this.validar.MilisegToSegundos( fec_comp_final.valueOf() - fec_comp_inicio.valueOf());

    //Condicion que valida el tiempo calculado de horas con la jornada laboral la cual es el numero de horas en segundos que trabaja el empleado
    if(total > 86400){
      this.validar.showToast('Ups!, lo sentimos el rango de horas excede el dia completo', 3500, 'warning');
      return false;
    }

    const { tiempo_transcurrido } = this.validar.CalcularHorasExtrasTotales(total)
    this.reg.num_hora = tiempo_transcurrido;
    this.reg.tiempo_autorizado = tiempo_transcurrido;

    if (registrarFechas) {
      this.reg.fec_inicio = moment(fec_comp_inicio).format('YYYY-MM-DD HH:mm:ss');
      this.reg.fec_final = moment(fec_comp_final).format('YYYY-MM-DD HH:mm:ss');
      console.log('data h...', this.reg)
    }

    return true
  }

  SaveRegister() {
    this.loadingBtn = true;
    const validadionesFechas = this.calcularTiempo(true)
    if (!validadionesFechas) return

    console.log('PASO VALIDACIONES DE FECHAS Y HORAS');
    this.reg.hora_salida = this.validar.TiempoFormatoHHMMSS(this.reg.hora_salida);
    this.reg.hora_ingreso = this.validar.TiempoFormatoHHMMSS(this.reg.hora_ingreso);

    if(this.archivoSubido != null){
      this.reg.docu_nombre = this.archivoSubido[0].name; // Inserta el nombre del archivo al subir
    }else{
      this.reg.docu_nombre = null;
    }

    this.subscripted = this.horasExtrasService.postNuevaHorasExtras(this.reg).subscribe(
      horaExtra => {
        horaExtra.EmpleadosSendNotiEmail.push(this.solInfo);
        if(this.archivoSubido != null){this.subirRespaldo(horaExtra)}
        this.CrearNuevaAutorizacion(horaExtra);
        this.CrearNuevaNotificacion(horaExtra);
        this.SendEmailsEmpleados(horaExtra);
        this.validar.abrirToas('Solicitud registrada exitosamente.', 4000, 'success', 'top');
        this.closeModalComponent.closeModal(true);
        this.formRegistro.resetForm();
      },
      err => { this.validar.showToast(err.error.message, 3000, 'warning'); 
               this.loadingBtn = false; 
               this.formRegistro.resetForm(); 
              },
      () => { this.loadingBtn = false; this.subs_bool = true }
    )
    this.closeModalComponent.closeModal(true);
  }

/* ********************************************************************************** *
     *                       SUBIR ARCHIVO DE SOLICITUD DE HORA EXTRA                   *
   * ********************************************************************************** */
  //Metodo para ingresar el archivo
  fileChange(element){
    this.archivoSubido = element.target.files;
    console.log(this.archivoSubido);
    const name = this.archivoSubido[0].name;
    if(this.archivoSubido.length != 0){
      if(this.archivoSubido[0].size >= 2e+6){
        this.archivoSubido = null;
        this.reg.docu_nombre = '';
        this.mensajeFile = "Ingrese un archivo maximo de 2Mb";
        this.validar.showToast('Ups el archivo pesa mas de 2Mb',3500, 'danger');

      }else if(this.archivoSubido[0].name.length > 50){
        this.archivoSubido = null;
        this.reg.docu_nombre = ''
        this.mensajeFile = "El nombre debe tener 50 caracteres como maximo";
        this.validar.showToast('Ups el nombre del archivo es muy largo', 3500, 'warning');

      }else{
        console.log(this.archivoSubido[0].name);
        this.reg.docu_nombre = name;
        this.validar.showToast('Archivo valido', 3500, 'success');
      }
    }
  }

  //Metodo para actualizar un archivo
  updataArchivo(horaExtra: any){
    if(this.archivoSubido[0].name == this.reg.docu_nombre){
      this.horasExtrasService.EliminarArchivoRespaldo(this.reg.documento).subscribe(res => {
        this.subirRespaldo(horaExtra);
      })
    }else{
      this.subirRespaldo(horaExtra);
    }
  }

  //Metodo para subir (cargar) el archivo al servidor
  subirRespaldo(horaExtra: any){
    var id = horaExtra.id;
    let formData = new FormData();
    console.log("tamaño: ", this.archivoSubido[0].size);

    if(this.archivoSubido == undefined){
      return this.archivoSubido = null;
    }
    
    for(var i = 0; i < this.archivoSubido.length; i++){
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    this.horasExtrasService.SubirArchivoRespaldo(formData, id, this.archivoSubido[0].name, null).subscribe(res => {
      this.validar.showToast('El archivo se Cargo Correctamente', 3000, 'success');
      this.reg.docu_nombre = '';

    }, err => {
        console.log(formData)
        return this.validar.showToast('El archivo no se pudo Cargar al Servidor', 3500, 'danger');
        
    });
  }

  //Metodo para quitar el archivo de horaExtra
  deleteDocumentohoraExtra(){
    console.log('El archivo ', this.reg.documento, ' Se quito Correctamente');
    this.validar.showToast('El archivo se quito correctamente', 3500, 'acua');
    this.reg.docu_nombre = null;
    this.mensajeFile = null;
    this.archivoSubido = null;
  }

   /* ********************************************************************************** *
     *                       CREAR NUEVA AUTORIZACION DE HORAS EXTRAS                   *
   * ********************************************************************************** */
  CrearNuevaAutorizacion(horaExtra: HoraExtra) {
    const autorizacion: Autorizacion = autorizacionValueDefault;
    autorizacion.estado = 1; // pendiende
    autorizacion.orden = 1; // orden de autorizacion
    autorizacion.id_departamento = parseInt(localStorage.getItem('cdepar'));
    autorizacion.id_vacacion = autorizacion.id_permiso = autorizacion.id_plan_hora_extra = null;
    autorizacion.id_hora_extra = horaExtra.id;
    autorizacion.id_documento = ''

    this.autorizaciones.postNuevaAutorizacion(autorizacion).subscribe(
      resp => { //this.validar.showToast(resp.message, 3000, 'success') 
      },
      err => { //this.validar.showToast(err.error.message, 3000, 'danger') 
      },
    )
  }

  CrearNuevaNotificacion(horaExtra: HoraExtra) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE HORA EXTRA
    let desde = this.validar.FormatearFecha(moment(horaExtra.fec_inicio).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(moment(horaExtra.fec_final).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);

    let h_inicio = this.validar.FormatearHora(moment(horaExtra.fec_inicio).format('HH:mm:ss'), this.formato_hora)
    let h_final = this.validar.FormatearHora(moment(horaExtra.fec_final).format('HH:mm:ss'), this.formato_hora);

    const noti: Notificacion = notificacionValueDefault;
    noti.id_hora_extra = horaExtra.id;
    noti.id_send_empl = parseInt(localStorage.getItem('empleadoID'));
    noti.id_permiso = noti.id_vacaciones = null;
    noti.create_at = this.tiempo.format('YYYY-MM-DD') + ' ' + this.tiempo.format('HH:mm:ss');
    noti.estado = 'Pendiente';
    noti.tipo = 1;
    noti.mensaje = 'Ha realizado una solicitud de horas extras desde ' +
      desde + ' hasta ' + hasta +
      ' horario de ' + h_inicio + ' a ' + h_final;

    //Listado para eliminar el usuario duplicado
    var allNotificaciones = [];
    //Ciclo por cada elemento del listado
    horaExtra.EmpleadosSendNotiEmail.forEach(function(elemento, indice, array) {
      // Discriminación de elementos iguales
      if(allNotificaciones.find(p=>p.empleado == elemento.empleado) == undefined)
      {
        // Nueva lista de empleados que reciben la notificacion
        allNotificaciones.push(elemento);
      }
    });

    allNotificaciones.forEach(e => {
      noti.id_receives_depa = e.id_dep
      noti.id_receives_empl = e.empleado
      if (e.hora_extra_noti) {
        this.autorizaciones.postNotificacion(noti).subscribe(
          resp => { //this.validar.showToast(resp.message, 3000, 'success')
            this.horasExtrasService.sendNotiRealTime(resp.respuesta);
          },
          err => { this.validar.showToast(err.error.message, 3000, 'danger') },
          () => { },
        )

      }

    })

  }

  SendEmailsEmpleados(horaExtra: HoraExtra) {

    console.log('ver horas extras ....   ', horaExtra)

    var cont = 0;
    var correo_usuarios = '';

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE HORA EXTRA
    let solicitud = this.validar.FormatearFecha(String(horaExtra.fec_solicita), this.formato_fecha, this.validar.dia_completo);
    let desde = this.validar.FormatearFecha(moment(horaExtra.fec_inicio).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(moment(horaExtra.fec_final).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);

    // CAPTURANDO ESTADO DE LA SOLICITUD DE HORA EXTRA
    if (horaExtra.estado === 1) {
      var estado_h = 'Pendiente';
    }

    horaExtra.EmpleadosSendNotiEmail.forEach(e => {

      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      if (e.hora_extra_mail) {
        if (e.estado === true) {
          if (correo_usuarios === '') {
            correo_usuarios = e.correo;
          }
          else {
            correo_usuarios = correo_usuarios + ', ' + e.correo
          }
        }
      }

      if (cont === horaExtra.EmpleadosSendNotiEmail.length) {

        let datosHoraExtraCreada = {
          id_empl_contrato: parseInt(localStorage.getItem('ccontr')),
          tipo_solicitud: 'Realización de Horas Extras solicitadas por',
          observacion: horaExtra.descripcion,
          num_horas: moment(horaExtra.num_hora, 'HH:mm').format('HH:mm'),
          estado_h: estado_h,
          solicitud: solicitud,
          desde: desde,
          hasta: hasta,
          h_inicio: this.validar.FormatearHora(moment(horaExtra.fec_inicio).format('HH:mm:ss'), this.formato_hora),
          h_final: this.validar.FormatearHora(moment(horaExtra.fec_final).format('HH:mm:ss'), this.formato_hora),
          proceso: 'creado',
          asunto: 'SOLICITUD DE REALIZACION DE HORAS EXTRAS',
          id_dep: e.id_dep,
          id_suc: e.id_suc,
          correo: correo_usuarios,
          solicitado_por: (localStorage.getItem('nom')) + ' ' + (localStorage.getItem('ap')),
        }
        console.log('ver horas extras ....   ', datosHoraExtraCreada)
        if (correo_usuarios != '') {
          this.autorizaciones.EnviarCorreoHoraExtra(this.idEmpresa, datosHoraExtraCreada).subscribe(
            resp => {
              if (resp.message === 'ok') {
                this.validar.showToast('Correo de solicitud enviado exitosamente.', 4000, 'success');
              }
              else {
                this.validar.showToast('Ups algo salio mal !!! No fue posible enviar correo de solicitud.', 4000, 'warning');
              }
            },
            err => { this.validar.showToast(err.error.message, 3000, 'danger'); },
            () => { },
          )
        }
      }
    })
  }

  ngOnDestroy() {
    if (this.subs_bool) {
      this.subscripted.unsubscribe()
      console.log('Destroy unsubcribe');
    }
    this.reg.fec_inicio = "";
    this.reg.fec_final = "";
    this.formRegistro.resetForm();
  }


}
