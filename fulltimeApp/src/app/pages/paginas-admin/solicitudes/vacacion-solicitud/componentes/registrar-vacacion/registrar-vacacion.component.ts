import { Component, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DateTime } from 'luxon';
import { estadoBoolean } from 'src/app/interfaces/Estados';
import { HorarioE } from 'src/app/interfaces/Horarios';
import { Cg_Feriados } from 'src/app/interfaces/Catalogos';
import { Autorizacion, autorizacionValueDefault } from 'src/app/interfaces/Autorizaciones';
import { Notificacion, notificacionValueDefault } from 'src/app/interfaces/Notificaciones';
import { Vacacion, vacacionValueDefault } from 'src/app/interfaces/Vacacion';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { AutorizacionesService } from 'src/app/services/autorizaciones.service';
import { VacacionesService } from 'src/app/services/vacaciones.service';
import { CatalogosService } from 'src/app/services/catalogos.service';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { CloseModalComponent } from 'src/app/componentes/close-modal/close-modal.component';
import { ParametrosService } from 'src/app/services/parametros.service';
import { HorasExtrasService } from 'src/app/services/horas-extras.service';
import { PermisosService } from 'src/app/services/permisos.service';
import { AlertController, IonDatetime } from '@ionic/angular';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
@Component({
  selector: 'app-registrar-vacacion',
  templateUrl: './registrar-vacacion.component.html',
  styleUrls: ['../solicitar-vacaciones.page.scss'],
})
export class RegistrarVacacionComponent implements OnInit, OnDestroy {

  @ViewChild('formRegistro', { static: false }) formRegistro: NgForm;
  @ViewChild(CloseModalComponent, { static: true })
  private closeModalComponent: CloseModalComponent;

  @Input() num_vacacion: number;
  @ViewChild(IonDatetime) datetimeInicio: IonDatetime;
  @ViewChild(IonDatetime) datetimeFinal: IonDatetime;
  @ViewChild(IonDatetime) datetimeIngreso: IonDatetime;

  reg: Vacacion = vacacionValueDefault;
  radioButton = estadoBoolean;
  loadingBtn: boolean = false;
  public horarioEmpleado: HorarioE;
  disabled_dia_fianl: boolean = false;
  disabled_dia_ingreso: boolean = false;

  dia_inicio: string = "";
  dia_fianl: string = "";
  dia_ingreso: string = "";

  private subscripted: Subscription;
  private subs_bool: boolean = false;

  //variable para ocultar el boton de calculos de acuerdo a la opcion que se ingresa
  btnOculto: boolean = true;
  //variable para ocultar el boton de guardar
  btnOcultoguardar: boolean = true;

  //variable para ocultar el formulario si no tiene asignado o registrado un periodo de vacaciones.
  ocultar: boolean = true;
  mensaje: boolean = true;

  private get cg_feriados(): Cg_Feriados[] {
    return this.catalogoService.cg_feriados
  }

  idEmpresa: number;

  constructor(
    public validar: ValidacionesService,
    private permisoService: PermisosService,
    private horasExtrasService: HorasExtrasService,
    private vacacionService: VacacionesService,
    private catalogoService: CatalogosService,
    private empleadoService: EmpleadosService,
    private autorizaciones: AutorizacionesService,
    public parametro: ParametrosService,
    public alertCrtl: AlertController,
    private userService: DataUserLoggedService,

  ) {
    this.idEmpresa = parseInt(localStorage.getItem('id_empresa'));
  }

  ngOnInit() {
    this.catalogoService.getFeriadosAnual()
    this.reg.estado = 1;
    this.reg.id_empleado = parseInt(localStorage.getItem('empleadoID'));
    this.reg.id_periodo_vacacion = parseInt(localStorage.getItem('cperi_vacacion'));
    this.reg.id_empleado_cargo = parseInt(localStorage.getItem('ccargo'));
    this.reg.dia_laborable = undefined;
    this.reg.dia_libre = undefined;

    this.reg.user_name = this.userService.username;
    this.reg.ip = localStorage.getItem('ip');

    console.log('peri_vacaciones: ', this.reg.id_periodo_vacacion);
    console.log('id_empleado_cargo: ', this.reg.id_empleado_cargo);

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
    this.autorizaciones.getInfoEmpleadoByCodigo(this.reg.id_empleado).subscribe(
      res => {
        if (res.estado === 1) {
          var estado = true;
        }
        this.solInfo = [];
        this.solInfo = {
          vaca_mail: res.vacacion_mail,
          vaca_noti: res.vacacion_notificacion,
          empleado: res.id_empleado,
          id_suc: res.id_suc,
          id_dep: res.id_depa,
          estado: estado,
          correo: res.correo,
        }

        if (!(Number.isNaN(this.reg.id_periodo_vacacion))) {
          this.ocultar = false;
          this.mensaje = true;
        } else {
          this.mensaje = false;
        }

      }
    );
  }

  valoresDefectoValidacionFechas() {
    this.reg.fecha_inicio = null;
    this.reg.fecha_final = null;
    this.reg.fecha_ingreso = null;
    this.loadingBtn = false;
    return false
  }

  //METODO VALIDADOR DE DIAS LIBRES
  DiaIniciolLibre(fecha_ingresada) {

    console.log("ver fecha_ingresada", fecha_ingresada);
    let dia_retur;
    if (fecha_ingresada != null && fecha_ingresada != "") {
      dia_retur = this.validar.validarDiaLaboral_Libre(fecha_ingresada.toString(), this.horarioEmpleado, this.cg_feriados);
      if (dia_retur == undefined) {
        this.validar.showToast('Ups! No tiene horario para realizar solicitudes', 3500, 'warning');
      }
      if (dia_retur == 0) {
        this.showAlert();
        return dia_retur;
      }
      return dia_retur;
    }
  }

  // Diseno de Mensaje de notificacion con logo 
  async showAlert() {
    let alert = await this.alertCrtl.create({
      message: `<div class="card-alert">
                  <img src="../../../assets/images/LOGOBLFT.png" class="img-alert">
                  <br>
                  <p> Ups! El día que ingreso esta fuera de su calendario laboral </p>
                  <p> Por favor cambie a un día dentro de su calendario </p>
                </div>`,
      buttons: [
        {
          text: 'OK',
          cssClass: 'alert-button-confirm'
        }],
      mode: "ios",
      backdropDismiss: false,
    }); await alert.present();
  }

  // METODO VALIDAR EL INPUT DE DIA INICIAL, FINAL y INGRESO
  ChangeDiaInicio(e) {
    this.reg.fecha_final = null;
    this.reg.fecha_ingreso = null;
    this.loadingBtn = false;
    this.dia_fianl = '';
    this.dia_ingreso = '';
    this.reg.dia_laborable = null;
    this.reg.dia_libre = null;

    if (!e.target.value) {
      this.reg.fecha_inicio = DateTime.now().toFormat('yyyy-MM-dd');
      const hoy = DateTime.fromISO(this.reg.fecha_inicio).toFormat("dd/MM/yyyy, HH:mm:ss")
      this.dia_fianl = DateTime.fromISO(this.reg.fecha_inicio).toFormat('yyyy-MM-dd');
      console.log("ver id empleado", this.reg.id_empleado)


      this.empleadoService.ObtenerUnHorarioEmpleado(this.reg.id_empleado, hoy).subscribe(
        horario => {

          console.log("ver horario", horario)
          this.horarioEmpleado = horario;

          if (this.DiaIniciolLibre(this.reg.fecha_inicio) == 0) {
            this.disabled_dia_fianl = true, this.disabled_dia_ingreso = true;
          } else {
            this.disabled_dia_fianl = false, this.disabled_dia_ingreso = false;
          }
          return this.dia_inicio = DateTime.fromISO(e.target.value).toFormat('yyyy-MM-dd');
        },
        err => {
          this.validar.showToast(err.error.message, 3000, 'danger');
          this.reg.fecha_inicio = undefined;
          return this.dia_inicio = '';
        }
      )

    } else {
      this.reg.fecha_inicio = e.target.value;
      this.dia_inicio = DateTime.fromISO(e.target.value).toFormat('yyyy-MM-dd');
      this.datetimeInicio.confirm(true);
      if (this.reg.fecha_inicio != '' || this.reg.fecha_inicio != null) {

        const hoy = DateTime.fromISO(this.reg.fecha_inicio).toFormat("dd/MM/yyyy, HH:mm:ss")

        console.log("ver el codigo para ho", this.reg.id_empleado)
        this.empleadoService.ObtenerUnHorarioEmpleado(this.reg.id_empleado, hoy).subscribe(
          horario => {

            this.horarioEmpleado = horario;
            console.log("ver horario", this.horarioEmpleado)

            if (this.DiaIniciolLibre(this.reg.fecha_inicio) == 0) {
              return this.disabled_dia_fianl = true, this.disabled_dia_ingreso = true;
            } else {
              return this.disabled_dia_fianl = false, this.disabled_dia_ingreso = false;
            }

          },
          err => {
            this.validar.showToast(err.error.message, 3000, 'danger')
            return this.dia_inicio = '';
          }
        )
      }

    }
  }

  ChangeDiaFinal(e) {
    if (!e.target.value) {
      this.reg.fecha_ingreso = null;
      this.loadingBtn = false;
      this.dia_ingreso = '';
      this.reg.dia_laborable = null;
      this.reg.dia_libre = null;

      if (DateTime.fromISO(this.reg.fecha_inicio).toFormat('yyyy-MM-dd') == DateTime.now().toFormat('yyyy-MM-dd')) {
        this.reg.fecha_final = this.reg.fecha_inicio;
        return this.dia_fianl = DateTime.fromISO(e.target.value).toFormat('yyyy-MM-dd');//Ajustamos el formato de la fecha para mostrar en el input
      } else {
        this.reg.fecha_final = null;
        this.validar.showToast('Seleccione una Fecha Final', 3000, "warning");
        return this.dia_fianl = null
      }
    } else {
      this.reg.fecha_ingreso = null;
      this.dia_ingreso = '';
      this.loadingBtn = false;
      this.reg.dia_laborable = null;
      this.reg.dia_libre = null;
      this.reg.fecha_final = e.target.value;
      this.dia_fianl = DateTime.fromISO(e.target.value).toFormat('yyyy-MM-dd');
      this.datetimeFinal.confirm(true);
    }

    if (DateTime.fromISO(this.reg.fecha_final).toFormat('yyyy-MM-dd') == DateTime.fromISO(this.reg.fecha_inicio).toFormat('yyyy-MM-dd')) {
      this.validar.showToast('Las fechas no pueden ser iguales', 3000, "warning");
      return this.disabled_dia_ingreso = true;
    }
    return this.disabled_dia_ingreso = false;
  }

  ChangeDiaIngreso(e) {
    if (!e.target.value) {
      this.reg.dia_laborable = null;
      this.reg.dia_libre = null;
      if (DateTime.fromISO(this.reg.fecha_final).toFormat('yyyy-MM-dd') == DateTime.now().toFormat('yyyy-MM-dd')) {
        this.reg.fecha_ingreso = this.reg.fecha_final;
        this.btnOculto = false;
        return this.dia_ingreso = DateTime.fromISO(e.target.value).toFormat('yyyy-MM-dd');//Ajustamos el formato de la fecha para mostrar en el input
      } else {
        this.reg.fecha_ingreso = null;
        this.validar.showToast('Seleccione una Fecha Final', 3000, "warning");
        return this.dia_ingreso = null
      }
    } else {
      this.reg.dia_laborable = null;
      this.reg.dia_libre = null;
      this.btnOculto = false;
      this.reg.fecha_ingreso = e.target.value;
      this.dia_ingreso = DateTime.fromISO(e.target.value).toFormat('yyyy-MM-dd');
      this.datetimeIngreso.confirm(true);
    }
  }


  /* ********************************************************************************** *
    *                 METODO PARA MOSTRAR EL CALCULO EN LOS INPUTS                   *
  * ********************************************************************************** */
  mostrarCalculos() {
    //variables para validar el dia de inicio completo y el dia final completo y buscar duplicidad.
    let minutosinicio = '00:00:00';
    let minutosfinal = '23:00:00';

    const fec_inicio = (DateTime.fromISO(this.reg.fecha_inicio).toFormat('yyyy-MM-dd')) + ' ' + minutosinicio;
    const fec_final = (DateTime.fromISO(this.reg.fecha_final).toFormat('yyyy-MM-dd')) + ' ' + minutosfinal;
    const codigo = parseInt(localStorage.getItem('empleadoID'))

    this.permisoService.getlistaPermisosByFechasyCodigo(fec_inicio, fec_final, codigo).subscribe(solicitados => {
      if (solicitados.length != 0) {
        this.reg.dia_laborable = null;
        this.reg.dia_libre = null;
        this.validar.showToast('Ups! Ya existe permisos en esas fechas ', 3500, 'warning');
        return this.btnOcultoguardar = true;
      }
      else {
        this.horasExtrasService.getlistaHorasExtrasByFechasyCodigo(fec_inicio, fec_final, codigo).subscribe(solicitados => {
          if (solicitados.length != 0) {
            this.reg.dia_laborable = null;
            this.reg.dia_libre = null;
            this.validar.showToast('Ups! Ya existe horas extras en esas fechas ', 3500, 'warning');
            return this.btnOcultoguardar = true;
          }
          else {
            this.vacacionService.getlistaVacacionesByFechasyCodigo(fec_inicio, fec_final, codigo).subscribe(solicitados => {
              if (solicitados.length != 0) {
                this.reg.dia_laborable = null;
                this.reg.dia_libre = null;
                this.validar.showToast('Ups! Ya existe vacaciones en esas fechas ', 3500, 'warning');
                return this.btnOcultoguardar = true;
              }
              else {
                this.calcularDiasVacaciones();
                return this.btnOcultoguardar = false;
              }
            }, err => {
              this.validar.showToast('Lo sentimos tenemos inconvenientes con el servidor', 3500, 'warning');
            });

          }
        }, err => {
          this.validar.showToast('Lo sentimos tenemos inconvenientes con el servidor', 3500, 'warning');
        });
      }
    }, err => {
      this.validar.showToast('Lo sentimos tenemos inconvenientes con el servidor', 3500, 'warning');
    });
  }

  calcularDiasVacaciones() {
    if (
      this.reg.fecha_inicio === undefined ||
      this.reg.fecha_final === undefined ||
      this.reg.fecha_ingreso === undefined) {

      this.loadingBtn = false;
      this.validar.showToast('Llenar todos los campos de fechas de vacación', 3000, 'warning')
      return false
    }

    const fechasValidas = this.validar.validarRangoFechasIngresa(this.reg.fecha_inicio, this.reg.fecha_final)
    if (!fechasValidas) return this.valoresDefectoValidacionFechas()

    const fechasValidasReingresa = this.validar.validarRangoFechasIngresa(this.reg.fecha_final, this.reg.fecha_ingreso, true)
    if (!fechasValidasReingresa) return this.valoresDefectoValidacionFechas()

    const { dia_laborable, dia_libre } = this.validar.vacacionesByFeriadoAndHorarioE(this.reg.fecha_inicio.toString(), this.reg.fecha_final.toString(), this.horarioEmpleado, this.cg_feriados)

    this.reg.dia_laborable = dia_laborable;
    this.reg.dia_libre = dia_libre;

    return true
  }

  SaveRegister() {
    this.loadingBtn = true;

    const validadionesFechas = this.calcularDiasVacaciones()
    if (!validadionesFechas) return

    console.log('PASO VALIDACIONES DE FECHAS Y HORAS');

    this.subscripted = this.vacacionService.postNuevoVacacion(this.reg).subscribe(
      vacacion => {

        vacacion.EmpleadosSendNotiEmail = [];
        vacacion.EmpleadosSendNotiEmail.push(this.solInfo);
        this.CrearNuevaAutorizacion(vacacion);
        this.CrearNuevaNotificacion(vacacion);
        //this.SendEmailsEmpleados(vacacion);
        this.validar.abrirToas('Solicitud registrada exitosamente.', 5000, 'success', 'top')
        this.closeModalComponent.closeModal(true);
      },
      err => { this.validar.showToast(err.error.message, 5000, 'warning'); this.loadingBtn = false; this.formRegistro.resetForm(); },
      () => { this.loadingBtn = false; this.formRegistro.resetForm(); this.subs_bool = true }
    )

  }

  CrearNuevaAutorizacion(vacacion: Vacacion) {
    const autorizacion: Autorizacion = autorizacionValueDefault;
    autorizacion.estado = 1; // pendiende
    autorizacion.orden = 1; // orden de autorizacion
    autorizacion.id_departamento = parseInt(localStorage.getItem('cdepar'));
    autorizacion.id_permiso = autorizacion.id_hora_extra = autorizacion.id_plan_hora_extra = null;
    autorizacion.id_vacacion = vacacion.id;
    autorizacion.id_documento = ''
    autorizacion.user_name = this.userService.username;
    autorizacion.ip = localStorage.getItem('ip');
    this.autorizaciones.postNuevaAutorizacion(autorizacion).subscribe(
      resp => { //this.validar.showToast(resp.message, 3000, 'success') 
      },
      err => { //this.validar.showToast(err.error.message, 3000, 'danger') 
      },
    )
  }

  CrearNuevaNotificacion(vacacion: Vacacion) {
    var f = DateTime.now();
    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE VACACIÓN
    let desde = this.validar.FormatearFecha(String(vacacion.fecha_inicio), this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(String(vacacion.fecha_final), this.formato_fecha, this.validar.dia_completo);

    const noti: Notificacion = notificacionValueDefault;
    noti.id_vacaciones = vacacion.id;
    noti.id_send_empl = parseInt(localStorage.getItem('empleadoID'));
    noti.id_permiso = noti.id_hora_extra = null;
    noti.fecha_hora = f.format('yyyy-MM-dd') + ' ' + f.format('HH:mm:ss');
    noti.estado = 'Pendiente';
    noti.tipo = 1;
    noti.mensaje = 'Ha realizado una solicitud de vacaciones desde ' +
      desde + ' hasta ' + hasta;

    noti.user_name = this.userService.username;
    noti.ip = localStorage.getItem('ip')

    //Listado para eliminar el usuario duplicado
    var allNotificaciones = [];
    //Ciclo por cada elemento del listado
    vacacion.EmpleadosSendNotiEmail.forEach(function (elemento, indice, array) {
      // Discriminación de elementos iguales
      if (allNotificaciones.find(p => p.empleado == elemento.empleado) == undefined) {
        // Nueva lista de empleados que reciben la notificacion
        allNotificaciones.push(elemento);
      }
    });

    allNotificaciones.forEach(e => {
      noti.id_receives_depa = e.id_dep
      noti.id_receives_empl = e.empleado
      if (e.vaca_noti) {
        this.autorizaciones.postNotificacion(noti).subscribe(
          resp => {
            this.vacacionService.sendNotiRealTime(resp.respuesta);
          },
          err => { this.validar.showToast(err.error.message, 3000, 'danger') },
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

  ionViewWillLeave() {
    console.log('Sali de Vacaciones');
    this.reg.fecha_inicio = null;
    this.reg.fecha_final = null;
    this.reg.fecha_ingreso = null;
  }

}
