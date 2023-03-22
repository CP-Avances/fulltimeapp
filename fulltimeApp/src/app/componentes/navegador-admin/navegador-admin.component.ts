import { Component, OnInit} from '@angular/core';
import { Platform } from '@ionic/angular';
import { MenuController, ModalController, PopoverController, AlertController, LoadingController, ToastController} from '@ionic/angular';
import { AutorizacionesService } from 'src/app/services/autorizaciones.service';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';
import { RelojServiceService } from 'src/app/services/reloj-service.service';
import { NotificacionPopoverComponent } from '../notificacion-popover/notificacion-popover.component';

import { Notificacion } from '../../interfaces/Notificaciones';
import { NotificacionTimbre } from '../../interfaces/Notificaciones';

import { Router } from '@angular/router';
import { ParametrosService } from 'src/app/services/parametros.service';
import { Socket } from 'ngx-socket-io';


@Component({
  selector: 'app-navegador-admin',
  templateUrl: './navegador-admin.component.html',
  styleUrls: ['./navegador-admin.component.scss'],
})
export class NavegadorAdminComponent implements OnInit {

  username: string = '';
  idEmpleadoIngresa: number = 0;
  valor: boolean = true;
  loading: boolean = true;
  notificaciones: Notificacion[] = [];
  notificaiontimbre: NotificacionTimbre [] = [];
  notificacionestimbres: any = [];
  notificacionesAll: any = [];

  public countNoti: number = 0;
  public countbadge: number = 0;
  mensaje: string = "";
  empleEnvia: string = "";

  constructor(
    private userService: DataUserLoggedService,
    private relojService: RelojServiceService,
    private menu: MenuController,
    public modalController: ModalController,
    public pooverCtrl: PopoverController,
    private notificacionService: AutorizacionesService,
    public platform: Platform,
    public alertCrtl: AlertController,
    private router: Router,
    public loadingController: LoadingController,
    private toastController: ToastController,
    public parametros: ParametrosService,
    private socket: Socket
  ) 
  {}

  ionViewWillEnter(){
    this.ngOnInit();
  }

  ngOnInit() {
    console.log('inicio menu...');
    this.username = this.userService.username;

    this.idEmpleadoIngresa = parseInt(''+(localStorage.getItem('empleadoID')));
    this.LlamarNotificcaccciones(this.idEmpleadoIngresa);

    this.socket.on('recibir_notificacion', (data_llega: any)=>{
      console.log("notificacion recibida :)", data_llega);
      
      this.LlamarNotificcaccciones(this.idEmpleadoIngresa);
      if(data_llega.id_send_empl !== this.idEmpleadoIngresa){
        console.log("Notificacion recibida",data_llega.id);

        if(data_llega.id_receives_empl === this.idEmpleadoIngresa){
          this.mensaje = "Nueva Notificacion de " + data_llega.usuario;
          console.log("Usuario envio",this.empleEnvia);
          this.countbadge = this.countNoti + 1;

            try{
              this.mostrarToasNoti("Notificacion Recibida de "+data_llega+"\n");
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
          this.mensaje = "Nuevo aviso de " + data_llega.usuario;
          console.log("Usuario envio",this.empleEnvia);

          try{
            this.mostrarToasNoti("Notificacion Recibida de "+data_llega+"\n");
          }catch (error) {
            this.mostrarToasNoti("No se pudo resibir la notificacion: \n"+ error);
            console.log("Problemas en la notificacion: ", error);
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
      this.router.navigateByUrl("/adminpage/aprobar-permisos");
      this.closeAdmin()
    }else{
      this.mostrarToas(" Ups!! Al parecer no tienes activado en tu plan el Modulo 'Aprobar Permisos'");
    } 
  }

  btn_aproVacacionesClick(){
    if(this.apro_vacaciones == true){
      this.router.navigateByUrl("/adminpage/aprobar-vacaciones");
      this.closeAdmin()
    }else{
      this.mostrarToas(" Ups!! Al parecer no tienes activado en tu plan el Modulo 'Aprobar Vacaciones'");
    } 
  }

  btn_aproHorasExtrasClick(){
    if(this.apro_horasExtras == true){
      this.router.navigateByUrl("/adminpage/aprobar-horas-extras");
      this.closeAdmin()
    }else{
      this.mostrarToas(" Ups!! Al parecer no tienes activado en tu plan el Modulo 'Aprobar Horas Extras'");
    } 
  }

  btn_aproAlimentacionClick(){
    if(this.apro_alimentaciones == true){
      this.router.navigateByUrl("/adminpage/aprobar-alimentacion");
      this.closeAdmin()
    }else{
      this.mostrarToas(" Ups!! Al parecer no tienes activado en tu plan el Modulo 'Aprobar Alimentacion'");
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
      mode: "md",
      translucent: true,
    });
    await popover.present();
    await popover.onDidDismiss();
  }

  openAdmin() {
    this.menu.enable(true, 'admin');
    this.menu.open('admin');
    this.VerificarFunciones();
  }

  closeAdmin() {
    this.menu.close('admin');
  }

  cerrarSesion() {
    this.relojService.cerrarSesion();
    this.closeAdmin();
  }

}
