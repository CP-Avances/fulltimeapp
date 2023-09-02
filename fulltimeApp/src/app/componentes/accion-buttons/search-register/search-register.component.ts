import { Component, Input, EventEmitter, Output } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'btn-search',
  templateUrl: './search-register.component.html',
  styleUrls: [],
})
export class SearchRegisterComponent {

  @Input() loadingBtn: boolean;

  @Input() label: string = 'Buscar';
  @Output() onSearch: EventEmitter<any> = new EventEmitter()

  constructor() { }

  BuscarDataTable() {
    this.onSearch.emit()
  }

}
