import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-refresh-info',
  templateUrl: './refresh-info.component.html',
  styles: [`
    ion-refresher {
      z-index: 102
    }
  `],
})
export class RefreshInfoComponent {

  @Output() onRefresh: EventEmitter<any> = new EventEmitter();
  @Input() removeItem: string = '';
  constructor() { }

  //refrescar la pagina
  doRefresh(event: any) {

    if (this.removeItem === 'noClean') {
      this.onRefresh.emit();
      setTimeout(() => {
        console.log('Async operation has ended');
        event.target.complete();
      }, 1500);
      return
    }

    if (this.removeItem === '') {
      sessionStorage.clear();
      this.onRefresh.emit();
      setTimeout(() => {
        console.log('Async operation has ended');
        event.target.complete();
      }, 1500);
      return
    }

    switch (this.removeItem) { // Esta logica es para saber que datos elimino del session storage.
      case 'cg_tipo_permiso': sessionStorage.removeItem(this.removeItem); break;
      case 'cg_feriado': sessionStorage.removeItem(this.removeItem); break;
      case 'cg_detalleMenu': sessionStorage.removeItem(this.removeItem); break;
      case 'lista-empleados': sessionStorage.removeItem(this.removeItem); break;
      case 'servicios-comida': sessionStorage.removeItem(this.removeItem); break;
      case 'menu-servicio': sessionStorage.removeItem(this.removeItem); break;
      case 'vacuna_info': sessionStorage.removeItem(this.removeItem); break;
      default:
        sessionStorage.clear();
        break;
    }

    this.onRefresh.emit();

    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 1500);
  }

}
