import { Component, Input } from '@angular/core';
import { Vacacion } from 'src/app/interfaces/Vacacion';

@Component({
  selector: 'app-ver-vacacion',
  templateUrl: './ver-vacacion.component.html',
  styleUrls: ['../solicitar-vacaciones.page.scss'],
})
export class VerVacacionComponent {

  @Input() vacacion: Vacacion;

  constructor() { }
}
