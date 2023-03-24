import { Component, OnInit, OnDestroy } from '@angular/core';
import { SkeletonListPermisoArray } from 'src/app/interfaces/Skeleton';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { Permiso } from 'src/app/interfaces/Permisos';

import { PermisosService } from '../../../../../services/permisos.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ValidacionesService } from 'src/app/libs/validaciones.service';

import { RegistrarPermisoComponent } from '../registrar-permiso/registrar-permiso.component';
import { EditarPermisoComponent } from '../editar-permiso/editar-permiso.component';
import { VerPermisoComponent } from '../ver-permiso/ver-permiso.component';

@Component({
  selector: 'app-lista-permisos',
  templateUrl: './lista-permisos.component.html',
  styleUrls: ['../../solicitar-permisos.page.scss'],
})

export class ListaPermisosComponent implements OnInit, OnDestroy {

  subscripted: Subscription;
  skeleton = SkeletonListPermisoArray;
  loading: boolean = true;

  permisos: Permiso[] = [];
  num_permiso: number = 0;

  page: number = 1;
  codigo: any;
  ver: boolean = true;

  constructor(
    private permisosService: PermisosService,
    public modalController: ModalController,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
  ) { }

  ngOnInit() {
    this.codigo = localStorage.getItem('codigo');
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
        this.obtenerListaPermisos();
      }
    )
  }

  ngOnDestroy() {
    this.subscripted.unsubscribe();
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

  obtenerListaPermisos() {
    this.subscripted = this.permisosService.getListaPermisosByCodigo(this.codigo)
      .subscribe(
        permisos => {
          this.permisos = permisos;
          this.permisos.forEach(p => {
            // TRATAMIENTO DE FECHAS Y HORAS EN FORMATO DD/MM/YYYYY
            p.fec_creacion_ = this.validar.FormatearFecha(String(p.fec_creacion), this.formato_fecha, this.validar.dia_completo);
            p.fec_inicio_ = this.validar.FormatearFecha(String(p.fec_inicio), this.formato_fecha, this.validar.dia_completo);
            p.fec_final_ = this.validar.FormatearFecha(String(p.fec_final), this.formato_fecha, this.validar.dia_completo);

            p.hora_ingreso_ = this.validar.FormatearHora(String(p.hora_ingreso), this.formato_hora);
            p.hora_salida_ = this.validar.FormatearHora(String(p.hora_salida), this.formato_hora);

          })
          console.log('empl permisos... ', this.permisos)
          const [ultimoNumeroPermiso] = permisos;
          this.num_permiso = (ultimoNumeroPermiso) ? ultimoNumeroPermiso.num_permiso! + 1 : 1;

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
