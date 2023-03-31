import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import moment from 'moment';

import { PlantillaReportesService } from '../../../../../libs/plantilla-reportes.service';
import { DataUserLoggedService } from '../../../../../services/data-user-logged.service';
import { AutorizacionesService } from '../../../../../services/autorizaciones.service';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { ValidacionesService } from '../../../../../libs/validaciones.service';
import { AlimentacionService } from '../../../../../services/alimentacion.service';

import { notificacionTimbreValueDefault, NotificacionTimbre, SettingsInfoEmpleado } from 'src/app/interfaces/Notificaciones';
import { EstadoAlimentacionSol, estadosAlimentacionSelectItems } from 'src/app/interfaces/Estados';
import { Alimentacion } from 'src/app/interfaces/Alimentacion';
import { ParametrosService } from 'src/app/services/parametros.service';

@Component({
  selector: 'app-update-autorizacion-multiple',
  templateUrl: './update-autorizacion-multiple.component.html',
  styleUrls: ['./update-autorizacion-multiple.component.scss'],
})

export class UpdateAutorizacionMultipleComponent implements OnInit {

  @ViewChild('formRegistro', { static: true }) ngForm: NgForm;
  showForm: boolean = true;
  @Input() alimentacion: Alimentacion[];
  @Input() labelAutorizacion: string = 'alimentacion';
  @Input() generarArchivoPdf: boolean = true;

  notificacion: NotificacionTimbre = notificacionTimbreValueDefault;

  loadingBtn: boolean = false;
  estadoSelectItems = estadosAlimentacionSelectItems;
  estadoChange: EstadoAlimentacionSol = { id: null, nombre: 'Pendiente' };

  infoEmpleadoRecibe: SettingsInfoEmpleado[] = [];

  get fechaInicio(): string { return this.dataUserServices.fechaRangoInicio }

  get fechaFinal(): string { return this.dataUserServices.fechaRangoFinal }

  idEmpresa: number;

  constructor(
    private alimentacionService: AlimentacionService,
    private dataUserServices: DataUserLoggedService,
    private plantillaPDF: PlantillaReportesService,
    private autoService: AutorizacionesService,
    private notifica: NotificacionesService,
    private validar: ValidacionesService,
    public loadingController: LoadingController,
    public modalController: ModalController,
    public parametro: ParametrosService,
  ) {
    this.idEmpresa = parseInt(localStorage.getItem('id_empresa'));
  }
  tiempo: any;

  ngOnInit() {
    this.tiempo = moment();
    const id_empresa = localStorage.getItem('id_empresa');
    (id_empresa !== null) ? this.plantillaPDF.ShowColoresLogo(id_empresa) : this.plantillaPDF.abrirToas('No existe codigo de empresa', 'danger', 3000);
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
        this.obtenerInformacionEmpleados()
      }
    )
  }

  obtenerInformacionEmpleados() {
    if (this.alimentacion) {
      this.alimentacion.forEach(o => {
        this.autoService.getInfoEmpleadoByIdEmpleado(o.id_empleado).subscribe(
          res => { this.processInfoEmpleado(res) },
          err => { this.errorResponse(err.error.message) },
        )
      });
      return
    }

  }

  processInfoEmpleado(info: SettingsInfoEmpleado) {
    if (info === null) {
      this.showForm = false;
      this.alimentacion = [];
    }
    this.infoEmpleadoRecibe.push(info);

  }

  ChangeEstado(loadingAutorizacion = false) {

    if (loadingAutorizacion) {
      const [autorizacion] = this.estadoSelectItems.filter(o => {
        return o.id === this.alimentacion[0].aprobada
      })
      this.estadoChange = { ...autorizacion };
    } else {
      const [autorizacion] = this.estadoSelectItems.filter(o => {
        return o.id === this.estadoChange.id
      })
      this.estadoChange = { ...autorizacion };
    }
  }

  async UpdateRegister() {
    if (this.estadoChange.id == null) {
      return this.validar.showToast("Seleccione el tipo de Autorización", 2000, 'warning');
    } else {
      this.loadingBtn = true;
      await this.alimentacion.forEach(a => {
        a.aprobada = this.estadoChange.id

        var [info] = this.infoEmpleadoRecibe.filter(o => { return o.id_empleado === a.id_empleado });
        this.alimentacionService.putEstadoAlimentacion(a).subscribe(
          alimento => { this.successResponse(a, info) },
          err => { this.errorResponse(err.error.message) },
        )

      })

      this.presentLoading()
    }
  }

  async presentLoading() {
    if (this.generarArchivoPdf) {
      const loading = await this.loadingController.create({
        cssClass: 'my-custom-class',
        message: 'Procesando aprobaciones...',
        duration: 4000
      });
      await loading.present();
      this.generarPDF();
    }
    this.loadingBtn = false;
    this.closeModal(true);
  }

  closeModal(refreshInfo: Boolean) {
    this.estadoChange = { id: null, nombre: 'Pendiente' };
    this.alimentacion = [];
    this.modalController.dismiss({
      'refreshInfo': refreshInfo
    });
  }

  dataAprobacion: any = [];
  successResponse(dataSolicitud: any, infoEmpleadoRecibe: SettingsInfoEmpleado) {

    this.dataAprobacion.push({ dataSolicitud });

    console.log('ver data comida... ', dataSolicitud, ' infor usuario ', infoEmpleadoRecibe)

    this.NotificarAprobacion(dataSolicitud, infoEmpleadoRecibe);

    return this.showMessageSuccess()
  }


  // METODO DE ENVIO DE NOTIFICACIONES RESPECTO A LA APROBACION
  NotificarAprobacion(comida: any, infoUsuario: any) {
    if (infoUsuario.estado === 1) {
      var estado = true;
    }
    var solInfo: any = [];
    solInfo = {
      comida_mail: infoUsuario.comida_mail,
      comida_noti: infoUsuario.comida_noti,
      empleado: infoUsuario.id_empleado,
      estado: estado,
      correo: infoUsuario.correo,
    }
    var datos = {
      depa_user_loggin: infoUsuario.id_departamento,
      objeto: comida,
    }

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (comida.aprobada === true) {
      var estado_a = 'Autorizado';
      var estado_c = 'Autorizada';
    }
    else {
      var estado_a = 'Negado';
      var estado_c = 'Negada';
    }
    this.autoService.BuscarJefes(datos).subscribe(alimentacion => {
      alimentacion.EmpleadosSendNotiEmail.push(solInfo);
      console.log(alimentacion);

      this.EnviarCorreo(alimentacion, estado_a, estado_c);
      this.NotificarEvento(alimentacion, estado_a, infoUsuario);

    });
  }

  // METODO PARA ENVIO DE CORREO
  EnviarCorreo(alimentacion: any, estado_a: string, estado_c: string) {
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
          tipo_solicitud: 'Servicio de alimentación ' + estado_a.toLowerCase() + ' por',
          fec_solicitud: solicitud,
          observacion: alimentacion.observacion,
          id_comida: alimentacion.id_comida,
          proceso: estado_a.toLowerCase(),
          correo: correo_usuarios,
          asunto: 'SOLICITUD DE SERVICIO DE ALIMENTACION ' + estado_c.toUpperCase(),
          estadoc: estado_a,
          inicio: this.validar.FormatearHora(alimentacion.hora_inicio, this.formato_hora),
          final: this.validar.FormatearHora(alimentacion.hora_fin, this.formato_hora),
          extra: alimentacion.extra,
          id: alimentacion.id,
          solicitado_por: (localStorage.getItem('nom')) + ' ' + (localStorage.getItem('ap')),
        }
        if (correo_usuarios != '') {
          this.autoService.EnviarCorreoSolAlimentacion(this.idEmpresa, comida).subscribe(
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
  NotificarEvento(alimentacion: any, estado_a: string, infoUsuario: any) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE ALIMENTACIÓN
    let desde = this.validar.FormatearFecha(alimentacion.fec_comida, this.formato_fecha, this.validar.dia_completo);

    let inicio = this.validar.FormatearHora(alimentacion.hora_inicio, this.formato_hora);
    let final = this.validar.FormatearHora(alimentacion.hora_fin, this.formato_hora);

    let mensaje = {
      create_at: this.tiempo.format('YYYY-MM-DD') + ' ' + this.tiempo.format('HH:mm:ss'),
      id_empl_envia: parseInt(localStorage.getItem('empleadoID')),
      id_empl_recive: '',
      tipo: 2, // SOLICITUD SERVICIO DE ALIMENTACIÓN APROBADA

      mensaje: 'Ha ' + estado_a.toLowerCase() + ' la solicitud de alimentación para ' +
        infoUsuario.fullname + ' desde ' +
        desde +
        ' horario de ' + inicio + ' a ' + final + ' servicio ',
      id_comida: alimentacion.id_comida
    }

    //Listado para eliminar el usuario duplicado
    var allNotificacionesAlimentacion = [];
    //Ciclo por cada elemento del listado
    alimentacion.EmpleadosSendNotiEmail.forEach(function(elemento, indice, array) {
      // Discriminación de elementos iguales
      if(allNotificacionesAlimentacion.find(p=>p.empleado == elemento.empleado) == undefined)
      {
        // Nueva lista de empleados que reciben la notificacion
        allNotificacionesAlimentacion.push(elemento);
      }
    });

    console.log("Usuarios que reciben la notificacion: ",allNotificacionesAlimentacion);

    allNotificacionesAlimentacion.forEach(e => {
      mensaje.id_empl_recive = e.empleado;
      if (e.comida_noti) {
        this.notifica.EnviarMensajePlanComida(mensaje).subscribe(
          res => {
            this.alimentacionService.sendNotiRealTime(res.respuesta);
          },
          err => { this.validar.showToast(err.error.message, 3000, 'danger') },
          () => { })
      }
    })

  }

  errorResponse(message) {
    this.showForm = false;
    this.showMessageError(message)
  }

  showMessageError(message = 'Error') {
    this.validar.showToast(message, 3000, 'danger')
  }

  showMessageSuccess(message = 'Registro actualizado') {
    this.validar.showToast(message, 3000, 'success')
  }


  generarPDF() {
    const fecha = new Date()
    const filename = 'aprobación-multiple-' + this.labelAutorizacion + '-' + fecha.valueOf() + '.pdf';

    //this.plantillaPDF.generarPdf(this.getDocumentDefinicion(), filename)
  }

  /* ****************************************************************************************************
  *                               PARA LA EXPORTACIÓN DE ARCHIVOS PDF
  * ****************************************************************************************************/

  getDocumentDefinicion() {

    return {

      pageOrientation: this.plantillaPDF.Orientacion(false),
      watermark: this.plantillaPDF.MargaDeAgua(),
      header: this.plantillaPDF.HeaderText(),

      footer: function (currentPage, pageCount, fecha) {
        const h = new Date();
        const f = moment();
        fecha = f.format('YYYY-MM-DD');
        h.setUTCHours(h.getHours());
        const time = h.toJSON().split("T")[1].split(".")[0];
        return {
          margin: 10,
          columns: [
            {
              text: [{
                text: 'Fecha: ' + fecha + ' Hora: ' + time,
                alignment: 'left', opacity: 0.3
              }]
            },
            {
              text: [{
                text: '© Pag ' + currentPage.toString() + ' of ' + pageCount, alignment: 'right', opacity: 0.3
              }],
            }
          ], fontSize: 10
        }
      },
      content: [
        this.plantillaPDF.EncabezadoHorizontalAprobacion('Reporte Aprobación Múltiple'),
        this.impresionDatosPDF(this.dataAprobacion)
      ],
      styles: this.plantillaPDF.estilosPdf()
    };
  }

  impresionDatosPDF(data: any[]): Array<any> {
    let c = 0;
    console.log(data);

    return [{
      style: 'tableMargin',
      table: {
        widths: ['auto', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*'],
        body: [
          [
            { text: 'N°', style: 'tableHeader' },
            { text: 'Solicitud', style: 'tableHeader' },
            { text: 'Empleado', style: 'tableHeader' },
            { text: 'Fecha Consumo', style: 'tableHeader' },
            { text: 'Hora Inicio', style: 'tableHeader' },
            { text: 'Hora Fin', style: 'tableHeader' },
            { text: 'Servicio', style: 'tableHeader' },
            { text: 'Alimentación', style: 'tableHeader' },
            { text: 'Estado', style: 'tableHeader' },
            { text: 'Revisado por', style: 'tableHeader' },
            { text: 'Fecha ', style: 'tableHeader' }
          ],
          ...data.map(obj => {
            c = c + 1
            const { dataSolicitud: dat } = obj;
            console.log('dat *****************', dat)
            return [
              { style: 'itemsTableCentrado', text: c },
              { style: 'itemsTable', text: 'alimentación' },
              { style: 'itemsTable', text: dat.nempleado },
              { style: 'itemsTable', text: this.validar.FormatearFecha(dat.fec_comida, this.formato_fecha, this.validar.dia_abreviado) },
              { style: 'itemsTable', text: this.validar.FormatearHora(dat.hora_inicio, this.formato_hora) },
              { style: 'itemsTable', text: this.validar.FormatearHora(dat.hora_fin, this.formato_hora) },
              { style: 'itemsTable', text: dat.nservicio },
              { style: 'itemsTable', text: dat.ncomida },
              { style: 'itemsTable', text: this.estadoChange.nombre },
              { style: 'itemsTable', text: localStorage.getItem('ap') + ' ' + localStorage.getItem('nom') },
              { style: 'itemsTable', text: this.validar.FormatearFecha(dat.fecha, this.formato_fecha, this.validar.dia_abreviado) },
            ]
          })

        ]
      },
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
        }
      }
    }]
  }

}
