import { Component, Input } from '@angular/core';
import { Alimentacion } from 'src/app/interfaces/Alimentacion';

@Component({
  selector: 'app-ver-alimentacion',
  templateUrl: './ver-alimentacion.component.html',
  styleUrls: ['../../solicitar-planificar-alimentacion.page.scss'],
})
export class VerAlimentacionComponent {

  @Input() alimentacion: Alimentacion;

  constructor() { }
}
