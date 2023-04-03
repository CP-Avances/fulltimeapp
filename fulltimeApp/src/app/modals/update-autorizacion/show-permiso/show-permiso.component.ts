import { Component, Input } from '@angular/core';
import { Permiso } from '../../../interfaces/Permisos';

@Component({
  selector: 'app-show-permiso',
  templateUrl: './show-permiso.component.html',
  // styleUrls: ['./show-permiso.component.scss'],
})
export class ShowPermisoComponent {

  @Input() permiso: Permiso;


}
