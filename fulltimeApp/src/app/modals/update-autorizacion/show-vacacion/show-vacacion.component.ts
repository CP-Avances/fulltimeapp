import { Component, Input } from '@angular/core';
import { Vacacion } from '../../../interfaces/Vacacion';

@Component({
  selector: 'app-show-vacacion',
  templateUrl: './show-vacacion.component.html',
  // styleUrls: ['./show-vacacion.component.scss'],
})
export class ShowVacacionComponent {

  @Input() vacacion: Vacacion;

}
