import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { AutorizacionesService } from '../../services/autorizaciones.service';
import { Notificacion } from '../../interfaces/Notificaciones';
import { NotificacionTimbre } from '../../interfaces/Notificaciones';
import { SkeletonListNotificacionesArray } from '../../interfaces/Skeleton';
import { Router } from '@angular/router';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { DataUserLoggedService } from 'src/app/services/data-user-logged.service';


@Component({
  selector: 'app-lista-notificacion',
  templateUrl: './lista-notificacion.component.html',
  styleUrls: ['./lista-notificacion.component.scss'],
})
export class ListaNotificacionComponent implements OnInit {

  skeleton = SkeletonListNotificacionesArray;
  loading: boolean = true;
  notificaciones: Notificacion[] = [];
  notificaiontimbre: NotificacionTimbre [] = [];
  notificacionestimbres: any = [];

  notificacionesAll: any = [];
  
  countNoti: any;
 
  pageActual: any = 1;
  valorcolor: string = '';
  noticheck: string = '';

  valor: boolean = false;
  paginaccionvista: boolean = false;
  ver: boolean = false;
  
  constructor(
    private notificacionService: AutorizacionesService,
    private router: Router,
    public pooverCtrl: PopoverController,
    private vistonotificacion: NotificacionesService,
    public modalController: ModalController,
    private userService: DataUserLoggedService,
    private navCtroller: NavController,
  ) { }

  ngOnInit() {
    const id_empleado = localStorage.getItem('empleadoID')
    this.notificacionService.getNotificacionesByIdEmpleado(id_empleado+'').subscribe(
      notificacion => {
        this.notificaciones = notificacion;

        this.notificacionesAll.sort(
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

          //si el objeto de los timbres esta vacion oculta las ventanas y muestra la ventana - 'vacio'.
          if(Object.keys(this.notificacionesAll).length === 0){
            this.ver = true;
          }
          
        },
        err => {console.log(err); this.ver = true},
        () => { this.loading = false;}
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
          console.log(this.notificacionesAll)
          },
          err => { console.log(err); this.ver = true},
          () => { this.loading = false;}
        )

        console.log(err); },
      () => { this.loading = false;}
    ) 

  }

  tiponotificacion(noti: { id_permiso: string; id_vacaciones: string; id_hora_extra: string; visto: boolean, tipo:number}){
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

  AbrirNoti(noti: {id:number, id_permiso: string; id_vacaciones: string; id_hora_extra: string; estado: string, tipo: number; nempleadoreceives: string; id_receives_empl: number; nempleadosend: string;}) { 
    this.cambiovistanoti(noti);
    this.cambiovistanotitimbre(noti);
    this.modalController.dismiss({});

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
          this.router.navigate(['/empleado/solicitar-permisos']);
        }else if(noti.id_vacaciones != null){
          this.router.navigate(['/empleado/solicitar-vacaciones']);
        }else if(noti.id_hora_extra != null && noti.estado === "Pendiente"){
          this.router.navigate(['/empleado/solicitar-horas-extras']);
        }else if(noti.tipo ===  1 ){
          console.log("Alimentacion Tipo =", noti.tipo);
          this.router.navigate(['/empleado/solicitar-planificar-alimentacion']);
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
        }
        else{
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
        if(noti.id_permiso != null && noti.estado === "Pendiente"){
          return this.router.navigate(['/adminpage/aprobar-permisos']);
        }else if(noti.id_hora_extra != null && noti.estado === "Pendiente"){
          return this.router.navigate(['/adminpage/aprobar-horas-extras']);
        }else if(noti.id_vacaciones != null && noti.estado === "Pendiente"){
          return this.router.navigate(['/adminpage/aprobar-vacaciones']);
        }
        if(noti.tipo === 1 ){
          return this.router.navigate(['/adminpage/aprobar-alimentacion']);
        }

        return this.router.navigate(['empleado/solicitar-planificar-alimentacion']);
      }
    }

  }

  //cambia el estado de la columna visto de la tabla realtime_noti de true a false.
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

  //cambia el estado de la columna visto de la tabla realtime_notitimbre de true a false.
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

  //Poner todas las notificaciones como vistas
  notificacionesvistanoti(noti: any){
    const vista = true;
    var datos = {id_notificacion: 0, visible: vista}
    var allNotificaciones = [];
    allNotificaciones = noti;
    
    noti.forEach((item: any) => {
      if(item.visto == false){
        datos.id_notificacion = item.id
      this.vistonotificacion.PutNotificaVisto(datos).subscribe(
        res => {
          res.forEach((notificacio: any) => {
            notificacio.visto = true;
          });
        },
        res => {console.error()},
        () => { this.loading = false }
      )

      this.vistonotificacion.PutNotifiTimbreVisto(datos).subscribe(
        res => {
          res.forEach((notificaciontim: any) => {
            notificaciontim = true;
          });
        },
        res => {console.error()},
        () => { this.loading = false }
      )
      }
    });

    this.modalController.dismiss({});
  }
}
