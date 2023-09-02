import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-estados',
  templateUrl: './estados.component.html',
})
export class EstadosComponent implements OnInit {

  @Output() onChangeEstado: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    this.cambioPestaniaEstados()
  }

  pestaniaEstados: string = 'pendientes';
  cambioPestaniaEstados(event?) {
    this.pestaniaEstados = (event) ? event.target.value : 'pendientes';
    this.onChangeEstado.emit(this.pestaniaEstados);
  }

}
