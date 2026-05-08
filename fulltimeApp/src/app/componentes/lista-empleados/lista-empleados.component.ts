import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { EmpleadosService } from '../../services/empleados.service';
import { ModalController, ToastController } from '@ionic/angular';

import { LoadingController, IonInfiniteScroll } from '@ionic/angular';

@Component({
  selector: 'app-lista-empleados',
  templateUrl: './lista-empleados.component.html',
  styleUrls: ['./lista-empleados.component.scss'],
})
export class ListaEmpleadosComponent implements OnInit {

  empleados: any[] = [];
  empleados_filtro: any[] = [];

  pageActual: number = 1;
  ver: boolean = true;
  loading: boolean = false;
  @Input('open') presentModal!: (args: any) => void; //callback function
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  constructor(
    private empleadoService: EmpleadosService,
    public modalController: ModalController,
    private toastController: ToastController,
    public loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.ObtenerListaEmpleados();
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


  ObtenerListaEmpleados() {
    const emp = sessionStorage.getItem('lista-empleados')
    if (emp === null) {
      console.log('entro a peticion');
      this.empleadoService.ObtenerListaEmpleados().subscribe(res => {
        console.log("ver busqueda de empleados, ", res);
        this.empleados = res;
        this.empleados_filtro = [...this.empleados];
        sessionStorage.setItem('lista-empleados', JSON.stringify(this.empleados))

        this.loading = true;
        if (this.empleados_filtro.length < 11) {
          this.ver = true;
        }else{
          this.ver = false;
        }

      },error => {
        this.loading = true;
        console.log(error);
        this.ver = true;
       // return this.abrirToas('Ups!, No fue posible conectarse con el servidor', 'danger', 3500, 'middle')
      });
    } else {
      this.loading = true;

      this.empleados = JSON.parse(emp)
      this.empleados_filtro = [...this.empleados];
      if (this.empleados_filtro.length < 11) {
        this.ver = true;
      }else{
        this.ver = false;
      }
    }
    
    if((this.empleados_filtro == undefined) || (this.empleados_filtro == null)){
      this.loading = false;
      this.ver = true;
    }
  }

  changeSearch(e: any) {
    console.log("entra a busqueda", e.detail.value)
    const palabrasBusqueda = e.detail.value.toLowerCase().split(' ');  // DIVIDE EL ARGUMENTO EN PALABRAS
    console.log("ver las palabra de busqueda ",palabrasBusqueda )
    const filtro = this.empleados.filter((o: any) => {
      const nombreCompleto = `${o.fullname }`.toLowerCase();

      console.log("ver el nombre de empleado: ", o.nombre)
      return palabrasBusqueda.every(palabra => nombreCompleto.includes(palabra))
    })
    this.empleados_filtro = filtro

  }

  async abrirToas(mensaje: string, color: string, duracion: number, position: any) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color: color,
      mode: 'ios',
      position: position
    });
    toast.present();
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
