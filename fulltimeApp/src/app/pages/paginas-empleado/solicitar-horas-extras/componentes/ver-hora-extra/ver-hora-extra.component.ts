import { Component, Input, OnInit } from '@angular/core';
import { HoraExtra } from 'src/app/interfaces/HoraExtra';

@Component({
  selector: 'app-ver-hora-extra',
  templateUrl: './ver-hora-extra.component.html',
  styleUrls: ['../../solicitar-horas-extras.page.scss'],
})
export class VerHoraExtraComponent implements OnInit{

  @Input() hora_extra: HoraExtra;
  hipervinculo: string = 'http://192.168.0.193:3001';
  file: any;

  constructor() { }
  ngOnInit(): void {
    this.file = this.hora_extra.documento;
    console.log(this.hora_extra.documento);
  }

}
