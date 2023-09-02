import { Component, Input } from '@angular/core';
import { HoraExtra } from '../../../interfaces/HoraExtra';

@Component({
  selector: 'app-show-hora-extra',
  templateUrl: './show-hora-extra.component.html',
  // styleUrls: ['./show-hora-extra.component.scss'],
})
export class ShowHoraExtraComponent {

  @Input() hora_extra: HoraExtra;

}
