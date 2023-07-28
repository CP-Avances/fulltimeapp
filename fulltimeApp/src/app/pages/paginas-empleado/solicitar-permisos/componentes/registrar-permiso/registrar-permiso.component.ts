import { Component, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import moment from 'moment';

import { cg_permisoValueDefault, diasHoras, Permiso, permisoValueDefault } from 'src/app/interfaces/Permisos';
import { Autorizacion, autorizacionValueDefault } from 'src/app/interfaces/Autorizaciones';
import { Notificacion, notificacionValueDefault } from 'src/app/interfaces/Notificaciones';
import { Cg_TipoPermiso } from 'src/app/interfaces/Catalogos';
import { Cg_Feriados } from 'src/app/interfaces/Catalogos';
import { estadoBoolean } from 'src/app/interfaces/Estados';
import { HorarioE } from 'src/app/interfaces/Horarios';

import { AutorizacionesService } from 'src/app/services/autorizaciones.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { CatalogosService } from 'src/app/services/catalogos.service';
import { PermisosService } from 'src/app/services/permisos.service';
import { HorasExtrasService } from 'src/app/services/horas-extras.service';
import { VacacionesService } from 'src/app/services/vacaciones.service';
import { Vacacion } from '../../../../../interfaces/Vacacion';
import { ParametrosService } from 'src/app/services/parametros.service';

import { CloseModalComponent } from 'src/app/componentes/close-modal/close-modal.component';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { AlertController, IonDatetime, ModalController } from '@ionic/angular';


@Component({
  selector: 'app-registrar-permiso',
  templateUrl: './registrar-permiso.component.html',
  styleUrls: ['../../solicitar-permisos.page.scss'],
})

export class RegistrarPermisoComponent implements OnInit, OnDestroy {

  @ViewChild('formRegistro', { static: false }) formRegistro: NgForm;
  @ViewChild(CloseModalComponent, { static: false })
  private closeModalComponent: CloseModalComponent;

  @Input() num_permiso: number;
  @ViewChild(IonDatetime) datetimeInicio: IonDatetime;
  @ViewChild(IonDatetime) datetimeFinal: IonDatetime;

  reg: Permiso = permisoValueDefault;
  diasHoras = diasHoras;
  radioButton = estadoBoolean;
  selectItemDiasHoras: string;
  horarioEmpleado: HorarioE;
  loadingBtn: boolean = false;
  mensajeFile: string | null;
  archivoSubido: Array <File> | null;
  required: boolean = false;
  readonly: boolean = true;
  legalizado: string = '';
  idEmpresa: number;
  fech_bloqu: boolean;
  fech_bloquf: boolean;

  dia_inicio: string;
  dia_fianl: string;
  dia_siguiente: string;
  hora_inicio: string;
  hora_final: string;

  //variable para ocultar el boton de calculos de acuerdo a la opcion que se ingresa
  btnOculto: boolean = true;
  btnOcultoHoras: boolean = true;
  //variable para ocultar el boton de guardar
  btnOcultoguardar: boolean = false;

  //variable que calcula el tiempo de horas en la opcion de dias y horas
  totalhoras: number;

  //Variables para almacenar la fecha de y la hora que se ingresa en el Form
  fecha_inicio: any;
  fecha_final: any;

  //Variables para almacenar la hora del horario que tiene el usuario registrado
  horario_ingreso: any;
  horario_salida: any;

  cg_permiso: Cg_TipoPermiso = cg_permisoValueDefault;

  public get cg_tipo_permisos(): Cg_TipoPermiso[] {
    return this.catalogos.cg_tipo_permisos
  }

  private get cg_feriados(): Cg_Feriados[] {
    return this.catalogos.cg_feriados
  }


  //Campo de validacion de documento
  CetificadoName = new FormControl('');

  //variable para ocultar el formulario si no tiene asignado o registrado un periodo de vacaciones.
  ocultar: boolean = true;
  mensaje: boolean = true;

  private subscripted: Subscription;
  private subs_bool: boolean = false;
  private horas_trabaja_seg: number = 0; // formato: 1000 seg


  constructor(
    private validaciones: ValidacionesService,
    private permisoService: PermisosService,
    private horasExtrasService: HorasExtrasService,
    private vacacionService: VacacionesService,
    private empleadoService: EmpleadosService,
    private autorizaciones: AutorizacionesService,
    private catalogos: CatalogosService,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    public modalController: ModalController,
    public alertCrtl: AlertController,
  ) {
    this.idEmpresa = parseInt(localStorage.getItem('id_empresa')!);
  }

  peri_vacaciones: any = [];
  vacaciones: Vacacion[] = [];
  tiempo: any;
  ngOnInit() {
    this.peri_vacaciones = [];
    this.tiempo = moment();
    this.catalogos.getCgPermisos();
    this.reg.fec_creacion = this.tiempo.format('YYYY-MM-DD');
    this.reg.num_permiso = this.num_permiso;
    this.reg.estado = 1;
    this.reg.codigo = parseInt(localStorage.getItem('codigo'));
    this.reg.id_peri_vacacion = parseInt(localStorage.getItem('cperi_vacacion'));
    this.reg.id_empl_cargo = parseInt(localStorage.getItem('ccargo')!)
    this.reg.id_empl_contrato = parseInt(localStorage.getItem('ccontr')!)
    this.horas_trabaja_seg = this.validaciones.HorasTrabajaToSegundos(localStorage.getItem('horas_trabaja')!);

    if(this.reg.fec_inicio == null || this.reg.fec_inicio == undefined) {
      this.readonly = true;
    }else{
      this.readonly = false;
    }

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
          permiso_mail: res.permiso_mail,
          permiso_noti: res.permiso_noti,
          id_empleado: res.id_empleado,
          id_dep: res.id_departamento,
          id_suc: res.id_sucursal,
          estado: estado!,
          correo: res.correo,
          
        }
      }
    );
  }

  /** ******************************************************************************************* **
    ** **                            MANEJO DE VARIABLES INPUT                                 ** **
  ** ******************************************************************************************* **/
  // METODO ENCERRAR LOS INPUTS DE FECHA
  valoresDefectoValidacionFechas() {
    this.reg.fec_inicio = null;
    this.reg.fec_final = null;
    this.loadingBtn = false;
    return false
  }
  // METODO ENCERRAR LOS INPUTS DE HORAS
  valoresDefectoValidacionHoras(message = '', showToast = false) {
    this.reg.hora_salida = null;
    this.reg.hora_ingreso = null;
    this.hora_inicio = '';
    this.hora_final = '';
    this.loadingBtn = false;
    if (showToast) return this.validaciones.showToast(message, 3000, 'danger');
    return false
  }
  //METODO ENCERRAR LOS INPUTS DE LOS RESULTADOS DE LOS CALCULOS
  valoresDefectoValidacionResultados(){
      this.reg.dia = null;
      this.reg.dia_libre = null;
      this.reg.hora_numero = null; 
      this.readonly = false;
  }

  /** ******************************************************************************************* **
    ** **                    MANEJO DE MENSAJES DEL CAMBIO DE LOS SELECC                      ** **
   ** ******************************************************************************************* **/
  // METODO VALIDAR EL ITEM DE TIEMPO DE PERMISO SELECCIONADO
  ChangeDiasHoras($event: any) {
    this.valoresDefectoValidacionFechas();
    this.valoresDefectoValidacionHoras();
    this.dia_inicio = '';
    this.dia_fianl = '';
    if(!$event.target.value){
      return console.log('Salio ', $event.target.value);
    }else{
     const [diasHora] = this.diasHoras.filter(o => { return o.value === this.selectItemDiasHoras })
     if( diasHora != undefined || diasHora != null ){
       this.validaciones.showToast(diasHora.message, 3500, 'primary')
       this.valoresDefectoValidacionResultados();
      }
    }
  }
  
  // METODO VALIDAR EL ITEM DE TIPO DE PERMISO SELECCIONADO
  informacion_comida: string = ''
  ChangeTipoPermiso($event: any) {
    //Metodo para mostrar el mensaje al seleccionar
    if(!$event.target.value){
      return console.log('Salio');
    }else{
      this.valoresDefectoValidacionFechas();
      this.valoresDefectoValidacionHoras();
      this.valoresDefectoValidacionResultados();
      this.dia_inicio = '';
      this.dia_fianl = '';

      const [cg_permiso] = this.cg_tipo_permisos.filter(o => {return o.id === this.reg.id_tipo_permiso})
      this.cg_permiso = cg_permiso;
      
      if(this.cg_permiso.id == this.reg.id_tipo_permiso ){
        const num_maxPermiso = this.cg_permiso.num_dia_maximo;
        const permilegalizado = this.cg_permiso.legalizar;
  
        if(permilegalizado == true){
          this.legalizado = 'SI';
          this.reg.legalizado = permilegalizado;
          console.log('Legalizado ',this.reg.legalizado)
        }else{
          this.legalizado = 'NO';
          this.reg.legalizado = permilegalizado;
          console.log('Legalizado ',this.reg.legalizado)
        }
  
        if(this.cg_permiso.documento === true){
          this.required = true;
        }else{
          this.required = false;
        }

        if(this.cg_permiso.almu_incluir === true){
          this.informacion_comida = `Aplica descuento de minutos de alimentación si el permiso es solicitado por horas y se encuentra dentro del horario de alimentación.`;
        }

        //Cambiar esta validacion del dato id_peri_vacacion se debe leer por la consulta no por el valor almacenado
        if(this.cg_permiso.tipo_descuento == 1){
          if(!(Number.isNaN(this.reg.id_peri_vacacion))){
            this.vacacionService.getlistarPeriVacacionesByCodigo(this.reg.codigo).subscribe(vacaciones => {
              if(vacaciones.length == 0){
                this.ocultar = true;
                this.mensaje = false;
              }else{
                this.validaciones.showToast('Sin descuento a vacaciones.', 4000, 'tertiary');
                localStorage.setItem('cperi_vacacion',vacaciones[0].id.toString());
                this.reg.id_peri_vacacion = parseInt(localStorage.getItem('cperi_vacacion'));
                this.ocultar = false;
                this.mensaje = true;
              }

            },error => {
              this.ocultar = true;
              this.mensaje = false;
              this.validaciones.showToast(error.message, 4000, 'danger');
            });

          }else{
            this.mensaje = false;
          }
        }else if(this.cg_permiso.tipo_descuento == null || this.cg_permiso.tipo_descuento == undefined){
          this.ocultar = true;
          this.mensaje = false;
          this.validaciones.showToast('No tiene registrado periodo de vacaciones.', 3000, 'warning');
        }else{
          this.reg.id_peri_vacacion = 0;
          this.ocultar = false;
          this.mensaje = true;
        }

        //Numero maxio de días y horas de permiso
        this.validaciones.abrirToas(' Dias maximos de Permiso - '+num_maxPermiso, 3000, 'tertiary', 'top');
        if(this.cg_permiso.num_hora_maximo != '00:00:00'){
          this.horas_trabaja_seg = this.validaciones.HorasTrabajaToSegundos(this.cg_permiso.num_hora_maximo);
        }
        
        return console.log('Se requiere documento ',this.required)
      }
    }
  }

  plan_horario: any = []; 
  dia_validado: any;
  dia_return: any;
  cont_tipo_dia_libre: number = 0;
  //METODO VALIDADOR DE DIAS LIBRES
  DiaIniciolLibre(){
    this.plan_horario = [];
    this.cont_tipo_dia_libre = 0;
    if(this.reg.fec_inicio != null){
      var busqueda = {
        fecha: moment(this.reg.fec_inicio).format('YYYY-MM-D'), 
        codigo: this.reg.codigo
      }

      this.empleadoService.getHorariosEmpleadobyCodigo(busqueda).subscribe(datos => { 
        this.plan_horario = this.validaciones.ObtenerDetallesPlanificacion(datos);

        if(this.plan_horario == undefined){
          return this.btnOculto = true;
        }

        this.plan_horario.filter(item => {
          if(item.tipo_dia == 'L' ||  item.tipo_dia == 'FD' || item.tipo_dia == '-'){
            this.cont_tipo_dia_libre += 1;
          }
        });

        if(this.cont_tipo_dia_libre == this.plan_horario.length){
          this.showAlert();
          this.valoresDefectoValidacionHoras();
          this.btnOculto = true;
          return this.readonly = true;
        }else{

          //Validación fechas reservadas
          if(this.cg_permiso.fec_validar == true){
            if((this.dia_inicio >= moment(this.cg_permiso.fecha_inicio).format('YYYY-MM-DD')) && (this.dia_inicio <= moment(this.cg_permiso.fecha_fin).format('YYYY-MM-DD'))){
              this.validaciones.showToast('Lo Sentimos la fecha '+this.dia_inicio+' esta dentro del rango de los días reservados', 3500, 'warning');
              this.valoresDefectoValidacionHoras();
              this.readonly = true
              return this.btnOculto = true;
            }
          }

          //Esta variable permite contar el dia siguiente ingresado en el campo de dia inicial y que 
          //sea este dato el valor a leer en la fecha maxima
          var fechasiguiente = new Date(this.reg.fec_inicio);
          fechasiguiente.setDate(fechasiguiente.getDate() + 1);
          if(this.selectItemDiasHoras == 'Horas'){
            this.dia_siguiente = moment(fechasiguiente).format('YYYY-MM-DD');
            this.reg.hora_numero = null; 
            this.readonly = false;
            this.fech_bloqu = false;
            this.btnOcultoguardar = true;
            this.datetimeInicio.confirm(true);
            return this.btnOculto = true;
          }else{
            this.dia_siguiente = '2050-12-31';
            this.readonly = false;
            this.fech_bloqu = false;
            this.datetimeInicio.confirm(true);
            return this.dia_validado;
          }
          
        }
      },error => {
        this.validaciones.showToast('Ups! No tiene registrado un horario en ese día para solicitar un permiso', 3500, 'warning');
        return this.dia_inicio = ''
      });

      
    }
  }

  //METODO VALIDADOR DE DIAS LIBRES
  DiaFinalLibre(){
    this.plan_horario = [];
    this.cont_tipo_dia_libre = 0;
    if(this.reg.fec_final != null){
      var busqueda = {
        fecha: moment(this.reg.fec_final).format('YYYY-MM-DD'), 
        codigo: this.reg.codigo
      }

      this.empleadoService.getHorariosEmpleadobyCodigo(busqueda).subscribe(datos => { 
        this.plan_horario = this.validaciones.ObtenerDetallesPlanificacion(datos);

        if(this.plan_horario == undefined){
          return this.btnOculto = true;
        }
        
        this.plan_horario.filter(item => {
          if(item.tipo_dia == 'L' ||  item.tipo_dia == 'FD' || item.tipo_dia == '-'){
            this.cont_tipo_dia_libre += 1;
          }
        });

        if(this.cont_tipo_dia_libre == this.plan_horario.length){
          this.showAlert();
          return this.btnOculto = true;;
        }else{
          //Validación fechas reservadas
          if(this.cg_permiso.fec_validar == true){
            if((this.dia_fianl >= moment(this.cg_permiso.fecha_inicio).format('YYYY-MM-DD')) && (this.dia_fianl <= moment(this.cg_permiso.fecha_fin).format('YYYY-MM-DD'))){
              this.validaciones.showToast('Lo Sentimos la fecha '+this.dia_fianl+' esta dentro del rango de los días reservados', 3500, 'warning');
              this.valoresDefectoValidacionHoras();
              this.btnOculto = true;
              this.readonly = false;
              return this.dia_validado;
            }else if((this.dia_inicio <= moment(this.cg_permiso.fecha_fin).format('YYYY-MM-DD') && (this.dia_fianl >= moment(this.cg_permiso.fecha_fin).format('YYYY-MM-DD')))){
              this.validaciones.showToast('El rango de dias de permiso estan reservados, no puede pedir en el rango de '+moment(this.cg_permiso.fecha_inicio).format('YYYY-MM-DD')+' - '+moment(this.cg_permiso.fecha_fin).format('YYYY-MM-DD'), 4000, 'warning');
              this.valoresDefectoValidacionHoras();
              this.btnOculto = true;
              this.readonly = false;
              return this.dia_validado;
            }
          }

          if(this.selectItemDiasHoras == 'Horas'){
            this.readonly = false;
            this.datetimeFinal.confirm(true);
            return this.btnOculto = true;
          }else{
            this.datetimeFinal.confirm(true);
            this.btnOculto = false;
            this.fech_bloqu = false;
          }
        }

      },error => {
        this.validaciones.showToast('Ups! No tiene registrado un horario en ese día para solicitar un permiso', 3500, 'warning');
        this.dia_fianl = ''; 
        this.btnOculto = true;
        return this.dia_validado = undefined;
      });
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

  // METODO VALIDAR Y CAMBIAR EL INPUT DE DIA INICIAL Y FINAL
  conteo_dia_antisipo: any;
  dia1: any; dia2: any;
  mes1: any; mes2: any;
  ChangeDiaInicio(e: any){
    this.dia1 = ''; this.dia2 = '';
    this.mes1 = ''; this.mes2 = '';
    this.conteo_dia_antisipo = 0;
    this.dia_siguiente = '';
    this.valoresDefectoValidacionResultados();
    this.readonly = true;
    if(e.target.value){
      this.horario_salida = '00:00:00'
      this.reg.fec_final = null;
      this.dia_fianl = '';
      this.reg.fec_inicio = e.target.value;
      this.dia_inicio = moment(e.target.value).format('YYYY-MM-DD');
      this.valoresDefectoValidacionHoras();
      this.dia_siguiente = '2050-12-31';

      if(this.reg.fec_inicio != '' || this.reg.fec_inicio != null){      
        //conteo de días para validar el num de dias de anticipacion para pedir el permiso
        this.dia1 = moment(this.dia_inicio).format('D');
        this.dia2 = moment(this.reg.fec_creacion).format('D');
        this.mes1 = moment(this.dia_inicio).format('MM');
        this.mes2 = moment(this.reg.fec_creacion).format('MM');

        if(this.cg_permiso.num_dia_anticipo != null && this.cg_permiso.num_dia_anticipo != 0){
          if(this.mes1 == this.mes2){
            this.conteo_dia_antisipo = parseInt(this.dia1) - parseInt(this.dia2);
            if(this.conteo_dia_antisipo >= this.cg_permiso.num_dia_anticipo ){
              this.DiaIniciolLibre();
            }else{
              this.validaciones.showToast('Lo sentimos, el tipo de solicitud seleccionado debe ser solicitado con '+this.cg_permiso.num_dia_anticipo+' días de anticipación', 4500, 'warning'); 
            }
          }else{
            this.DiaIniciolLibre();
          }
        }else{
          this.DiaIniciolLibre();
        }
      }
    }
  }

  ChangeDiaFinal(e: any){
    this.valoresDefectoValidacionResultados();
    if(e.target.value){
      this.horario_ingreso = '23:59:59'
      this.reg.fec_final = e.target.value;
      this.dia_fianl = moment(e.target.value).format('YYYY-MM-DD');
      const hoy = moment(this.reg.fec_inicio).format("DD/MM/YYYY, HH:mm:ss")
      this.valoresDefectoValidacionHoras();
      this.DiaFinalLibre();
    }
  }

  horario: number;
  // METODO ALIDAR Y CAMBIAR EL INPUT DE HORA INICAL Y FINAL
  ChangeHoraInicio(e: any){
    this.fech_bloquf = true;
    this.horario = 0;
    this.valoresDefectoValidacionResultados();
    if(!e.target.value){
      var hora = new Date().setSeconds(0);
      this.reg.hora_salida = moment(hora).format();
      return this.hora_inicio = moment(this.reg.hora_salida).format('h:mm a');
    }else{
      this.btnOculto = true;
      this.hora_final = ''; 
      this.reg.hora_ingreso = null;
      this.reg.hora_salida = e.target.value;
      this.hora_inicio = moment(e.target.value).format('h:mm a');

      const hora_salida = this.validaciones.TiempoFormatoHHMMSS(this.reg.hora_salida);
      const fec_comp_inicio = this.validaciones.Unir_Fecha_Hora(this.reg.fec_inicio!, hora_salida );

      this.plan_horario.filter(item => {
        const HorarioInicio = this.validaciones.Unir_Fecha_Hora(String(this.dia_inicio),item.entrada);      
        const HorarioFinal = this.validaciones.Unir_Fecha_Hora(String(this.dia_inicio),item.salida);
        if((fec_comp_inicio.toTimeString() >= HorarioInicio.toTimeString()) && (fec_comp_inicio.toTimeString() <= HorarioFinal.toTimeString())){
          this.horario_salida = item.entrada;
          this.horario = item.horario
          this.fech_bloquf = false;
        }
      });

      if(this.fech_bloquf == true){
        this.validaciones.showToast('Ups! La hora de Inicio esta fuera de su horario de ingreso', 3500, 'warning');
      }
    }
  }

  ChangeHoraFinal(e: any){
    this.valoresDefectoValidacionResultados();
    this.btnOculto = true;
    console.log('horario: ',this.horario);
    if(!e.target.value){
      var hora = new Date().setSeconds(0);
      this.reg.hora_ingreso = moment(hora).format();
      return this.hora_final = moment(this.reg.hora_ingreso).format('h:mm a');
    }else{
      this.reg.hora_ingreso = e.target.value;
      this.hora_final = moment(e.target.value).format('h:mm a');

      const hora_ingreso = this.validaciones.TiempoFormatoHHMMSS(this.reg.hora_ingreso);
      const fec_comp_final = this.validaciones.Unir_Fecha_Hora(this.reg.fec_inicio!, hora_ingreso );

      this.plan_horario.filter(item => {
        const HorarioInicio = this.validaciones.Unir_Fecha_Hora(String(this.dia_inicio),item.entrada);      
        const HorarioFinal = this.validaciones.Unir_Fecha_Hora(String(this.dia_inicio),item.salida);
        if((fec_comp_final.toTimeString() >= HorarioInicio.toTimeString()) && (fec_comp_final.toTimeString() <= HorarioFinal.toTimeString())
        && (this.horario == item.horario)){
          this.horario_ingreso = item.salida;
          this.btnOculto = false;
        }
      });

      if(this.btnOculto == true){
        this.validaciones.showToast('Ups! La hora Final esta fuera de su horario de Salida', 3500, 'warning');
      }
      
    }
  }

  AlmuerzoIncluidoCalculo(){
    if(this.cg_permiso.almu_incluir == true){
      if(this.selectItemDiasHoras == 'Horas'){
        if(this.dia_inicio == this.dia_fianl){
          this.VerificarFechasIgualesComida(this.dia_inicio);
        }else{
          this.VerificarFechasDiferentesComida(this.dia_inicio, this.dia_fianl);
        }
      }
    }
  }

  dato_comida: any;
  valor_comida: any;
  VerificarFechasIgualesComida(fecha_inicio: any){
    let datos: any = [];
    this.dato_comida = 0;
    this.valor_comida = 0;
    let horario = {
      codigo: this.reg.codigo,
      fecha_inicio: fecha_inicio,
      hora_inicio: moment(this.reg.hora_salida).format('HH:mm:ss'),
      hora_final: moment(this.reg.hora_ingreso).format('HH:mm:ss'),
    }

    this.empleadoService.BuscarComidaHorarioHorasMD(horario).subscribe(informacion => {
      datos = informacion.respuesta;
      //Horarios con finalizacion de jornada en el mismo día
      if(informacion.message === 'CASO_1'){
        console.log('calculo caso 1');
        console.log('datos: ',datos);
        this.dato_comida = datos[0].min_almuerzo;
        this.valor_comida = this.validar.MinutosToSegundos(this.dato_comida);
      }else if(informacion.message === 'CASO_2'){
        console.log('calculo caso 2');
        console.log('datos: ',datos);
        this.dato_comida = datos[0].min_almuerzo;
        this.valor_comida = this.validar.MinutosToSegundos(this.dato_comida);
      }
      this.validaciones.showToast('Se descontaron los minutos de la alimentacion', 3500, 'warning');

    },error => {
      this.validaciones.showToast('No se descontara la alimentacion', 3500, 'warning');
    });
  }

  VerificarFechasDiferentesComida(fecha_inicio: any, fecha_final: any){
    let datos: any = [];
    this.dato_comida = 0;
    this.valor_comida = 0;
    let horario = {
      fecha_inicio: fecha_inicio,
      fecha_final: fecha_final,
      hora_inicio: moment(this.reg.hora_salida).format('HH:mm:ss'),
      hora_final: moment(this.reg.hora_ingreso).format('HH:mm:ss'),
      codigo: this.reg.codigo
    }

    this.empleadoService.BuscarComidaHorarioHorasDD(horario).subscribe(informacion => {
      console.log('informacion dias diferentes: ',informacion);
      datos = informacion.respuesta;
      //Horarios con finalizacion de jornada en el mismo día
      if (informacion.message === 'CASO_4') {
        console.log('calculo caso 1');
        console.log('datos: ',datos);
        this.dato_comida = datos[0].min_almuerzo;
        this.valor_comida = this.validar.MinutosToSegundos(this.dato_comida);
      }


    },error => {
      this.validaciones.showToast('No se ha encontrado registro minutos de alimentacion', 3500, 'warning');
    });

  }
  
 /* ********************************************************************************** *
    *                 METODO PARA MOSTRAR EL CALCULO EN LOS INPUTS                   *
  * ********************************************************************************** */
  mostrarCalculos(){ 
    //variables para validar el dia de inicio completo y el dia final completo y buscar duplicidad.
     let minutosinicio = this.horario_salida;
     let minutosfinal = this.horario_ingreso;

    if (this.reg.fec_inicio === null || this.reg.fec_final === null || this.reg.fec_inicio === undefined || this.reg.fec_final ===  undefined){
      this.loadingBtn = false;
      this.validaciones.showToast('Llenar todos los campos de ', 3000, 'warning')
      return false
    }

    var data = {
      fecha_inicio: moment(this.reg.fec_inicio).format('YYYY-MM-D'), 
      fecha_final: moment(this.reg.fec_final).format('YYYY-MM-D'), 
      codigo: '\''+this.reg.codigo+'\''
    }

    this.empleadoService.BuscarPlanificacionHorarioEmple(data).subscribe(horario => {
      this.horarioEmpleado = horario;

      if(this.selectItemDiasHoras === 'Horas'){
        this.AlmuerzoIncluidoCalculo();
        minutosinicio = moment(this.reg.hora_salida).format('HH:mm:ss');
        minutosfinal = moment(this.reg.hora_ingreso).format('HH:mm:ss');
      }
  
      const fec_inicio = (moment(this.reg.fec_inicio).format('YYYY-MM-DD'))+' '+ minutosinicio;
      const fec_final = (moment(this.reg.fec_final).format('YYYY-MM-DD')) +' '+ minutosfinal;
      const codigo = parseInt(localStorage.getItem('codigo')!)
  
      if(this.selectItemDiasHoras === 'Días'){
        this.permisoService.getlistaPermisosByFechasyCodigo(fec_inicio, fec_final, codigo).subscribe(solicitados => {
          if(solicitados.length != 0){
            this.reg.dia = null;
            this.reg.dia_libre = null;
            this.reg.hora_numero = null;
            this.validaciones.showToast('Ups! Ya existe permisos en esas fechas ', 3500, 'warning');
            return false
          }
          else{
            this.horasExtrasService.getlistaHorasExtrasByFechasyCodigo(fec_inicio, fec_final, codigo).subscribe(solicitados => {
              if(solicitados.length != 0){
                this.reg.dia = null;
                this.reg.dia_libre = null;
                this.reg.hora_numero = null;
                this.validaciones.showToast('Ups! Ya existe horas extras en esas fechas ', 3500, 'warning');
                return false
              }
              else{
                this.vacacionService.getlistaVacacionesByFechasyCodigo(fec_inicio, fec_final, codigo).subscribe(solicitados => {
                  if(solicitados.length != 0){
                    this.reg.dia = null;
                    this.reg.dia_libre = null;
                    this.reg.hora_numero = null;
                    this.validaciones.showToast('Ups! Ya existe vacaciones en esas fechas ', 3500, 'warning');
                    return false
                  }
                  else{
                    this.calcularhoras();
                  }
                }, err => {
                  this.validaciones.showToast('Lo sentimos tenemos problemas para verificar su permiso', 3500, 'warning');
                }); 
    
              }
            }, err => {
              this.validaciones.showToast('Lo sentimos tenemos problemas para verificar su permiso', 3500, 'warning');
            }); 
          }
        }, err => {
          this.validaciones.showToast('Lo sentimos tenemos problemas para verificar su permiso', 3500, 'warning');
        });
      }else{
        this.permisoService.getlistaPermisosByHorasyCodigo(fec_inicio, fec_final, minutosinicio, minutosfinal, codigo).subscribe(solicitados => {
          if(solicitados.length != 0){
            this.reg.dia = null;
            this.reg.dia_libre = null;
            this.reg.hora_numero = null;
            this.validaciones.showToast('Ups! Ya existe permisos en esas fecha y hora ', 3500, 'warning');
            return false
          }
          else{
            this.horasExtrasService.getlistaHorasExtrasByFechasyCodigo(fec_inicio, fec_final, codigo).subscribe(solicitados => {
              if(solicitados.length != 0){
                this.reg.dia = null;
                this.reg.dia_libre = null;
                this.reg.hora_numero = null;
                this.validaciones.showToast('Ups! Ya existe horas extras en esas fechas ', 3500, 'warning');
                return false
              }
              else{
                this.vacacionService.getlistaVacacionesByFechasyCodigo(fec_inicio, fec_final, codigo).subscribe(solicitados => {
                  if(solicitados.length != 0){
                    this.reg.dia = null;
                    this.reg.dia_libre = null;
                    this.reg.hora_numero = null;
                    this.validaciones.showToast('Ups! Ya existe vacaciones en esas fechas ', 3500, 'warning');
                    return false
                  }
                  else{
                    this.calcularhoras();
                  }
                }, err => {
                  this.validaciones.showToast('Lo sentimos tenemos problemas para verificar su permiso', 3500, 'warning');
                }); 
    
              }
            }, err => {
              this.validaciones.showToast('Lo sentimos tenemos problemas para verificar su permiso', 3500, 'warning');
            }); 
          }
        }, err => {
          this.validaciones.showToast('Lo sentimos tenemos problemas para verificar su permiso', 3500, 'warning');
        });
      } 
    });
  }

  /* ********************************************************************************** *
     *              METODO PARA CALCULAR Y VALIDAR EL RESULTADO MOSTRADO              *
   * ********************************************************************************** */
  validacion: boolean = false;
  calcularhoras() {
    this.reg.docu_nombre = null;
    if(this.selectItemDiasHoras == 'Días'){
      const fechasValidas = this.validaciones.validarRangoFechasIngresa(this.reg.fec_inicio, this.reg.fec_final, true);
      console.log('fechasValidas: ',fechasValidas)
      if (!fechasValidas) { return this.valoresDefectoValidacionFechas(), this.validacion = false;}

      //Se optiene la hora por defecto del dia de salida que es la hora en la que se crea el permiso 
      //Esto se lee por defecto ya que el tipo de permiso es por dias
      const fec_comp_inicio = this.validaciones.Unir_Fecha_Hora(this.reg.fec_inicio!, this.horario_salida);
      const fec_comp_final = this.validaciones.Unir_Fecha_Hora(this.reg.fec_final!, this.horario_salida);
      const total = this.validaciones.MilisegToSegundos( fec_comp_final.valueOf() - fec_comp_inicio.valueOf() )

      // 86400 seg ==> es un dia de 24 horas
      let { dia, tiempo_transcurrido, dia_libre } =
      this.validaciones.SegundosTransformDiaLaboral(this.reg.fec_inicio!.toString(), this.reg.fec_final!.toString(), total, this.totalhoras, this.horarioEmpleado, this.horas_trabaja_seg, this.cg_feriados)
      if(dia == 0){
        dia = 1;
      }

      this.fecha_inicio = moment(fec_comp_inicio).format();
      this.fecha_final = moment(fec_comp_final).format();
      this.reg.hora_salida= this.horario_salida;
      this.reg.hora_ingreso =  this.horario_ingreso;
      this.reg.dia = dia
      this.reg.dia_libre = dia_libre;
      this.reg.hora_numero = '00:00:00'; //Por defecto ya que es permiso por dias
    }
    else {

      const fechasValidas = this.validaciones.validarRangoFechasIngresa(this.reg.fec_inicio!, this.reg.fec_final!, true);
      if (!fechasValidas){ return this.valoresDefectoValidacionFechas(), this.validacion = false;}
  
      const hora_salida = this.validaciones.TiempoFormatoHHMMSS(this.reg.hora_salida);
      const hora_ingreso = this.validaciones.TiempoFormatoHHMMSS(this.reg.hora_ingreso);
      const fec_comp_inicio = this.validaciones.Unir_Fecha_Hora(this.reg.fec_inicio!, hora_salida );
      const fec_comp_final = this.validaciones.Unir_Fecha_Hora(this.reg.fec_final!, hora_ingreso);

      

      this.fecha_inicio = moment(fec_comp_inicio).format();
      this.fecha_final = moment(fec_comp_final).format();

      const horasValidas = this.validaciones.validarHorasIngresadas(fec_comp_inicio, fec_comp_final) // evaluacion de fechas completas 
      if (!horasValidas) {return this.valoresDefectoValidacionHoras(), this.reg.hora_numero = null, this.reg.dia = null, this.validacion = false }

      //Esta parte valida el ingreso de las horas con respecto al horario que tiene el usuaio con su hora de ingreso y salida del trabajo
      //const HorarioInicio = this.validaciones.Unir_Fecha_Hora(String(this.dia_inicio), this.horario_salida);      
      //const HorarioFinal = this.validaciones.Unir_Fecha_Hora(String(this.dia_fianl), this.horario_ingreso);   
      
      var total = this.validaciones.MilisegToSegundos( fec_comp_final.valueOf() - fec_comp_inicio.valueOf());

      //Condicion que valida el tiempo calculado de horas con la jornada laboral la cual es el numero de horas en segundos que trabaja el empleado
      if(this.selectItemDiasHoras === 'Horas'){
        if(total >= this.horas_trabaja_seg){
          this.validaciones.showToast('Ups!, El rango de horas exedio las permitidas para un permiso, por favor realice un permiso por días', 4500, 'warning');
          this.reg.hora_numero = null;
          this.btnOcultoguardar = true;
          return this.validacion = false;
        }
        this.btnOcultoguardar = false;
      }

      //Esta condición calcula el tiempo total con el descuento de minutos de alimentación.
      if(this.dato_comida != 0 && this.cg_permiso.almu_incluir == true){
        total = total -  this.valor_comida;
      }
      
      // 86400 seg ==> es un dia de 24 horas
      const { dia, tiempo_transcurrido, dia_libre } = 
      this.validaciones.SegundosTransformDiaLaboral(this.reg.fec_inicio!.toString(), this.reg.fec_final!.toString(), total, this.totalhoras, this.horarioEmpleado, this.horas_trabaja_seg, this.cg_feriados)
      this.reg.dia = dia
      this.reg.hora_numero = tiempo_transcurrido
      this.reg.dia_libre = dia_libre;

      switch (this.selectItemDiasHoras) {
        case 'Horas':
          //Por defecto ya q es permiso por solo horas.
          this.reg.dia = 0; 
          this.reg.dia_libre = 0;
          break;
        default: break;
      }
    }

    if((this.cg_permiso.num_dia_maximo < this.reg.dia!) &&  (this.cg_permiso.num_dia_maximo != 0)){
      this.validaciones.showToast('Lo Sentimos el maximo de dias de permiso es '+this.cg_permiso.num_dia_maximo, 3500, 'warning');
      this.reg.fec_final = null;
      return this.validacion = false;
    }
    
    return this.validacion = true;
  }

  /* ********************************************************************************** *
     *                          GUARDA LA SOLICITUD CREADA                            *
   * ********************************************************************************** */
  //Metodo para registrar la solicitud y guardar
  SaveRegister() {

    this.reg.fec_inicio = this.fecha_inicio;
    this.reg.fec_final = this.fecha_final;

    const validadionesFechasHoras = this.validacion;
    this.loadingBtn = true;

    if (!validadionesFechasHoras) return

      console.log('PASO VALIDACIONES DE FECHAS Y HORAS');

      const f = moment();
      this.reg.fec_creacion = moment(f).format('YYYY-MM-DD HH:mm:ss');

      if(this.selectItemDiasHoras != 'Días'){
        this.reg.hora_salida = this.validar.TiempoFormatoHHMMSS(this.reg.hora_salida!);
        this.reg.hora_ingreso = this.validar.TiempoFormatoHHMMSS(this.reg.hora_ingreso!);
      }
     
      if(this.archivoSubido != null){
        this.reg.docu_nombre = this.archivoSubido[0].name; // Inserta el nombre del archivo al subir
      }else{
        this.reg.docu_nombre = null;
      }

      this.subscripted = this.permisoService.postNuevoPermiso(this.reg).subscribe(
        permiso => {
          permiso.EmpleadosSendNotiEmail.push(this.solInfo);
          if(this.archivoSubido != null){this.subirRespaldo(permiso)};
          this.CrearNuevaAutorizacion(permiso);
          this.num_permiso = this.num_permiso + 1;
          this.closeModalComponent.closeModal(true);
          this.validaciones.abrirToas('Solicitud registrada Exitosamente.', 4000, 'success', 'top');
        },
        err => { 
                  this.validaciones.showToast(err.error.message, 4000, 'danger'); 
                  this.closeModalComponent.closeModal(true);
                  this.loadingBtn = false; 
                  this.mensajeFile = '';},
        () => { this.loadingBtn = false; this.subs_bool = true }
      )
  }

  /* ********************************************************************************** *
     *                       SUBIR ARCHIVO DE SOLICITUD DE PERMISO                    *
   * ********************************************************************************** */
  //Metodo para ingresar el archivo
  fileChange(element: any){

    this.archivoSubido = element.target.files;
    console.log(this.archivoSubido);

    const name = this.archivoSubido[0].name;

    if(this.archivoSubido!.length != 0){
      if(this.archivoSubido[0].size >= 2e+6){
        this.archivoSubido = null;
        this.reg.docu_nombre = '';
        this.mensajeFile = "Ingrese un archivo maximo de 2Mb";
        this.validaciones.showToast('Ups el archivo pesa mas de 2Mb',3500, 'danger');

      }else if(this.archivoSubido![0].name.length > 50){
        this.archivoSubido = null;
        this.reg.docu_nombre = '';
        this.mensajeFile = "El nombre debe tener 50 caracteres como maximo";
        this.validaciones.showToast('Ups el nombre del archivo es muy largo', 3500, 'warning');

      }else{
        console.log(this.archivoSubido![0].name);
        this.reg.docu_nombre = name;
        this.validaciones.showToast('Archivo valido', 3500, 'success');
      }
    }
  }
  //Metodo para subir (cargar) el archivo al servidor
  subirRespaldo(permiso: any){
    var id = permiso.id;
    let formData = new FormData();
    console.log("tamaño: ", this.archivoSubido[0].size);
    if(this.archivoSubido == undefined){
      return this.archivoSubido = null;
    }

    for(var i = 0; i < this.archivoSubido.length; i++){
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    console.log('formData: ',formData);
    this.permisoService.SubirArchivoRespaldo(formData, id, this.reg.codigo, null).subscribe(res => {
      this.validaciones.showToast('El archivo se Cargo Correctamente', 3500, 'success');
      this.reg.docu_nombre = '';
    }, err => {
        console.log(err)
        return this.validaciones.showToast('El archivo no se pudo Cargar al Servidor', 3500, 'danger');
        
    });
  }
  //Metodo para eliminar el archivo de permiso
  deleteDocumentoPermiso(){
    console.log('El archivo ', this.reg.docu_nombre, ' Se quito Correctamente')
    this.validaciones.showToast('El archivo se quito correctamente', 3500, 'acua');
    this.reg.docu_nombre = null;
    this.mensajeFile = null;
    this.archivoSubido = null;
  }

  /* ********************************************************************************** *
    *                       CREAR NUEVA AUTORIZACION DE PERMISOS                    *
   * ********************************************************************************** */

  CrearNuevaAutorizacion(permiso: Permiso) {
    const autorizacion: Autorizacion = autorizacionValueDefault;
    autorizacion.estado = 1; // PENDIETE
    autorizacion.orden = 1; // ORDEN DE AUTORIZACION
    autorizacion.id_departamento = parseInt(localStorage.getItem('cdepar')!);
    autorizacion.id_vacacion = autorizacion.id_hora_extra = autorizacion.id_plan_hora_extra = null;
    autorizacion.id_permiso = permiso.id;
    autorizacion.id_documento = ''

    this.autorizaciones.postNuevaAutorizacion(autorizacion).subscribe(
      resp => { 
        this.CrearNuevaNotificacion(permiso);
        this.SendEmailsEmpleados(permiso);
      },err => { 
        this.CrearNuevaNotificacion(permiso);
        this.SendEmailsEmpleados(permiso);
        this.validaciones.showToast(err.error.message, 3000, 'danger') 
      },
    )
  }

  CrearNuevaNotificacion(permiso: Permiso) {
    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO
    let desde = this.validar.FormatearFecha(String(permiso.fec_inicio), this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(String(permiso.fec_final), this.formato_fecha, this.validar.dia_completo);

    let h_inicio = this.validar.FormatearHora(permiso.hora_salida!, this.formato_hora);
    let h_fin = this.validar.FormatearHora(permiso.hora_ingreso!, this.formato_hora);

    if (h_inicio === '00:00') {
      h_inicio = '';
    }

    if (h_fin === '00:00') {
      h_fin = '';
    }

    //Listado para eliminar el usuario duplicado
    var allNotificaciones = [];
    //Ciclo por cada elemento del listado
    permiso.EmpleadosSendNotiEmail.forEach(function(elemento: any, indice: any, array: any) {
      // Discriminación de elementos iguales
      if(allNotificaciones.find((p: any)=> p.id_empleado == elemento.id_empleado) == undefined)
      {
        // Nueva lista de empleados que reciben la notificacion
        allNotificaciones.push(elemento);
      }
    });

    console.log("Usuarios que reciben la notificacion: ",allNotificaciones);

    allNotificaciones.forEach(item => {
      let notificacion: any = {
        id_send_empl: parseInt(localStorage.getItem('empleadoID')),
        id_receives_empl: item.id_empleado,
        id_receives_depa: item.id_dep,
        create_at: this.tiempo.format('YYYY-MM-DD') + ' ' + this.tiempo.format('HH:mm:ss'),
        estado: 'Pendiente',
        id_permiso: permiso.id,
        id_vacaciones: null,
        id_hora_extra: null,
        mensaje: 'Ha realizado una solicitud de permiso desde ' + desde + ' ' + h_inicio + ' hasta ' + hasta + ' ' + h_fin,
        tipo: 1,
      }

      if (item.permiso_noti) {
        this.autorizaciones.postNotificacion(notificacion).subscribe(
          resp => {
            this.permisoService.sendNotiRealTime(resp.respuesta);
          },
          err => { 
            this.validaciones.showToast('No se pudo enviar la notificacion', 3000, 'danger'); 
          },
        )
      }
    })

  }


  SendEmailsEmpleados(permiso: Permiso) {
    var cont = 0;
    var correo_usuarios = '';

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO
    let solicitud = this.validar.FormatearFecha(permiso.fec_creacion, this.formato_fecha, this.validar.dia_completo);
    let desde = this.validar.FormatearFecha(String(permiso.fec_inicio), this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(String(permiso.fec_final), this.formato_fecha, this.validar.dia_completo);

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (permiso.estado === 1) {
      var estado_p = 'Pendiente de autorización';
    }

    // LEYENDO DATOS DE TIPO DE PERMISO
    var tipo_permiso = '';
    let correo_crear: boolean;

    this.cg_tipo_permisos.filter(o => {
      if (o.id === permiso.id_tipo_permiso) {
        tipo_permiso = o.descripcion
        correo_crear = o.correo_crear
      }
      return tipo_permiso;
    })

    console.log('Envio de correo: ',correo_crear)

    //Listado para eliminar el usuario duplicado
    var allCorreos = [];
    //Ciclo por cada elemento del listado
    permiso.EmpleadosSendNotiEmail.forEach(function(elemento: any, indice: any, array: any) {
      // Discriminación de elementos iguales
      if(allCorreos.find((p: any)=> p.id_empleado == elemento.id_empleado) == undefined)
      {
        // Nueva lista de empleados que reciben la notificacion
        allCorreos.push(elemento);
      }
    });

    if(correo_crear === true){
      // VERIFICACIÓN QUE TODOS LOS DATOS HAYAN SIDO LEIDOS PARA ENVIAR CORREO
      allCorreos.forEach(e => {

      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      // SI EL USUARIO SE ENCUENTRA ACTIVO Y TIENEN CONFIGURACIÓN RECIBIRA CORREO DE SOLICITUD DE PERMISOS
      if (e.permiso_mail) {
        if (e.estado === true) {
          if (correo_usuarios === '') {
            correo_usuarios = e.correo;
          }
          else {
            correo_usuarios = correo_usuarios + ', ' + e.correo
          }
        }
      }

      if (cont === allCorreos.length) {
        let datosPermisoCreado = {
          tipo_solicitud: 'Permiso solicitado por',
          solicitud: solicitud,
          desde: desde,
          hasta: hasta,
          h_inicio: this.validar.FormatearHora(permiso.hora_salida!, this.formato_hora),
          h_fin: this.validar.FormatearHora(permiso.hora_ingreso!, this.formato_hora),
          id_empl_contrato: permiso.id_empl_contrato,
          horas_permiso: permiso.hora_numero,
          observacion: permiso.descripcion,
          tipo_permiso: tipo_permiso,
          dias_permiso: permiso.dia,
          estado_p: estado_p,
          proceso: 'creado',
          id_dep: e.id_dep,
          id_suc: e.id_suc,
          correo: correo_usuarios,
          asunto: 'SOLICITUD DE PERMISO',
          solicitado_por: (localStorage.getItem('nom')) + ' ' + (localStorage.getItem('ap'))
        }

        console.log('datosPermisoCreado: ',datosPermisoCreado);
        
        if (correo_usuarios != '') {

          this.autorizaciones.EnviarCorreoPermiso(this.idEmpresa, datosPermisoCreado).subscribe(
            resp => {
              if (resp.message === 'ok') {
                this.validaciones.showToast('Correo de solicitud enviado exitosamente.', 4000, 'success');
              }
              else {
                this.validaciones.showToast('Ups algo salio mal !!! No fue posible enviar correo de solicitud.', 4000, 'warning');
              }
            },
            err => {
              this.validaciones.showToast(err.error.message, 5000, 'danger');
            }
          )

        }
      }
    })
    }
  }

  ngOnDestroy() {
    if (this.subs_bool) {
      this.subscripted.unsubscribe();
      this.reg.dia = null;
      this.reg.hora_numero = null;
      this.reg.dia_libre = null;
      console.log('Destroy unsubcribe');
    }
    this.formRegistro.resetForm();
  }
  
}