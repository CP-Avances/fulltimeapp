import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Permiso } from 'src/app/interfaces/Permisos';
import { ModalController } from '@ionic/angular';
import { SkeletonListPermisoArray } from 'src/app/interfaces/Skeleton';
import { LoadingController, IonInfiniteScroll } from '@ionic/angular';
import { Socket } from 'ngx-socket-io';

import { Subscription } from 'rxjs';

import { PermisosService } from 'src/app/services/permisos.service';
import { RegistrarPermisoComponent } from 'src/app/pages/paginas-empleado/solicitar-permisos/componentes/registrar-permiso/registrar-permiso.component';
import { VerPermisoComponent } from 'src/app/pages/paginas-empleado/solicitar-permisos/componentes/ver-permiso/ver-permiso.component';
import { EditarPermisoComponent } from 'src/app/pages/paginas-empleado/solicitar-permisos/componentes/editar-permiso/editar-permiso.component';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';


@Component({
  selector: 'app-permisos-lista',
  templateUrl: './permisos-lista.component.html',
  styleUrls: ['../../permiso-solicitud.page.scss'],
})

export class PermisosListaComponent implements OnInit, OnDestroy {

  subscripted: Subscription;
  skeleton = SkeletonListPermisoArray;
  loading: boolean = true;
  pageActual: number = 1;

  permisos: Permiso[] = [];
  num_permiso: number = 0;

  ver: boolean = true;
  codigo: any;

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  constructor(
    private permisosService: PermisosService,
    public loadingController: LoadingController,
    public modalController: ModalController,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    public socket: Socket,
  ) { 
    this.socket.on('recibir_notificacion', (data_llega: any) => {
      this.obtenerListaPermisos();
    });
  }

  ngOnInit() {
    this.codigo = String(localStorage.getItem('codigo'));
    this.BuscarFormatos();
    this.cambioPaginaActual();
  }

  // BUSQUEDA DE PARAMETROS DE FECHAS Y HORAS
  formato_fecha: string = '';
  formato_hora: string = '';
  BuscarFormatos() {
    this.parametro.ObtenerFormatos().subscribe(
      resp => {
        this.formato_fecha = resp.fecha;
        this.formato_hora = resp.hora;
        this.obtenerListaPermisos();
      }
    )
  }

  ngOnDestroy() {
    this.subscripted.unsubscribe();
  }

  posts: any[] = [];
  totalPosts = 0;
  limit = 10;

  //have issue here about "disabling"
  loadMorePosts(event: any) {
    setTimeout(() => {
      console.log('Begin async operation');
      this.limit += 10;
      event.target.complete();

      if (this.posts.length == this.limit) {
        event.target.disabled = true;
      }
    }, 500);
  }

  colorfondocard(permiso: { estado: any }) {
    if (permiso.estado === 1) {
      return "pendientes";
    } else if (permiso.estado === 2) {
      return "preautorizados"
    } else if (permiso.estado === 3) {
      return "autorizados";
    } else {
      return "negados";
    }
  }

  conteoSolicitudes: number = 0;
  obtenerListaPermisos() {
    this.conteoSolicitudes = 0;
    this.subscripted = this.permisosService.getListaPermisosByCodigo(this.codigo)
      .subscribe(
        permisos => {
          this.permisos = permisos;

          this.permisos.forEach(p => {
            // TRATAMIENTO DE FECHAS Y HORAS EN FORMATO DD/MM/YYYYY
            p.fec_creacion_ = this.validar.FormatearFecha(String(p.fec_creacion), this.formato_fecha, this.validar.dia_completo);
            p.fec_inicio_ = this.validar.FormatearFecha(String(p.fec_inicio), this.formato_fecha, this.validar.dia_completo);
            p.fec_final_ = this.validar.FormatearFecha(String(p.fec_final), this.formato_fecha, this.validar.dia_completo);

            p.hora_ingreso_ = this.validar.FormatearHora(p.hora_ingreso!, this.formato_hora);
            p.hora_salida_ = this.validar.FormatearHora(p.hora_salida!, this.formato_hora);

          })
          const [ultimoNumeroPermiso] = permisos;
          this.num_permiso = (ultimoNumeroPermiso) ? ultimoNumeroPermiso.num_permiso! + 1 : 1;

          this.conteoSolicitudes = this.permisos.length;

          if (permisos.length < 6) {
            return this.ver = true;
          } else {
            return this.ver = false;
          }

        },
        err => {
          console.log(err);
        },
        () => {
          this.loading = false
        })
  }

  inputNumeroPermiso(num: number) { this.num_permiso = num }

  async presentModalNuevoRegistro(num_permiso: number) {
    const modal = await this.modalController.create({
      component: RegistrarPermisoComponent,
      componentProps: { num_permiso },
      cssClass: 'my-custom-class'
    });

    await modal.present();

    const { data: { refreshInfo } } = await modal.onDidDismiss()

    if (refreshInfo) {
      this.ngOnInit()
    }
    return;
  }

  cambioPaginaActual(){
    if((this.permisos.length < (this.pageActual * 5)) && ((this.pageActual * 5) - this.permisos.length  == 4)){
      return this.pageActual = this.pageActual - 1;
    }
  }

  async presentModalVerRegistro(permiso: Permiso) {
    const modal = await this.modalController.create({
      component: VerPermisoComponent,
      componentProps: { permiso },
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  async presentModalEditarRegistro(permiso: Permiso) {
    const modal = await this.modalController.create({
      component: EditarPermisoComponent,
      componentProps: { permiso },
      cssClass: 'my-custom-class'
    });

    await modal.present();

    const { data: { refreshInfo } } = await modal.onDidDismiss()

    if (refreshInfo) {
      this.ngOnInit()
    }
    return;
  }

  //variables de configuracion del componente de paginacion (pagination-controls)
  public maxSize: number = 5;
  public directionLinks: boolean = true;
  public autoHide: boolean = false;
  public responsive: boolean = true;
  public labels: any = {
    previousLabel: 'ante..',
    nextLabel: 'sigui..',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };
}
