import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SkeletonListPermisoArray } from 'src/app/interfaces/Skeleton';
import { VerVacacionComponent } from '../ver-vacacion/ver-vacacion.component';
import { Subscription } from 'rxjs';
import { Vacacion } from '../../../../../interfaces/Vacacion';
import { VacacionesService } from '../../../../../services/vacaciones.service';
import { EditarVacacionComponent } from '../editar-vacacion/editar-vacacion.component';
import { RegistrarVacacionComponent } from '../registrar-vacacion/registrar-vacacion.component';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';

@Component({
  selector: 'app-lista-vacacion',
  templateUrl: './lista-vacacion.component.html',
  styleUrls: ['../../solicitar-vacaciones.page.scss'],
})
export class ListaVacacionComponent implements OnInit, OnDestroy {

  subscripted: Subscription;
  skeleton = SkeletonListPermisoArray;
  loading: boolean = true;

  vacaciones: Vacacion[] = [];
  num_vacaciones: number = 0;

  pageActual: number = 1;
  ver: boolean = true;
  codigo: any;

  constructor(
    private vacacionesService: VacacionesService,
    public modalController: ModalController,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
  ) { }

  ngOnInit() {
    this.codigo = localStorage.getItem('codigo')
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
        this.obtenerListaVacaciones();
      }
    )
  }

  ngOnDestroy() {
    this.subscripted.unsubscribe();
  }

  colorfondocard(vacaciones:{estado: any}){
    if(vacaciones.estado === 1){
      return "pendientes";
    }else if(vacaciones.estado === 2){
      return "preautorizados"
    }else if(vacaciones.estado === 3){
      return "autorizados";
    }else{
      return "negados";
    }
  }

  obtenerListaVacaciones() {
    this.subscripted = this.vacacionesService.getListaVacacionesByCodigo(this.codigo)
      .subscribe(
        vacaciones => {
          this.vacaciones = vacaciones;

          this.vacaciones.sort((n1, n2) => {
            if(n1.id > n2.id){
              return -1;
            }
            if(n1.id < n2.id){
              return +1;
            }
          });

          this.vacaciones.forEach(v => {
            // TRATAMIENTO DE FECHAS Y HORAS 
            v.fec_ingreso_ = this.validar.FormatearFecha(String(v.fec_ingreso), this.formato_fecha, this.validar.dia_completo);
            v.fec_inicio_ = this.validar.FormatearFecha(String(v.fec_inicio), this.formato_fecha, this.validar.dia_completo);
            v.fec_final_ = this.validar.FormatearFecha(String(v.fec_final), this.formato_fecha, this.validar.dia_completo);
          })

          if(vacaciones.length < 6){
            return this.ver = true;
          }else{
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
      component: RegistrarVacacionComponent,
      cssClass: 'my-custom-class'
    });

    await modal.present();

    const { data: { refreshInfo } } = await modal.onDidDismiss()

    if (refreshInfo) {
      this.ngOnInit()
    }
    return;
  }

  async presentModalVerRegistro(vacacion: Vacacion) {
    const modal = await this.modalController.create({
      component: VerVacacionComponent,
      componentProps: { vacacion },
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  async presentModalEditarRegistro(vacacion: Vacacion) {
    const modal = await this.modalController.create({
      component: EditarVacacionComponent,
      componentProps: { vacacion },
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
