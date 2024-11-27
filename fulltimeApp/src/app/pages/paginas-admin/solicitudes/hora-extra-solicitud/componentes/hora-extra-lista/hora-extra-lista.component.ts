import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { HoraExtra } from 'src/app/interfaces/HoraExtra';
import { ModalController } from '@ionic/angular';
import { SkeletonListPermisoArray } from 'src/app/interfaces/Skeleton';
import { LoadingController, IonInfiniteScroll } from '@ionic/angular';
import { Socket } from 'ngx-socket-io';
import { Subscription } from 'rxjs';
import { HorasExtrasService } from 'src/app/services/horas-extras.service';
import { EditarHoraExtraComponent } from '../editar-hora-extra/editar-hora-extra.component';
import { RegistrarHoraExtraComponent } from '../registrar-hora-extra/registrar-hora-extra.component';
import { VerHoraExtraComponent } from '../ver-hora-extra/ver-hora-extra.component';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-hora-extra-lista',
  templateUrl: './hora-extra-lista.component.html',
  styleUrls: ['../../hora-extra-solicitud.page.scss'],
})

export class HoraExtraListaComponent implements OnInit, OnDestroy {

  subscripted: Subscription;
  skeleton = SkeletonListPermisoArray;
  loading: boolean = true;
  pageActual: number = 1;

  horas_extras: HoraExtra[] = [];

  ver: boolean = true;
  codigo: any;

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  constructor(
    private horasExtrasService: HorasExtrasService,
    public loadingController: LoadingController,
    public modalController: ModalController,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    public socket: Socket,
  ) {
    this.socket.on('recibir_notificacion', (data_llega: any) => {
      this.obtenerListaHoraExtra();
    });
  }

  ngOnInit() {
    this.codigo = localStorage.getItem('empleadoID')
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
        this.obtenerListaHoraExtra()
      }
    )
  }

  ngOnDestroy() {
    this.subscripted.unsubscribe();
  }

  colorfondocard(hora_extra: { estado: any }) {
    if (hora_extra.estado === 1) {
      return "pendientes";
    } else if (hora_extra.estado === 2) {
      return "preautorizados"
    } else if (hora_extra.estado === 3) {
      return "autorizados";
    } else {
      return "negados";
    }
  }

  obtenerListaHoraExtra() {
    this.subscripted = this.horasExtrasService.getListaHorasExtrasByCodigo(this.codigo)
      .subscribe(
        horas_extras => {
          this.horas_extras = horas_extras;

          this.horas_extras.sort((n1, n2) => {
            if (n1.id > n2.id) {
              return -1;
            }
            if (n1.id < n2.id) {
              return +1;
            }
          });

          this.horas_extras.forEach(h => {
            // TRATAMIENTO DE FECHAS Y HORAS
            h.fecha_inicio_ = this.validar.FormatearFecha(DateTime.fromISO(h.fecha_inicio).toFormat('yyyy-MM-dd'), this.formato_fecha, this.validar.dia_completo);
            h.hora_inicio_ = this.validar.FormatearHora(DateTime.fromISO(h.fecha_inicio).toFormat('HH:mm:ss'), this.formato_hora);

            h.fecha_fin_ = this.validar.FormatearFecha(DateTime.fromISO(h.fecha_final).toFormat('yyyy-MM-dd'), this.formato_fecha, this.validar.dia_completo);;
            h.hora_fin_ = this.validar.FormatearHora(DateTime.fromISO(h.fecha_final).toFormat('HH:mm:ss'), this.formato_hora);

            h.fecha_solicita_ = this.validar.FormatearFecha(String(h.fecha_solicita), this.formato_fecha, this.validar.dia_completo);
          })

          if (horas_extras.length < 6) {
            return this.ver = true;
          } else {
            return this.ver = false;
          }

        },
        err => {
          console.log(err);
        },
        () => {
          this.loading = false;
        })
  }

  async presentModalNuevoRegistro() {
    const modal = await this.modalController.create({
      component: RegistrarHoraExtraComponent,
      cssClass: 'my-custom-class'
    });

    await modal.present();

    const { data: { refreshInfo } } = await modal.onDidDismiss()

    if (refreshInfo) {
      this.ngOnInit()
    }
    return;
  }

  async presentModalVerRegistro(hora_extra: HoraExtra) {
    const modal = await this.modalController.create({
      component: VerHoraExtraComponent,
      componentProps: { hora_extra },
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  async presentModalEditarRegistro(hora_extra: HoraExtra) {
    const modal = await this.modalController.create({
      component: EditarHoraExtraComponent,
      componentProps: { hora_extra },
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
