import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, MenuController, ModalController, NavController, PopoverController, ToastController } from '@ionic/angular';
import { AutorizacionesService } from 'src/app/services/autorizaciones.service';
import { DataUserLoggedService } from '../../services/data-user-logged.service';
import { RelojServiceService } from '../../services/reloj-service.service';
import { Notificacion } from '../../interfaces/Notificaciones';
import { NotificacionTimbre } from '../../interfaces/Notificaciones';
import { NotificacionPopoverComponent } from '../notificacion-popover/notificacion-popover.component';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';

import { TimbresPerdidosComponent } from '../../pages/bienvenido/showTimbresGuardados.component';

import { EmpleadoPage } from 'src/app/pages/empleado/empleado.page';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { ParametrosService } from 'src/app/services/parametros.service';


@Component({
  selector: 'app-navegador-empleado',
  templateUrl: './navegador-empleado.component.html',
  styleUrls: ['./navegador-empleado.component.scss'],
})
export class NavegadorEmpleadoComponent implements OnInit {

  @ViewChild('myNav') nav: NavController

  username: string;
  loading: boolean = true;
  notificaciones: Notificacion[] = [];
  notificaiontimbre: NotificacionTimbre [] = [];
  notificacionestimbres: any = [];
  notificacionesAll: any = [];
  valor: boolean = true;

  idEmpleadoIngresa: number;
  countNoti: number;
  public countbadge: number;
  mensaje: string = "";
  empleEnvia: string = "";

  ids: number [] = [];
  resume: boolean = false;

  public rootPage: any = EmpleadoPage;

  colorNOtifi: string = '';

  constructor(
    private userService: DataUserLoggedService,
    private relojService: RelojServiceService,
    private menu: MenuController,
    public modalController: ModalController,
    public pooverCtrl: PopoverController,
    private notificacionService: AutorizacionesService,
    public alertCrtl: AlertController,
    private router: Router,
    public socket: Socket,
    private toastController: ToastController,
    public parametros: ParametrosService
  ) {}

  ionViewWillEnter(){
    this.ngOnInit();
    this.VerificarFunciones();
  }

  ngOnInit() {
    this.username = this.userService.username;

    this.idEmpleadoIngresa = parseInt(localStorage.getItem('empleadoID'));
    this.LlamarNotificcaccciones(this.idEmpleadoIngresa); 

    this.socket.on('recibir_notificacion', (data_llega: any)=>{
      this.LlamarNotificcaccciones(this.idEmpleadoIngresa);
      if(data_llega.id_send_empl !== this.idEmpleadoIngresa){
        console.log("Notificacion recibida",data_llega.id);

        if(data_llega.id_receives_empl === this.idEmpleadoIngresa){
          this.mensaje = data_llega.usuario+" "+data_llega.mensaje;

          try{
            //this.mostrarToasNoti("Notificacion Recibida de "+data_llega+"\n");
            var t = new Date();
            t.setSeconds(t.getSeconds() + 5);
            let id = this.ids.length;
            this.ids.push(id);

            let options:ScheduleOptions = { notifications: [{
              id: data_llega.id,
              title: "Fulltime Notificacion",
              groupSummary: true,
              body: this.mensaje,
              largeBody: this.mensaje+"\n"+data_llega.descripcion,
              schedule: {
                allowWhileIdle: true,
              }
            }]}
            LocalNotifications.schedule(options).then(()=> {});

          }catch (error) {
            this.mostrarToasNoti("No se pudo resibir la notificacion: \n"+ error);
            console.log("Problemas en la notificacion: ", error);
          }   
        }
        
      }
      
    });

    this.socket.on('recibir_aviso', (data_llega: any)=>{
      this.LlamarNotificcaccciones(this.idEmpleadoIngresa);
      if(data_llega.id_send_empl !== this.idEmpleadoIngresa){
        console.log("Aviso recibido",data_llega.id);
        this.countbadge = this.countNoti + 1;

        if(data_llega.id_receives_empl === this.idEmpleadoIngresa){
          this.mensaje = "Nuevo aviso de " + data_llega.usuario +"\n"+data_llega.descripcion;

          try{
            //this.mostrarToasNoti("Notificacion Recibida de "+data_llega+"\n");
            var t = new Date();
            t.setSeconds(t.getSeconds() + 5);
            let id = this.ids.length;
            this.ids.push(id);

            let options:ScheduleOptions = { notifications: [{
              id: data_llega.id,
              title: "Fulltime Aviso",
              groupSummary: true,
              body: this.mensaje,
              largeBody: this.mensaje+"\n"+data_llega.descripcion,
              schedule: {
                allowWhileIdle: true,
              }
            }]}
            LocalNotifications.schedule(options).then(()=> {});

          }catch (error) {
            this.mostrarToasNoti("No se pudo resibir el Aviso: \n"+ error);
            console.log("Problemas en el Avison: ", error);
          }   

        }
      }
    });
  }

  LlamarNotificcaccciones(id_empleado: number){

    //Carga y Muestra el numero de notificaciones,   
    this.notificacionService.getNotificacionesByIdEmpleado(id_empleado).subscribe(
      notificacion => {
        this.notificaciones = notificacion;

      this.notificacionService.getNotificacionesTimbreByIdEmpleado(id_empleado) .subscribe(
        notificaciontim => {
          this.notificacionestimbres = notificaciontim;

          this.notificacionesAll = this.notificaciones.concat(this.notificacionestimbres);
          
          this.countNoti = 0;
          
          //cuenta las notificaciones que estan sin ver
          this.notificacionesAll.forEach((item: any) => {
          if(item.visto === false){
            this.countNoti ++;
            this.empleEnvia = item.nempleadosend;
          }
          });

          //badge de notificacciones pendientes
          if(this.countNoti == 0){
            this.valor = false;
          }else{
            this.valor = true;
          }
      

        },
        err => {console.log(err)},() => { this.loading = false }
      )
      },
      err => { 
  
      this.notificacionService.getNotificacionesTimbreByIdEmpleado(id_empleado).subscribe(
        notificaiontim => {
        this.notificacionesAll = notificaiontim;
        this.countNoti = 0;
        //cuenta las notificaciones que estan sin ver
        this.notificacionesAll.forEach((item: any) => {
          if(item.visto === false){
            this.countNoti ++;
            this.empleEnvia = item.nempleadosend;
          }
          });

          //badge de notificacciones pendientes
          if(this.countNoti == 0){
            this.valor = false;
          }else{
            this.valor = true;
          }

        },
        err => { console.log(err) },
        () => { this.loading = false }
      )

      console.log(err) },
      () => { this.loading = false });
  }


  //Verifica si tiene activado los modulos mediante la tabla funciones
  funciones: any = [];
  apro_permisos: any;
  apro_vacaciones: any;
  apro_horasExtras: any;
  apro_alimentaciones: any;

  colorp: any;
  colorh: any;
  colorv: any;
  colora: any;

  VerificarFunciones() {
    this.parametros.ObtenerFunciones().subscribe(res => {
      this.funciones = res[0];
      console.log('menu empleado funciones, ',this.funciones)

      this.apro_permisos = this.funciones.permisos;
      this.apro_vacaciones = this.funciones.vacaciones;
      this.apro_horasExtras = this.funciones.hora_extra;
      this.apro_alimentaciones = this.funciones.alimentacion;

      if(this.apro_permisos == true){
        this.colorp = "dark"
      }else{
        this.colorp = "medium"
      } 

      if(this.apro_vacaciones == true){
        this.colorv = "dark"
      }else{
        this.colorv = "medium"
      } 

      if(this.apro_horasExtras == true){
        this.colorh = "dark"
      }else{
        this.colorh = "medium"
      } 

      if(this.apro_alimentaciones == true){
        this.colora = "dark"
      }else{
        this.colora = "medium"
      } 

    });
  }

  //funciones para el click de cada metodo de aprobacion
  btn_aproPermisosClick(){
    if(this.apro_permisos == true){
      this.router.navigateByUrl("/empleado/solicitar-permisos");
      this.closeEmpleado();
    }else{
      this.mostrarToas(" Ups!! No tiene habilitado el modulo de Permisos");
    } 
  }

  btn_aproVacacionesClick(){
    if(this.apro_vacaciones == true){
      this.router.navigateByUrl("/empleado/solicitar-vacaciones");
      this.closeEmpleado();
    }else{
      this.mostrarToas(" Ups!! No tiene habilitado el modulo de Vacaciones");
    } 
  }

  btn_aproHorasExtrasClick(){
    if(this.apro_horasExtras == true){
      this.router.navigateByUrl("/empleado/solicitar-horas-extras");
      this.closeEmpleado();
    }else{
      this.mostrarToas(" Ups!! No tiene habilitado el modulo de Horas Extras");
    } 
  }

  btn_aproAlimentacionClick(){
    if(this.apro_alimentaciones == true){
      this.router.navigateByUrl("/empleado/solicitar-planificar-alimentacion");
      this.closeEmpleado();
    }else{
      this.mostrarToas(" Ups!! No tiene habilitado el modulo de Alimentacion");
    } 
  }


  //Pestalas de mensajes
  async mostrarToas(mensaje: string) {
    const toast = await this.toastController.create({
      message: `<ion-icon name="information-circle-outline"></ion-icon>`+mensaje+"\n\n Te gustaria activarlo? \n Comunicate con nosotros: www.casapazmino.com.ec",
      duration: 4500,
      position: "top",
      color: "notificacicon",
      mode: "ios",
      cssClass: 'toast-custom-class',
    });
    await toast.present();
  }

  async mostrarToasNoti(mensaje: string) {
    const toast = await this.toastController.create({
      message: this.mensaje,
      duration: 3000,
      position: "top",
      color: "notificacicon",
      mode: "ios",
      cssClass: 'toast-custom-class',
    });
    await toast.present();
  }

  async Mostrarpopnotificaciones(event: any){
    this.valor = false;
    const popover = await this.pooverCtrl.create({
      component: NotificacionPopoverComponent,  
      event: event,
      mode: 'md',
      translucent: true,
    });
    await popover.present();
  }

  openEmpleado() {
    this.menu.enable(true, 'empleado');
    this.menu.open('empleado');
    this.VerificarFunciones();
  }

  closeEmpleado() {
    this.menu.close('empleado')
  }

  cerrarSesion() {
    this.relojService.cerrarSesion();
  }

  async presentModalTimbresPerdidos() {
    this.closeEmpleado();
    const modal = await this.modalController.create({
      component: TimbresPerdidosComponent,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  // Diseno de Mensaje de notificacion con logo 
  /*
  async showAlert(){
    let alert = await this.alertCrtl.create({
      message: `<img src="../../../assets/LOGOBLFT.png" class="card-alert">
                <h5>Notificaciones</h5>
                Tienes Notificaciones Pendientes`,
      buttons: [
        {
          text: 'OK',
          cssClass: 'alert-button-confirm'
        }],
      mode: "ios",
      backdropDismiss: false
    });await alert.present();

  }*/
}
