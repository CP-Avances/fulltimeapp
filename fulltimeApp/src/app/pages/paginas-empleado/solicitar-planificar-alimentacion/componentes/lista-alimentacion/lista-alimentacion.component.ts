import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Alimentacion } from 'src/app/interfaces/Alimentacion';
import { SkeletonListPermisoArray } from 'src/app/interfaces/Skeleton';
import { AlimentacionService } from 'src/app/services/alimentacion.service';
import { VerAlimentacionComponent } from '../ver-alimentacion/ver-alimentacion.component';
import { EditarAlimentacionComponent } from '../editar-alimentacion/editar-alimentacion.component';
import { RegistrarAlimentacionComponent } from '../registrar-alimentacion/registrar-alimentacion.component';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-lista-alimentacion',
  templateUrl: './lista-alimentacion.component.html',
  styleUrls: ['../../solicitar-planificar-alimentacion.page.scss'],
})
export class ListaAlimentacionComponent implements OnInit, OnDestroy {

  subscripted: Subscription;
  skeleton = SkeletonListPermisoArray;
  loading: boolean = true;
  pageActual: number = 1;

  alimentacion: Alimentacion[] = [];
  num_alimentos: number = 0;

  idEmpleado: any;

  ver: boolean = true;

  constructor(
    private alimentacionService: AlimentacionService,
    public modalController: ModalController,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    public socket: Socket,
  ) { 
    this.socket.on('recibir_aviso', (data_llega: any) => {
      this.obtenerListaAlimentacion();
    });
  }

  ngOnInit() {
    this.idEmpleado = localStorage.getItem('empleadoID');
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
        this.obtenerListaAlimentacion();
      }
    )
  }
  
  ngOnDestroy() {
    this.subscripted.unsubscribe();
  }

  colorfondocard(a: { aprobada: any; }) {
    if (a.aprobada === null) {
      return "pendientes";
    } else if (a.aprobada === true) {
      return "autorizados";
    } else {
      return "negados";
    }
  }

  obtenerListaAlimentacion() {
    this.subscripted = this.alimentacionService.getListaAlimentacionByIdEmpleado(this.idEmpleado)
      .subscribe(
        alimentacion => {
          this.alimentacion = alimentacion;

          this.alimentacion.sort((n1, n2) => {
            if (n1.id > n2.id) {
              return -1;
            }
            if (n1.id < n2.id) {
              return +1;
            }
          });

          alimentacion.forEach(c => {
            // TRATAMIENTO DE FECHAS Y HORAS
            c.fecha_ = this.validar.FormatearFecha(String(c.fecha), this.formato_fecha, this.validar.dia_completo);
            c.fec_comida_ = this.validar.FormatearFecha(String(c.fec_comida), this.formato_fecha, this.validar.dia_completo);
            c.hora_inicio_ = this.validar.FormatearHora(c.hora_inicio, this.formato_hora);
            c.hora_fin_ = this.validar.FormatearHora(c.hora_fin, this.formato_hora);

          })

          if (alimentacion.length < 6) {
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

  async presentModalNuevoRegistro() {
    const modal = await this.modalController.create({
      component: RegistrarAlimentacionComponent,
      cssClass: 'my-custom-class'
    });

    await modal.present();

    const { data: { refreshInfo } } = await modal.onDidDismiss()

    if (refreshInfo) {
      this.ngOnInit()
    }
    return;
  }

  async presentModalVerRegistro(alimentacion: Alimentacion) {
    const modal = await this.modalController.create({
      component: VerAlimentacionComponent,
      componentProps: { alimentacion },
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  async presentModalEditarRegistro(alimentacion: Alimentacion) {
    const modal = await this.modalController.create({
      component: EditarAlimentacionComponent,
      componentProps: { alimentacion },
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
