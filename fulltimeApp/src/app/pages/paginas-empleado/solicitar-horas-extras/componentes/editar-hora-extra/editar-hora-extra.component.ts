import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import moment from 'moment';

import { AutorizacionesService } from 'src/app/services/autorizaciones.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { HorasExtrasService } from 'src/app/services/horas-extras.service';

import { Notificacion, notificacionValueDefault } from 'src/app/interfaces/Notificaciones';
import { HoraExtra } from 'src/app/interfaces/HoraExtra';
import { ParametrosService } from 'src/app/services/parametros.service';

@Component({
  selector: 'app-editar-hora-extra',
  templateUrl: './editar-hora-extra.component.html',
  styleUrls: ['../../solicitar-horas-extras.page.scss']
})
export class EditarHoraExtraComponent implements OnInit {

  @Input() hora_extra!: HoraExtra;
  @ViewChild('formRegistro', { static: true }) ngForm: NgForm;
  reg: HoraExtra;
  loadingBtn: boolean = false;
  idEmpresa: number;
  nameFile: string;
  mensajeFile: string;
  required: boolean = false;
  archivoSubido: Array<File>;

  btnBloq: boolean = true;
  btnBloqueadoGuardar: boolean = false;

  private subscripted: Subscription;
  private subs_bool: boolean = false;

  dia_inicio: string = "";
  dia_fianl: string = "";
  hora_inicio: string = "";
  hora_final: string = "";

  constructor(
    private horasExtrasService: HorasExtrasService,
    private autoriza: AutorizacionesService,
    private validar: ValidacionesService,
    public modalController: ModalController,
    public parametro: ParametrosService,
  ) {
    this.idEmpresa = parseInt(localStorage.getItem('id_empresa'));
  }

  tiempo: any;

  ngOnInit() {
    this.tiempo = moment();
    this.reg = this.hora_extra;
    this.reg.fec_inicio = moment(this.hora_extra.fec_inicio).format();
    this.reg.fec_final = moment(this.hora_extra.fec_final).format();
    this.dia_inicio = moment(this.reg.fec_inicio).format('YYYY-MM-DD');
    this.dia_fianl = moment(this.reg.fec_final).format('YYYY-MM-DD');
    this.reg.hora_salida = moment(this.hora_extra.fec_inicio).format();
    this.reg.hora_ingreso = moment(this.hora_extra.fec_final).format();
    this.hora_inicio = moment(this.reg.hora_salida).format('h:mm a');
    this.hora_final = moment(this.reg.hora_ingreso).format('h:mm a');

    if(this.reg.docu_nombre == null){
      this.mensajeFile = "No hay archivo subido";
    }

    if(this.reg.hora_ingreso == null || this.reg.hora_salida == null ){
      this.btnBloq = true;
    }

    console.log('documento: ',this.reg.documento);
    console.log('documento nombre: ',this.reg.docu_nombre);
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
    this.dia_inicio = '';
    this.dia_fianl = '';
    this.loadingBtn = false;
    return false
  }

  valoresDefectoValidacionHoras() {
    this.reg.hora_salida = null;
    this.reg.hora_ingreso = null;
    this.hora_inicio = '';
    this.hora_final = '';
    this.btnBloq = true;
    this.loadingBtn = false;
    return false
  }

  valoresDefectoValidacionResultados(){
    this.reg.num_hora = null;
    this.reg.tiempo_autorizado = null;
    this.btnBloq = false;
    this.btnBloqueadoGuardar = true;
  }

  ChangeDiaInicio(e){
    this.btnBloqueadoGuardar = true;
    //Enceramos el resto de los Inputs
    this.reg.num_hora = null;
    this.reg.tiempo_autorizado = null;
    this.valoresDefectoValidacionHoras();
    this.valoresDefectoValidacionFechas();
    //Validamos si hay un cambio en el ingreso de la Fecha.
    if(!e.target.value){//Si no cambia nada en el ingreso de la fecha y pone ok directamente, se ingresa la hora actual que indica el componente
      this.reg.fec_inicio = e.target.value;
      this.dia_inicio = moment(this.reg.fec_inicio).format('YYYY-MM-DD');//Ajustamos el formato de la fecha para mostrar en el input
      console.log("fecha Inicio: ",this.reg.fec_inicio)
    }else{
      this.reg.fec_inicio = e.target.value;//Igualamos la variable a la fecha ingresada
      this.dia_inicio = moment(e.target.value).format('YYYY-MM-DD');//Ajustamos el formato de la fecha para mostrar en el input
    }
  }

  ChangeDiaFinal(e){
    this.btnBloqueadoGuardar = true;
    //Enceramos el resto de los Inputs
    this.valoresDefectoValidacionHoras();
    this.reg.num_hora = null;
    this.reg.tiempo_autorizado = null;
     //Validamos si hay un cambio en el ingreso de la Fecha.
     if(!e.target.value){//Si no cambia nada en el ingreso de la fecha y pone ok directamente, se ingresa la hora actual que indica el componente      
      if(moment(this.reg.fec_inicio).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')){
        this.reg.fec_final = this.reg.fec_inicio;
        this.dia_fianl = moment(e.target.value).format('YYYY-MM-DD');//Ajustamos el formato de la fecha para mostrar en el input
      }else{
        this.reg.fec_final = null;
        this.dia_fianl = null
        return this.validar.showToast('Seleccione una Fecha Final', 3000, "warning");
      }

    }else{
      this.reg.fec_final = e.target.value; //Igualamos la variable a la fecha ingresada
      this.dia_fianl = moment(e.target.value).format('YYYY-MM-DD');//Ajustamos el formato de la fecha para mostrar en el input
      //Validamos el ingreso de las fechas en los inputs
      if (moment(this.reg.fec_final).format('YYYY-MM-DD') < moment(this.reg.fec_inicio).format('YYYY-MM-DD')) {
        this.dia_inicio = '';
        this.dia_fianl = '';
        this.validar.showToast('La fecha Final no puede ser MENOR a la fecha de Inicio', 3000, "warning");
      }
    }
  }

  ChangeHoraInicio(e){
    this.reg.hora_ingreso = null;
    this.hora_final = null;
    //Enceramos el resto de los Inputs
    this.valoresDefectoValidacionResultados();
    this.btnBloq = true;
    //Validamos si hay un cambio en el ingreso de la Hora.
    if(!e.target.value){//Si no cambia nada en el ingreso de la hora y pone ok directamente, se ingresa la hora actual que indica el componente
      this.reg.hora_salida = moment(new Date()).format();
      this.hora_inicio = moment(this.reg.hora_salida).format('h:mm a');
    }else{//Si hay un cambion en la seleccion de la hora en el componente ingresa la hora seleccionada
      this.reg.hora_salida = e.target.value;//Igualamos la variable a la hora ingresada
      this.hora_inicio = moment(e.target.value).format('h:mm a');//Ajustamos el formato de la Hora para mostrar en el input
    }
  }

  ChangeHoraFinal(e){
    //Enceramos el resto de los Inputs
    this.valoresDefectoValidacionResultados();
    //Validamos si hay un cambio en el ingreso de la Hora.
    if(!e.target.value){//Si no cambia nada en el ingreso de la hora y pone ok directamente, se ingresa la hora actual que indica el componente
      this.reg.hora_ingreso = moment(new Date()).format();
      this.hora_final = moment(this.reg.hora_ingreso).format('h:mm a');
    }else{//Si hay un cambion en la seleccion de la hora en el componente ingresa la hora seleccionada
      this.reg.hora_ingreso = e.target.value;//Igualamos la variable a la hora ingresada
      this.hora_final = moment(e.target.value).format('h:mm a');//Ajustamos el formato de la Hora para mostrar en el input
    }
    this.validar.showToast('Calcule el tiempo para actualizar.', 3000, 'warning')
  }

  calcularTiempo(registrarFechas = false) {

    if (this.validar.vacio(this.reg.hora_ingreso) || this.validar.vacio(this.reg.hora_salida)) {
      this.loadingBtn = false;
      this.validar.showToast('Llenar todos los campos solicitados.', 3000, 'warning')
      return false
    }

    const hora_salida = this.validar.TiempoFormatoHHMMSS(this.reg.hora_salida)
    const hora_ingreso = this.validar.TiempoFormatoHHMMSS(this.reg.hora_ingreso)
    const fec_comp_inicio = this.validar.Unir_Fecha_Hora_HE(this.reg.fec_inicio, hora_salida);
    const fec_comp_final = this.validar.Unir_Fecha_Hora_HE(this.reg.fec_final, hora_ingreso);

    const horasValidas = this.validar.validarHorasIngresadas(fec_comp_inicio, fec_comp_final) // evaluacion de fechas completas 
    if (!horasValidas) return this.valoresDefectoValidacionResultados();

    const total = this.validar.MilisegToSegundos( fec_comp_final.valueOf() - fec_comp_inicio.valueOf());
    console.log('total: ',total);
    const { tiempo_transcurrido } = this.validar.CalcularHorasExtrasTotales(total)

    //Condicion que valida el tiempo calculado de horas con la jornada laboral la cual es el numero de horas en segundos que trabaja el empleado
    if(total > 86400){
      this.validar.showToast('Ups!, lo sentimos el rango de horas excede el dia completo', 3500, 'warning');
      return false;
    }

    this.reg.num_hora = tiempo_transcurrido;
    this.reg.tiempo_autorizado = '00:00:00';

    if (registrarFechas) {
      this.reg.fec_inicio = moment(fec_comp_inicio).format('YYYY-MM-DD HH:mm:ss');
      this.reg.fec_final = moment(fec_comp_final).format('YYYY-MM-DD HH:mm:ss');
    }

    this.btnBloqueadoGuardar = false;
    return true
  }

  UpdateRegister() {
    this.loadingBtn = true;
    const validadionesFechas = this.calcularTiempo(true)
    if (!validadionesFechas) return

    console.log('PASO validar DE FECHAS Y HORAS');

    if(this.reg.docu_nombre != null){
      if(this.archivoSubido != null){
        this.reg.docu_nombre = this.archivoSubido[0].name; // Inserta el nombre del archivo al subir
      }
    }else{
      if(this.archivoSubido != null){
        this.reg.docu_nombre = this.archivoSubido[0].name; // Inserta el nombre del archivo al subir
      }else{
        this.horasExtrasService.EliminarArchivoRespaldo(this.reg.documento).subscribe(res => {})//elimina el archivo si se quita 
        this.reg.docu_nombre = null;
        this.reg.documento = null;
      }
    }

    this.subscripted = this.horasExtrasService.putHoraExtra(this.reg).subscribe(
      resp => {
        if(this.archivoSubido != null){this.updataArchivo(resp)}
        this.NotificarEdicionHE(resp);
        this.validar.abrirToas('Solicitud registrada exitosamente.', 4000, 'success', 'top');
        this.closeModal(true)
      },
      err => { this.validar.showToast(err.error.message, 3000, 'danger') },
      () => { this.loadingBtn = false; this.ngForm.resetForm(); this.subs_bool = true }
    )
    this.closeModal(true)
  }


  /* ********************************************************************************** *
     *                       SUBIR ARCHIVO DE SOLICITUD DE PERMISO                    *
   * ********************************************************************************** */
  //Metodo para ingresar el archivo
  fileChange(element){
    this.archivoSubido = element.target.files;
    const name = this.archivoSubido[0].name;
    if(this.archivoSubido.length != 0){
      if(this.archivoSubido[0].size >= 2e+6){
        this.archivoSubido = null;
        this.reg.docu_nombre = '';
        this.mensajeFile = "Ingrese un archivo maximo de 2Mb";
        this.validar.showToast('Ups el archivo pesa mas de 2Mb',3500, 'danger');
      }else if(this.archivoSubido[0].name.length > 50){
        this.archivoSubido = null;
        this.reg.docu_nombre = '';
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
    this.horasExtrasService.EliminarArchivoRespaldo(this.reg.documento).subscribe(res => {
      this.subirRespaldo(horaExtra);
    })
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
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.horasExtrasService.SubirArchivoRespaldo(formData, id, this.archivoSubido[0].name).subscribe(res => {
      this.validar.showToast('El archivo se Actualizo Correctamente', 3500, 'success');
      this.reg.docu_nombre = '';

    }, err => {
        console.log(formData)
        return this.validar.showToast('El archivo no se pudo Cargar al Servidor', 3500, 'danger');
        
    });
  }

  //Metodo para eliminar el archivo de permiso
  deleteDocumentohorasExtras(){
    console.log('El archivo ', this.reg.docu_nombre, ' Se quito Correctamente')
    this.validar.showToast('El archivo se quito correctamente', 3500, 'success');
    this.reg.docu_nombre = null;
    this.mensajeFile = null;
    this.archivoSubido = null;
  }


  /** ******************************************************************************************* **
   ** **                METODO DE ENVIO DE NOTIFICACIONES DE HORAS EXTRAS                      ** **
   ** ******************************************************************************************* **/

  // METODO DE ENVIO DE NOTIFICACIONES
  NotificarEdicionHE(horaExtra: any) {
    var datos = {
      depa_user_loggin: this.solInfo.id_dep,
      objeto: horaExtra,
    }
    this.autoriza.BuscarJefes(datos).subscribe(horaExtra => {
      horaExtra.EmpleadosSendNotiEmail.push(this.solInfo);
      console.log(horaExtra);
      this.EnviarCorreoHE(horaExtra);
      this.EnviarNotificacionHE(horaExtra);
      //this.validar.showToast('Proceso realizado exitosamente.', 5000, 'success');
    });
  }

  // METODO PARA ENVIAR NOTIFICACIONES DE CORREO
  EnviarCorreoHE(horaExtra: any) {
    var cont = 0;
    var correo_usuarios = '';

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE HORA EXTRA
    let solicitud = this.validar.FormatearFecha(horaExtra.fec_solicita, this.formato_fecha, this.validar.dia_completo);
    let desde = this.validar.FormatearFecha(moment(horaExtra.fec_inicio).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(moment(horaExtra.fec_final).format('YYYY-MM-DD'), this.formato_fecha, this.validar.dia_completo);

    // CAPTURANDO ESTADO DE LA SOLICITUD DE HORA EXTRA
    if (horaExtra.estado === 1) {
      var estado_h = 'Pendiente de autorización';
    }
    else if (horaExtra.estado === 1) {
      var estado_h = 'Preautorizada';
    }
    else if (horaExtra.estado === 1) {
      var estado_h = 'Autorizada';
    }
    else if (horaExtra.estado === 1) {
      var estado_h = 'Negada';
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
          tipo_solicitud: 'Solicitud de Horas Extras actualizada por',
          observacion: horaExtra.descripcion,
          num_horas: moment(horaExtra.num_hora, 'HH:mm').format('HH:mm'),
          estado_h: estado_h,
          solicitud: solicitud,
          desde: desde,
          hasta: hasta,
          h_inicio: this.validar.FormatearHora(moment(horaExtra.fec_inicio).format('HH:mm:ss'), this.formato_hora),
          h_final: this.validar.FormatearHora(moment(horaExtra.fec_final).format('HH:mm:ss'), this.formato_hora),
          proceso: 'actualizado',
          asunto: 'ACTUALIZACION DE SOLICITUD DE REALIZACION DE HORAS EXTRAS',
          correo: correo_usuarios,
          id_dep: e.id_dep,
          id_suc: e.id_suc,
          id: horaExtra.id,
          solicitado_por: (localStorage.getItem('nom')) + ' ' + (localStorage.getItem('ap')),
        }

        if (correo_usuarios != '') {
          this.autoriza.EnviarCorreoHoraExtra(this.idEmpresa, datosHoraExtraCreada).subscribe(
            resp => {
              if (resp.message === 'ok') {
                this.validar.showToast('Correo de solicitud enviado exitosamente.', 5000, 'success');
              }
              else {
                this.validar.showToast('Ups algo salio mal !!! No fue posible enviar correo de solicitud.', 5000, 'warning');
              }
            },
            err => { this.validar.showToast(err.error.message, 3000, 'danger'); },
            () => { },
          )
        }

      }
    })
  }

  // METODO PARA ENVIAR NOTIIFICACIONES AL SISTEMA
  EnviarNotificacionHE(horaExtra: any) {

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
    noti.mensaje = 'Ha actualizado su solicitud de horas extras desde ' +
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
      noti.id_receives_empl = e.empleado;
      if (e.hora_extra_noti) {
        this.autoriza.postNotificacion(noti).subscribe(
          resp => {
            this.horasExtrasService.sendNotiRealTime(resp.respuesta);
          },
          err => { //this.validar.showToast(err.error.message, 3000, 'danger') 
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
    this.ngForm.reset();
  }

  closeModal(refreshInfo: Boolean) {
    this.ngForm.reset();
    this.modalController.dismiss({
      'refreshInfo': refreshInfo
    });
  }

}
