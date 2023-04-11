import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import moment from 'moment';
moment.locale('es');

import { AutorizacionesService } from 'src/app/services/autorizaciones.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { CatalogosService } from 'src/app/services/catalogos.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { PermisosService } from 'src/app/services/permisos.service';

import { Permiso, diasHoras, cg_permisoValueDefault, tipoPermiso } from 'src/app/interfaces/Permisos';
import { Notificacion, notificacionValueDefault } from 'src/app/interfaces/Notificaciones';
import { Cg_TipoPermiso } from 'src/app/interfaces/Catalogos';
import { Cg_Feriados } from 'src/app/interfaces/Catalogos';
import { estadoBoolean } from 'src/app/interfaces/Estados';
import { HorarioE } from 'src/app/interfaces/Horarios';
import { ParametrosService } from 'src/app/services/parametros.service';
import { HorasExtrasService } from 'src/app/services/horas-extras.service';
import { VacacionesService } from 'src/app/services/vacaciones.service';

@Component({
  selector: 'app-editar-permiso',
  templateUrl: './editar-permiso.component.html',
  styleUrls: ['../../solicitar-permisos.page.scss']
})

export class EditarPermisoComponent implements OnInit {

  @ViewChild('formRegistro', { static: true }) ngForm: NgForm;
  @Input() permiso!: Permiso;
  reg: Permiso;
  diasHoras = diasHoras;
  tipoPermiso = tipoPermiso;
  radioButton = estadoBoolean;
  selectItemDiasHoras: string = '';
  horarioEmpleado: HorarioE;
  loadingBtn: boolean = false;
  mensajeFile: string | null;
  archivoSubido: Array <File> | null;
  required: boolean = false;
  legalizado: string = '';
  readonly: boolean = false;
  fech_bloqu: boolean;

  dia_inicio: string | null = "";
  dia_fianl: string | null = "";
  hora_inicio: string = "";
  hora_final: string = "";

  //variable para ocultar el boton de calculos de acuerdo a la opcion que se ingresa
  btnOculto: boolean = true;
  //variable para ocultar el boton de guardar
  btnOcultoguardar: boolean = false;

  //variable que calcula el tiempo de horas en la opcion de dias y horas
  totalhoras: number;

  //Variables para almacenar la fecha y la hora que se ingresa en el Form
  fecha_inicio: any;
  fecha_final: any;

  cg_permiso: Cg_TipoPermiso = cg_permisoValueDefault;

  public get cg_tipo_permisos(): Cg_TipoPermiso[] {
    return this.catalogos.cg_tipo_permisos
  }

  private get cg_feriados(): Cg_Feriados[] {
    return this.catalogos.cg_feriados
  }

  private subscripted: Subscription;
  private subs_bool: boolean = false;
  private horas_trabaja_seg: number = 0; // formato: 1000 seg
  horas_trabaja_string: string = ''; // formato: '00:00:00'
  idEmpresa: number;

  constructor(
    private empleadoService: EmpleadosService,
    private permisoService: PermisosService,
    private horasExtrasService: HorasExtrasService,
    private vacacionService: VacacionesService,
    private validaciones: ValidacionesService,
    private autorizacion: AutorizacionesService,
    private catalogos: CatalogosService,
    public modalController: ModalController,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    public alertCrtl: AlertController,
  ) {
    this.idEmpresa = parseInt(String(localStorage.getItem('id_empresa')));
  }

  tiempo: any;
  ngOnInit() {
    this.tiempo = moment();
    this.catalogos.getCgPermisos()
    this.reg = this.permiso
    this.fecha_inicio = this.permiso.fec_inicio;
    this.fecha_final = this.permiso.fec_final;
    if(this.reg.docu_nombre == null){
      this.mensajeFile = "No hay archivo subido";
    }
    this.dia_inicio = moment(this.reg.fec_inicio).format('YYYY-MM-DD');
    this.dia_fianl = moment(this.reg.fec_final).format('YYYY-MM-DD');
    
    /*Esta tranformacion se realizada debido a que el formato  de la variables this.permiso.hora_salida_ no es correcto y se 
      realiza la configuracion para adaptar ese dato y transforma a una dato de tipo Date que permita visualizar en el input con el foprmato correcto.
    */ 
    let hora_ini = this.permiso.hora_salida_.replace(" ", "");
    const hora_i = String(hora_ini.replace("AM", ""));
    const Horainicio = this.validaciones.Unir_Fecha_Hora(String(this.reg.fec_inicio), hora_i);

    let hora_fin = this.reg.hora_ingreso_.replace(" ", "");
    const hora_f = String(hora_fin.replace("AM", ""));
    const HoraFinal = this.validaciones.Unir_Fecha_Hora(String(this.reg.fec_final), hora_f);
    
    this.reg.hora_salida = moment(Horainicio).format();
    this.reg.hora_ingreso = moment(HoraFinal).format();
    this.hora_inicio = moment(Horainicio).format('hh:ss a');
    this.hora_final = moment(HoraFinal).format('hh:ss a');

    if(this.reg.dia != 0 && this.reg.hora_numero == '00:00:00'){
      this.selectItemDiasHoras = 'Días';
    }else if(this.reg.dia == 0 && this.reg.hora_numero != '00:00:00'){
      this.selectItemDiasHoras = 'Horas';
      this.readonly = true;
    }else{
      this.selectItemDiasHoras = 'Días y Horas';
    }

    this.horas_trabaja_seg = this.validaciones.HorasTrabajaToSegundos(String(localStorage.getItem('horas_trabaja')))
    this.horas_trabaja_string = this.validaciones.SegundosToHHMM(this.horas_trabaja_seg)

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
    this.autorizacion.getInfoEmpleadoByCodigo(this.reg.codigo).subscribe(
      res => {
        if (res.estado === 1) {
          var estado = true;
        }
        this.solInfo = [];
        this.solInfo = {
          permiso_mail: res.permiso_mail,
          permiso_noti: res.permiso_noti,
          empleado: res.id_empleado,
          id_dep: res.id_departamento,
          id_suc: res.id_sucursal,
          estado: estado!,
          correo: res.correo,
        }

        console.log('ver informacion... ', this.solInfo)
      })
  }

  /** ******************************************************************************************* **
    ** **                            MANEJO DE VARIABLES INPUT                                 ** **
  ** ******************************************************************************************* **/
  // METODO ENCERAR LAS INPUTS DE FECHA
  valoresDefectoValidacionFechas() {
    this.reg.fec_inicio = null;
    this.reg.fec_final = null;
    this.dia_inicio = '';
    this.dia_fianl = '';
    this.loadingBtn = false;
    return false
  }
  // METODO ENCERAR LAS INPUTS DE HORA
  valoresDefectoValidacionHoras() {
    this.reg.hora_salida = null;
    this.reg.hora_ingreso = null;
    this.hora_inicio = '';
    this.hora_final = '';
    this.loadingBtn = false;
  }

   //METODO ENCERRAR LOS INPUTS DE LOS RESULTADOS DE LOS CALCULOS
   valoresDefectoValidacionResultados(){
    this.reg.dia = null;
    this.reg.dia_libre = null;
    this.reg.hora_numero = null;
    this.btnOculto = false; 
    this.btnOcultoguardar = true;
  }

  /** ******************************************************************************************* **
    ** **                    MANEJO DE MENSAJES DEL CAMBIO DE LOS SELECC                      ** **
   ** ******************************************************************************************* **/

  // METODO VALIDAR EL ITEM DE TIPO DE PERMISO SELECCIONADO
  ChangeTipoPermiso($event: any) {
    this.valoresDefectoValidacionResultados();
    //Metodo para mostrar el mensaje al seleccionar
    if(!$event.target.value){
      return console.log('Salio ', $event.target.value);
    }else{
      const [cg_permiso] = this.cg_tipo_permisos.filter(o => {return o.id === this.reg.id_tipo_permiso})
      this.cg_permiso = cg_permiso;
      
      if(this.cg_permiso.id == this.reg.id_tipo_permiso ){
        const [tipoPermiso] = this.tipoPermiso.filter(res => { return res.id === this.reg.id_tipo_permiso;})
        const num_maxPermiso = this.cg_permiso.num_dia_maximo;
        console.log('Dias maximo ',this.cg_permiso.num_dia_maximo);

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
  
        if(this.cg_permiso.documento == true){
          this.required = true;
        }else{
          this.required = false;
        }
        this.validaciones.abrirToas(tipoPermiso.message+num_maxPermiso, 3000, 'tertiary', 'top');
        return console.log('Se requiere documento ',this.required), this.cg_permiso.num_dia_maximo;
      }
    }
  }

  // METODO VALIDAR EL ITEM DE TIEMPO DE PERMISO SELECCIONADO
  ChangeDiasHoras($event: any) {
    this.valoresDefectoValidacionFechas();
    this.valoresDefectoValidacionHoras();
    this.reg.hora_numero = null;
    this.readonly = false;
    if(!$event.target.value){
      return console.log('Salio ', $event.target.value);
    }else{
     const [diasHora] = this.diasHoras.filter(o => { return o.value === this.selectItemDiasHoras })
     if( diasHora != undefined || diasHora != null ){
       this.validaciones.showToast(diasHora.message, 3500, 'primary')
       this.reg.dia = null;
        this.reg.dia_libre = null; // POR DEFECTO HASTA HACER LA VALIDACION CORRESPONDIENTES A DIAS LIBRES EN EL RANGO DE TIEMPO DEL PERMISO
        switch (diasHora.value) {
          case 'Días':
            this.reg.hora_numero = null ; // POR DEFECTO YA QUE ES PERMISO POR DIAS
          break;
          case 'Horas':
            this.readonly = true;
            this.reg.fec_final = this.reg.fec_inicio;
            this.dia_fianl = this.dia_inicio;
            this.reg.dia = 0; // POR DEFECTO YA Q ES PERMISO POR SOLO HORAS.
          break;
          case 'Días y Horas': break;
          default: break;
        }
      }
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

  //METODO VALIDADOR DE DIAS LIBRES
  DiaIniciolLibre(){
    let dia_retur; 
    if(this.reg.fec_inicio != null){
      dia_retur = this.validaciones.validarDiaLaboral_Libre(this.reg.fec_inicio.toString(),this.horarioEmpleado, this.cg_feriados);
      if(dia_retur == undefined){
        this.validar.showToast('Ups! No tiene horario para realizar solicitudes', 3500, 'warning');
      }

      if(dia_retur == 0){
        this.readonly = true;
        this.showAlert();
        this.valoresDefectoValidacionHoras();
        return dia_retur;
      }
      return dia_retur;
    }
  }

   //METODO VALIDADOR DE DIAS LIBRES
   DiaFinalLibre(){
    let dia_retur; 
    if(this.reg.fec_final != null){
      dia_retur = this.validaciones.validarDiaLaboral_Libre(this.reg.fec_final.toString(),this.horarioEmpleado, this.cg_feriados);
      if(dia_retur == undefined){
        this.validar.showToast('Ups! No tiene horario para realizar solicitudes', 3500, 'warning');
      }

      if(dia_retur == 0){
        this.showAlert();
        this.valoresDefectoValidacionHoras();
        return dia_retur;
      }
      return dia_retur;
    }
  }

  // METODO ALIDAR Y CAMBIAR EL INPUT DE HORA INICAL Y FINAL
  ChangeHoraInicio(e: any){
    this.btnOculto = false;
    if(!e.target.value){
      this.reg.hora_salida = moment(new Date()).format();
      this.hora_inicio = moment(this.reg.hora_salida).format('h:mm a');
    }else{
      this.valoresDefectoValidacionResultados();
      this.reg.hora_salida = e.target.value;
      this.hora_inicio = moment(e.target.value).format('h:mm a');
    }
  }

  ChangeHoraFinal(e: any){
    this.btnOculto = false;
    this.validar.showToast('Calcule el tiempo para actualizar.', 3000, 'warning')
    if(!e.target.value){
      this.reg.hora_ingreso = moment(new Date()).format();
      return this.hora_final = moment(this.reg.hora_ingreso).format('h:mm a');
    }else{
      this.valoresDefectoValidacionResultados();
      this.hora_final = moment(e.target.value).format('h:mm a');
      return this.reg.hora_ingreso = e.target.value;
    }
    
  }

   // METODO VALIDAR Y CAMBIAR EL INPUT DE DIA INICIAL Y FINAL
   ChangeDiaInicio(e: any){
    if(!e.target.value){
      this.valoresDefectoValidacionResultados();
      this.reg.fec_inicio = moment(new Date()).format('YYYY-MM-DD');
      const hoy = moment(this.reg.fec_inicio).format("DD/MM/YYYY, HH:mm:ss")

      this.empleadoService.ObtenerUnHorarioEmpleado(this.reg.codigo, hoy).subscribe(
        horario => { 
          this.horarioEmpleado = horario;

          if(this.cg_permiso.fec_validar == true){
              if(this.dia_inicio == moment(this.cg_permiso.fecha).format('YYYY-MM-DD')){
                this.validaciones.showToast('Lo Sentimos la fecha '+moment(this.cg_permiso.fecha).format('DD-MM-YYYY')+' esta reservada', 3500, 'warning');
                this.valoresDefectoValidacionHoras();
                this.btnOculto = true;
                return this.readonly = true;
              }
            }
      
            if(this.DiaIniciolLibre() == 0){
              this.btnOculto = true;
              return this.readonly = true;
            }
            
            this.valoresDefectoValidacionHoras();
      
            if(this.selectItemDiasHoras == 'Horas'){
              this.reg.fec_final = this.reg.fec_inicio;
              this.dia_fianl = this.dia_fianl = moment(e.target.value).format('YYYY-MM-DD');
              this.readonly = true;
            }else{
              this.valoresDefectoValidacionHoras();
              this.readonly = false;
            }
      
            this.fech_bloqu = false;
        },
        err => { this.validar.showToast(err.error.message, 3000, 'danger');
          return this.dia_inicio = '';
        }
      )


    }else{

      if(!(moment(e.target.value).format('YYYY-MM-DD') == moment(this.dia_inicio).format('YYYY-MM-DD'))){
        this.reg.fec_final = null;
        this.dia_fianl = '';
        this.readonly = true;
        this.valoresDefectoValidacionResultados();
        this.btnOcultoguardar = true;
      }

      this.reg.fec_inicio = e.target.value;
      this.dia_inicio = moment(e.target.value).format('YYYY-MM-DD');
      const hoy = moment(this.reg.fec_inicio).format("DD/MM/YYYY, HH:mm:ss")
        this.empleadoService.ObtenerUnHorarioEmpleado(this.reg.codigo, hoy).subscribe(
          horario => { 
            this.horarioEmpleado = horario;

            if(this.cg_permiso.fec_validar == true){
              if(this.dia_inicio == moment(this.cg_permiso.fecha).format('YYYY-MM-DD')){
                this.validaciones.showToast('Lo Sentimos la fecha '+moment(this.cg_permiso.fecha).format('DD-MM-YYYY')+' esta reservada', 3500, 'warning');
                this.valoresDefectoValidacionHoras();
                this.btnOculto = true;
                return this.readonly = true;
              }
            }
      
            if(this.DiaIniciolLibre() == 0){
              this.btnOculto = true;
              return this.readonly = true;
            }
            
            this.valoresDefectoValidacionHoras();
      
            if(this.selectItemDiasHoras == 'Horas'){
              this.reg.fec_final = this.reg.fec_inicio;
              this.dia_fianl = this.dia_fianl = moment(e.target.value).format('YYYY-MM-DD');
              this.readonly = true;
            }else{
              this.valoresDefectoValidacionHoras();
              this.readonly = false;
            }
      
            this.fech_bloqu = false;

          },
          err => { this.validar.showToast(err.error.message, 3000, 'danger') 
          return this.dia_inicio = '';  
          }
      )
    }

  }

  ChangeDiaFinal(e: any){
    this.valoresDefectoValidacionResultados();
    if(!e.target.value){
      if(moment(this.reg.fec_inicio).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')){
        this.reg.fec_final = this.reg.fec_inicio;
        this.dia_fianl = moment(e.target.value).format('YYYY-MM-DD');//Ajustamos el formato de la fecha para mostrar en el input

        const hoy = moment(this.reg.fec_final).format("DD/MM/YYYY, HH:mm:ss")
        this.empleadoService.ObtenerUnHorarioEmpleado(this.reg.codigo, hoy).subscribe(
          horario => { 
            this.horarioEmpleado = horario;
  
            if(this.cg_permiso.fec_validar == true){
              if(this.dia_inicio == moment(this.cg_permiso.fecha).format('YYYY-MM-DD')){
                this.validaciones.showToast('Lo Sentimos la fecha '+moment(this.cg_permiso.fecha).format('DD-MM-YYYY')+' esta reservada', 3500, 'warning');
                this.valoresDefectoValidacionHoras();
                this.btnOculto = true;
                return this.readonly = true;
              }
            }
        
            if(this.DiaFinalLibre() == 0){
              this.fech_bloqu = true;
              return this.btnOculto = true;
            }
              
            this.valoresDefectoValidacionHoras();

            if(this.selectItemDiasHoras == 'Horas'){
              this.readonly = true;
            }else{
              this.validar.showToast('Calcule el tiempo para actualizar.', 2000, 'warning')
              this.valoresDefectoValidacionHoras();
            }
        
            this.btnOculto = false;
            this.fech_bloqu = false;
          },
          err => { this.validar.showToast(err.error.message, 3000, 'danger');
            return this.dia_inicio = '';
          }
        )
      }else{
        this.reg.fec_final = null;
        this.validar.showToast('Seleccione una Fecha Final', 3000, "warning");
        this.dia_fianl = null;
      }
    }else{
      this.reg.fec_final = e.target.value;
      this.dia_fianl = moment(e.target.value).format('YYYY-MM-DD');
      const hoy = moment(this.reg.fec_final).format("DD/MM/YYYY, HH:mm:ss")

      this.empleadoService.ObtenerUnHorarioEmpleado(this.reg.codigo, hoy).subscribe(
        horario => { 
          this.horarioEmpleado = horario;

          if(this.cg_permiso.fec_validar == true)
          {
            if(this.dia_fianl == moment(this.cg_permiso.fecha).format('YYYY-MM-DD')){
              this.validaciones.showToast('Lo Sentimos la fecha '+moment(this.cg_permiso.fecha).format('DD-MM-YYYY')+' esta reservada', 3500, 'warning');
              this.valoresDefectoValidacionHoras();
              this.fech_bloqu = true;
              this.btnOculto = true;
              return false;
            }
          }
    
          if(this.DiaFinalLibre() == 0){
            this.fech_bloqu = true;
            return this.btnOculto = true;
          }
    
          if(this.selectItemDiasHoras == 'Horas'){
            this.readonly = true;
          }else{
            this.validar.showToast('Calcule el tiempo para actualizar.', 2000, 'warning')
            this.valoresDefectoValidacionHoras();
          }
          
          this.btnOculto = false;
          this.fech_bloqu = false;
        },
        err => { this.validar.showToast(err.error.message, 3000, 'danger');
          return this.dia_inicio = '';
        }
      )

      
    }
  }

  /* ********************************************************************************** *
     *                 METODO PARA MOSTRAR EL CALCULO EN LOS INPUTS                   *
   * ********************************************************************************** */
  mostrarCalculos(){
    if(this.selectItemDiasHoras == 'Horas'){
      if (this.validar.vacio(this.reg.hora_ingreso) || this.validar.vacio(this.reg.hora_salida)) {
        this.loadingBtn = false;
        this.validar.showToast('Llenar todos los campos solicitados.', 3000, 'warning')
        return false;
      }
    }
    
    //variables para validar el dia de inicio completo y el dia final completo y buscar duplicidad.
    let minutosinicio = '00:00:00';
    let minutosfinal = '23:00:00';

    if(this.selectItemDiasHoras === 'Horas'){
      minutosinicio = moment(this.reg.hora_salida).format('HH:mm:ss');
      minutosfinal = moment(this.reg.hora_ingreso).format('HH:mm:ss');
    }

    const fec_inicio = (moment(this.reg.fec_inicio).format('YYYY-MM-DD'))+' '+ minutosinicio;
    const fec_final = (moment(this.reg.fec_final).format('YYYY-MM-DD')) +' '+ minutosfinal;
    const codigo = parseInt(String(localStorage.getItem('codigo')));
    const id_solicitud = this.reg.id;

    if(moment(fec_inicio).format('YYYY-MM-DD') != moment(this.fecha_inicio).format('YYYY-MM-DD') || 
       moment(fec_final).format('YYYY-MM-DD') != moment(this.permiso.fec_final).format('YYYY-MM-DD')){

        if(this.selectItemDiasHoras == 'Dias'){
          this.permisoService.getlistaPermisosByFechasyCodigoEdit(fec_inicio, fec_final, codigo, id_solicitud).subscribe(solicitados => {

            if(solicitados.length != 0){
              this.valoresDefectoValidacionResultados();
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
                  }, error => {
                    this.validaciones.showToast('Lo sentimos tenemos problemas para verificar su permiso', 3500, 'warning');
                  }); 
                }
              }, error => {
                this.validaciones.showToast('Lo sentimos tenemos problemas para verificar su permiso', 3500, 'warning');
              });
            }
          }, error => {
            this.validaciones.showToast('Lo sentimos tenemos problemas para verificar su permiso', 3500, 'warning');
          });

        }else{
          this.permisoService.getlistaPermisosByHorasyCodigoEdit(fec_inicio, fec_final, minutosinicio, minutosfinal, codigo, id_solicitud).subscribe(solicitados => {
            if(solicitados.length != 0){
              this.valoresDefectoValidacionResultados();
              this.validaciones.showToast('Ups! Ya existe permisos en esa fecha y hora ', 3500, 'warning');
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
                  }, error => {
                    this.validaciones.showToast('Lo sentimos tenemos problemas para verificar su permiso', 3500, 'warning');
                  }); 
                }
              }, error => {
                this.validaciones.showToast('Lo sentimos tenemos problemas para verificar su permiso', 3500, 'warning');
              });
            }
          }, error => {
            this.validaciones.showToast('Lo sentimos tenemos problemas para verificar su permiso', 3500, 'warning');
          });
        }
    }else{
      this.calcularhoras();
    }
  }

  /* ********************************************************************************** *
     *              METODO PARA CALCULAR Y VALIDAR EL RESULTADO MOSTRADO              *
   * ********************************************************************************** */
  calcularhoras() {
    if(this.selectItemDiasHoras == 'Días'){

      const fechasValidas = this.validaciones.validarRangoFechasIngresa(this.reg.fec_inicio!, this.reg.fec_final!, true)
      if (!fechasValidas) {return this.valoresDefectoValidacionFechas()}
     
      //Se optiene la hora por defecto del dia de salida que es la hora en la que se crea el permiso 
      //Esto se lee hasta mientras por defecto ya que el tipo de permiso es por dias, se debe validar con el horario laboral del usuario
      const hora_ingreso =  '09:00:00'; //Hasta validar con el registro de horarios
      const hora_salida = '09:00:00'; //Hasta validar con el registro de horarios
      this.reg.hora_ingreso = hora_ingreso;
      this.reg.hora_salida = hora_salida;
      const fec_comp_inicio = this.validaciones.Unir_Fecha_Hora(String(this.reg.fec_inicio), hora_salida);
      const fec_comp_final = this.validaciones.Unir_Fecha_Hora(String(this.reg.fec_final), hora_ingreso);

      this.fecha_inicio = moment(fec_comp_inicio).format();
      this.fecha_final = moment(fec_comp_final).format();

      const total = this.validaciones.MilisegToSegundos( fec_comp_final.valueOf() - fec_comp_inicio.valueOf() );

      // 86400 seg ==> es un dia de 24 horas
      let { dia, tiempo_transcurrido, dia_libre } =
      this.validaciones.SegundosTransformDiaLaboral(String(this.reg.fec_inicio), String(this.reg.fec_final), total, this.totalhoras, this.horarioEmpleado, this.horas_trabaja_seg, this.cg_feriados)
      if(dia == 0){
        dia = 1;
      }

      this.reg.dia = dia
      this.reg.dia_libre = dia_libre;
      this.reg.hora_numero = '00:00:00'; //Por defecto ya que es permiso por dias
      this.btnOcultoguardar = false;

    }else{      
      //Validacion de Dias y Horas
      if(this.selectItemDiasHoras === 'Días y Horas'){
        //si los dias son iguales, en la opcion de dias y horas no permite
        if(moment(this.reg.fec_inicio).format('YYYY-MM-DD') == moment(this.reg.fec_final).format('YYYY-MM-DD')){
          this.reg.hora_numero = null;
          this.valoresDefectoValidacionFechas();
          this.valoresDefectoValidacionHoras(); 
          this.validaciones.showToast('Ups!, si decea ingresar solo un dia, seleccione la opcion de Horas', 3500, 'warning');
          return false;
        }
      }

      const fechasValidas = this.validaciones.validarRangoFechasIngresa(this.reg.fec_inicio!, this.reg.fec_final!, true)
      if (!fechasValidas){return this.valoresDefectoValidacionFechas()}
  
      const hora_salida = this.validaciones.TiempoFormatoHHMMSS(this.reg.hora_salida!);
      const hora_ingreso = this.validaciones.TiempoFormatoHHMMSS(this.reg.hora_ingreso!);
      const fec_comp_inicio = this.validaciones.Unir_Fecha_Hora(this.reg.fec_inicio!, hora_salida);
      const fec_comp_final = this.validaciones.Unir_Fecha_Hora(this.reg.fec_final!,  hora_ingreso);

      this.fecha_inicio = moment(fec_comp_inicio).format();
      this.fecha_final = moment(fec_comp_final).format();
  
      const horasValidas = this.validaciones.validarHorasIngresadas(fec_comp_inicio, fec_comp_final) // evaluacion de fechas completas 
      if (!horasValidas) return false;
  
      const total = this.validaciones.MilisegToSegundos( fec_comp_final.valueOf() - fec_comp_inicio.valueOf());

        //Condicion que valida el tiempo calculado de horas con la jornada laboral la cual es el numero de horas en segundos que trabaja el empleado
        if(this.selectItemDiasHoras === 'Horas'){
          if(total > this.horas_trabaja_seg){
            this.validaciones.showToast('Ups!, lo sentimos el rango de horas excede su jornada laboral', 3500, 'warning');
            this.reg.hora_numero = null;
            this.btnOcultoguardar = true;
            return false;
          }
          this.btnOcultoguardar = false;
        }

      // 86400 seg ==> es un dia de 24 horas
      const { dia, tiempo_transcurrido, dia_libre } =
      this.validaciones.SegundosTransformDiaLaboral(this.reg.fec_inicio!.toString(), this.reg.fec_final!.toString(), total, this.totalhoras, this.horarioEmpleado, this.horas_trabaja_seg, this.cg_feriados)

      this.reg.dia = dia
      this.reg.hora_numero = tiempo_transcurrido
      this.reg.dia_libre = dia_libre;
  
      switch (this.selectItemDiasHoras) {
        case 'Horas':
          this.reg.dia = 0; // por defecto ya q es permiso por solo horas.
          break;
        case 'Días y Horas': break;
        default: break;
      }

    }

    const [cg_permiso] = this.cg_tipo_permisos.filter(o => {return o.id === this.reg.id_tipo_permiso})
    this.cg_permiso = cg_permiso;

    if(this.cg_permiso.num_dia_maximo < this.reg.dia!){
      this.validaciones.showToast('Lo Sentimos el maximo de dias de permiso es '+this.cg_permiso.num_dia_maximo, 3500, 'warning');
      this.reg.fec_final = null;
      return false;
    }


    return true;
  }

   /* ********************************************************************************** *
     *                          ACTUALIZA LA SOLICITUD CREADA                            *
   * ********************************************************************************** */
  //Metodo para actualizar la solicitud
  UpdateRegister() {
    const validadionesFechasHoras = this.calcularhoras()
    this.loadingBtn = true;

    if (!validadionesFechasHoras) return

    console.log('PASO VALIDACIONES DE FECHAS Y HORAS');

    this.reg.fec_inicio = this.fecha_inicio;
    this.reg.fec_final = this.fecha_final;

    if(this.selectItemDiasHoras != 'Días'){
      this.reg.hora_salida = this.validaciones.TiempoFormatoHHMMSS(this.reg.hora_salida!);
      this.reg.hora_ingreso = this.validaciones.TiempoFormatoHHMMSS(this.reg.hora_ingreso!);
    }

    if(this.reg.docu_nombre != null){
      if(this.archivoSubido != null){
        this.reg.docu_nombre = this.archivoSubido[0].name; // Inserta el nombre del archivo al subir
      }
    }else{
      if(this.archivoSubido != null){
        this.reg.docu_nombre = this.archivoSubido[0].name; // Inserta el nombre del archivo al subir
      }else{
        this.permisoService.EliminarArchivo(this.reg.documento!).subscribe(res => {}) //Elimina el archivo del servidos si se quita y se guarda sin documento
        this.reg.docu_nombre = null;
        this.reg.documento = null;
      }
    }

    this.subscripted = this.permisoService.putPermiso(this.reg).subscribe(
      permiso => {
        this.reg.id_tipo_permiso = this.cg_permiso.id;
        if(this.archivoSubido != null){this.updataArchivo(permiso)}
        this.NotificarEdicionPermiso(permiso);
        this.closeModal(true);
        this.validaciones.abrirToas('Solicitud actualizada correctamente.', 4000, 'success', 'top');
      },
      err => { this.validaciones.showToast(err.error.message, 3000, 'danger') },
      () => { this.loadingBtn = false; this.ngForm.resetForm(); this.subs_bool = true; this.mensajeFile = '';}
    )
    this.closeModal(true);
  }

   /* ********************************************************************************** *
     *                       SUBIR ARCHIVO DE SOLICITUD DE PERMISO                    *
   * ********************************************************************************** */
  //Metodo para ingresar el archivo
  fileChange(element: any){
    this.archivoSubido = element.target.files;
    console.log(this.archivoSubido);
    const name = this.archivoSubido![0].name;
    if(this.archivoSubido!.length != 0){
      if(this.archivoSubido![0].size >= 2e+6){
        this.archivoSubido = null;
        this.reg.docu_nombre = '';
        this.mensajeFile = "Ingrese un archivo maximo de 2Mb";
        this.validaciones.showToast('Ups el archivo pesa mas de 2Mb',3500, 'danger');

      }else if(this.archivoSubido![0].name.length > 50){
        this.archivoSubido = null;
        this.reg.docu_nombre = ''
        this.mensajeFile = "El nombre debe tener 50 caracteres como maximo";
        this.validaciones.showToast('Ups el nombre del archivo es muy largo', 3500, 'warning');

      }else{
        console.log(this.archivoSubido![0].name);
        this.reg.docu_nombre = name;
        this.validaciones.showToast('Archivo valido', 3500, 'success');
      }
    }
  }

  //Metodo para actualizar un archivo
  updataArchivo(permiso: any){
    
    if(this.archivoSubido![0].name == this.reg.docu_nombre){
      this.permisoService.EliminarArchivo(this.reg.documento!).subscribe(res => {
        this.subirRespaldo(permiso);
      })
    }else{
      this.subirRespaldo(permiso);
    }
  }

  //Metodo para subir (cargar) el archivo al servidor
  subirRespaldo(permiso: any){
    var id = permiso.id;
    let formData = new FormData();
    console.log("tamaño: ", this.archivoSubido![0].size);

    if(this.archivoSubido == undefined){
      return this.archivoSubido = null;
    }
    
    for(var i = 0; i < this.archivoSubido.length; i++){
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    this.permisoService.SubirArchivoRespaldo(formData, id, this.archivoSubido[0].name).subscribe(res => {
      this.validaciones.showToast('El archivo se actualizo Correctamente', 3000, 'success');
      this.reg.docu_nombre = '';

    }, err => {
        console.log(formData)
        return this.validaciones.showToast('El archivo no se pudo Cargar al Servidor', 3500, 'danger');
        
    });
  }

  //Metodo para eliminar el archivo de permiso
  deleteDocumentoPermiso(){
    console.log('El archivo ', this.reg.documento, ' Se quito Correctamente');
    this.validaciones.showToast('El archivo se quito correctamente', 3500, 'acua');
    this.reg.docu_nombre = null;
    this.mensajeFile = null;
    this.archivoSubido = null;
  }

  /** ******************************************************************************************* **
   ** **                           MANEJO DE NOTIFICACIONES DE PERMISOS                          ** **
   ** ******************************************************************************************* **/

  // METODO DE ENVIO DE NOTIFICACIONES 
  NotificarEdicionPermiso(permiso: any) {
    var datos = {
      depa_user_loggin: this.solInfo.id_dep,
      objeto: permiso,
    }
    this.autorizacion.BuscarJefes(datos).subscribe(permiso => {
      permiso.EmpleadosSendNotiEmail.push(this.solInfo);
      this.EnviarCorreoPermiso(permiso);
      this.EnviarNotificacionPermiso(permiso);
    });
  }


  EnviarCorreoPermiso(permiso: any) {
    var cont = 0;
    var correo_usuarios = '';

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO
    let solicitud = this.validar.FormatearFecha(permiso.fec_creacion, this.formato_fecha, this.validar.dia_completo);
    let desde = this.validar.FormatearFecha(permiso.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(permiso.fec_final, this.formato_fecha, this.validar.dia_completo);

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (permiso.estado === 1) {
      var estado_p = 'Pendiente de autorización';
    }
    else if (permiso.estado === 2) {
      var estado_p = 'Preautorizada';
    }
    else if (permiso.estado === 3) {
      var estado_p = 'Autorizada';
    }
    else if (permiso.estado === 4) {
      var estado_p = 'Negada';
    }

    // LEYENDO DATOS DE TIPO DE PERMISO
    var tipo_permiso = '';
    this.cg_tipo_permisos.filter(o => {
      if (o.id === permiso.id_tipo_permiso) {
        tipo_permiso = o.descripcion
      }
      return tipo_permiso;
    })

    // VERIFICACIÓN QUE TODOS LOS DATOS HAYAN SIDO LEIDOS PARA ENVIAR CORREO
    permiso.EmpleadosSendNotiEmail.forEach((e: any) => {

      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      // SI EL USUARIO SE ENCUENTRA ACTIVO Y TIENEN CONFIGURACIÓN RECIBIRA CORREO DE SOLICITUD DE VACACIÓN
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

      console.log('contadores', permiso.EmpleadosSendNotiEmail.length + ' cont ' + cont)

      if (cont === permiso.EmpleadosSendNotiEmail.length) {

        console.log('data entra correo usuarios', correo_usuarios)

        let datosPermisoCreado = {
          solicitud: solicitud,
          desde: desde,
          hasta: hasta,
          h_inicio: this.validar.FormatearHora(permiso.hora_salida, this.formato_hora),
          h_fin: this.validar.FormatearHora(permiso.hora_ingreso, this.formato_hora),
          id_empl_contrato: permiso.id_empl_contrato,
          tipo_solicitud: 'Permiso actualizado por',
          horas_permiso: permiso.hora_numero,
          observacion: permiso.descripcion,
          tipo_permiso: tipo_permiso,
          dias_permiso: permiso.dia,
          estado_p: estado_p,
          proceso: 'actualizado',
          id_dep: e.id_dep,
          id_suc: e.id_suc,
          correo: correo_usuarios,
          asunto: 'ACTUALIZACION DE SOLICITUD DE PERMISO',
          id: permiso.id,
          solicitado_por: (localStorage.getItem('nom')) + ' ' + (localStorage.getItem('ap')),
        }
        if (correo_usuarios != '') {
          console.log('data entra enviar correo')

          this.autorizacion.EnviarCorreoPermiso(this.idEmpresa, datosPermisoCreado).subscribe(
            resp => {
              if (resp.message === 'ok') {
                this.validaciones.abrirToas('Correo de solicitud enviado exitosamente.', 4000, 'success', 'top');
              }
              else {
                this.validaciones.showToast('Ups algo salio mal !!! No fue posible enviar correo de solicitud.', 5000, 'warning');
              }
            },
            err => {
              this.validaciones.showToast(err.error.message, 5000, 'danger');
            },
            () => { },
          )
        }
      }
    })
  }

  EnviarNotificacionPermiso(permiso: any) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO
    let desde = this.validar.FormatearFecha(permiso.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(permiso.fec_final, this.formato_fecha, this.validar.dia_completo);

    let h_inicio = this.validar.FormatearHora(permiso.hora_salida, this.formato_hora);
    let h_fin = this.validar.FormatearHora(permiso.hora_ingreso, this.formato_hora);

    if (h_inicio === '00:00') {
      h_inicio = '';
    }

    if (h_fin === '00:00') {
      h_fin = '';
    }

    const noti: Notificacion = notificacionValueDefault;
    noti.id_vacaciones = noti.id_hora_extra = null;
    noti.id_send_empl = parseInt(localStorage.getItem('empleadoID')!);
    noti.id_permiso = permiso.id;
    noti.create_at = this.tiempo.format('YYYY-MM-DD') + ' ' + this.tiempo.format('HH:mm:ss');
    noti.estado = 'Pendiente';
    noti.tipo = 1;
    noti.mensaje = 'Ha actualizado su solicitud de permiso desde ' +
      desde + ' ' + h_inicio + ' hasta ' +
      hasta + ' ' + h_fin;

    //Listado para eliminar el usuario duplicado
    var allNotificaciones: any = [];
    //Ciclo por cada elemento del listado
    permiso.EmpleadosSendNotiEmail.forEach(function(elemento: any, indice: any , array: any) {
      // Discriminación de elementos iguales
      if(allNotificaciones.find((p: any) =>p.empleado == elemento.empleado) == undefined)
      {
        // Nueva lista de empleados que reciben la notificacion
        allNotificaciones.push(elemento);
      }
    });

    console.log("Usuarios que reciben la notificacion: ",allNotificaciones);

    allNotificaciones.forEach((e: any) => {
      noti.id_receives_depa = e.id_dep;
      noti.id_receives_empl = e.empleado;
      if (e.permiso_noti) {
        this.autorizacion.postNotificacion(noti).subscribe(
          resp => {
            this.permisoService.sendNotiRealTime(resp.respuesta);
          },
          err => { this.validaciones.showToast(err.error.message, 3000, 'danger') },
          () => { },
        )
      }
    })
  }


  ngOnDestroy() {
    this.ngForm.resetForm(); 
    if (this.subs_bool) {
      this.subscripted.unsubscribe()
      console.log('Destroy unsubcribe');
    }
  }

  closeModal(refreshInfo: Boolean) {
    this.ngForm.resetForm(); 
    this.modalController.dismiss({
      'refreshInfo': refreshInfo
    });
  }
}
