import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { AutorizacionesService } from '../../services/autorizaciones.service';
import { Notificacion } from '../../interfaces/Notificaciones';
import { NotificacionTimbre } from '../../interfaces/Notificaciones';
import { SkeletonListNotificacionesArray } from '../../interfaces/Skeleton';
import { Router } from '@angular/router';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
//import { ListaNotificacionComponent } from '../lista-notificaciones/lista-notificacion.component';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';


@Component({
  selector: 'app-notificacion-popover',
  templateUrl: './notificacion-popover.component.html',
  styleUrls: ['./notificacion-popover.component.scss'],
})
export class NotificacionPopoverComponent implements OnInit {

  skeleton = SkeletonListNotificacionesArray;
  loading: boolean = true;
  notificaciones: Notificacion[] = [];
  notificaiontimbre: NotificacionTimbre [] = [];
  notificacionestimbres: any = [];

  notificacionesAll: any = [];
  
  countNoti: number = 0;
 
  pageActual: number = 1;
  valorcolor: string = '';
  noticheck: string = '';

  valor: boolean = false;

  constructor(
    private notificacionService: AutorizacionesService,
    private router: Router,
    public pooverCtrl: PopoverController,
    private vistonotificacion: NotificacionesService,
    public modalController: ModalController,
    private userService: DataUserLoggedService,
  ) {}

  ngOnInit() {
    const id_empleado = localStorage.getItem('empleadoID');

    this.notificacionService.getNotificacionesByIdEmpleado(id_empleado+'').subscribe(
      notificacion => {
        this.notificaciones = notificacion;
        this.notificaciones.sort(
          (firstObject: Notificacion, secondObject: Notificacion) =>  
              (firstObject.visto === true)? 1 : 
                (firstObject.visto === secondObject.visto) ?
                  ((firstObject.create_at < secondObject.create_at)? 1 : -1)
              
            :-1
        );

      this.notificacionService.getNotificacionesTimbreByIdEmpleado(id_empleado+'').subscribe(
        notificaiontim => {
          this.notificaiontimbre = notificaiontim;
          this.notificacionestimbres = this.notificaiontimbre;
          
          this.notificacionesAll = this.notificaciones.concat(this.notificacionestimbres);

          this.notificacionesAll.sort(
            (firstObject: NotificacionTimbre, secondObject: NotificacionTimbre) =>  
                (firstObject.visto === true)? 1 : 
                  (firstObject.visto === secondObject.visto) ?
                    ((firstObject.create_at < secondObject.create_at)? 1 : -1)
                
              :-1
          );
          
          //cuenta las notificaciones que estan sin ver
          this.notificacionesAll.forEach((item: any) => {

          if(item.visto === false){
            this.countNoti ++;
          }
          });

        },
        err => {console.log(err)},
        () => { this.loading = false }
      )
      

      },
      err => { 
        
        this.notificacionService.getNotificacionesTimbreByIdEmpleado(id_empleado+'').subscribe(
          notificaiontim => {
          this.notificacionesAll = notificaiontim;
          this.notificacionesAll.sort(
            (firstObject: NotificacionTimbre, secondObject: NotificacionTimbre) =>  
                (firstObject.visto === true)? 1 : 
                  (firstObject.visto === secondObject.visto) ?
                    ((firstObject.create_at < secondObject.create_at)? 1 : -1)
                
              :-1
          );

          //cuenta las notificaciones que estan sin ver
          this.notificacionesAll.forEach((item: any) => {
            if(item.visto === false){
              this.countNoti ++;
            }
            });
            
          },
          err => { console.log(err) },
          () => { this.loading = false }
        )

        console.log(err) },
      () => { this.loading = false }
    )  

  }

  tiponotificacion(noti: { id_permiso: string; id_vacaciones: string; id_hora_extra: string; visto: boolean; tipo:number;}){
    if(noti.visto === true){
      return "reportes";
    }
    else
    {
      if(noti.id_permiso != null ){
        return "permisos";
      }else if(noti.id_vacaciones != null){
        return "vacaciones";
      }else if(noti.id_hora_extra != null ){
        return "horas_extras";
      }else if(noti.tipo >=  1 && noti.tipo <= 2){
        return "alimentacion1";
      }else if(noti.tipo ==  2 ){
        return "alimentacion2";
      }else if(noti.tipo == 6){
        return "comunicados6";
      }else if(noti.tipo >= 10 &&  noti.tipo <= 12 ){
        return "planificacionhe10";
      }else if(noti.tipo == 20){
        return "planificacionalimen";
      }else if(noti.tipo == null){
        return "danger";
      }else{
        return "reportes";
      }
    }
  }


  AbrirNoti(noti: {id:number, id_permiso: string; id_vacaciones: string; id_hora_extra: string; estado: string; tipo: number; nempleadoreceives: string; id_receives_empl: number; nempleadosend: string;}) {
    this.cambiovistanoti(noti);
    this.cambiovistanotitimbre(noti);
    this.pooverCtrl.dismiss({});  

    if(noti.nempleadoreceives === noti.nempleadosend){

      console.log(noti.nempleadoreceives, " = ", noti.nempleadosend);
      
      if(localStorage.getItem("rol") == "1"){
        //Solicitudes Admin envia
        if(noti.id_permiso != null && noti.estado === "Pendiente"){
          return this.router.navigate(['/adminpage/solicitudes/permiso-solicitud']);
        }else if(noti.id_hora_extra != null && noti.estado === "Pendiente"){
          return this.router.navigate(['/adminpage/solicitudes/hora-extra-solicitud']);
        }else if(noti.id_vacaciones != null && noti.estado === "Pendiente"){
          return this.router.navigate(['/adminpage/solicitudes/vacacion-solicitud']);
        }

        if(noti.tipo === 1 ){
          return this.router.navigate(['/adminpage/solicitudes/alimentacion-solicitud']);
        }
      
        return this.router.navigate(['/adminpage/solicitudes/alimentacion-solicitud']);

      }else{
        //Solicitudes Empleado envia
        if(noti.id_permiso != null){
          return this.router.navigate(['/empleado/solicitar-permisos']);
        }else if(noti.id_vacaciones != null){
          return this.router.navigate(['/empleado/solicitar-vacaciones']);
        }else if(noti.id_hora_extra != null && noti.estado === "Pendiente"){
          return this.router.navigate(['/empleado/solicitar-horas-extras']);
        }else if(noti.tipo ===  1 ){
          console.log("Alimentacion Tipo =", noti.tipo);
          return this.router.navigate(['empleado/solicitar-planificar-alimentacion']);
        }

        //Aprobar las solicitudes Admin envia respuesta
        if(noti.id_permiso != null && noti.estado != "Pendiente"){
          console.log("Aprobar Permiso ",noti.id_permiso, " = ", noti.estado);
          return this.router.navigate(['/adminpage/aprobar-permisos']);
        }else if( noti.tipo === 12){
          console.log("Aprobar Hora Extra ",noti.tipo);
          console.log("Aprobar Hora Extra ",noti.id_hora_extra, " = ", noti.estado)
          return this.router.navigate(['/adminpage/aprobar-horas-extras']); 
        }else if(noti.id_vacaciones != null && noti.estado != "Pendiente"){
          console.log("Aprobar Vacaciones ",noti.id_vacaciones, " = ", noti.estado)
          return this.router.navigate(['/adminpage/aprobar-vacaciones']); 
        }

        if(localStorage.getItem('rol') == "1" && noti.tipo === 2 ){
          console.log("Aprobar Alimentacion ",noti.tipo, " = ", noti.estado)
          return this.router.navigate(['/adminpage/aprobar-alimentacion']);
        }
        
        return this.router.navigate(['/adminpage/aprobar-alimentacion']);
      }

    }
    else
    {

      console.log(noti.nempleadoreceives, " != ", noti.nempleadosend);

      if(localStorage.getItem("rol") === "1"){
        //Solicitudes Admin Respuesta que recibe
        if(noti.id_permiso != null && noti.estado != "Pendiente"){
          console.log("Aprobar Permiso ",noti.id_permiso, " = ", noti.estado);
          return this.router.navigate(['/adminpage/solicitudes/permiso-solicitud']);
        }else if( noti.tipo === 12){
          console.log("Aprobar Hora Extra ",noti.tipo);
          return this.router.navigate(['/adminpage/solicitudes/hora-extra-solicitud']);
        }else if(noti.id_vacaciones != null && noti.estado != "Pendiente"){
          console.log("Aprobar Vacaciones ",noti.id_vacaciones, " = ", noti.estado)
          return this.router.navigate(['/adminpage/solicitudes/vacacion-solicitud']);
        }

        if(noti.tipo === 2 ){
          console.log("Aprobar Alimentacion ",noti.tipo, " = ", noti.estado)
          return this.router.navigate(['/adminpage/solicitudes/alimentacion-solicitud']);
        }else{
          return this.router.navigate(['/adminpage/solicitudes/alimentacion-solicitud']);
        }

      }else{
        //Solicitudes Empleado Respuesta que recibe
        if(noti.id_permiso != null){
          return this.router.navigate(['/empleado/solicitar-permisos']);
        }else if(noti.id_vacaciones != null){
          return this.router.navigate(['/empleado/solicitar-vacaciones']);
        }else if(noti.tipo === 12){
          return this.router.navigate(['/empleado/solicitar-horas-extras']);
        }else if(noti.tipo ===  2 ){
          console.log("Alimentacion Tipo =", noti.tipo);
          return this.router.navigate(['/empleado/solicitar-planificar-alimentacion']);
        }
      

        //Aprobaciones Admin envia
        if(noti.tipo === 1 ){
          return this.router.navigate(['/adminpage/aprobar-alimentacion']);
        }

        if(noti.id_permiso != null && noti.estado === "Pendiente"){
          return this.router.navigate(['/adminpage/aprobar-permisos']);
        }else if(noti.id_hora_extra != null && noti.estado === "Pendiente"){
          return this.router.navigate(['/adminpage/aprobar-horas-extras']);
        }else if(noti.id_vacaciones != null && noti.estado === "Pendiente"){
          return this.router.navigate(['/adminpage/aprobar-vacaciones']);
        }
        return this.router.navigate(['empleado/solicitar-planificar-alimentacion']);
      }
    }
 
  }

  
  cambiovistanoti(noti:{id: number}) {
    const vista = true;
    const datos = {id_notificacion: noti.id, visible: vista}

    this.vistonotificacion.PutNotificaVisto(datos).subscribe(
      res => {
        res.visto = false;
      },
      res => {console.error()},
      () => { this.loading = false }
    )
  }

  cambiovistanotitimbre(noti:{id: number}) {
    const vista = true;
    const datos = {id_notificacion: noti.id, visible: vista}
    
    this.vistonotificacion.PutNotifiTimbreVisto(datos).subscribe(
      res => {
        res.visto = false;
      },
      res => {console.error()},
      () => { this.loading = false }
    )
  }

  /*async abrirNotificaciones() {
    this.pooverCtrl.dismiss({}); 
    this.valor = false;
    const modal = await this.modalController.create({
      component: ListaNotificacionComponent,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }*/
}
