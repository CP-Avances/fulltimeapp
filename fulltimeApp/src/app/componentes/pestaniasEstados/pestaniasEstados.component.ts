import { Component, EventEmitter, Output, OnInit } from '@angular/core';

@Component({
  selector: 'app-pestanias-estados',
  templateUrl: './pestaniasEstados.component.html',
})
export class PestaniasEstadosComponent implements OnInit {

  @Output() onChangeEstado: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    this.cambioPestaniaEstados()
  }

  pestaniaEstados: string = 'pendientes';
  cambioPestaniaEstados(event?: any) {
    this.pestaniaEstados = (event) ? event.target.value : 'pendientes';
    this.onChangeEstado.emit(this.pestaniaEstados);
  }

}
