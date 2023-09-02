import { Component, Input } from '@angular/core';
import { HoraExtra } from 'src/app/interfaces/HoraExtra';

@Component({
  selector: 'app-ver-hora-extra',
  templateUrl: './ver-hora-extra.component.html',
  styleUrls: ['../../solicitar-horas-extras.page.scss'],
})
export class VerHoraExtraComponent {

  @Input() hora_extra: HoraExtra;

  hipervinculo: string = 'http://192.168.0.193:3001';

  constructor() { }
}
